"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RazorpayCheckout from "@/components/RazorpayCheckout";
import { useCart, type CartItem } from "@/lib/cart";
import { formatINR, formatQuantity } from "@/lib/pricing";
import { SITE, whatsappLink } from "@/lib/site";

interface FormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const FIELD_CLASS =
  "w-full px-4 py-3 border border-luxury-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream text-luxury-charcoal";

export default function CheckoutPage() {
  const { items, ready, total } = useCart();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [step, setStep] = useState<"form" | "payment">("form");
  // Snapshot taken when the customer starts paying, so clearing the cart on
  // success does not unmount the confirmation panel.
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrderItems(items);
    setOrderTotal(total);
    setStep("payment");
  }

  const summaryItems = step === "payment" ? orderItems : items;
  const summaryTotal = step === "payment" ? orderTotal : total;

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto px-6 lg:px-12 py-16 w-full">
        <div className="mb-10 space-y-2">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">
            Secure checkout
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-serif text-luxury-charcoal">
            Confirm order &amp; payment
          </h1>
          <p className="text-xs text-gray-500 font-light">
            Step {step === "form" ? "1" : "2"} of 2 ·{" "}
            {step === "form" ? "delivery details" : "payment"}
          </p>
        </div>

        {!ready ? (
          <div className="bg-white p-12 rounded-xl border border-luxury-border text-center">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Loading your order…
            </p>
          </div>
        ) : step === "form" && items.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-luxury-border text-center space-y-6">
            <p className="text-gray-500 text-sm font-light">
              There is nothing to check out yet.
            </p>
            <Link
              href="/#calculator"
              className="inline-block bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal px-8 py-3 text-xs font-bold tracking-widest uppercase rounded-sm transition-all"
            >
              Build a label batch
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white p-8 rounded-xl shadow-sm border border-luxury-border">
              {step === "form" ? (
                <form onSubmit={handleSubmitForm} className="space-y-5">
                  <h2 className="text-lg font-serif font-bold text-luxury-charcoal border-b border-luxury-border pb-3">
                    Delivery details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="space-y-1 block">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Full name
                      </span>
                      <input
                        required
                        autoComplete="name"
                        value={form.name}
                        onChange={(event) => update("name", event.target.value)}
                        placeholder="Your full name"
                        className={FIELD_CLASS}
                      />
                    </label>
                    <label className="space-y-1 block">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Email
                      </span>
                      <input
                        required
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(event) => update("email", event.target.value)}
                        placeholder="you@brand.com"
                        className={FIELD_CLASS}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="space-y-1 block">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Phone / WhatsApp
                      </span>
                      <input
                        required
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(event) => update("phone", event.target.value)}
                        placeholder="+91 98765 43210"
                        className={FIELD_CLASS}
                      />
                    </label>
                    <label className="space-y-1 block">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Pincode
                      </span>
                      <input
                        required
                        inputMode="numeric"
                        pattern="[0-9]{5,6}"
                        autoComplete="postal-code"
                        value={form.pincode}
                        onChange={(event) => update("pincode", event.target.value)}
                        placeholder="641687"
                        className={FIELD_CLASS}
                      />
                    </label>
                  </div>

                  <label className="space-y-1 block">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Street address
                    </span>
                    <input
                      required
                      autoComplete="street-address"
                      value={form.address}
                      onChange={(event) => update("address", event.target.value)}
                      placeholder="Building, street, area"
                      className={FIELD_CLASS}
                    />
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="space-y-1 block">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        City
                      </span>
                      <input
                        required
                        autoComplete="address-level2"
                        value={form.city}
                        onChange={(event) => update("city", event.target.value)}
                        placeholder="Tirupur"
                        className={FIELD_CLASS}
                      />
                    </label>
                    <label className="space-y-1 block">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        State
                      </span>
                      <input
                        required
                        autoComplete="address-level1"
                        value={form.state}
                        onChange={(event) => update("state", event.target.value)}
                        placeholder="Tamil Nadu"
                        className={FIELD_CLASS}
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal py-4 text-xs font-bold tracking-widest uppercase transition-all rounded-sm shadow-md"
                  >
                    Continue to payment →
                  </button>
                  <p className="text-[10px] text-gray-400 text-center">
                    We only use these details to manufacture and ship your order.
                  </p>
                </form>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-lg font-serif font-bold text-luxury-charcoal border-b border-luxury-border pb-3">
                    Payment
                  </h2>
                  <RazorpayCheckout
                    items={orderItems}
                    customer={form}
                    total={orderTotal}
                  />
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="text-xs text-luxury-gold font-bold hover:underline"
                  >
                    ← Edit delivery details
                  </button>
                </div>
              )}
            </div>

            <aside className="lg:col-span-5 bg-luxury-charcoal text-white p-8 rounded-xl space-y-5 shadow-xl">
              <h2 className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold border-b border-white/10 pb-4">
                Order summary ({formatQuantity(summaryItems.length)} lines)
              </h2>

              <ul className="space-y-3 text-xs max-h-72 overflow-y-auto pr-1">
                {summaryItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-3 border-b border-white/10 pb-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-200 font-semibold truncate">{item.title}</p>
                      <p className="text-[10px] text-gray-500">
                        {formatQuantity(item.quantity)} pcs ·{" "}
                        {formatINR(item.unitPrice, 2)} / pc
                      </p>
                      {item.specs ? (
                        <p className="text-[10px] text-gray-600 mt-0.5 line-clamp-2">{item.specs}</p>
                      ) : null}
                      {item.conceptImageUrl ? (
                        <p className="text-[10px] text-luxury-gold mt-1 font-semibold">
                          AI concept attached
                        </p>
                      ) : null}
                    </div>
                    {item.conceptImageUrl ? (
                      <img
                        src={item.conceptImageUrl}
                        alt=""
                        className="w-12 h-12 rounded object-cover border border-white/10 shrink-0"
                      />
                    ) : null}
                    <span className="font-bold text-luxury-softgold shrink-0 self-center">
                      {formatINR(item.total, 0)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-white/10 pt-4 flex justify-between text-base font-bold font-serif text-luxury-softgold">
                <span>Total</span>
                <span>{formatINR(summaryTotal, 0)}</span>
              </div>

              <p className="text-[10px] text-gray-400 leading-relaxed">
                Excludes GST and courier. Every batch is woven and printed in
                Tirupur and inspected before dispatch.
              </p>

              <a
                href={whatsappLink(
                  `Hi Vector Labels Team, I need help placing this order:\n\n${summaryItems
                    .map(
                      (item) =>
                        `• ${item.title} — ${item.specs} — ${formatINR(item.total, 0)}`
                    )
                    .join("\n")}\n\nTotal: ${formatINR(summaryTotal, 0)}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-luxury-gold"
              >
                Need help? WhatsApp {SITE.phoneDisplay}
              </a>
            </aside>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
