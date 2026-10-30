"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductShowcase() {
  const [selectedProduct, setSelectedProduct] = useState<{ title: string; specs: string } | null>(null);

  const products = [
    {
      slug: "woven-labels",
      title: "Woven Labels",
      image: "/images/woven_label_photo.png",
      tag: "High Density Weave",
      desc: "High-density damask weaves featuring detailed thread overlays. The industry benchmark for high-end clothing.",
      specsText: "Material: 100% Premium Fine Polyester Thread Yarns<br>Weave Density: 50, 75, or 100 denier fine weaves for high resolutions<br>Colors Available: Single color base (+10% per extra color)<br>Folding Styles: End fold, center fold, book fold, miter fold, or laser cut flat<br>Pricing: ₹0.0010 per sq mm<br>MOQ: 2,000 pcs<br>Delivery Time: 3 - 5 Days",
    },
    {
      slug: "cotton-labels",
      title: "Cotton Labels",
      image: "/images/cotton_label_photo.png",
      tag: "Organic & Sustainable",
      desc: "Natural 100% organic cotton and herringbone twill tapes. Soft to the touch, biodegradable, and eco-friendly.",
      specsText: "Material: 100% Organic Cotton / Herringbone Twill Tape<br>Print Types: Screen printing, foil stamping, or subtle rotary dye<br>Colors: Natural unbleached cotton, bleached white, custom dyed organic base<br>MOQ: 1,000 pcs<br>Delivery Time: 5 - 7 Days",
    },
    {
      slug: "satin-labels",
      title: "Satin Labels",
      image: "/images/satin_label_photo.png",
      tag: "Silky Smooth",
      desc: "Lustrous, soft satin ribbon labels. Ideal for inner collar care labels, lingerie, and silk garments.",
      specsText: "Material: Double-faced woven edge satin polyester ribbon<br>Finish: Ultra-smooth silk feel with heat-sealed edges preventing fraying<br>Printing: High-definition thermal transfer or silk screen print<br>MOQ: 1,000 pcs<br>Delivery Time: 4 - 6 Days",
    },
    {
      slug: "woven-patches",
      title: "Woven Patches",
      image: "/images/woven_patch_photo.png",
      tag: "Heavy Emblem",
      desc: "Sturdy, heavy-threaded woven emblems. Perfect for retro sleeve accents, heavy hats, and technical outerwear.",
      specsText: "Material: Heavy-gauge premium polyester threads<br>Patch Backings: Plain sew-on, heat-activated iron-on, adhesive stick-on, velcro loops<br>Border Finishes: Merrowed edge or heat-laser clean cuts<br>MOQ: 500 pcs<br>Delivery Time: 9 - 12 working days",
    },
    {
      slug: "hang-tags",
      title: "Hang Tags",
      image: "/images/hangtag_photo.png",
      tag: "Cardstock & Twine",
      desc: "Stately, heavy cardboard and paper tags with foil stamping. Perfect for display branding and customer unboxings.",
      specsText: "Material: 350 GSM to 700 GSM Art Card, Kraft Paper, Textured Linen Paper<br>Finishes: Matte lamination, gloss UV spot, gold/silver foil stamping, embossing<br>MOQ: 500 pcs<br>Delivery Time: 5 - 7 working days",
    },
    {
      slug: "heat-transfer",
      title: "Heat Transfer Labels",
      image: "/images/heattransfer_photo.png",
      tag: "Tagless Comfort",
      desc: "Tagless neck care labels printed directly onto fabric using heat presses. Clean look with zero skin irritation.",
      specsText: "Material: Eco-friendly silicone or plastisol heat transfer inks<br>Durability: Withstands 50+ industrial washes without cracking or fading<br>Application: T-shirts, activewear, baby clothes, innerwear<br>MOQ: 2,000 pcs<br>Delivery Time: 4 - 6 days",
    },
  ];

  return (
    <section id="products" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div className="flex justify-center">
            <Image
              src="/images/premium_labels_showcase.png"
              alt="Premium Labels Showcase"
              width={600}
              height={320}
              className="rounded-xl shadow-2xl w-full max-h-80 object-cover border border-luxury-border"
            />
          </div>
          <div className="space-y-4">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">Craftsmanship &amp; Quality</span>
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-luxury-charcoal">Our Premium Label Collection</h2>
            <div className="w-16 h-[2px] bg-luxury-gold mt-4"></div>
            <p className="text-gray-500 font-light pt-2">
              Manufactured in Tirupur with world-class weaving and printing machinery. Every batch is rigorously inspected for color fastness, yarn density, and precise edge cutting.
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p, idx) => (
            <div key={idx} className="group bg-white border border-luxury-border rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
              <div>
                <Link href={`/products/${p.slug}`}>
                  <div className="relative overflow-hidden aspect-[4/3] bg-luxury-slate cursor-pointer">
                    <Image
                      src={p.image}
                      alt={p.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
                    <span className="absolute top-3 left-3 bg-white border border-luxury-gold/30 text-luxury-charcoal px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold">
                      {p.tag}
                    </span>
                  </div>
                </Link>
                <div className="p-6 space-y-4">
                  <Link href={`/products/${p.slug}`}>
                    <h3 className="text-lg font-serif font-bold text-luxury-charcoal hover:text-luxury-gold transition-colors">{p.title}</h3>
                  </Link>
                  <p className="text-xs text-gray-500 font-light line-clamp-2">{p.desc}</p>
                </div>
              </div>
              <div className="p-6 pt-0">
                <div className="flex items-center justify-between border-t border-luxury-border pt-4">
                  <Link href={`/products/${p.slug}`} className="text-[10px] tracking-widest uppercase text-luxury-gold font-bold hover:underline">
                    View Details →
                  </Link>
                  <button
                    onClick={() => setSelectedProduct({ title: p.title, specs: p.specsText })}
                    className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-luxury-charcoal transition-colors"
                  >
                    Quick Specs
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal / Drawer for Product Specs */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-lg max-w-lg w-full p-8 shadow-2xl relative space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-luxury-border pb-4">
              <h3 className="text-xl font-bold font-serif text-luxury-charcoal">{selectedProduct.title} Specifications</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-2xl hover:text-luxury-gold focus:outline-none">&times;</button>
            </div>
            <div className="text-xs text-gray-600 space-y-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedProduct.specs }}></div>
            <div className="pt-4 border-t border-luxury-border flex justify-end">
              <button
                onClick={() => setSelectedProduct(null)}
                className="bg-luxury-charcoal text-white px-6 py-2.5 rounded-sm text-xs font-bold tracking-widest uppercase hover:bg-luxury-gold hover:text-luxury-charcoal transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
