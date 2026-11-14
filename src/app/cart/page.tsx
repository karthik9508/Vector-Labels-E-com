"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { formatINR, formatQuantity } from "@/lib/pricing";

export default function CartPage() {
  const router = useRouter();
  const { items, ready, remove, setQuantity, clear, total, count } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full">
        <div className="mb-12 space-y-2">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">
            Shopping cart &amp; batches
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-serif text-luxury-charcoal">
            Your selected label specifications
          </h1>
        </div>

        {!ready ? (
          <div className="bg-white p-12 rounded-xl border border-luxury-border text-center">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Loading your cart…
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-luxury-border text-center space-y-6">
            <p className="text-gray-500 text-sm font-light">
              Your cart is empty. Configure a label batch in the calculator or
              design one in the AI Studio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/ai-studio"
                className="bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal px-8 py-3 text-xs font-bold tracking-widest uppercase rounded-sm transition-all"
              >
                Create your design
              </Link>
              <Link
                href="/#calculator"
                className="bg-transparent border border-luxury-charcoal text-luxury-charcoal hover:bg-luxury-charcoal hover:text-white px-8 py-3 text-xs font-bold tracking-widest uppercase rounded-sm transition-all"
              >
                Calculate a price
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white rounded-xl border border-luxury-border shadow-sm overflow-hidden">
              <ul className="divide-y divide-luxury-border">
                {items.map((item) => (
                  <li key={item.id} className="p-6 flex flex-col sm:flex-row gap-5">
                    <div
                      aria-hidden="true"
                      className="w-16 h-16 rounded-sm border border-luxury-border shrink-0 flex items-center justify-center text-[8px] font-bold uppercase tracking-widest"
                      style={
                        item.swatch
                          ? { backgroundColor: item.swatch.background, color: item.swatch.text }
                          : { backgroundColor: "#F1F1EF", color: "#9ca3af" }
                      }
                    >
                      {item.swatch ? "PREVIEW" : "BATCH"}
                    </div>

                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="font-serif font-bold text-luxury-charcoal text-base">
                          {item.slug ? (
                            <Link href={`/products/${item.slug}`} className="hover:text-luxury-gold">
                              {item.title}
                            </Link>
                          ) : (
                            item.title
                          )}
                        </h2>
                        <p className="font-bold text-luxury-gold whitespace-nowrap">
                          {formatINR(item.total, 0)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 font-light break-words">
                        {item.specs}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 pt-1">
                        <div className="flex items-center border border-luxury-border rounded-sm">
                          <button
                            type="button"
                            onClick={() => setQuantity(item.id, item.quantity - 100)}
                            aria-label={`Decrease quantity for ${item.title}`}
                            className="px-3 py-1.5 text-luxury-charcoal hover:bg-luxury-slate"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            min={1}
                            onChange={(event) =>
                              setQuantity(item.id, Number(event.target.value) || 1)
                            }
                            aria-label={`Quantity for ${item.title}`}
                            className="w-20 text-center text-xs font-semibold py-1.5 border-x border-luxury-border bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setQuantity(item.id, item.quantity + 100)}
                            aria-label={`Increase quantity for ${item.title}`}
                            className="px-3 py-1.5 text-luxury-charcoal hover:bg-luxury-slate"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-gray-400">
                          {formatINR(item.unitPrice, 2)} / pc
                        </span>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-widest ml-auto"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="px-6 py-4 bg-luxury-slate border-t border-luxury-border flex justify-between items-center gap-4">
                <Link
                  href="/#products"
                  className="text-[10px] font-bold uppercase tracking-widest text-luxury-charcoal hover:text-luxury-gold"
                >
                  ← Continue shopping
                </Link>
                <button
                  type="button"
                  onClick={clear}
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-600"
                >
                  Empty cart
                </button>
              </div>
            </div>

            <aside className="lg:col-span-4 bg-luxury-charcoal text-white p-8 rounded-xl space-y-6 shadow-xl sticky top-28">
              <h2 className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold border-b border-white/10 pb-4">
                Order summary
              </h2>
              <dl className="space-y-3 text-xs">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-400">Lines</dt>
                  <dd className="font-bold">{formatQuantity(items.length)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-400">Total pieces</dt>
                  <dd className="font-bold">{formatQuantity(count)}</dd>
                </div>
                <div className="flex justify-between gap-4 pt-3 border-t border-white/10 text-base">
                  <dt className="font-serif">Batch estimate</dt>
                  <dd className="font-bold font-serif text-luxury-softgold">
                    {formatINR(total, 0)}
                  </dd>
                </div>
              </dl>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Excludes GST and courier. Final pricing is confirmed on artwork
                proof approval.
              </p>
              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="w-full bg-luxury-gold text-luxury-charcoal hover:bg-white py-4 rounded-sm text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-md"
              >
                Proceed to checkout →
              </button>
            </aside>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
