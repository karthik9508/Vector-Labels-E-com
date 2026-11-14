"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { CartItem } from "@/lib/cart";
import { clearCart } from "@/lib/cart";
import { formatINR } from "@/lib/pricing";
import { whatsappLink } from "@/lib/site";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
}

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

type Status = "idle" | "creating" | "opening" | "success" | "error" | "unavailable";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayCheckout({
  items,
  customer,
  total,
}: {
  items: CartItem[];
  customer: CheckoutCustomer;
  total: number;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const canPay = items.length > 0 && items.every((item) => item.pricingRequest);

  async function handlePayment() {
    if (!canPay) {
      setStatus("error");
      setError(
        "One of your cart items was added before this checkout was upgraded. Please remove it and add the product again."
      );
      return;
    }

    setStatus("creating");
    setError(null);

    try {
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            title: item.title,
            pricingRequest: item.pricingRequest,
          })),
          customer,
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        orderId?: string;
        internalOrderId?: string | null;
        amount?: number;
        currency?: string;
        keyId?: string;
        code?: string;
        error?: string;
      };

      if (!response.ok || !data.success) {
        setStatus(data.code === "PAYMENT_NOT_CONFIGURED" ? "unavailable" : "error");
        setError(data.error ?? "We could not start the payment. Please try again.");
        return;
      }

      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !window.Razorpay) {
        setStatus("error");
        setError(
          "The payment window could not load — this is usually a network or ad-blocker issue. Please retry, or send your order on WhatsApp."
        );
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Vector Labels",
        description: `Custom label batch · ${items.length} line${items.length === 1 ? "" : "s"}`,
        image: "/Logo.png",
        order_id: data.orderId,
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        notes: { delivery_pincode: customer.pincode },
        theme: { color: "#D4AF37" },
        handler: (result: RazorpayResponse) => {
          setPaymentId(result.razorpay_payment_id);
          setStatus("success");
          clearCart();
          if (data.internalOrderId) {
            router.push(`/track?id=${data.internalOrderId}`);
          }
        },
        modal: {
          ondismiss: () => setStatus("idle"),
        },
      };

      const instance = new window.Razorpay(options);
      instance.on("payment.failed", (response) => {
        setStatus("error");
        setError(
          response?.error?.description ??
            "The payment did not go through. No money has been taken — please try another method."
        );
      });
      setStatus("opening");
      instance.open();
    } catch {
      setStatus("error");
      setError(
        "We could not reach the payment service. Please check your connection and try again."
      );
    }
  }

  if (status === "success") {
    return (
      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3 text-center">
        <p className="text-sm font-bold text-emerald-900">Payment received</p>
        <p className="text-xs text-emerald-800">
          Thank you — our Tirupur team will send an artwork proof for your approval
          before production starts.
        </p>
        {paymentId ? (
          <p className="text-[10px] uppercase tracking-widest text-emerald-700">
            Payment id: {paymentId}
          </p>
        ) : null}
        <a
          href={whatsappLink(
            `Hi Vector Labels Team, my payment went through and I would like to confirm my label order. Payment id: ${paymentId ?? "—"}`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-emerald-700 text-white px-6 py-3 rounded-sm text-xs font-bold tracking-widest uppercase hover:bg-emerald-800 transition-colors"
        >
          Share details on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-luxury-slate rounded border border-luxury-border flex items-center justify-between gap-4 text-xs">
        <div>
          <p className="font-bold text-luxury-charcoal uppercase tracking-wider">
            Razorpay secure checkout
          </p>
          <p className="text-gray-500 font-light">UPI, cards, net banking, wallets</p>
        </div>
        <span className="text-lg font-bold text-luxury-gold whitespace-nowrap">
          {formatINR(total, 0)}
        </span>
      </div>

      {error ? (
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded space-y-3">
          <p className="text-xs text-red-800">{error}</p>
          <a
            href={whatsappLink(
              `Hi Vector Labels Team, I could not complete checkout on your website (${error}). Here is my order:\n\n${items
                .map((item) => `• ${item.title} — ${item.specs} — ${formatINR(item.total, 0)}`)
                .join("\n")}\n\nTotal: ${formatINR(total, 0)}`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[11px] font-bold uppercase tracking-widest text-red-900 underline"
          >
            Send this order on WhatsApp instead →
          </a>
        </div>
      ) : null}

      {status === "unavailable" ? (
        <a
          href={whatsappLink(
            `Hi Vector Labels Team, I would like to place this order:\n\n${items
              .map((item) => `• ${item.title} — ${item.specs} — ${formatINR(item.total, 0)}`)
              .join("\n")}\n\nTotal: ${formatINR(total, 0)}`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full block text-center bg-emerald-600 text-white hover:bg-emerald-700 py-4 rounded-sm text-xs font-bold tracking-widest uppercase transition-all shadow-md"
        >
          Place this order on WhatsApp →
        </a>
      ) : (
        <button
          type="button"
          onClick={handlePayment}
          disabled={status === "creating" || status === "opening" || !canPay}
          className="w-full bg-luxury-gold text-luxury-charcoal hover:bg-white py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-sm shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "creating"
            ? "Preparing secure order…"
            : status === "opening"
              ? "Waiting for payment…"
              : `Pay ${formatINR(total, 0)} securely →`}
        </button>
      )}

      <p className="text-[10px] text-gray-400 leading-relaxed text-center">
        Payments are processed by Razorpay. Vector Labels never sees your card
        details. Production starts only after you approve the artwork proof.
      </p>
    </div>
  );
}
