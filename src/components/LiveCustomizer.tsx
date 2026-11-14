"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PRODUCTS, getProduct } from "@/data/products";
import { formatINR, formatQuantity, formatUnitPrice, quote } from "@/lib/pricing";
import { createCartItem, useCart } from "@/lib/cart";
import { whatsappLink } from "@/lib/site";

/** Base colours offered for each fabric, first entry is the default. */
const PALETTES: Record<string, string[]> = {
  "woven-labels": ["#121212", "#FAF9F6", "#C5A880", "#1E3A8A"],
  "cotton-labels": ["#F5F5DC", "#FAF9F6", "#D2B48C", "#3E2723"],
  "satin-labels": ["#121212", "#FAF9F6", "#800020", "#000080"],
  "taffeta-labels": ["#FFFFFF", "#121212", "#708090", "#2F4F4F"],
  "woven-patches": ["#121212", "#FAF9F6", "#C5A880", "#556B2F"],
  "hang-tags": ["#D4AF37", "#FAF9F6", "#121212", "#C5A880"],
  "heat-transfer": ["#121212", "#FAF9F6", "#D4AF37", "#FF4500"],
  "thanks-cards": ["#FAF9F6", "#D4AF37", "#121212", "#C5A880"],
};

const TEXT_COLORS = ["#FAF9F6", "#D4AF37", "#121212", "#C5A880"];

const TYPOGRAPHY = [
  { id: "serif", label: "Classic serif", className: "font-serif" },
  { id: "sans", label: "Modern sans", className: "font-sans font-medium" },
  { id: "mono", label: "Minimal mono", className: "font-mono" },
  { id: "cursive", label: "Luxury script", className: "font-serif italic" },
];

const FIELD_CLASS =
  "w-full px-3 py-2 border border-luxury-border rounded-sm bg-luxury-cream text-xs font-semibold text-luxury-charcoal";
const SMALL_LABEL = "block text-[10px] font-bold uppercase tracking-widest text-gray-500";

