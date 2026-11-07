"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RazorpayCheckout({ amount, orderDetails }: { amount: number; orderDetails: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);

    try {
      console.log("Initiating payment, amount:", amount); // Debugging
      // 1. Call server to create Razorpay order
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), currency: "INR" }),
      });
      const data = await res.json();
      console.log("Order creation response:", data); // Debugging

      if (!data.success) {
        throw new Error(data.error || "Failed to create payment order");
      }

      // 2. Load Razorpay script if not already loaded
      const scriptLoaded = await new Promise((resolve) => {
        if ((window as any).Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!scriptLoaded) {
        // Fallback redirection if script fails to load
        setTimeout(() => {
          setLoading(false);
          router.push(`/track?id=${data.orderId}`);
        }, 1000);
        return;
      }

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: data.keyId || "rzp_test_placeholder",
        amount: data.amount,
        currency: data.currency,
        name: "Vector Labels",
        description: "Custom Clothing Labels Batch",
        image: "/Logo.png",
        order_id: data.orderId,
        handler: function (response: any) {
          // Payment successful
          setLoading(false);
          router.push(`/track?id=${response.razorpay_order_id || data.orderId}`);
        },
        prefill: {
          name: orderDetails?.name || "Couture Brand",
          email: orderDetails?.email || "brand@couture.com",
          contact: orderDetails?.phone || "+918608847513",
        },
        theme: {
          color: "#D4AF37",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setLoading(false);
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      // Fallback redirect on error
      const fallbackId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
      router.push(`/track?id=${fallbackId}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-luxury-slate rounded border border-luxury-border flex items-center justify-between text-xs">
        <div>
          <p className="font-bold text-luxury-charcoal uppercase tracking-wider">Razorpay Secure Checkout</p>
          <p className="text-gray-500 font-light">UPI, Cards, NetBanking, Wallets, QR</p>
        </div>
        <span className="text-lg font-bold text-luxury-gold">₹{amount}</span>
      </div>

      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-luxury-gold text-luxury-charcoal hover:bg-white py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-sm shadow-md"
      >
        {loading ? "Initializing Razorpay..." : `Pay ₹${amount} via Razorpay →`}
      </button>
    </div>
  );
}
