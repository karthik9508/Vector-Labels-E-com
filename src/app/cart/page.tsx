"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([
    {
      product: "WOVEN LABELS - THE COUTURE CO.",
      specs: "Material: woven, Color: #121212, Text: #D4AF37, Font: serif, Stitch: Yes (2,000 pcs)",
      price: 1850,
    },
  ]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("vector_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setCart(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleRemove = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    try {
      localStorage.setItem("vector_cart", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price || 1850), 0);

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full">
        <div className="mb-12 space-y-2">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">Shopping Cart &amp; Batches</span>
          <h1 className="text-3xl md:text-5xl font-bold font-serif text-luxury-charcoal">Your Selected Label Specifications</h1>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-luxury-border text-center space-y-6">
            <p className="text-gray-500 text-sm font-light">Your cart is empty. Configure a custom label in the live customizer and add it to your order.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#customizer" className="bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal px-8 py-3 text-xs font-bold tracking-widest uppercase rounded-sm transition-all">
                Live Customizer
              </Link>
              <Link href="/#products" className="bg-transparent border border-luxury-charcoal text-luxury-charcoal hover:bg-luxury-charcoal hover:text-white px-8 py-3 text-xs font-bold tracking-widest uppercase rounded-sm transition-all">
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-luxury-border shadow-sm overflow-hidden">
            <div className="divide-y divide-luxury-border">
              {cart.map((item, idx) => (
                <div key={idx} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-luxury-charcoal text-base">{item.product}</h3>
                    <p className="text-xs text-gray-500 font-light">{item.specs}</p>
                  </div>
                  <div className="flex items-center gap-6 justify-between sm:justify-end">
                    <span className="text-base font-bold text-luxury-gold">₹{item.price || 1850}</span>
                    <button
                      onClick={() => handleRemove(idx)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold uppercase tracking-wider"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-luxury-slate p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-luxury-border">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Total Batch Estimate</p>
                <p className="text-3xl font-bold font-serif text-luxury-charcoal mt-1">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </p>
              </div>
              <Link
                href="/checkout"
                className="w-full sm:w-auto text-center bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal px-8 py-4 text-xs font-bold tracking-widest uppercase rounded-sm transition-all duration-300 shadow-xl"
              >
                Proceed to Checkout →
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
