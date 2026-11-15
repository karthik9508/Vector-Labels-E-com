import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { parseShippingAddress, priceLines } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

interface CreateOrderBody {
  items?: unknown;
  customer?: unknown;
  note?: unknown;
}

/**
 * Create a Razorpay order for a cart.
 *
 * The amount is recalculated on the server from the cart's line
 * specifications — the browser never gets to name a price. When payment
 * credentials are missing we fail with `PAYMENT_NOT_CONFIGURED` instead of
 * returning a fake order id, so the customer is never sent to a page that
 * pretends an unpaid order exists.
 */
export async function POST(request: Request) {
  let body: CreateOrderBody;
  try {
    body = (await request.json()) as CreateOrderBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const priced = priceLines(body.items);
  if (!priced.ok) {
    return NextResponse.json({ success: false, error: priced.error }, { status: 400 });
  }

  const address = parseShippingAddress(body.customer);
  if (!address) {
    return NextResponse.json(
      { success: false, error: "Please complete a valid name, email, phone and delivery address." },
      { status: 400 }
    );
  }

  if (priced.total < 1) {
    return NextResponse.json(
      { success: false, error: "Order total must be at least ₹1." },
      { status: 400 }
    );
  }

  const keyId = process.env.PAYMENT_PUBLIC_KEY || process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.PAYMENT_SECRET_KEY || process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId.includes("placeholder")) {
    return NextResponse.json(
      {
        success: false,
        code: "PAYMENT_NOT_CONFIGURED",
        error:
          "Online payment is temporarily unavailable. Please send this order to our team on WhatsApp and we will confirm it manually.",
      },
      { status: 503 }
    );
  }

  // Attribute the order to the signed-in customer, when there is one.
  let userId: string | null = null;
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // Guest checkout — orders are still created.
  }

  const admin = createAdminClient();
  let internalOrderId: string | null = null;

  if (admin) {
    const { data, error } = await admin
      .from("orders")
      .insert({
        user_id: userId,
        total_amount: priced.total,
        currency: "INR",
        status: "payment_pending",
        shipping_address: address,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Order insert failed:", error.message);
    } else if (data) {
      internalOrderId = data.id as string;

      const { error: itemsError } = await admin.from("order_items").insert(
        priced.lines.map((line) => ({
          order_id: internalOrderId,
          product_name: line.title,
          quantity: line.quantity,
          unit_price: line.unitPrice,
          specifications: {
            slug: line.slug,
            summary: line.specification,
            request: line.request,
            concept_image_url: line.conceptImageUrl ?? null,
            concept_id: line.conceptId ?? null,
          },
        }))
      );

      if (itemsError) {
        console.error("Order items insert failed:", itemsError.message);
      }
    }
  } else {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not set — order will not be persisted.");
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(priced.total * 100), // paise
      currency: "INR",
      receipt: internalOrderId
        ? `rcpt_${internalOrderId.replace(/-/g, "").slice(0, 24)}`
        : `rcpt_${Date.now()}`,
      notes: {
        order_id: internalOrderId ?? "",
        contact: address.phone,
        summary: priced.lines.map((line) => line.title).join(", ").slice(0, 240),
        ai_concept_count: String(priced.lines.filter((l) => l.conceptImageUrl).length),
        ...(typeof body.note === "string" ? { note: body.note.slice(0, 200) } : {}),
      },
    });

    if (internalOrderId && admin) {
      const { error } = await admin
        .from("orders")
        .update({ razorpay_order_id: order.id })
        .eq("id", internalOrderId);
      if (error) console.error("Could not attach Razorpay order id:", error.message);
    }

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        internalOrderId,
        amount: order.amount,
        currency: order.currency,
        keyId,
        total: priced.total,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Razorpay error";
    console.error("Razorpay order creation failed:", message);
    return NextResponse.json(
      {
        success: false,
        error:
          "We could not start the payment right now. Please try again, or send your order on WhatsApp.",
      },
      { status: 502 }
    );
  }
}
