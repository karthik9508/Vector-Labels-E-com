"use client";

import React, { useState } from "react";

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is the minimum order quantity (MOQ) for custom woven labels?",
      a: "Our standard MOQ for high-density damask woven labels is 2,000 pieces per design/colorway. For organic cotton and satin labels, MOQ starts at 1,000 pieces. For hang tags and woven patches, MOQ starts at 500 pieces.",
    },
    {
      q: "Where is manufacturing located and what is your turnaround time?",
      a: "All our labels and hang tags are precision-manufactured in Tirupur, India — the apparel capital. Standard production takes 3 to 7 working days depending on finish and finishing folds, with fast global courier dispatch.",
    },
    {
      q: "Can I get a digital sample proof before full production begins?",
      a: "Yes! Once you submit your artwork or design specifications via WhatsApp or our design studio, our expert technicians generate a digital proof showing exact thread density, fold lines, and color pantones for your approval.",
    },
    {
      q: "What file formats do you accept for custom brand logos?",
      a: "We prefer vector files (.AI, .EPS, .PDF, .CDR, or high-resolution .PNG / .SVG). If you only have a raster sketch or brand name, our design team can vectorize and format it for weaving machinery at no extra charge.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">Frequently Asked Questions</span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-luxury-charcoal">Everything You Need to Know</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="border border-luxury-border rounded-lg overflow-hidden transition-all bg-luxury-cream/50">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left p-6 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-serif font-bold text-base text-luxury-charcoal">{faq.q}</span>
                  <span className="text-luxury-gold text-xl font-bold transition-transform duration-300">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-xs text-gray-600 font-light leading-relaxed border-t border-luxury-border/40 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
