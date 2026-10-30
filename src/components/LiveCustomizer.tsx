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

  const handleAddToCart = () => {
    const item = {
      product: `${material.toUpperCase()} Label - ${brandText}`,
      specs: `Material: ${material}, Color: ${bgColor}, Text: ${textColor}, Font: ${fontStyle}, Stitch: ${stitch ? "Yes" : "No"}`,
      price: 1850, // default batch estimation
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
      `Hi Vector Labels Team, I want to order custom labels with the following spec:\n- Material: ${material}\n- Brand Name: ${brandText}\n- Background Color: ${bgColor}\n- Text Color: ${textColor}\n- Font: ${fontStyle}\n- Stitch Border: ${stitch ? "Yes" : "No"}`
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
          </div>

          {/* Right Canvas Preview Panel */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8 bg-luxury-slate p-6 rounded-lg border border-luxury-border/60">
            <div>
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
