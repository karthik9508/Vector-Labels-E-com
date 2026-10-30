"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-luxury-cream/95 backdrop-blur-md border-b border-luxury-border transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border border-luxury-gold/30 p-1 bg-white shadow-sm group-hover:border-luxury-gold transition-colors">
              <Image
                src="/images/vector logo.webp"
                alt="Vector Labels Logo"
                width={40}
                height={40}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg tracking-[0.08em] text-luxury-charcoal">VECTOR LABELS</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-luxury-gold font-semibold">Tirupur, India</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-bold tracking-[0.15em] uppercase text-luxury-charcoal">
            <Link href="/" className="hover:text-luxury-gold transition-colors py-2">Home</Link>
            <Link href="/ai-studio" className="text-luxury-gold hover:text-luxury-charcoal transition-colors py-2">Create Your Design</Link>
            <Link href="/#products" className="hover:text-luxury-gold transition-colors py-2">Products</Link>
            <Link href="/#calculator" className="hover:text-luxury-gold transition-colors py-2">Pricing Calculator</Link>
            <Link href="/cart" className="hover:text-luxury-gold transition-colors py-2 font-bold text-luxury-gold">🛒 Cart &amp; Checkout</Link>
            <Link href="/dashboard" className="hover:text-luxury-gold transition-colors py-2">Sign In</Link>
          </nav>

          {/* Desktop CTA (WhatsApp only, single Cart in Nav) */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://wa.me/918608847513?text=Hi%20Vector%20Labels%20Team%2C%20I%20want%20to%20discuss%20clothing%20labels%20for%20my%20brand."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal px-6 py-3 rounded-sm text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300 shadow-sm"
            >
              WhatsApp Inquiry
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 focus:outline-none"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-luxury-charcoal transition-transform ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
            <span className={`block w-4 h-0.5 bg-luxury-charcoal transition-opacity ml-2 ${mobileMenuOpen ? "opacity-0" : ""}`}></span>
            <span className={`block w-6 h-0.5 bg-luxury-charcoal transition-transform ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-80 max-w-full bg-luxury-cream p-8 shadow-2xl flex flex-col justify-between border-l border-luxury-gold/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-luxury-border pb-6">
                <div className="flex items-center gap-2">
                  <Image src="/images/vector logo.webp" alt="Vector Labels" width={32} height={32} className="h-8 w-8 object-contain" />
                  <span className="font-serif font-bold text-lg tracking-[0.05em]">VECTOR LABELS</span>
                </div>
                <button className="text-2xl hover:text-luxury-gold focus:outline-none" onClick={() => setMobileMenuOpen(false)}>&times;</button>
              </div>

              <nav>
                <ul className="flex flex-col gap-6 text-sm font-semibold tracking-widest uppercase">
                  <li><Link href="/" onClick={() => setMobileMenuOpen(false)} className="block hover:text-luxury-gold py-2 border-b border-luxury-border/50">Home</Link></li>
                  <li><Link href="/ai-studio" onClick={() => setMobileMenuOpen(false)} className="block hover:text-luxury-gold py-2 border-b border-luxury-border/50 text-luxury-gold font-bold">Create Your Design</Link></li>
                  <li><Link href="/#products" onClick={() => setMobileMenuOpen(false)} className="block hover:text-luxury-gold py-2 border-b border-luxury-border/50">Our Products</Link></li>
                  <li><Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="block hover:text-luxury-gold py-2 border-b border-luxury-border/50 text-luxury-gold font-bold">🛒 Cart &amp; Checkout</Link></li>
                  <li><Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block hover:text-luxury-gold py-2 border-b border-luxury-border/50">Sign In</Link></li>
                </ul>
              </nav>
            </div>

            <div className="space-y-4 pt-6 border-t border-luxury-border">
              <a
                href="https://wa.me/918608847513?text=Hi%20Vector%20Labels%20Team%2C%20I%20want%20to%20discuss%20clothing%20labels%20for%20my%20brand."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal py-4 rounded-sm text-xs font-bold tracking-widest uppercase transition-all duration-300"
              >
                WhatsApp Inquiry
              </a>
              <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest font-semibold">© 2026 Vector Labels Tirupur</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
