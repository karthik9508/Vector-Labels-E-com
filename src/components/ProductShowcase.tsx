"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PRODUCTS, PRODUCT_CATEGORIES, type Product } from "@/data/products";
import {
  formatQuantity,
  formatRatePerSqMm,
  formatUnitPrice,
  fromPrice,
  priceRows,
} from "@/lib/pricing";

type CategoryFilter = "All" | (typeof PRODUCT_CATEGORIES)[number];

export default function ProductShowcase() {
  const [selected, setSelected] = useState<Product | null>(null);
  const [filter, setFilter] = useState<CategoryFilter>("All");

  const visibleProducts = useMemo(
    () => (filter === "All" ? PRODUCTS : PRODUCTS.filter((item) => item.category === filter)),
    [filter]
  );

  // Close the spec sheet on Escape and stop the page behind it scrolling.
  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selected]);

  const selectedRows = selected ? priceRows(selected.slug, { quantity: selected.pricing.moq }) : [];

  return (
    <section id="products" className="py-20 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div className="flex justify-center">
            <Image
              src="/images/premium_labels_showcase.png"
              alt="Premium label collection made in Tirupur"
              width={600}
              height={320}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-xl shadow-2xl w-full max-h-80 object-cover border border-luxury-border"
            />
          </div>
          <div className="space-y-4">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">
              Craftsmanship &amp; quality
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-luxury-charcoal">
              Our premium label collection
            </h2>
            <div className="w-16 h-[2px] bg-luxury-gold mt-4" />
            <p className="text-gray-500 font-light pt-2">
              Manufactured in Tirupur on high-density weaving and printing
              machinery. Every batch is inspected for colour fastness, yarn
              density and edge cutting before dispatch.
            </p>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-10" role="group" aria-label="Filter products by category">
          {(["All", ...PRODUCT_CATEGORIES] as CategoryFilter[]).map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={filter === category}
              onClick={() => setFilter(category)}
              className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-full border transition-all ${
                filter === category
                  ? "bg-luxury-charcoal text-white border-luxury-charcoal"
                  : "bg-white text-luxury-charcoal border-luxury-border hover:border-luxury-gold"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleProducts.map((product) => {
            const rows = priceRows(product.slug, { quantity: product.pricing.moq });
            const cheapest = fromPrice(product.slug).unitPrice;
            const cheapestRow = rows.find((row) => row.unitPrice === cheapest);

            return (
              <article
                key={product.slug}
                className="group bg-white border border-luxury-border rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="relative overflow-hidden aspect-[4/3] bg-luxury-slate">
                      <Image
                        src={product.image}
                        alt={product.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300" />
                      <span className="absolute top-3 left-3 bg-white border border-luxury-gold/30 text-luxury-charcoal px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold">
                        {product.tagline}
                      </span>
                    </div>
                  </Link>
                  <div className="p-6 space-y-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="text-lg font-serif font-bold text-luxury-charcoal hover:text-luxury-gold transition-colors">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-sm font-bold text-luxury-gold whitespace-nowrap">
                        {formatUnitPrice(cheapest)}
                        <span className="text-[10px] font-normal text-gray-400"> /pc</span>
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 font-light line-clamp-2">
                      {product.description}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                      MOQ {formatQuantity(product.pricing.moq)} pcs ·{" "}
                      {product.pricing.leadTime}
                      {cheapestRow && product.pricing.model === "area"
                        ? ` · from ${cheapestRow.label}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className="flex items-center justify-between border-t border-luxury-border pt-4">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-[10px] tracking-widest uppercase text-luxury-gold font-bold hover:underline"
                    >
                      View details →
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelected(product)}
                      aria-haspopup="dialog"
                      className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-luxury-charcoal transition-colors"
                    >
                      Quick specs
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="spec-sheet-title"
            className="bg-white rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto p-8 shadow-2xl relative space-y-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-luxury-border pb-4">
              <div>
                <h3 id="spec-sheet-title" className="text-xl font-bold font-serif text-luxury-charcoal">
                  {selected.title}
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold mt-1">
                  {selected.tagline}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close specifications"
                className="text-2xl leading-none hover:text-luxury-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold rounded"
              >
                ×
              </button>
            </div>

            <dl className="text-xs text-gray-600 space-y-3">
              {[
                ["Material", selected.specs.material],
                ["Density / weight", selected.specs.densityOrWeight],
                ["Fold / finish", selected.specs.foldTypes.join(", ")],
                ["Colours", selected.specs.colors],
                ["Ideal for", selected.specs.idealFor],
              ].map(([term, value]) => (
                <div key={term} className="grid grid-cols-[110px_1fr] gap-3">
                  <dt className="font-bold text-luxury-charcoal uppercase tracking-wider text-[10px] pt-0.5">
                    {term}
                  </dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            <div className="border-t border-luxury-border pt-4 space-y-2">
              <div className="flex items-baseline justify-between">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-luxury-charcoal">
                  Rate card at {formatQuantity(selected.pricing.moq)} pcs
                </h4>
                <span className="text-[10px] text-gray-400">
                  {selected.pricing.leadTime}
                </span>
              </div>
              <ul className="text-xs divide-y divide-luxury-border">
                {selectedRows.map((row) => (
                  <li key={row.id} className="flex items-center justify-between py-2 gap-4">
                    <span className="text-gray-600">
                      {row.label}
                      {selected.pricing.model === "area" ? " · 1 colour" : ""}
                    </span>
                    <span className="font-bold text-luxury-charcoal whitespace-nowrap">
                      {formatUnitPrice(row.unitPrice)} /pc
                    </span>
                  </li>
                ))}
              </ul>
              {selected.pricing.model === "area" ? (
                <p className="text-[10px] text-gray-400">
                  Material rate {formatRatePerSqMm(selected.pricing.ratePerSqMm ?? 0)} ·
                  each extra colour +10%
                </p>
              ) : null}
              {selected.pricing.note ? (
                <p className="text-[10px] text-amber-700">{selected.pricing.note}</p>
              ) : null}
            </div>

            <div className="pt-4 border-t border-luxury-border flex flex-col sm:flex-row gap-3 justify-end">
              <Link
                href={`/products/${selected.slug}`}
                className="text-center bg-transparent border border-luxury-charcoal text-luxury-charcoal hover:bg-luxury-charcoal hover:text-white px-6 py-2.5 rounded-sm text-xs font-bold tracking-widest uppercase transition-all"
              >
                Full details
              </Link>
              <Link
                href="/#calculator"
                onClick={() => setSelected(null)}
                className="text-center bg-luxury-charcoal text-white px-6 py-2.5 rounded-sm text-xs font-bold tracking-widest uppercase hover:bg-luxury-gold hover:text-luxury-charcoal transition-all"
              >
                Calculate price
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
