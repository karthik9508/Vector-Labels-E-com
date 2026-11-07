"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LiveCustomizer() {
  const [material, setMaterial] = useState("woven");
  const [bgColor, setBgColor] = useState("#121212");
  const [textColor, setTextColor] = useState("#D4AF37");
  const [brandText, setBrandText] = useState("THE COUTURE CO.");
  const [fontStyle, setFontStyle] = useState("serif");
  const [stitch, setStitch] = useState(true);
  const [addedNotice, setAddedNotice] = useState(false);
  // Batch parameters & size — entered before image generation / pricing
  const [qty, setQty] = useState(2000);
  const [width, setWidth] = useState(20);
  const [length, setLength] = useState(60);
  const [colors, setColors] = useState(1);
  const router = useRouter();

  const materials = [
    { id: "woven", name: "Woven Labels", colors: ["#121212", "#FAF9F6", "#C5A880", "#1E3A8A"] },
    { id: "cotton", name: "Cotton Labels", colors: ["#F5F5DC", "#FAF9F6", "#D2B48C", "#3E2723"] },
    { id: "satin", name: "Satin Labels", colors: ["#121212", "#FAF9F6", "#800020", "#000080"] },
    { id: "taffeta", name: "Taffeta Labels", colors: ["#FFFFFF", "#121212", "#708090", "#2F4F4F"] },
    { id: "hangtag", name: "Hang Tags", colors: ["#D4AF37", "#FAF9F6", "#121212", "#C5A880"] },
    { id: "heattransfer", name: "Heat Transfer", colors: ["#121212", "#FAF9F6", "#D4AF37", "#FF4500"] },
  ];

  const currentMatObj = materials.find((m) => m.id === material) || materials[0];

  const fontClass =
    fontStyle === "serif"
      ? "font-serif"
      : fontStyle === "sans"
      ? "font-sans font-medium"
      : fontStyle === "mono"
      ? "font-mono"
      : "font-serif italic";

  const productProfiles: Record<string, { priceType: string; base: number; moq: number; timeline: string }> = {
    woven: { priceType: 'sqmm', base: 0.0010, moq: 2000, timeline: '3 - 5 Days' },
    cotton: { priceType: 'sqmm', base: 0.00075, moq: 2000, timeline: '2 - 3 Days' },
    satin: { priceType: 'sqmm', base: 0.0005, moq: 2000, timeline: '2 - 3 Days' },
    taffeta: { priceType: 'sqmm', base: 0.0005, moq: 2000, timeline: '2 - 3 Days' },
    hangtag: { priceType: 'fixed', base: 1.40, moq: 1000, timeline: '2 - 3 Days' },
    heattransfer: { priceType: 'fixed', base: 2.00, moq: 500, timeline: '2 - 3 Days' }
  };

  const profile = productProfiles[material] || productProfiles.woven;
  const area = width * length;
  let discountFactor = 1.0;
  if (qty >= 10000) discountFactor = 0.65;
  else if (qty >= 5000) discountFactor = 0.75;
  else if (qty >= 2000) discountFactor = 0.88;

  let colorFactor = 1.0;
  if (colors > 1) colorFactor = 1.0 + (colors - 1) * 0.10;

  const unitBase = profile.priceType === 'sqmm' ? profile.base * area * discountFactor * colorFactor : profile.base * discountFactor * colorFactor;
  const unitMin = unitBase * 0.92;
  const unitMax = unitBase * 1.08;
  const totalMin = unitMin * qty;
  const totalMax = unitMax * qty;

  const handleAddToCart = () => {
    const item = {
      product: `${material.toUpperCase()} Label - ${brandText}`,
      specs: `Material: ${material}, Qty: ${qty} pcs, Size: ${width}x${length}mm, Color: ${bgColor}, Text: ${textColor}, Font: ${fontStyle}, Stitch: ${stitch ? "Yes" : "No"}`,
      price: Math.round(totalMin),
    };
    try {
      const existing = JSON.parse(localStorage.getItem("vector_cart") || "[]");
      localStorage.setItem("vector_cart", JSON.stringify([...existing, item]));
    } catch {
      // fallback
    }
    setAddedNotice(true);
    setTimeout(() => {
      router.push("/cart");
    }, 1000);
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hi Vector Labels Team, I want to order custom labels with the following spec (configured via Live Studio Customizer):\n- Material: ${material}\n- Brand Name: ${brandText}\n- Dimensions: ${width}mm width x ${length}mm length\n- Quantity: ${qty} pcs\n- Background Color: ${bgColor}\n- Text Color: ${textColor}\n- Font: ${fontStyle}\n- Stitch Border: ${stitch ? "Yes" : "No"}\n- Estimated Unit Price: ₹${unitMin.toFixed(2)} - ₹${unitMax.toFixed(2)}\n- Estimated Total: ₹${Math.round(totalMin).toLocaleString()} - ₹${Math.round(totalMax).toLocaleString()}`
    );
    window.open(`https://wa.me/918608847513?text=${text}`, "_blank");
  };

  return (
    <section id="customizer" className="py-20 bg-luxury-cream border-b border-luxury-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Headline block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-4">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">Visual Sandbox Tool</span>
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-luxury-charcoal">Design Your Brand Label</h2>
            <div className="w-16 h-[2px] bg-luxury-gold mt-4"></div>
            <p className="text-gray-500 font-light pt-2">
              Simulate real-world label styles, textures, colors, and premium lettering in real-time. Craft a preview of your label and place your order directly on the web or via WhatsApp.
            </p>
          </div>
          <div className="flex justify-center">
            <Image
              src="/images/design_brand_label.png"
              alt="Design Your Brand Label Workspace"
              width={600}
              height={320}
              className="rounded-xl shadow-2xl w-full max-h-80 object-cover border border-luxury-border"
            />
          </div>
        </div>

        {/* Main Customizer UI */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-6 md:p-10 rounded-xl shadow-xl border border-luxury-border max-w-6xl mx-auto">
          {/* Left Control Panel */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-lg font-bold font-serif tracking-wider text-luxury-charcoal uppercase border-b border-luxury-border pb-3">
              Configuration Options
            </h3>

            {/* Label Material */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Label Material / Fabric:</label>
              <div className="grid grid-cols-2 gap-2">
                {materials.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMaterial(m.id);
                      setBgColor(m.colors[0]);
                    }}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-sm border tracking-widest uppercase transition-all ${
                      material === m.id
                        ? "border-luxury-gold bg-luxury-charcoal text-white"
                        : "border-luxury-border hover:border-luxury-gold text-luxury-charcoal"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Background Color:</label>
              <div className="flex gap-3">
                {currentMatObj.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setBgColor(c)}
                    className={`w-8 h-8 rounded-full border-2 ${bgColor === c ? "border-luxury-gold scale-110 shadow-md" : "border-luxury-border"}`}
                    style={{ backgroundColor: c }}
                    title={c}
                  ></button>
                ))}
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Text &amp; Thread Color:</label>
              <div className="flex gap-3">
                {["#FAF9F6", "#D4AF37", "#121212", "#C5A880"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setTextColor(c)}
                    className={`w-8 h-8 rounded-full border-2 ${textColor === c ? "border-luxury-gold scale-110 shadow-md" : "border-luxury-border"}`}
                    style={{ backgroundColor: c }}
                    title={c}
                  ></button>
                ))}
              </div>
            </div>

            {/* Brand Name Input */}
            <div className="space-y-2">
              <label htmlFor="brand-name-input" className="block text-xs font-bold uppercase tracking-widest text-gray-500">Brand Name / Text:</label>
              <input
                id="brand-name-input"
                type="text"
                value={brandText}
                onChange={(e) => setBrandText(e.target.value)}
                placeholder="Enter Brand Name"
                className="w-full px-4 py-3 border border-luxury-border rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream text-sm font-semibold tracking-wider transition-all text-luxury-charcoal"
              />
            </div>

            {/* Typography Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Lettering Typography:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "serif", label: "Classic Serif", cls: "font-serif" },
                  { id: "sans", label: "Modern Outfit", cls: "font-sans" },
                  { id: "mono", label: "Minimal Mono", cls: "font-mono" },
                  { id: "cursive", label: "Luxury Script", cls: "font-serif italic" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontStyle(f.id)}
                    className={`px-3 py-2 text-xs font-semibold rounded-sm border transition-all ${f.cls} ${
                      fontStyle === f.id ? "border-luxury-gold bg-luxury-charcoal text-white" : "border-luxury-border text-luxury-charcoal hover:border-luxury-gold"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stitch Border Checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <input
                id="stitch-border-checkbox"
                type="checkbox"
                checked={stitch}
                onChange={(e) => setStitch(e.target.checked)}
                className="w-4 h-4 text-luxury-gold focus:ring-luxury-gold border-gray-300 rounded cursor-pointer accent-luxury-gold"
              />
              <label htmlFor="stitch-border-checkbox" className="text-xs font-bold uppercase tracking-widest text-gray-500 cursor-pointer select-none">
                Include Stitched Border Effect
              </label>
            </div>

            {/* Batch Parameters & Size (entered before image generation) */}
            <div className="space-y-4 pt-4 border-t border-luxury-border">
              <h4 className="text-xs font-bold uppercase tracking-widest text-luxury-charcoal">Batch Parameters & Size</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label htmlFor="customizer-qty" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">Qty (pcs)</label>
                  <input
                    id="customizer-qty"
                    type="number"
                    value={qty}
                    min={profile.moq}
                    step={profile.moq >= 500 ? 500 : 100}
                    onChange={(e) => setQty(parseInt(e.target.value) || profile.moq)}
                    className="w-full px-3 py-2 border border-luxury-border rounded-sm bg-luxury-cream text-xs font-semibold text-luxury-charcoal"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="customizer-width" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">Width (mm)</label>
                  <input
                    id="customizer-width"
                    type="number"
                    value={width}
                    min={5}
                    max={200}
                    onChange={(e) => setWidth(parseInt(e.target.value) || 20)}
                    className="w-full px-3 py-2 border border-luxury-border rounded-sm bg-luxury-cream text-xs font-semibold text-luxury-charcoal"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="customizer-length" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">Length (mm)</label>
                  <input
                    id="customizer-length"
                    type="number"
                    value={length}
                    min={5}
                    max={300}
                    onChange={(e) => setLength(parseInt(e.target.value) || 60)}
                    className="w-full px-3 py-2 border border-luxury-border rounded-sm bg-luxury-cream text-xs font-semibold text-luxury-charcoal"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Canvas Preview Panel */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8 bg-luxury-slate p-6 rounded-lg border border-luxury-border/60">

            <div className="space-y-6">
              <h4 className="text-xs uppercase font-bold tracking-[0.2em] text-gray-500 mb-4">Fabric Canvas Live Render</h4>

              <div className="w-full flex justify-center items-center py-16 bg-[#e0dcd3] rounded shadow-inner relative overflow-hidden">
                <div
                  className="w-72 h-36 flex items-center justify-center relative shadow-2xl transition-all duration-500 rounded-sm border border-black/10 select-none"
                  style={{ backgroundColor: bgColor }}
                >
                  {stitch && (
                    <div className="absolute inset-1.5 border border-dashed border-white/40 rounded-sm pointer-events-none"></div>
                  )}

                  <div className="text-center px-4 relative z-10 max-w-full">
                    <h5 className={`text-xl font-bold tracking-[0.2em] uppercase transition-all duration-300 truncate ${fontClass}`} style={{ color: textColor }}>
                      {brandText || "YOUR BRAND"}
                    </h5>
                    <p className="text-[8px] tracking-[0.35em] uppercase font-semibold transition-all mt-1.5 opacity-80" style={{ color: textColor }}>
                      EST. 2026
                    </p>
                  </div>

                  <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/20 border-r border-white/5"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-black/20 border-l border-white/5"></div>
                </div>
              </div>

              {/* Live Pricing Estimate Card — shown before image generation, after parameters entered */}
              <div className="bg-luxury-charcoal text-white p-4 rounded-lg border border-luxury-gold/30 space-y-3 shadow-md">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-luxury-gold">Live Pricing Estimate (Before Image Generation)</span>
                  <span className="text-[10px] text-gray-300 font-semibold">MOQ: {profile.moq.toLocaleString()} pcs</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Unit Price Range:</p>
                    <p className="text-xl font-bold font-serif text-luxury-softgold">₹{unitMin.toFixed(2)} - ₹{unitMax.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Total Est. Cost:</p>
                    <p className="text-lg font-bold text-white">₹{Math.round(totalMin).toLocaleString()} - ₹{Math.round(totalMax).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {addedNotice && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded text-center font-bold">
                  Design added to cart successfully! Redirecting...
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-luxury-gold text-luxury-charcoal hover:bg-white py-4 px-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-sm shadow-md"
                >
                  Add Design to Cart
                </button>
                <button
                  onClick={handleWhatsAppInquiry}
                  className="w-full bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal py-4 px-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-sm shadow-md"
                >
                  Order via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
