"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // Check cart count from localStorage
    try {
      const storedCart = localStorage.getItem("vector_cart");
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) {
          setCartCount(parsed.length);
        }
      }
    } catch {
      // ignore
    }

    // Event listener for cart updates if any
    const handleStorageChange = () => {
      try {
        const storedCart = localStorage.getItem("vector_cart");
        if (storedCart) {
          const parsed = JSON.parse(storedCart);
          if (Array.isArray(parsed)) {
            setCartCount(parsed.length);
          }
        } else {
          setCartCount(0);
        }
      } catch {
        setCartCount(0);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Custom event for same-window cart updates
    window.addEventListener("cartUpdated", handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-luxury-charcoal text-white text-[11px] tracking-[0.15em] uppercase py-2 px-4 text-center font-medium border-b border-luxury-gold/20 flex flex-wrap justify-center items-center gap-4">
        <span className="flex items-center gap-1.5 text-luxury-gold">
          <span className="inline-block w-2 h-2 rounded-full bg-luxury-gold animate-pulse"></span>
          Direct Manufacturer from Tirupur
        </span>
        <span className="hidden md:inline text-luxury-border/40">•</span>
        <span className="text-gray-300">Printed Labels • Cotton Labels • Woven Labels • Hang Tags</span>
        <span className="hidden md:inline text-luxury-border/40">•</span>
        <a
          href="https://wa.me/918608847513?text=Hi%20Vector%20Labels%20Team%2C%20I%20want%20to%20discuss%20clothing%20labels%20for%20my%20brand."
          target="_blank"
          rel="noopener noreferrer"
          className="text-luxury-gold hover:underline font-bold transition-all"
        >
          WhatsApp: +91 86088 47513
        </a>
      </div>

      <header className="sticky top-0 z-40 bg-luxury-cream/95 backdrop-blur-md border-b border-luxury-border/80 shadow-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-11 h-11 overflow-hidden rounded-full border-2 border-luxury-gold/40 p-0.5 bg-white shadow-sm group-hover:border-luxury-gold transition-all duration-300 group-hover:scale-105">
              <Image
                src="/Logo.png"
                alt="Vector Labels Logo"
                width={44}
                height={44}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg tracking-[0.1em] text-luxury-charcoal group-hover:text-luxury-darkgold transition-colors">VECTOR LABELS</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-luxury-gold font-bold">Tirupur • Premium Branding</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-bold tracking-[0.15em] uppercase text-luxury-charcoal">
            <Link href="/" className="hover:text-luxury-gold transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-luxury-gold hover:after:w-full after:transition-all">Home</Link>

            {/* Featured AI Studio Pill */}
            <Link
              href="/ai-studio"
              className="bg-gradient-to-r from-luxury-gold to-luxury-darkgold text-white px-4 py-2 rounded-full text-[11px] font-bold tracking-[0.15em] shadow-sm hover:shadow-md hover:opacity-95 transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5"
            >
              <span>✨</span> Create Your Design
            </Link>

            <Link href="/#products" className="hover:text-luxury-gold transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-luxury-gold hover:after:w-full after:transition-all">Products</Link>
            <Link href="/#calculator" className="hover:text-luxury-gold transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-luxury-gold hover:after:w-full after:transition-all">Pricing Calculator</Link>

            <Link href="/cart" className="hover:text-luxury-gold transition-colors py-2 flex items-center gap-1.5 font-bold text-luxury-darkgold">
              <span className="text-base">🛒</span>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="bg-luxury-charcoal text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <button onClick={handleSignOut} className="hover:text-luxury-gold transition-colors py-2 text-gray-600 hover:text-red-600">Sign Out</button>
            ) : (
              <Link href="/dashboard" className="hover:text-luxury-gold transition-colors py-2">Sign In</Link>
            )}
          </nav>

          {/* Desktop CTA (Profile/Sign In Only) */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <button onClick={handleSignOut} className="bg-luxury-charcoal text-white hover:bg-red-600 px-6 py-3 rounded-md text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300 shadow-sm hover:shadow-md">
                Sign Out
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="bg-transparent border-2 border-luxury-charcoal text-luxury-charcoal hover:bg-luxury-charcoal hover:text-white px-6 py-3 rounded-md text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 focus:outline-none p-2 rounded-md hover:bg-luxury-border/40 transition-colors"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-luxury-charcoal transition-transform duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
            <span className={`block w-4 h-0.5 bg-luxury-charcoal transition-opacity duration-300 ml-2 ${mobileMenuOpen ? "opacity-0" : ""}`}></span>
            <span className={`block w-6 h-0.5 bg-luxury-charcoal transition-transform duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs transition-opacity" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-84 max-w-full bg-luxury-cream p-8 shadow-2xl flex flex-col justify-between border-l border-luxury-gold/30 transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-luxury-border pb-5">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-full border border-luxury-gold/40 p-0.5 bg-white">
                    <Image src="/Logo.png" alt="Vector Labels" width={36} height={36} className="h-full w-full object-contain" />
                  </div>
                  <span className="font-serif font-bold text-base tracking-[0.08em] text-luxury-charcoal">VECTOR LABELS</span>
                </div>
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-luxury-border/60 hover:bg-luxury-gold hover:text-white transition-colors text-xl font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  &times;
                </button>
              </div>

              <nav>
                <ul className="flex flex-col gap-4 text-xs font-bold tracking-[0.15em] uppercase text-luxury-charcoal">
                  <li>
                    <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block hover:text-luxury-gold py-3 border-b border-luxury-border/60 transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/ai-studio" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between bg-gradient-to-r from-luxury-gold to-luxury-darkgold text-white p-3.5 rounded-lg shadow-sm">
                      <span className="flex items-center gap-2">✨ Create Your Design</span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded">AI Studio</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/#products" onClick={() => setMobileMenuOpen(false)} className="block hover:text-luxury-gold py-3 border-b border-luxury-border/60 transition-colors">
                      Our Products
                    </Link>
                  </li>
                  <li>
                    <Link href="/#calculator" onClick={() => setMobileMenuOpen(false)} className="block hover:text-luxury-gold py-3 border-b border-luxury-border/60 transition-colors">
                      Pricing Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between hover:text-luxury-gold py-3 border-b border-luxury-border/60 transition-colors text-luxury-darkgold">
                      <span className="flex items-center gap-2">🛒 Cart &amp; Checkout</span>
                      {cartCount > 0 && (
                        <span className="bg-luxury-charcoal text-white text-xs px-2.5 py-0.5 rounded-full">
                          {cartCount} items
                        </span>
                      )}
                    </Link>
                  </li>
                  <li>
                    {user ? (
                      <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="w-full text-left hover:text-red-600 py-3 border-b border-luxury-border/60 transition-colors text-red-500">
                        Sign Out
                      </button>
                    ) : (
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block hover:text-luxury-gold py-3 border-b border-luxury-border/60 transition-colors">
                        Sign In / Dashboard
                      </Link>
                    )}
                  </li>
                </ul>
              </nav>
            </div>

            <div className="space-y-4 pt-6 border-t border-luxury-border">
              <div className="text-center space-y-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">© 2026 Vector Labels Tirupur</p>
                <p className="text-[9px] text-luxury-gold tracking-wider">Direct Manufacturer & Exporter</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
