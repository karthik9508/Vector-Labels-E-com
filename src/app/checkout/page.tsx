"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RazorpayCheckout from "@/components/RazorpayCheckout";

export default function CheckoutPage() {
  const [form, setForm] = useState({
    name: "Couture Brand Ltd.",
    email: "brand@couture.com",
    phone: "+91 98765 43210",
    address: "7th street, Mahalakshmi Nagar",
    city: "Tirupur",
    state: "Tamil Nadu",
    pincode: "641687",
  });

  const [step, setStep] = useState<"form" | "payment">("form");
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    try {
      const storedTotal = localStorage.getItem("vector_cart_total");
      const storedItems = localStorage.getItem("vector_cart_items");
      if (storedTotal) {
        setCartTotal(parseFloat(storedTotal) || 1850);
      }
      if (storedItems) {
        const parsed = JSON.parse(storedItems);
        if (parsed.length > 0) {
          setCartItems(parsed);
          const computedTotal = parsed.reduce((sum: number, item: any) => sum + (item.price || 1850), 0);
          setCartTotal(computedTotal);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto px-6 lg:px-12 py-16 w-full">
        <div className="mb-12 space-y-2">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">Secure Checkout</span>
          <h1 className="text-3xl md:text-5xl font-bold font-serif text-luxury-charcoal">Confirm Order &amp; Payment</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-8 md:p-12 rounded-xl shadow-xl border border-luxury-border">
          {step === "form" ? (
            <form onSubmit={handleSubmitForm} className="lg:col-span-7 space-y-5">
              <h3 className="text-lg font-serif font-bold text-luxury-charcoal border-b border-luxury-border pb-3">Shipping Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-4 py-3 border border-luxury-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream" />
                <input required type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-4 py-3 border border-luxury-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required type="tel" placeholder="Phone / WhatsApp (+91 ...)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="px-4 py-3 border border-luxury-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream" />
                <input required type="text" placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="px-4 py-3 border border-luxury-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream" />
              </div>

              <input required type="text" placeholder="Street Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-3 border border-luxury-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required type="text" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="px-4 py-3 border border-luxury-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream" />
                <input required type="text" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="px-4 py-3 border border-luxury-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream" />
              </div>

              <button type="submit" className="w-full bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal py-4 text-xs font-bold tracking-widest uppercase transition-all rounded-sm shadow-md">
                Proceed to Payment →
              </button>
            </form>
          ) : (
            <div className="lg:col-span-7 space-y-6">
              <h3 className="text-lg font-serif font-bold text-luxury-charcoal border-b border-luxury-border pb-3">Select Payment Gateway</h3>
              <p className="text-xs text-gray-500 font-light">Complete your secure payment of ₹{cartTotal.toLocaleString("en-IN")} via Razorpay to initiate immediate production in Tirupur.</p>
              <RazorpayCheckout amount={cartTotal} orderDetails={form} />
              <button onClick={() => setStep("form")} className="text-xs text-luxury-gold font-bold hover:underline">
                &larr; Edit Shipping Address
              </button>
            </div>
          )}

          <div className="lg:col-span-5 bg-luxury-charcoal text-white p-8 rounded-lg flex flex-col justify-between space-y-6 shadow-xl">
            <div>
              <h3 className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold border-b border-white/10 pb-4">Order Summary ({cartItems.length} items)</h3>
              <div className="space-y-3 mt-4 text-xs max-h-60 overflow-y-auto pr-2">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between gap-4 border-b border-white/10 pb-2">
                    <span className="text-gray-300 truncate">{item.product}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{item.specs || ''}</span>
                    <span className="font-bold text-luxury-softgold shrink-0">₹{item.price || 1850}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4 mt-4 flex justify-between text-base font-bold font-serif text-luxury-softgold">
                <span>Total Amount</span><span>₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              All batches are woven and printed in Tirupur with rigorous quality inspection before dispatch.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
