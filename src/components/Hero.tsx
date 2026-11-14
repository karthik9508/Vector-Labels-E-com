"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-luxury-cream via-[#F5F3ED] to-[#EAE6DD] py-28 md:py-36 border-b border-luxury-border"
    >
      {/* Floating organic grid elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
      <div className="absolute top-1/4 -left-36 w-72 h-72 rounded-full bg-luxury-softgold/10 blur-[120px]"></div>
      <div className="absolute bottom-1/4 -right-36 w-80 h-80 rounded-full bg-luxury-gold/10 blur-[150px]"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* Hero Content */}
          <div className="md:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2.5 bg-white border border-luxury-gold/30 px-4 py-1.5 rounded-full shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-luxury-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-luxury-gold"></span>
              </span>
              <span className="text-[10px] md:text-xs font-bold tracking-widest text-luxury-gold uppercase">
                Tirupur&#8217;s Premium Labels Manufacturer
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-luxury-charcoal font-serif leading-[1.1]">
              Exquisite Custom <br />
              <span className="text-luxury-gold font-serif italic">Clothing Labels</span> for Couture Brands.
            </h1>

            <p className="text-base md:text-lg text-gray-600 font-light leading-relaxed max-w-xl">
              Uncompromising detail. Premium woven craftsmanship, organic cotton, and lustrous satins. Elevate your apparel identity with custom designs curated specifically for high-end fashion lines.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href="#customizer"
                className="bg-luxury-charcoal hover:bg-luxury-gold text-white hover:text-luxury-charcoal px-8 py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-xl rounded-sm hover:-translate-y-0.5 text-center"
              >
                Customize Your Label
              </a>
              <a
                href="#products"
                className="bg-transparent border-2 border-luxury-charcoal text-luxury-charcoal hover:bg-luxury-charcoal hover:text-white px-8 py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-sm hover:-translate-y-0.5 text-center"
              >
                Explore Products
              </a>
            </div>

            {/* Bullet Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-luxury-border">
              <div>
                <p className="text-2xl font-bold font-serif text-luxury-gold">100%</p>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold mt-1">Premium Quality</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-serif text-luxury-gold">Custom</p>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold mt-1">Sizing &amp; Design</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-serif text-luxury-gold">Fast</p>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold mt-1">Global Shipping</p>
              </div>
            </div>
          </div>

          {/* Floating Hero Image Composition */}
          <div className="md:col-span-5 flex justify-center items-center relative min-h-[400px]">
            <div className="relative w-full max-w-md h-full flex items-center justify-center">
              <div className="absolute inset-0 bg-luxury-gold/5 rounded-2xl -rotate-3 scale-[1.03]"></div>
              <div className="absolute -inset-1 border border-luxury-gold/20 rounded-2xl rotate-2"></div>

              <Image
                src="/images/cotton_label_photo.png"
                alt="Organic cotton labels"
                width={192}
                height={192}
                sizes="192px"
                className="absolute -left-6 top-8 w-48 h-48 rounded-xl shadow-xl object-cover border border-luxury-border -rotate-6 opacity-80 hover:opacity-100 hover:z-20 hover:scale-105 transition-all duration-500"
              />
              <Image
                src="/images/satin_label_photo.png"
                alt="Satin ribbon labels"
                width={192}
                height={192}
                sizes="192px"
                className="absolute -right-6 bottom-8 w-48 h-48 rounded-xl shadow-xl object-cover border border-luxury-border rotate-6 opacity-80 hover:opacity-100 hover:z-20 hover:scale-105 transition-all duration-500"
              />
              <Image
                src="/images/woven_label_photo.png"
                alt="High-density woven labels"
                width={256}
                height={256}
                sizes="(max-width: 768px) 240px, 256px"
                priority
                className="relative z-10 w-64 h-64 rounded-xl shadow-2xl object-cover border-2 border-luxury-gold/50 hover:scale-105 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}