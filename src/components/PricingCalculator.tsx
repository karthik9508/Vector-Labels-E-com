"use client";

import React, { useState } from "react";

export default function PricingCalculator() {
  const [product, setProduct] = useState("woven");
  const [qty, setQty] = useState(2000);
  const [width, setWidth] = useState(20);
  const [height, setHeight] = useState(60);
  const [colors, setColors] = useState("2");

  const productBaseRates: Record<string, { rate: number; moq: number; timeline: string }> = {
    woven: { rate: 0.0012, moq: 2000, timeline: "3 - 5 Days" },
    cotton: { rate: 0.0018, moq: 1000, timeline: "5 - 7 Days" },
    satin: { rate: 0.0010, moq: 1000, timeline: "4 - 6 Days" },
    taffeta: { rate: 0.0008, moq: 3000, timeline: "3 - 5 Days" },
    hangtag: { rate: 0.0025, moq: 500, timeline: "5 - 7 Days" },
    heattransfer: { rate: 0.0015, moq: 2000, timeline: "4 - 6 Days" },
  };

  const currentConfig = productBaseRates[product] || productBaseRates.woven;
  const area = width * height;
  const colorMultiplier = 1 + (parseInt(colors) - 1) * 0.1;
  const unitPriceEst = area * currentConfig.rate * colorMultiplier;
  const totalPriceEst = unitPriceEst * qty;

  const isBelowMOQ = qty < currentConfig.moq;

  return (
    <section id="calculator" className="py-20 bg-luxury-cream border-t border-b border-luxury-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">Instant Pricing &amp; Quotation</span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-luxury-charcoal">Label Cost Calculator</h2>
          <p className="text-gray-500 font-light">
            Calculate accurate per-piece and bulk batch pricing based on dimensions, material rates, color layers, and quantity minimums.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-6 md:p-10 rounded-xl shadow-xl border border-luxury-border max-w-5xl mx-auto">
          {/* Inputs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Label / Product Type:</label>
              <select
                value={product}
                onChange={(e) => {
                  const val = e.target.value;
                  setProduct(val);
                  setQty(productBaseRates[val].moq);
                }}
                className="w-full px-4 py-3 border border-luxury-border rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream text-xs font-semibold uppercase tracking-wider text-luxury-charcoal"
              >
                <option value="woven">Woven Labels (Damask)</option>
                <option value="cotton">Organic Cotton Labels</option>
                <option value="satin">Satin Ribbon Labels</option>
                <option value="taffeta">Taffeta Labels</option>
                <option value="hangtag">Paper Hang Tags</option>
                <option value="heattransfer">Heat Transfer Labels</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Quantity (Pieces):</label>
                <input
                  type="number"
                  value={qty}
                  min={currentConfig.moq}
                  step={500}
                  onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-luxury-border rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream text-xs font-semibold text-luxury-charcoal"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Color Layers:</label>
                <select
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  className="w-full px-4 py-3 border border-luxury-border rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream text-xs font-semibold uppercase tracking-wider text-luxury-charcoal"
                >
                  <option value="1">1 Color</option>
                  <option value="2">2 Colors</option>
                  <option value="3">3 Colors</option>
                  <option value="4">4+ Colors</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Width (mm):</label>
                <input
                  type="number"
                  value={width}
                  min={5}
                  max={200}
                  onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-luxury-border rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream text-xs font-semibold text-luxury-charcoal"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Height / Length (mm):</label>
                <input
                  type="number"
                  value={height}
                  min={5}
                  max={300}
                  onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-luxury-border rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream text-xs font-semibold text-luxury-charcoal"
                />
              </div>
            </div>

            {isBelowMOQ && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-sm">
                Minimum order quantity for this product is {currentConfig.moq} pcs. Quantity adjusted or noted for custom review.
              </div>
            )}
          </div>

          {/* Pricing Summary Card */}
          <div className="lg:col-span-5 bg-luxury-charcoal text-white p-8 rounded-lg flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-6">
              <h3 className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold border-b border-white/10 pb-4">Estimated Quote</h3>

              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-gray-400">Unit Price Estimate</p>
                <p className="text-3xl font-bold font-serif text-luxury-softgold">₹{unitPriceEst.toFixed(2)} / pc</p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-gray-400">Total Batch Estimate</p>
                <p className="text-xl font-bold text-white">₹{totalPriceEst.toFixed(0)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-400">MOQ</p>
                  <p className="font-bold text-luxury-softgold mt-0.5">{currentConfig.moq} pcs</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-400">Timeline</p>
                  <p className="font-bold text-white mt-0.5">{currentConfig.timeline}</p>
                </div>
              </div>
            </div>

            <a
              href={`https://wa.me/918608847513?text=${encodeURIComponent(`Hi Vector Labels Team, I calculated an estimate for ${qty} pcs of ${product} labels (${width}x${height}mm). Estimated total: ₹${totalPriceEst.toFixed(0)}. Please confirm order!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center bg-luxury-gold text-luxury-charcoal hover:bg-white py-4 rounded-sm text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-md"
            >
              Order via WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
