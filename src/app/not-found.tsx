import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { whatsappLink } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto px-6 py-24 text-center space-y-8">
        <p className="text-[10px] uppercase tracking-[0.35em] text-luxury-gold font-bold">
          Error 404
        </p>
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-luxury-charcoal">
          This label isn&#8217;t on our shelf
        </h1>
        <p className="text-gray-500 font-light max-w-xl mx-auto">
          The page you were looking for has moved or never existed. Our product
          range, the price calculator and the design studio are all one click
          away.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Link
            href="/#products"
            className="bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal px-8 py-4 rounded-sm text-xs font-bold tracking-widest uppercase transition-all"
          >
            Browse products
          </Link>
          <Link
            href="/#calculator"
            className="bg-transparent border-2 border-luxury-charcoal text-luxury-charcoal hover:bg-luxury-charcoal hover:text-white px-8 py-4 rounded-sm text-xs font-bold tracking-widest uppercase transition-all"
          >
            Calculate a price
          </Link>
        </div>

        <p className="text-xs text-gray-400 pt-6">
          Need a person?{" "}
          <a
            href={whatsappLink("Hi Vector Labels Team, I could not find a page on your website.")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-luxury-gold font-bold hover:underline"
          >
            WhatsApp our team
          </a>
        </p>
      </div>

      <Footer />
    </div>
  );
}
