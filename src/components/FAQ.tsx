"use client";

import React, { useState } from "react";
import { FAQS } from "@/data/faqs";

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <section id="faq" className="py-20 bg-white scroll-mt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">
            Frequently asked questions
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-luxury-charcoal">
            Everything you need to know
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            const panelId = `faq-panel-${idx}`;
            const buttonId = `faq-button-${idx}`;
            return (
              <div
                key={faq.question}
                className="border border-luxury-border rounded-lg overflow-hidden transition-all bg-luxury-cream/50"
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full text-left p-6 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold"
                  >
                    <span className="font-serif font-bold text-base text-luxury-charcoal">
                      {faq.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-luxury-gold text-xl font-bold transition-transform duration-300"
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="px-6 pb-6 text-xs text-gray-600 font-light leading-relaxed border-t border-luxury-border/40 pt-4"
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
