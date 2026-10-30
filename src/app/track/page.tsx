"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

function TrackingContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "ORD-2026-9481";

  const order = {
    id: id,
    status: "in_production",
    total_amount: 1850,
    created_at: "2026-10-28T12:00:00.000Z",
    items: [{ product_name: "Woven Labels (Damask Weave)", quantity: 2000, unit_price: 0.92 }],
    shipping_address: { name: "Couture Brand Ltd.", city: "Tirupur", state: "Tamil Nadu", pincode: "641687" },
  };

  const stages = [
    { key: "payment_pending", label: "Payment Confirmed" },
    { key: "paid", label: "Paid" },
    { key: "proof_review", label: "Artwork Proof Review" },
    { key: "in_production", label: "Manufacturing in Tirupur" },
    { key: "dispatched", label: "Dispatched & Shipped" },
    { key: "delivered", label: "Delivered" },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto px-6 lg:px-12 py-16 w-full">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">Production Tracker</span>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-luxury-charcoal mt-1">Order #{order.id}</h1>
          </div>
          <Link href="/dashboard" className="text-xs font-bold uppercase tracking-widest text-luxury-gold hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-xl shadow-xl border border-luxury-border space-y-8">
          {/* Status Tracker Bar */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-gray-400">Live Production Milestones</h3>
            <div className="relative border-l-2 border-luxury-gold/40 ml-4 space-y-8 py-2">
              {stages.map((stage, idx) => {
                const isCompleted = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={stage.key} className="relative pl-6">
                    <div
                      className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 transition-all ${
                        isCompleted
                          ? "bg-luxury-gold border-luxury-gold shadow-md"
                          : "bg-white border-gray-300"
                      }`}
                    ></div>
                    <p className={`text-sm font-bold ${isCurrent ? "text-luxury-gold" : isCompleted ? "text-luxury-charcoal" : "text-gray-400"}`}>
                      {stage.label}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                      {isCompleted ? "Completed" : "Pending milestone"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details */}
          <div className="border-t border-luxury-border pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-widest text-luxury-charcoal">Shipping Address</h4>
              <p className="text-gray-600">{order.shipping_address.name}</p>
              <p className="text-gray-600">{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-widest text-luxury-charcoal">Batch Summary</h4>
              <p className="text-gray-600">Total Amount: <strong className="text-luxury-charcoal">₹{order.total_amount}</strong></p>
              <p className="text-gray-600">Status: <strong className="text-luxury-gold uppercase">{order.status.replace("_", " ")}</strong></p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading tracking details...</div>}>
      <TrackingContent />
    </Suspense>
  );
}
