import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductShowcase from "@/components/ProductShowcase";
import LoginGate from "@/components/LoginGate";
import LiveCustomizer from "@/components/LiveCustomizer";
import PricingCalculator from "@/components/PricingCalculator";
import TestimonialsAndProcess from "@/components/TestimonialsAndProcess";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Link from "next/link";
import { whatsappLink } from "@/lib/site";
import { AuthProtectedLink } from "@/components/AuthProtectedLink";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
      <Navbar />

      <div className="flex-1">
        {/* Hero — top of funnel awareness */}
        <Hero />

        {/* AI Studio teaser */}
        <section className="bg-gradient-to-r from-luxury-charcoal via-[#1a1a1a] to-luxury-charcoal text-white py-12 border-y border-luxury-gold/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">
                ✨ AI concept studio
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-serif">
                Design your brand label in real time
              </h2>
              <p className="text-xs text-gray-300 font-light max-w-xl">
                Design the label by hand — wording, thread colour, typeface and
                finish — or let AI sketch a concept from your own design.
                Download the artwork and watch the price update live.
              </p>
            </div>
            <AuthProtectedLink
              href="/ai-studio"
              className="bg-luxury-gold text-luxury-charcoal hover:bg-white hover:text-luxury-charcoal px-8 py-4 rounded-md text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-lg whitespace-nowrap"
            >
              Launch AI Studio →
            </AuthProtectedLink>
          </div>
        </section>

        {/* Each section owns its own container and full-bleed background. */}
        <ProductShowcase />
        <LoginGate title="Label Customizer" description="Sign in to use the live label customizer and see pricing updates in real time.">
          <LiveCustomizer />
        </LoginGate>
        <LoginGate title="Pricing Calculator" description="Sign in to access live per-piece and batch pricing from our rate card, based on size, material, colour count and quantity breaks.">
          <PricingCalculator />
        </LoginGate>

        {/* Process steps, trust stats & testimonials */}
        <TestimonialsAndProcess />

        <FAQ />

        {/* Bottom CTA */}
        <section className="bg-luxury-charcoal text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10 space-y-6">
            <span className="text-xs uppercase font-bold tracking-[0.3em] text-luxury-gold">
              Ready to elevate your apparel?
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-white leading-tight">
              Craft your custom labels with Tirupur&#8217;s finest
            </h2>
            <p className="text-sm md:text-base text-gray-300 font-light max-w-xl mx-auto leading-relaxed">
              Join 1,500+ fashion brands trusting Vector Labels for
              uncompromising quality, sustainable materials, and rapid express
              delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <AuthProtectedLink
                href="/ai-studio"
                className="bg-luxury-gold text-luxury-charcoal hover:bg-white px-8 py-4 rounded-md text-xs font-bold tracking-widest uppercase transition-all shadow-xl"
              >
                Launch AI Studio →
              </AuthProtectedLink>
              <a
                href={whatsappLink(
                  "Hi Vector Labels Team, I want to discuss clothing labels for my brand."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent border-2 border-white/40 text-white hover:bg-white hover:text-luxury-charcoal px-8 py-4 rounded-md text-xs font-bold tracking-widest uppercase transition-all"
              >
                WhatsApp inquiry (+91 86088 47513)
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
