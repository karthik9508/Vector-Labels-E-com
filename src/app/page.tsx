import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductShowcase from "@/components/ProductShowcase";
import PricingCalculator from "@/components/PricingCalculator";
import TestimonialsAndProcess from "@/components/TestimonialsAndProcess";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
      <Navbar />

      <div className="flex-1">
        {/* Hero Section - Top of funnel awareness */}
        <Hero />

        {/* AI Studio Banner Teaser */}
        <section className="bg-gradient-to-r from-luxury-charcoal via-[#1a1a1a] to-luxury-charcoal text-white py-12 border-y border-luxury-gold/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">✨ Interactive AI Generator</span>
              <h2 className="text-2xl md:text-3xl font-bold font-serif">Design Your Brand Label in Real-Time</h2>
              <p className="text-xs text-gray-300 font-light max-w-xl">
                Choose fonts, icons, layouts, and colors, or let our AI generate custom label concepts tailored to your clothing brand instantly.
              </p>
            </div>
            <Link
              href="/ai-studio"
              className="bg-luxury-gold text-luxury-charcoal hover:bg-white hover:text-luxury-charcoal px-8 py-4 rounded-md text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-lg whitespace-nowrap"
            >
              Launch AI Studio →
            </Link>
          </div>
        </section>

        {/* Main Content Area - User journey flow */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
          <div className="space-y-16">
            <ProductShowcase />
            <PricingCalculator />
          </div>
        </div>

        {/* Process Steps, Trust Stats & Testimonials */}
        <TestimonialsAndProcess />

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <FAQ />
        </div>

        {/* Bottom CTA / Summary */}
        <section className="bg-luxury-charcoal text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10 space-y-6">
            <span className="text-xs uppercase font-bold tracking-[0.3em] text-luxury-gold">Ready to Elevate Your Apparel?</span>
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-white leading-tight">
              Craft Your Custom Labels With Tirupur&#8217;s Finest
            </h2>
            <p className="text-sm md:text-base text-gray-300 font-light max-w-xl mx-auto leading-relaxed">
              Join 1,500+ fashion brands trusting Vector Labels for uncompromising quality, sustainable organic materials, and rapid express delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/ai-studio"
                className="bg-luxury-gold text-luxury-charcoal hover:bg-white px-8 py-4 rounded-md text-xs font-bold tracking-widest uppercase transition-all shadow-xl"
              >
                Launch AI Studio →
              </Link>
              <a
                href="https://wa.me/918608847513?text=Hi%20Vector%20Labels%20Team%2C%20I%20want%20to%20discuss%20clothing%20labels%20for%20my%20brand."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent border-2 border-white/40 text-white hover:bg-white hover:text-luxury-charcoal px-8 py-4 rounded-md text-xs font-bold tracking-widest uppercase transition-all"
              >
                WhatsApp Inquiry (+91 86088 47513)
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