export default function LiveCustomizer() {
  const router = useRouter();
  const { add } = useCart();

  const [slug, setSlug] = useState(PRODUCTS[0].slug);
  const product = getProduct(slug) ?? PRODUCTS[0];
  const pricing = product.pricing;
  const isPiecePriced = pricing.model === "piece";
  const palette = PALETTES[slug] ?? PALETTES["woven-labels"];

  const [bgColor, setBgColor] = useState(palette[0]);
  const [textColor, setTextColor] = useState(TEXT_COLORS[1]);
  const [brandText, setBrandText] = useState("THE COUTURE CO.");
  const [fontStyle, setFontStyle] = useState("serif");
  const [stitch, setStitch] = useState(true);

  const [quantity, setQuantity] = useState(pricing.moq);
  const [widthMm, setWidthMm] = useState(20);
  const [lengthMm, setLengthMm] = useState(60);
  const [colors, setColors] = useState(1);
  const [variantId, setVariantId] = useState(pricing.variants?.[0]?.id ?? "");

  const [added, setAdded] = useState(false);

  function selectMaterial(nextSlug: string) {
    const next = getProduct(nextSlug) ?? PRODUCTS[0];
    setSlug(next.slug);
    setBgColor((PALETTES[next.slug] ?? PALETTES["woven-labels"])[0]);
    setQuantity(next.pricing.moq);
    setColors(1);
    setVariantId(next.pricing.variants?.[0]?.id ?? "");
    setAdded(false);
    const variant = next.pricing.variants?.[0];
    if (variant?.widthMm) setWidthMm(variant.widthMm);
    if (variant?.heightMm) setLengthMm(variant.heightMm);
  }

  const result = useMemo(
    () =>
      quote({
        slug,
        quantity,
        widthMm,
        heightMm: lengthMm,
        colors,
        variantId: variantId || undefined,
      }),
    [slug, quantity, widthMm, lengthMm, colors, variantId]
  );

  const fontClass =
    TYPOGRAPHY.find((font) => font.id === fontStyle)?.className ?? TYPOGRAPHY[0].className;

  const specification = isPiecePriced
    ? `Size: ${result.variant?.label ?? "—"} · Qty: ${formatQuantity(result.quantity)} pcs`
    : `Size: ${result.widthMm}×${result.heightMm} mm · Qty: ${formatQuantity(result.quantity)} pcs · ${result.colors} colour(s)`;

  const specSummary = [
    `Material: ${product.title}`,
    specification,
    `Base: ${bgColor}`,
    `Text/thread: ${textColor}`,
    `Lettering: ${TYPOGRAPHY.find((font) => font.id === fontStyle)?.label ?? "Classic serif"}`,
    `Stitched border: ${stitch ? "yes" : "no"}`,
    `Unit price: ${formatUnitPrice(result.unitPrice)}`,
    `Estimated total: ${formatINR(result.total, 0)}`,
  ].join(" · ");

  function handleAddToCart() {
    add(
      createCartItem({
        slug,
        title: `${product.title} — ${brandText || "Custom design"}`,
        specs: specSummary,
        quantity: result.quantity,
        unitPrice: result.unitPrice,
        swatch: { background: bgColor, text: textColor },
      })
    );
    setAdded(true);
    window.setTimeout(() => router.push("/cart"), 900);
  }

  return (
    <section
      id="customizer"
      className="py-20 bg-luxury-cream border-b border-luxury-border scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-4">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">
              Visual sandbox tool
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-luxury-charcoal">
              Design your brand label
            </h2>
            <div className="w-16 h-[2px] bg-luxury-gold mt-4"></div>
            <p className="text-gray-500 font-light pt-2">
              Try fabric, colour, lettering and finishing options and see the
              price update live. Add the design to your cart, or send the full
              specification to our Tirupur team on WhatsApp.
            </p>
          </div>
          <div className="flex justify-center">
            <Image
              src="/images/design_brand_label.png"
              alt="Design your brand label workspace"
              width={600}
              height={320}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-xl shadow-2xl w-full max-h-80 object-cover border border-luxury-border"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-6 md:p-10 rounded-xl shadow-xl border border-luxury-border max-w-6xl mx-auto">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-lg font-bold font-serif tracking-wider text-luxury-charcoal uppercase border-b border-luxury-border pb-3">
              Configuration options
            </h3>

            <fieldset className="space-y-2">
              <legend className={SMALL_LABEL}>Label material / fabric</legend>
              <div className="grid grid-cols-2 gap-2">
                {PRODUCTS.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    aria-pressed={slug === item.slug}
                    onClick={() => selectMaterial(item.slug)}
                    className={`px-3 py-2.5 text-[11px] font-semibold rounded-sm border tracking-wider uppercase transition-all text-left ${
                      slug === item.slug
                        ? "border-luxury-gold bg-luxury-charcoal text-white"
                        : "border-luxury-border hover:border-luxury-gold text-luxury-charcoal"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className={SMALL_LABEL}>Base colour</legend>
              <div className="flex flex-wrap gap-3">
                {palette.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Base colour ${color}`}
                    aria-pressed={bgColor === color}
                    onClick={() => setBgColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      bgColor === color
                        ? "border-luxury-gold scale-110 shadow-md"
                        : "border-luxury-border"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className={SMALL_LABEL}>Text &amp; thread colour</legend>
              <div className="flex flex-wrap gap-3">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Text colour ${color}`}
                    aria-pressed={textColor === color}
                    onClick={() => setTextColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      textColor === color
                        ? "border-luxury-gold scale-110 shadow-md"
                        : "border-luxury-border"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </fieldset>

            <div className="space-y-2">
              <label htmlFor="customizer-brand" className={SMALL_LABEL}>
                Brand name / text
              </label>
              <input
                id="customizer-brand"
                type="text"
                value={brandText}
                maxLength={40}
                onChange={(event) => setBrandText(event.target.value)}
                placeholder="Enter brand name"
                className="w-full px-4 py-3 border border-luxury-border rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream text-sm font-semibold tracking-wider text-luxury-charcoal"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className={SMALL_LABEL}>Lettering typography</legend>
              <div className="grid grid-cols-2 gap-2">
                {TYPOGRAPHY.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    aria-pressed={fontStyle === font.id}
                    onClick={() => setFontStyle(font.id)}
                    className={`px-3 py-2 text-xs font-semibold rounded-sm border transition-all ${font.className} ${
                      fontStyle === font.id
                        ? "border-luxury-gold bg-luxury-charcoal text-white"
                        : "border-luxury-border text-luxury-charcoal hover:border-luxury-gold"
                    }`}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={stitch}
                onChange={(event) => setStitch(event.target.checked)}
                className="w-4 h-4 accent-luxury-gold rounded"
              />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                Include stitched border
              </span>
            </label>

            <div className="space-y-4 pt-4 border-t border-luxury-border">
              <h4 className="text-xs font-bold uppercase tracking-widest text-luxury-charcoal">
                Batch parameters &amp; size
              </h4>
              <div className={`grid grid-cols-1 ${isPiecePriced ? "" : "sm:grid-cols-3"} gap-3`}>
                <div className="space-y-1">
                  <label htmlFor="customizer-qty" className={SMALL_LABEL}>
                    Qty (pcs)
                  </label>
                  <input
                    id="customizer-qty"
                    type="number"
                    value={quantity}
                    min={1}
                    step={pricing.moq >= 1000 ? 500 : 100}
                    onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                    className={FIELD_CLASS}
                  />
                </div>
                {isPiecePriced ? (
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="customizer-variant" className={SMALL_LABEL}>
                      Size / stock
                    </label>
                    <select
                      id="customizer-variant"
                      value={variantId}
                      onChange={(event) => setVariantId(event.target.value)}
                      className={FIELD_CLASS}
                    >
                      {(pricing.variants ?? []).map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label htmlFor="customizer-width" className={SMALL_LABEL}>
                        Width (mm)
                      </label>
                      <input
                        id="customizer-width"
                        type="number"
                        value={widthMm}
                        min={5}
                        max={200}
                        onChange={(event) =>
                          setWidthMm(Math.min(200, Math.max(5, Number(event.target.value) || 5)))
                        }
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="customizer-length" className={SMALL_LABEL}>
                        Length (mm)
                      </label>
                      <input
                        id="customizer-length"
                        type="number"
                        value={lengthMm}
                        min={5}
                        max={300}
                        onChange={(event) =>
                          setLengthMm(Math.min(300, Math.max(5, Number(event.target.value) || 5)))
                        }
                        className={FIELD_CLASS}
                      />
                    </div>
                  </>
                )}
              </div>
              {!isPiecePriced && pricing.colorSurcharge > 0 ? (
                <div className="space-y-1">
                  <label htmlFor="customizer-colors" className={SMALL_LABEL}>
                    Colour count
                  </label>
                  <select
                    id="customizer-colors"
                    value={colors}
                    onChange={(event) => setColors(Number(event.target.value))}
                    className={FIELD_CLASS}
                  >
                    {[1, 2, 3, 4, 5, 6].map((count) => (
                      <option key={count} value={count}>
                        {count} {count === 1 ? "colour" : "colours"}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8 bg-luxury-slate p-6 rounded-lg border border-luxury-border/60">
            <div className="space-y-6">
              <h4 className="text-xs uppercase font-bold tracking-[0.2em] text-gray-500">
                Fabric canvas live render
              </h4>

              <div className="w-full flex justify-center items-center py-14 bg-[#e0dcd3] rounded shadow-inner relative overflow-hidden">
                <div
                  className="w-72 h-36 flex items-center justify-center relative shadow-2xl transition-all duration-500 rounded-sm border border-black/10 select-none overflow-hidden"
                  style={{ backgroundColor: bgColor }}
                >
                  {stitch ? (
                    <div className="absolute inset-1.5 border border-dashed border-white/40 rounded-sm pointer-events-none" />
                  ) : null}

                  <div className="text-center px-6 relative z-10 max-w-full">
                    <p
                      className={`text-xl font-bold tracking-[0.2em] uppercase transition-all duration-300 truncate ${fontClass}`}
                      style={{ color: textColor }}
                    >
                      {brandText || "YOUR BRAND"}
                    </p>
                    <p
                      className="text-[8px] tracking-[0.35em] uppercase font-semibold mt-1.5 opacity-80"
                      style={{ color: textColor }}
                    >
                      EST. 2026
                    </p>
                  </div>

                  <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/20 border-r border-white/5" />
                  <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-black/20 border-l border-white/5" />
                </div>
              </div>

              <div className="bg-luxury-charcoal text-white p-4 rounded-lg border border-luxury-gold/30 space-y-3 shadow-md">
                <div className="flex justify-between items-center border-b border-white/10 pb-2 gap-3">
                  <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-luxury-gold">
                    Live pricing estimate
                  </span>
                  <span className="text-[10px] text-gray-300 font-semibold whitespace-nowrap">
                    MOQ {formatQuantity(pricing.moq)} pcs
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">
                      Per piece
                    </p>
                    <p className="text-xl font-bold font-serif text-luxury-softgold">
                      {formatUnitPrice(result.unitPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">
                      Batch total
                    </p>
                    <p className="text-lg font-bold text-white">
                      {formatINR(result.total, 0)}
                    </p>
                  </div>
                </div>
                {!result.meetsMoq ? (
                  <p className="text-[10px] text-amber-300 font-semibold">
                    Below the {formatQuantity(result.moq)} pc minimum — quoted as a
                    custom run.
                  </p>
                ) : null}
                {result.bulkSaving > 0 ? (
                  <p className="text-[10px] text-emerald-400 font-semibold">
                    Bulk rate applied · saves {formatINR(result.bulkSaving, 0)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              {added ? (
                <div
                  role="status"
                  className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded text-center font-bold"
                >
                  Design added to cart — redirecting…
                </div>
              ) : null}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full bg-luxury-gold text-luxury-charcoal hover:bg-white py-4 px-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-sm shadow-md"
                >
                  Add design to cart
                </button>
                <a
                  href={whatsappLink(
                    `Hi Vector Labels Team, I configured a custom label in your Live Studio:\n\n- Material: ${product.title}\n- Brand name: ${brandText || "—"}\n- ${specification}\n- Base colour: ${bgColor}\n- Text/thread colour: ${textColor}\n- Lettering: ${TYPOGRAPHY.find((font) => font.id === fontStyle)?.label}\n- Stitched border: ${stitch ? "yes" : "no"}\n- Estimated unit price: ${formatUnitPrice(result.unitPrice)}\n- Estimated total: ${formatINR(result.total, 0)}\n\nPlease send me a proof and final quotation.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-center bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal py-4 px-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-sm shadow-md"
                >
                  Order via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
