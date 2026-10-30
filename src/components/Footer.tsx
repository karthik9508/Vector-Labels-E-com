"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    brand: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const whatsappText = encodeURIComponent(
      `New Inquiry from Vector Labels Website:\n- Name: ${formData.name}\n- Email: ${formData.email}\n- Phone: ${formData.phone}\n- Brand: ${formData.brand}\n- Message: ${formData.message}`
    );
    window.open(`https://wa.me/918608847513?text=${whatsappText}`, "_blank");
  };

  return (
    <footer id="contact" className="bg-luxury-charcoal text-white pt-20 pb-12 border-t border-luxury-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Company Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 overflow-hidden rounded-full border border-luxury-gold/50 p-1 bg-white">
                <Image src="/images/vector logo.webp" alt="Vector Labels" width={40} height={40} className="object-contain w-full h-full" />
              </div>
              <span className="font-serif font-bold text-lg tracking-[0.08em] text-white">VECTOR LABELS</span>
            </div>
            <p className="text-xs text-gray-400 font-light leading-relaxed max-w-sm">
              Tirupur&#8217;s premier manufacturer of custom woven labels, organic cotton tags, satin ribbons, hang tags, and woven patches for elite fashion brands worldwide.
            </p>
            <div className="space-y-3 text-xs text-gray-300">
              <p className="flex items-center gap-2">
                <span className="text-luxury-gold">📍</span> 7th street, Mahalakshmi Nagar, Tirupur, TN 641687, India
              </p>
              <p className="flex items-center gap-2">
                <span className="text-luxury-gold">📞</span> +91 86088 47513
              </p>
              <p className="flex items-center gap-2">
                <span className="text-luxury-gold">✉️</span> contact@vectorlabels.com
              </p>
            </div>
          </div>

          {/* Inquiry / Lead Capture Form */}
          <div className="lg:col-span-7 bg-white/5 p-8 rounded-xl border border-white/10">
            <h3 className="text-lg font-serif font-bold text-white mb-2">Request a Custom Quote or Callback</h3>
            <p className="text-xs text-gray-400 font-light mb-6">Fill out your specifications or connect directly with our Tirupur manufacturing team.</p>

            {submitted ? (
              <div className="p-6 bg-luxury-gold/20 border border-luxury-gold text-luxury-softgold text-xs rounded text-center space-y-2">
                <p className="font-bold text-sm">Thank you for your inquiry!</p>
                <p>WhatsApp has been opened with your details. Our team will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    required
                    placeholder="Phone / WhatsApp (+91 ...)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold"
                  />
                  <input
                    type="text"
                    placeholder="Brand Name"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold"
                  />
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your label dimensions, fabric style, fold type, and quantities..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-luxury-gold text-luxury-charcoal hover:bg-white py-4 text-xs font-bold tracking-widest uppercase transition-all rounded-sm shadow-md"
                >
                  Submit Inquiry &amp; Open WhatsApp →
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-500 tracking-widest uppercase font-semibold">
          <p>&copy; 2026 Vector Labels. All rights reserved. Manufactured in Tirupur, India.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <Link href="#home" className="hover:text-luxury-gold transition-colors">Privacy Policy</Link>
            <Link href="#home" className="hover:text-luxury-gold transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
