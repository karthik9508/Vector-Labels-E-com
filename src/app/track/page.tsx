"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatINR, formatQuantity } from "@/lib/pricing";
import { SITE, whatsappLink } from "@/lib/site";

const STAGES = [
  { key: "payment_pending", label: "Order received", hint: "Awaiting payment confirmation" },
  { key: "paid", label: "Payment confirmed", hint: "We have your payment" },
  { key: "proof_review", label: "Artwork proof review", hint: "Approval before production" },
  { key: "in_production", label: "Manufacturing in Tirupur", hint: "Weaving, printing, finishing" },
  { key: "dispatched", label: "Dispatched", hint: "Handed to the courier" },
  { key: "delivered", label: "Delivered", hint: "Order complete" },
] as const;

interface TrackedOrder {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  shipping: { name: string | null; city: string | null; state: string | null; pincode: string | null };
  items: { name: string; quantity: number; unitPrice: number }[];
}

type State =
  | { kind: "empty" }
  | { kind: "loading" }
  | { kind: "ready"; order: TrackedOrder }
  | { kind: "notfound" }
  | { kind: "error"; message: string };

/** Look up one order. Returns the next UI state; never touches React state. */
async function fetchOrder(id: string): Promise<State> {
  try {
    const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (response.status === 404) return { kind: "notfound" };
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      return {
        kind: "error",
        message: payload.error ?? "We could not load this order right now.",
      };
    }
    return { kind: "ready", order: (await response.json()) as TrackedOrder };
  } catch {
    return {
      kind: "error",
      message: "We could not reach the order service. Please check your connection.",
    };
  }
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id") ?? "";

  const [orderId, setOrderId] = useState(queryId);
  const [state, setState] = useState<State>({ kind: queryId ? "loading" : "empty" });

  useEffect(() => {
    if (!queryId) return;
    let ignore = false;
    fetchOrder(queryId).then((next) => {
      if (!ignore) setState(next);
    });
    return () => {
      ignore = true;
    };
  }, [queryId]);

  async function handleLookup(event: React.FormEvent) {
    event.preventDefault();
    const id = orderId.trim();
    if (!id) {
      setState({ kind: "empty" });
      return;
    }
    setState({ kind: "loading" });
    setState(await fetchOrder(id));
  }

  const order = state.kind === "ready" ? state.order : null;
  const stageIndex = order ? STAGES.findIndex((stage) => stage.key === order.status) : -1;
  const cancelled = order?.status === "cancelled";

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto px-6 lg:px-12 py-16 w-full">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">
              Production tracker
            </span>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-luxury-charcoal mt-1">
              {order ? `Order #${order.id.slice(0, 8).toUpperCase()}` : "Track your order"}
            </h1>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-bold uppercase tracking-widest text-luxury-gold hover:underline"
          >
            ← Back to dashboard
          </Link>
        </div>

        <form
          onSubmit={handleLookup}
          className="bg-white p-6 rounded-xl border border-luxury-border shadow-sm mb-8 flex flex-col sm:flex-row gap-3"
        >
          <label className="flex-1 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Order id
            </span>
            <input
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="Paste the order id from your confirmation"
              className="w-full px-4 py-3 border border-luxury-border rounded-sm text-xs bg-luxury-cream focus:outline-none focus:ring-1 focus:ring-luxury-gold"
            />
          </label>
          <button
            type="submit"
            className="self-end bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal px-6 py-3 rounded-sm text-xs font-bold tracking-widest uppercase transition-all"
          >
            Track
          </button>
        </form>

        {state.kind === "loading" ? (
          <div className="bg-white p-12 rounded-xl border border-luxury-border text-center">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Looking up your order…
            </p>
          </div>
        ) : null}

        {state.kind === "empty" ? (
          <div className="bg-white p-10 rounded-xl border border-luxury-border text-center space-y-4">
            <p className="text-sm text-gray-600 font-light">
              Enter the order id from your payment confirmation to see live
              production milestones.
            </p>
            <p className="text-xs text-gray-400">
              Don&apos;t have it? Message us on WhatsApp and we will look it up for you.
            </p>
          </div>
        ) : null}

        {state.kind === "notfound" ? (
          <div className="bg-amber-50 border border-amber-200 p-8 rounded-xl text-center space-y-3">
            <p className="text-sm font-bold text-amber-900">No order found for that id</p>
            <p className="text-xs text-amber-800">
              Double-check the id from your confirmation, or ask our team — orders
              placed directly on WhatsApp are tracked by phone number instead.
            </p>
          </div>
        ) : null}

        {state.kind === "error" ? (
          <div className="bg-red-50 border border-red-200 p-8 rounded-xl text-center space-y-3">
            <p className="text-sm font-bold text-red-900">Tracking is unavailable</p>
            <p className="text-xs text-red-800">{state.message}</p>
          </div>
        ) : null}

        {order ? (
          <div className="bg-white p-8 md:p-10 rounded-xl shadow-xl border border-luxury-border space-y-8">
            {cancelled ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                This order was cancelled. Contact us if that was not expected.
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xs uppercase font-bold tracking-widest text-gray-400">
                  Production milestones
                </h2>
                <ol className="relative border-l-2 border-luxury-gold/40 ml-4 space-y-8 py-2">
                  {STAGES.map((stage, index) => {
                    const isCompleted = index <= stageIndex;
                    const isCurrent = index === stageIndex;
                    return (
                      <li key={stage.key} className="relative pl-6">
                        <span
                          aria-hidden="true"
                          className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${
                            isCompleted
                              ? "bg-luxury-gold border-luxury-gold shadow-md"
                              : "bg-white border-gray-300"
                          }`}
                        />
                        <p
                          className={`text-sm font-bold ${
                            isCurrent
                              ? "text-luxury-gold"
                              : isCompleted
                                ? "text-luxury-charcoal"
                                : "text-gray-400"
                          }`}
                        >
                          {stage.label}
                          {isCurrent ? (
                            <span className="sr-only"> (current stage)</span>
                          ) : null}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                          {isCompleted ? stage.hint : "Pending"}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            <div className="border-t border-luxury-border pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <h3 className="font-bold uppercase tracking-widest text-luxury-charcoal">
                  Delivery
                </h3>
                <p className="text-gray-600">{order.shipping.name ?? "—"}</p>
                <p className="text-gray-600">
                  {[order.shipping.city, order.shipping.state]
                    .filter(Boolean)
                    .join(", ") || "—"}
                  {order.shipping.pincode ? ` - ${order.shipping.pincode}` : ""}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold uppercase tracking-widest text-luxury-charcoal">
                  Batch
                </h3>
                <ul className="space-y-1 text-gray-600">
                  {order.items.map((item, index) => (
                    <li key={`${item.name}-${index}`}>
                      {item.name} · {formatQuantity(item.quantity)} pcs
                    </li>
                  ))}
                </ul>
                <p className="text-gray-600">
                  Total:{" "}
                  <strong className="text-luxury-charcoal">
                    {formatINR(order.totalAmount, 0)}
                  </strong>
                </p>
              </div>
            </div>

            <a
              href={whatsappLink(
                `Hi Vector Labels Team, I have a question about order #${order.id.slice(0, 8).toUpperCase()}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-emerald-600 text-white hover:bg-emerald-700 py-3.5 rounded-sm text-xs font-bold tracking-widest uppercase transition-all"
            >
              Ask about this order on WhatsApp
            </a>
          </div>
        ) : null}

        <p className="text-center text-[10px] text-gray-400 mt-8">
          Need a hand? Call {SITE.phoneDisplay} · {SITE.hours}
        </p>
      </div>

      <Footer />
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-luxury-cream">
          <p className="text-xs uppercase tracking-widest text-gray-400">
            Loading tracker…
          </p>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
