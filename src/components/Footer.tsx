"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTS } from "@/data/products";
import { SITE, whatsappLink } from "@/lib/site";

const INPUT_CLASS =
  "px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold";

export default function Footer() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    brand: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    window.open(
      whatsappLink(
        `New inquiry from the Vector Labels website:\n- Name: ${formData.name}\n- Email: ${formData.email}\n- Phone: ${formData.phone}\n- Brand: ${formData.brand || "—"}\n- Message: ${formData.message}`
      ),
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <footer id="contact" className="bg-luxury-charcoal text-white pt-20 pb-12 border-t border-luxury-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Company */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="relative w-10 h-10 overflow-hidden rounded-full border border-luxury-gold/50 p-1 bg-white">
                <Image
                  src="/Logo.png"
                  alt="Vector Labels"
                  width={40}
                  height={40}
                  className="object-contain w-full h-full"
                />
              </span>
              <span className="font-serif font-bold text-lg tracking-[0.08em] text-white">
                VECTOR LABELS
              </span>
            </Link>
            <p className="text-xs text-gray-400 font-light leading-relaxed max-w-sm">
              Tirupur&#8217;s manufacturer of custom woven labels, organic cotton
              tags, satin and taffeta ribbons, hang tags and woven patches for
              fashion brands worldwide.
            </p>
            <address className="space-y-3 text-xs text-gray-300 not-italic">
              <p className="flex items-start gap-2">
                <span aria-hidden="true" className="text-luxury-gold">📍</span>
                <span>
                  {SITE.street}, {SITE.city}, {SITE.region} {SITE.postalCode}, India
                </span>
              </p>
              <p className="flex items-center gap-2">
                <span aria-hidden="true" className="text-luxury-gold">📞</span>
                <a href={`tel:${SITE.whatsapp}`} className="hover:text-luxury-gold">
                  {SITE.phoneDisplay}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span aria-hidden="true" className="text-luxury-gold">✉️</span>
                <a href={`mailto:${SITE.email}`} className="hover:text-luxury-gold">
                  {SITE.email}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span aria-hidden="true" className="text-luxury-gold">🕘</span>
                {SITE.hours}
              </p>
            </address>
          </div>

          {/* Product links — internal links for customers and crawlers */}
          <nav aria-label="Products" className="lg:col-span-2 space-y-4">
            <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-luxury-gold">
              Products
            </h2>
            <ul className="space-y-2 text-xs text-gray-300">
              {PRODUCTS.map((product) => (
                <li key={product.slug}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="hover:text-luxury-gold transition-colors"
                  >
                    {product.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Inquiry form */}
          <div className="lg:col-span-6 bg-white/5 p-8 rounded-xl border border-white/10">
            <h2 className="text-lg font-serif font-bold text-white mb-2">
              Request a custom quote
            </h2>
            <p className="text-xs text-gray-400 font-light mb-6">
              Send your specifications and our Tirupur team will reply with a
              quotation and proof.
            </p>

            {submitted ? (
              <div
                role="status"
                className="p-6 bg-luxury-gold/20 border border-luxury-gold text-luxury-softgold text-xs rounded text-center space-y-2"
              >
                <p className="font-bold text-sm">Thank you for your inquiry</p>
                <p>
                  WhatsApp should have opened with your details. If it did not,{" "}
                  <a
                    href={whatsappLink("Hi Vector Labels Team, I would like a quotation.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold"
                  >
                    tap here
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="sr-only">Your name</span>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(event) =>
                        setFormData({ ...formData, name: event.target.value })
                      }
                      className={`${INPUT_CLASS} w-full`}
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">Email address</span>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(event) =>
                        setFormData({ ...formData, email: event.target.value })
                      }
                      className={`${INPUT_CLASS} w-full`}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="sr-only">Phone or WhatsApp number</span>
                    <input
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="Phone / WhatsApp"
                      value={formData.phone}
                      onChange={(event) =>
                        setFormData({ ...formData, phone: event.target.value })
                      }
                      className={`${INPUT_CLASS} w-full`}
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">Brand name</span>
                    <input
                      type="text"
                      placeholder="Brand name"
                      value={formData.brand}
                      onChange={(event) =>
                        setFormData({ ...formData, brand: event.target.value })
                      }
                      className={`${INPUT_CLASS} w-full`}
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="sr-only">Your requirements</span>
                  <textarea
                    rows={3}
                    required
                    placeholder="Label dimensions, fabric, fold type and quantity…"
                    value={formData.message}
                    onChange={(event) =>
                      setFormData({ ...formData, message: event.target.value })
                    }
                    className={`${INPUT_CLASS} w-full`}
                  />
                </label>
                <button
                  type="submit"
                  className="w-full bg-luxury-gold text-luxury-charcoal hover:bg-white py-4 text-xs font-bold tracking-widest uppercase transition-all rounded-sm shadow-md"
                >
                  Submit inquiry &amp; open WhatsApp →
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-gray-500 tracking-widest uppercase font-semibold">
          <p>
            © {SITE.copyrightYear} {SITE.name}. Manufactured in {SITE.city}, India.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-luxury-gold transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-luxury-gold transition-colors">
              Terms
            </Link>
            <Link href="/track" className="hover:text-luxury-gold transition-colors">
              Track order
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
