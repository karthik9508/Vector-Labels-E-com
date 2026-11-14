import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PRODUCTS, getProduct } from "@/data/products";
import {
  formatINR,
  formatQuantity,
  formatRatePerSqMm,
  formatUnitPrice,
  priceRows,
} from "@/lib/pricing";
import { SITE, absoluteUrl, whatsappLink } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found" };

  // The root layout template appends "| Vector Labels", so do not repeat it.
  const title = `${product.title} — ${product.tagline}`;
  return {
    title,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description: product.description,
      url: absoluteUrl(`/products/${product.slug}`),
      images: [{ url: absoluteUrl(product.image), alt: product.imageAlt }],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  const { pricing } = product;
  const rows = priceRows(product.slug, { quantity: pricing.moq });
  const cheapest = rows.reduce((min, row) => Math.min(min, row.unitPrice), Number.POSITIVE_INFINITY);
  const dearest = rows.reduce((max, row) => Math.max(max, row.unitPrice), 0);

  const related = PRODUCTS.filter(
    (item) => item.category === product.category && item.slug !== product.slug
  ).slice(0, 3);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: absoluteUrl(product.image),
    brand: { "@type": "Brand", name: SITE.name },
    material: product.specs.material,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: cheapest,
      highPrice: dearest,
      offerCount: rows.length,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: SITE.name },
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Minimum order quantity", value: `${pricing.moq} pcs` },
      { "@type": "PropertyValue", name: "Production lead time", value: pricing.leadTime },
      { "@type": "PropertyValue", name: "Fold / finish options", value: product.specs.foldTypes.join(", ") },
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Products", item: absoluteUrl("/#products") },
      { "@type": "ListItem", position: 3, name: product.title, item: absoluteUrl(`/products/${product.slug}`) },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([productJsonLd, breadcrumbJsonLd]).replace(/</g, "\\u003c"),
        }}
      />

      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full">
        <nav aria-label="Breadcrumb" className="mb-8 text-[11px] uppercase tracking-widest">
          <ol className="flex flex-wrap items-center gap-2 text-gray-400">
            <li><Link href="/" className="hover:text-luxury-gold">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/#products" className="hover:text-luxury-gold">Products</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-luxury-gold font-bold" aria-current="page">{product.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-8 md:p-12 rounded-xl shadow-xl border border-luxury-border">
          {/* Image */}
          <div className="lg:col-span-6 relative aspect-[4/3] rounded-lg overflow-hidden bg-luxury-slate border border-luxury-border">
            <Image
              src={product.image}
              alt={product.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <span className="absolute top-4 left-4 bg-white border border-luxury-gold/30 text-luxury-charcoal px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold shadow-sm">
              {product.tagline}
            </span>
          </div>

          {/* Details */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">
                {product.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold font-serif text-luxury-charcoal">
                {product.title}
              </h1>
            </div>
            <p className="text-sm text-gray-600 font-light leading-relaxed">
              {product.description}
            </p>

            <ul className="flex flex-wrap gap-2">
              {product.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="text-[10px] uppercase tracking-widest font-bold text-luxury-charcoal bg-luxury-slate border border-luxury-border px-3 py-1.5 rounded-full"
                >
                  {highlight}
                </li>
              ))}
            </ul>

            <dl className="grid grid-cols-3 gap-4 py-5 border-y border-luxury-border text-xs">
              <div>
                <dt className="text-gray-400 uppercase tracking-widest">From</dt>
                <dd className="font-bold text-luxury-charcoal text-base mt-1">
                  {formatUnitPrice(cheapest)}
                  <span className="text-[10px] font-normal text-gray-400"> /pc</span>
                </dd>
              </div>
              <div>
                <dt className="text-gray-400 uppercase tracking-widest">Minimum</dt>
                <dd className="font-bold text-luxury-charcoal text-base mt-1">
                  {formatQuantity(pricing.moq)} pcs
                </dd>
              </div>
              <div>
                <dt className="text-gray-400 uppercase tracking-widest">Lead time</dt>
                <dd className="font-bold text-luxury-charcoal text-base mt-1">
                  {pricing.leadTime}
                </dd>
              </div>
            </dl>

            <div className="space-y-3 text-xs">
              <h2 className="font-bold uppercase tracking-widest text-luxury-charcoal">
                Technical specifications
              </h2>
              <dl className="space-y-2 text-gray-600">
                {[
                  ["Material", product.specs.material],
                  ["Density / weight", product.specs.densityOrWeight],
                  ["Fold / finish", product.specs.foldTypes.join(", ")],
                  ["Colours", product.specs.colors],
                  ["Ideal application", product.specs.idealFor],
                ].map(([term, value]) => (
                  <div key={term} className="grid grid-cols-[120px_1fr] gap-3">
                    <dt className="font-bold text-luxury-charcoal text-[11px] uppercase tracking-wider pt-0.5">
                      {term}
                    </dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <a
                href={whatsappLink(
                  `Hi Vector Labels Team, I want to order ${product.title} (MOQ ${pricing.moq} pcs). Please send a quotation and proof details.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal py-4 px-6 text-xs font-bold tracking-widest uppercase transition-all rounded-sm shadow-md"
              >
                Enquire on WhatsApp
              </a>
              <Link
                href={`/#calculator`}
                className="flex-1 text-center bg-transparent border-2 border-luxury-charcoal text-luxury-charcoal hover:bg-luxury-charcoal hover:text-white py-4 px-6 text-xs font-bold tracking-widest uppercase transition-all rounded-sm"
              >
                Calculate price
              </Link>
            </div>
          </div>
        </div>

        {/* Rate card */}
        <section className="mt-12 bg-white rounded-xl border border-luxury-border shadow-sm overflow-hidden">
          <div className="p-8 border-b border-luxury-border flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold font-serif text-luxury-charcoal">
                {pricing.model === "area" ? "Price by size" : "Price by size / stock"}
              </h2>
              <p className="text-xs text-gray-500 font-light mt-1">
                {pricing.model === "area"
                  ? `Rates at ${formatQuantity(pricing.moq)} pcs and one colour — ${formatRatePerSqMm(pricing.ratePerSqMm ?? 0)}, each extra colour +10%.`
                  : `Flat piece rates at ${formatQuantity(pricing.moq)} pcs minimum.`}
              </p>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
              Excludes GST &amp; courier
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-luxury-slate text-luxury-charcoal uppercase tracking-widest text-[10px]">
                <tr>
                  <th scope="col" className="text-left font-bold px-8 py-4">Size / option</th>
                  <th scope="col" className="text-right font-bold px-8 py-4">Per piece</th>
                  <th scope="col" className="text-right font-bold px-8 py-4">
                    Batch ({formatQuantity(pricing.moq)} pcs)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border">
                {rows.map((row) => {
                  return (
                    <tr key={row.id} className="hover:bg-luxury-cream/60 transition-colors">
                      <th scope="row" className="text-left font-semibold text-luxury-charcoal px-8 py-4">
                        {row.label}
                      </th>
                      <td className="text-right px-8 py-4 text-luxury-charcoal">
                        {formatUnitPrice(row.unitPrice)}
                      </td>
                      <td className="text-right px-8 py-4 font-bold text-luxury-gold">
                        {formatINR(row.total, 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {pricing.note ? (
            <p className="px-8 py-4 text-[11px] text-amber-700 bg-amber-50 border-t border-amber-100">
              {pricing.note}
            </p>
          ) : null}
        </section>

        {/* Related */}
        {related.length > 0 ? (
          <section className="mt-16">
            <h2 className="text-2xl font-bold font-serif text-luxury-charcoal mb-6">
              More {product.category.toLowerCase()}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/products/${item.slug}`}
                  className="group bg-white border border-luxury-border rounded-lg overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[4/3] bg-luxury-slate overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 space-y-1">
                    <h3 className="font-serif font-bold text-luxury-charcoal group-hover:text-luxury-gold transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                      MOQ {formatQuantity(item.pricing.moq)} pcs · {item.pricing.leadTime}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <Footer />
    </div>
  );
}
