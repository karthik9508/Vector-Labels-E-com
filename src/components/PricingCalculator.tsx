"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCTS, getProduct } from "@/data/products";
import {
  formatINR,
  formatQuantity,
  formatRatePerSqMm,
  formatUnitPrice,
  quote,
} from "@/lib/pricing";
import { createCartItem, useCart } from "@/lib/cart";
import { whatsappLink } from "@/lib/site";

const FIELD_CLASS =
  "w-full px-4 py-3 border border-luxury-border rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream text-xs font-semibold text-luxury-charcoal";
const LABEL_CLASS =
  "block text-xs font-bold uppercase tracking-widest text-gray-500";

export default function PricingCalculator() {
  const router = useRouter();
  const { add } = useCart();

  const [slug, setSlug] = useState(PRODUCTS[0].slug);
  const product = getProduct(slug) ?? PRODUCTS[0];
  const pricing = product.pricing;
  const isPiecePriced = pricing.model === "piece";

  const [quantity, setQuantity] = useState(pricing.moq);
  const [widthMm, setWidthMm] = useState(20);
  const [heightMm, setHeightMm] = useState(60);
  const [colors, setColors] = useState(2);
  const [variantId, setVariantId] = useState(pricing.variants?.[0]?.id ?? "");
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [added, setAdded] = useState(false);

  function selectProduct(nextSlug: string) {
    const next = getProduct(nextSlug);
    if (!next) return;
    setSlug(nextSlug);
    setQuantity(next.pricing.moq);
    setVariantId(next.pricing.variants?.[0]?.id ?? "");
    setAddOnIds([]);
    setColors(1);
    setAdded(false);

    const variant = next.pricing.variants?.[0];
    if (variant?.widthMm) setWidthMm(variant.widthMm);
    if (variant?.heightMm) setHeightMm(variant.heightMm);
  }

  function toggleAddOn(id: string) {
    setAddOnIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  const result = useMemo(
    () =>
      quote({
        slug,
        quantity,
        widthMm,
        heightMm,
        colors,
        variantId: variantId || undefined,
        addOnIds,
      }),
    [slug, quantity, widthMm, heightMm, colors, variantId, addOnIds]
  );

  const summaryLines = [
    `${product.title}`,
    isPiecePriced
      ? `Size / stock: ${result.variant?.label ?? "—"}`
      : `Size: ${result.widthMm} × ${result.heightMm} mm (${formatQuantity(result.areaSqMm)} mm²)`,
    `Quantity: ${formatQuantity(result.quantity)} pcs`,
    isPiecePriced ? null : `Colours: ${result.colors}`,
    result.addOns.length
      ? `Add-ons: ${result.addOns.map((addOn) => addOn.label).join(", ")}`
      : null,
    `Unit price: ${formatUnitPrice(result.unitPrice)} / pc`,
    `Estimated total: ${formatINR(result.total, 0)}`,
  ]
    .filter(Boolean)
    .join("\n");

  function handleAddToCart() {
    add(
      createCartItem({
        slug,
        title: product.title,
        specs: summaryLines.replace(/\n/g, " · "),
        quantity: result.quantity,
        unitPrice: result.unitPrice,
      })
    );
    setAdded(true);
    window.setTimeout(() => router.push("/cart"), 700);
  }

  return (
    <section
      id="calculator"
      className="py-20 bg-luxury-cream border-t border-b border-luxury-border scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">
            Instant pricing &amp; quotation
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-luxury-charcoal">
            Label Cost Calculator
          </h2>
          <p className="text-gray-500 font-light">
            Live per-piece and batch pricing from our Tirupur rate card, based on
            size, material, colour count and quantity breaks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-6 md:p-10 rounded-xl shadow-xl border border-luxury-border max-w-5xl mx-auto">
          {/* Inputs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <label htmlFor="calc-product" className={LABEL_CLASS}>
                Label / product type
              </label>
              <select
                id="calc-product"
                value={slug}
                onChange={(event) => selectProduct(event.target.value)}
                className={FIELD_CLASS}
              >
                {PRODUCTS.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.title} — {item.tagline}
                  </option>
                ))}
              </select>
            </div>

            {isPiecePriced ? (
              <div className="space-y-2">
                <label htmlFor="calc-variant" className={LABEL_CLASS}>
                  Size / board stock
                </label>
                <select
                  id="calc-variant"
                  value={variantId}
                  onChange={(event) => setVariantId(event.target.value)}
                  className={FIELD_CLASS}
                >
                  {(pricing.variants ?? []).map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.label} — {formatINR(variant.unitRate)} / pc
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="calc-width" className={LABEL_CLASS}>
                    Width (mm)
                  </label>
                  <input
                    id="calc-width"
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
                <div className="space-y-2">
                  <label htmlFor="calc-height" className={LABEL_CLASS}>
                    Height / length (mm)
                  </label>
                  <input
                    id="calc-height"
                    type="number"
                    value={heightMm}
                    min={5}
                    max={300}
                    onChange={(event) =>
                      setHeightMm(Math.min(300, Math.max(5, Number(event.target.value) || 5)))
                    }
                    className={FIELD_CLASS}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="calc-colors" className={LABEL_CLASS}>
                    Colours
                  </label>
                  <select
                    id="calc-colors"
                    value={colors}
                    onChange={(event) => setColors(Number(event.target.value))}
                    className={FIELD_CLASS}
                  >
                    {[1, 2, 3, 4, 5, 6].map((count) => (
                      <option key={count} value={count}>
                        {count} {count === 1 ? "colour" : "colours"}
                        {count > pricing.includedColors ? " (+10% each)" : " (included)"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {pricing.addOns?.length ? (
              <fieldset className="space-y-2">
                <legend className={LABEL_CLASS}>Optional finishing</legend>
                <div className="space-y-2">
                  {pricing.addOns.map((addOn) => (
                    <label
                      key={addOn.id}
                      className="flex items-center gap-3 text-xs text-luxury-charcoal cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={addOnIds.includes(addOn.id)}
                        onChange={() => toggleAddOn(addOn.id)}
                        className="w-4 h-4 accent-luxury-gold"
                      />
                      <span className="font-semibold">
                        {addOn.label}
                        <span className="text-gray-500 font-light">
                          {" "}
                          (+{formatINR(addOn.unitRate)} / pc)
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <div className="space-y-2">
              <label htmlFor="calc-qty" className={LABEL_CLASS}>
                Quantity (pieces)
              </label>
              <input
                id="calc-qty"
                type="number"
                value={quantity}
                min={1}
                step={pricing.moq >= 1000 ? 500 : 100}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                className={FIELD_CLASS}
              />
            </div>

            {!result.meetsMoq ? (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-sm flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <span>
                  Minimum order for {product.title.toLowerCase()} is{" "}
                  <strong>{formatQuantity(result.moq)} pcs</strong>. We can quote
                  below MOQ as a custom run.
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(result.moq)}
                  className="shrink-0 bg-amber-800 text-white px-3 py-2 rounded-sm font-bold uppercase tracking-wider text-[10px] hover:bg-amber-900 transition-colors"
                >
                  Set to MOQ
                </button>
              </div>
            ) : null}
          </div>

          {/* Quote summary */}
          <div className="lg:col-span-5 bg-luxury-charcoal text-white p-8 rounded-lg flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-6">
              <h3 className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold border-b border-white/10 pb-4">
                Estimated quote
              </h3>

              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-gray-400">
                  Unit price estimate
                </p>
                <p className="text-3xl font-bold font-serif text-luxury-softgold">
                  {formatUnitPrice(result.unitPrice)}
                  <span className="text-sm text-gray-400 font-sans font-normal"> / pc</span>
                </p>
                {result.bulkSaving > 0 ? (
                  <p className="text-[10px] text-emerald-400 font-semibold">
                    Bulk rate applied — saves {formatINR(result.bulkSaving, 0)} vs. list
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-gray-400">
                  Total for {formatQuantity(result.quantity)} pcs
                </p>
                <p className="text-xl font-bold text-white">{formatINR(result.total, 0)}</p>
              </div>

              <dl className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
                <div>
                  <dt className="text-[9px] uppercase tracking-widest text-gray-400">MOQ</dt>
                  <dd className="font-bold text-luxury-softgold mt-0.5">
                    {formatQuantity(result.moq)} pcs
                  </dd>
                </div>
                <div>
                  <dt className="text-[9px] uppercase tracking-widest text-gray-400">
                    Production
                  </dt>
                  <dd className="font-bold text-white mt-0.5">{result.leadTime}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[9px] uppercase tracking-widest text-gray-400">
                    {isPiecePriced ? "Rate card" : "Material rate"}
                  </dt>
                  <dd className="font-bold text-white mt-0.5">
                    {isPiecePriced
                      ? `${formatINR(result.variant?.unitRate ?? 0)} / pc`
                      : formatRatePerSqMm(pricing.ratePerSqMm ?? 0)}
                  </dd>
                </div>
              </dl>

              {result.note ? (
                <p className="text-[10px] text-amber-200/80 leading-relaxed border-t border-white/10 pt-3">
                  {result.note}
                </p>
              ) : null}

              <p className="text-[10px] text-gray-400 leading-relaxed">
                Estimate excludes GST and courier. Final pricing is confirmed on
                artwork proof approval.
              </p>
            </div>

            <div className="space-y-3">
              {added ? (
                <p className="text-[11px] text-emerald-400 font-bold text-center">
                  Added to cart — opening your cart…
                </p>
              ) : null}
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full block text-center bg-luxury-gold text-luxury-charcoal hover:bg-white py-4 rounded-sm text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-md"
              >
                Add batch to cart →
              </button>
              <a
                href={whatsappLink(
                  `Hi Vector Labels Team, I calculated an estimate on your website:\n\n${summaryLines}\n\nPlease confirm this order.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center bg-transparent border border-white/30 text-white hover:bg-white/10 py-3.5 rounded-sm text-xs font-bold tracking-widest uppercase transition-all duration-300"
              >
                Send quote on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
