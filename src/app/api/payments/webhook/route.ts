import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createAdminClient } from "@/lib/supabase/admin";

type RazorpayWebhookEvent = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
        notes?: Record<string, string>;
      };
    };
  };
};

/**
 * Razorpay webhook.
 *
 * Previously this route trusted any POST body, so anyone who knew the URL
 * could mark an order as paid. The signature is now verified against
 * PAYMENT_WEBHOOK_SECRET before anything is written, and the update runs with
 * the service-role client because a webhook has no customer session.
 */
export async function POST(request: Request) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    console.error("PAYMENT_WEBHOOK_SECRET is not configured — rejecting webhook.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let verified = false;
  try {
    verified = Razorpay.validateWebhookSignature(rawBody, signature, secret);
  } catch (error) {
    console.error("Webhook signature check failed:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (!verified) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id;
  const paymentId = payment?.id;

  const admin = createAdminClient();
  if (!admin) {
    console.error("Supabase service role key missing — cannot record payment.");
    // 500 so Razorpay retries once the environment is fixed.
    return NextResponse.json({ error: "Persistence not configured." }, { status: 500 });
  }

  try {
    if (event.event === "payment.captured" || event.event === "order.paid") {
      if (razorpayOrderId) {
        const { error } = await admin
          .from("orders")
          .update({
            status: "paid",
            razorpay_payment_id: paymentId ?? null,
          })
          .eq("razorpay_order_id", razorpayOrderId);

        if (error) {
          console.error("Order update failed:", error.message);
          return NextResponse.json({ error: "Order update failed." }, { status: 500 });
        }
      }
    } else if (event.event === "payment.failed") {
      console.warn("Payment failed for Razorpay order", razorpayOrderId);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook handling failed:", error);
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }
}
