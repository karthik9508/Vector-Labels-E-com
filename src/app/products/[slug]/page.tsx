import React from "react";
import { PRODUCTS } from "@/data/products";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const whatsappMsg = encodeURIComponent(
    `Hi Vector Labels Team, I want to order ${product.title} (MOQ: ${product.moq} pcs). Please send quotation & proof details.`
  );

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="mb-8">
          <Link href="/#products" className="text-xs uppercase tracking-widest text-luxury-gold font-bold hover:underline">
            &larr; Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-8 md:p-12 rounded-xl shadow-xl border border-luxury-border">
          {/* Image */}
          <div className="lg:col-span-6 relative aspect-[4/3] rounded-lg overflow-hidden bg-luxury-slate border border-luxury-border">
            <Image src={product.image} alt={product.title} fill className="object-cover" priority />
            <span className="absolute top-4 left-4 bg-white border border-luxury-gold/30 text-luxury-charcoal px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold shadow-sm">
              {product.tagline}
            </span>
          </div>

          {/* Details */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">{product.category}</span>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-luxury-charcoal">{product.title}</h1>
            <p className="text-sm text-gray-600 font-light leading-relaxed">{product.description}</p>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-luxury-border text-xs">
              <div>
                <p className="text-gray-400 uppercase tracking-widest">Minimum Order</p>
                <p className="font-bold text-luxury-charcoal text-sm mt-1">{product.moq} pcs</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase tracking-widest">Turnaround</p>
                <p className="font-bold text-luxury-charcoal text-sm mt-1">{product.delivery}</p>
              </div>
            </div>

            {/* Specs list */}
            <div className="space-y-3 text-xs">
              <h3 className="font-bold uppercase tracking-widest text-luxury-charcoal">Technical Specifications</h3>
              <ul className="space-y-2 text-gray-600">
                <li><strong className="text-luxury-charcoal">Material:</strong> {product.specs.material}</li>
                <li><strong className="text-luxury-charcoal">Density / Weight:</strong> {product.specs.densityOrWeight}</li>
                <li><strong className="text-luxury-charcoal">Fold / Finish Types:</strong> {product.specs.foldTypes.join(", ")}</li>
                <li><strong className="text-luxury-charcoal">Colors:</strong> {product.specs.colors}</li>
                <li><strong className="text-luxury-charcoal">Ideal Application:</strong> {product.specs.idealFor}</li>
              </ul>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <a
                href={`https://wa.me/918608847513?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal py-4 px-6 text-xs font-bold tracking-widest uppercase transition-all rounded-sm shadow-md"
              >
                Inquire &amp; Order on WhatsApp
              </a>
              <Link
                href="/#calculator"
                className="flex-1 text-center bg-transparent border-2 border-luxury-charcoal text-luxury-charcoal hover:bg-luxury-charcoal hover:text-white py-4 px-6 text-xs font-bold tracking-widest uppercase transition-all rounded-sm"
              >
                Calculate Price
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
