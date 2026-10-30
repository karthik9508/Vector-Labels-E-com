import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductShowcase from "@/components/ProductShowcase";
import PricingCalculator from "@/components/PricingCalculator";
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

        {/* Main Content Area - User journey flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-1440 mx-auto px-6">
          {/* Left Column - Product Discovery */}
          <div className="lg:col-span-2 space-y-12">
            <ProductShowcase />
            <PricingCalculator />
          </div>

          {/* Right Column - Design & Customization */}
          <div className="space-y-12">
            <FAQ />
          </div>
        </div>

        {/* Bottom CTA / Summary */}
        <div className="bg-luxury-charcoal text-white py-12 mt-12">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-white mb-4">
              Ready to Create Your Custom Labels?
            </h2>
            <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
              Design your custom clothing labels in 3 simple steps: Select product → Customize design → Complete payment
            </p>
            <div className="space-y-4">
              <Link
                href="/#customizer"
                className="bg-luxury-gold text-luxury-charcoal hover:bg-white px-8 py-3 rounded-sm text-xs font-bold tracking-widest uppercase transition-all shadow-md"
              >
                Start Customizing →
              </Link>
              <Link
                href="/#products"
                className="bg-transparent border-2 border-white/30 px-8 py-3 rounded-sm text-xs font-bold tracking-widest uppercase hover:text-white transition-all"
              >
                Browse Products →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}