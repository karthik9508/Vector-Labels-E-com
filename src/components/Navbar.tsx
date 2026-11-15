"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { PRODUCTS } from "@/data/products";
import { formatUnitPrice, fromPrice } from "@/lib/pricing";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart";
import { SITE, whatsappLink } from "@/lib/site";
import { useAuthGuard } from "@/hooks/use-auth-guard";

/** Products with their "from" price, resolved once from the rate card. */
const PRODUCT_MENU = PRODUCTS.map((product) => ({
  slug: product.slug,
  title: product.title,
  tagline: product.tagline,
  image: product.image,
  from: fromPrice(product.slug).unitPrice,
}));

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold focus-visible:ring-offset-2 focus-visible:ring-offset-luxury-cream";

const WHATSAPP_MESSAGE =
  "Hi Vector Labels Team, I want to discuss clothing labels for my brand.";

function isCurrent(pathname: string, href: string, exact = false): boolean {
  if (href.startsWith("/#")) return false;
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function BagIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M6 8h12l-.8 11.2a1.5 1.5 0 0 1-1.5 1.4H8.3a1.5 1.5 0 0 1-1.5-1.4L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" strokeLinecap="round" />
    </svg>
  );
}

function SparkIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l1.9 5.8 5.8 1.9-5.8 1.9-1.9 5.8-1.9-5.8L4.3 10.2l5.8-1.9L12 2.5Z" />
      <path d="M18.6 15.2l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" opacity=".65" />
    </svg>
  );
}

function ChevronIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2A9.9 9.9 0 0 0 2.1 11.9c0 1.75.46 3.46 1.34 4.96L2 22l5.3-1.39a9.9 9.9 0 0 0 4.73 1.2h.01a9.9 9.9 0 0 0 9.9-9.9A9.9 9.9 0 0 0 12.04 2Zm5.8 14.05c-.24.68-1.42 1.3-1.96 1.35-.54.05-1.04.24-3.5-.73-2.95-1.17-4.83-4.2-4.98-4.4-.15-.2-1.19-1.58-1.19-3.02 0-1.44.76-2.15 1.03-2.44.27-.3.58-.37.78-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.24.57.81 1.97.88 2.11.07.15.12.32.02.51-.1.2-.15.32-.3.49-.15.17-.31.38-.45.51-.15.15-.3.31-.13.6.17.3.75 1.24 1.6 2.01 1.1.98 2.02 1.29 2.31 1.44.29.15.46.12.63-.07.17-.2.73-.85.93-1.14.2-.3.39-.24.66-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.12.07.7-.17 1.38Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Navbar                                                              */
/* ------------------------------------------------------------------ */

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { count } = useCart();
  const { email, loading } = useAuthGuard();
  const pathname = usePathname();
  const router = useRouter();

  const sentinelRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  function requireAuth(e: { preventDefault: () => void }) {
    if (!email) {
      e.preventDefault();
      router.push("/auth/login");
    }
  }

  /* Shrink the bar once the announcement strip scrolls away ------- */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  /* Dismiss the two desktop popovers ------------------------------ */
  useEffect(() => {
    if (!productsOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!productsRef.current?.contains(event.target as Node)) setProductsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProductsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [productsOpen]);

  useEffect(() => {
    if (!accountOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountOpen]);

  /* Drawer: Escape + scroll lock ---------------------------------- */
  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  async function handleSignOut() {
    if (isSupabaseConfigured()) {
      await createClient().auth.signOut();
    }
    setAccountOpen(false);
    setDrawerOpen(false);
    router.push("/");
    router.refresh();
  }

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* Announcement strip */}
      <div className="bg-luxury-charcoal text-white border-b border-luxury-gold/20">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-4 px-4 text-[10px] tracking-[0.18em] uppercase sm:justify-between sm:px-6 lg:px-12">
          <p className="flex items-center gap-2 font-semibold text-luxury-gold">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-luxury-gold opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-luxury-gold" />
            </span>
            Direct manufacturer · {SITE.city}
          </p>
          <p className="hidden text-gray-400 md:block">
            Woven · Cotton · Satin · Hang tags · Patches
          </p>
          <a
            href={whatsappLink(WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden items-center gap-1.5 font-semibold text-gray-300 transition-colors hover:text-luxury-gold sm:flex ${FOCUS_RING}`}
          >
            <WhatsAppIcon />
            {SITE.phoneDisplay}
          </a>
        </div>
      </div>

      {/* Scroll sentinel — the header compacts once this leaves the viewport */}
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-lg transition-[background-color,box-shadow,border-color] duration-300 ${
          scrolled
            ? "border-luxury-gold/30 bg-luxury-cream/95 shadow-[0_16px_40px_-32px_rgba(18,18,18,0.65)]"
            : "border-luxury-border/80 bg-luxury-cream/85"
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[height] duration-300 sm:px-6 lg:px-12 ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          {/* Wordmark */}
          <Link
            href="/"
            aria-label={`${SITE.name} — home`}
            className={`group flex shrink-0 items-center gap-3 ${FOCUS_RING} rounded-full`}
          >
            <span
              className={`relative overflow-hidden rounded-full border border-luxury-gold/50 bg-white p-0.5 shadow-sm transition-all duration-300 group-hover:border-luxury-gold group-hover:shadow-md ${
                scrolled ? "h-9 w-9" : "h-11 w-11"
              }`}
            >
              <Image
                src="/Logo.png"
                alt=""
                width={44}
                height={44}
                className="h-full w-full object-contain"
              />
            </span>
            <span className="flex flex-col leading-none">
              <span
                className={`font-serif font-bold tracking-[0.14em] text-luxury-charcoal transition-all duration-300 group-hover:text-luxury-darkgold ${
                  scrolled ? "text-base" : "text-lg"
                }`}
              >
                VECTOR LABELS
              </span>
              <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.3em] text-luxury-gold">
                {SITE.city} · Since {SITE.foundingYear}
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex xl:gap-2">
            <Link
              href="/"
              aria-current={isCurrent(pathname, "/", true) ? "page" : undefined}
              className={`group flex items-center rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors hover:text-luxury-charcoal ${
                isCurrent(pathname, "/", true) ? "text-luxury-charcoal" : "text-gray-600"
              } ${FOCUS_RING}`}
            >
              <span className="relative">
                Home
                <span
                  className={`absolute -bottom-1.5 left-0 h-[2px] bg-luxury-gold transition-all duration-300 ${
                    isCurrent(pathname, "/", true) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </span>
            </Link>

            {/* Products mega menu */}
            <div
              ref={productsRef}
              className="relative"
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
            >
              <button
                type="button"
                aria-expanded={productsOpen}
                aria-controls="products-menu"
                onClick={() => setProductsOpen((open) => !open)}
                className={`group flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-600 transition-colors hover:text-luxury-charcoal ${FOCUS_RING} ${
                  productsOpen ? "text-luxury-charcoal" : ""
                }`}
              >
                <span className="relative">
                  Products
                  <span
                    className={`absolute -bottom-1.5 left-0 h-[2px] bg-luxury-gold transition-all duration-300 ${
                      productsOpen ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </span>
                <ChevronIcon
                  className={`h-3 w-3 transition-transform duration-300 ${
                    productsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {productsOpen ? (
                <div
                  id="products-menu"
                  className="nav-panel absolute left-1/2 top-full z-50 w-[min(40rem,90vw)] -translate-x-1/2 pt-3"
                >
                  <div className="overflow-hidden rounded-xl border border-luxury-border bg-white shadow-[0_36px_70px_-40px_rgba(18,18,18,0.55)]">
                    <div className="flex items-center justify-between border-b border-luxury-border px-5 py-3">
                      <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400">
                        The range
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                        From, at MOQ
                      </p>
                    </div>

                    <ul className="grid grid-cols-2 gap-1 p-3">
                      {PRODUCT_MENU.map((product) => (
                        <li key={product.slug}>
                          <Link
                            href={`/products/${product.slug}`}
                            onClick={() => setProductsOpen(false)}
                            className={`group flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-luxury-cream ${FOCUS_RING}`}
                          >
                            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-luxury-border bg-luxury-slate">
                              <Image
                                src={product.image}
                                alt=""
                                fill
                                sizes="44px"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-bold text-luxury-charcoal transition-colors group-hover:text-luxury-gold">
                                {product.title}
                              </span>
                              <span className="block truncate text-[10px] text-gray-400">
                                {product.tagline}
                              </span>
                            </span>
                            <span className="shrink-0 text-[11px] font-bold text-luxury-charcoal">
                              {formatUnitPrice(product.from)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-luxury-border bg-luxury-slate px-5 py-3">
                      <Link
                        href="/#products"
                        onClick={() => setProductsOpen(false)}
                        className={`text-[10px] font-bold uppercase tracking-[0.18em] text-luxury-charcoal transition-colors hover:text-luxury-gold ${FOCUS_RING} rounded`}
                      >
                        View the full collection →
                      </Link>
                      <Link
                        href="/ai-studio"
                        onClick={() => setProductsOpen(false)}
                        className={`text-[10px] font-bold uppercase tracking-[0.18em] text-luxury-gold transition-colors hover:underline ${FOCUS_RING} rounded`}
                      >
                        Design your own →
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <Link
              href="/#calculator"
              onClick={email ? undefined : requireAuth}
              className={`group flex items-center rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-600 transition-colors hover:text-luxury-charcoal ${FOCUS_RING}`}
            >
              <span className="relative">
                Pricing
                <span className="absolute -bottom-1.5 left-0 h-[2px] w-0 bg-luxury-gold transition-all duration-300 group-hover:w-full" />
              </span>
            </Link>

            <Link
              href="/track"
              aria-current={isCurrent(pathname, "/track") ? "page" : undefined}
              className={`group hidden items-center rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors hover:text-luxury-charcoal xl:flex ${
                isCurrent(pathname, "/track") ? "text-luxury-charcoal" : "text-gray-600"
              } ${FOCUS_RING}`}
            >
              <span className="relative">
                Track order
                <span
                  className={`absolute -bottom-1.5 left-0 h-[2px] bg-luxury-gold transition-all duration-300 ${
                    isCurrent(pathname, "/track") ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </span>
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/ai-studio"
              className={`hidden items-center gap-2 rounded-full border border-luxury-gold/40 bg-gradient-to-r from-luxury-gold to-luxury-darkgold px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md xl:inline-flex ${FOCUS_RING}`}
            >
              <SparkIcon />
              Create your design
            </Link>

            <Link
              href="/cart"
              aria-label={count > 0 ? `Cart, ${count} items` : "Cart, empty"}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full text-luxury-charcoal transition-colors hover:bg-luxury-border/60 ${FOCUS_RING}`}
            >
              <BagIcon />
              {count > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-luxury-charcoal px-1 text-[9px] font-bold leading-none text-white ring-2 ring-luxury-cream">
                  {count > 99 ? "99+" : count}
                </span>
              ) : null}
            </Link>

            {email ? (
              <div ref={accountRef} className="relative hidden lg:block">
                <button
                  type="button"
                  aria-expanded={accountOpen}
                  aria-controls="account-menu"
                  aria-label="Account menu"
                  onClick={() => setAccountOpen((open) => !open)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border border-luxury-border bg-white text-xs font-bold uppercase text-luxury-charcoal transition-colors hover:border-luxury-gold ${FOCUS_RING}`}
                >
                  {email.slice(0, 1)}
                </button>

                {accountOpen ? (
                  <div
                    id="account-menu"
                    className="nav-panel absolute right-0 top-full z-50 w-64 pt-3"
                  >
                    <div className="overflow-hidden rounded-xl border border-luxury-border bg-white shadow-xl">
                      <div className="border-b border-luxury-border px-4 py-3">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">
                          Signed in
                        </p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-luxury-charcoal">
                          {email}
                        </p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/dashboard"
                          onClick={() => setAccountOpen(false)}
                          className={`block rounded-md px-3 py-2 text-xs font-semibold text-luxury-charcoal hover:bg-luxury-cream ${FOCUS_RING}`}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/track"
                          onClick={() => setAccountOpen(false)}
                          className={`block rounded-md px-3 py-2 text-xs font-semibold text-luxury-charcoal hover:bg-luxury-cream ${FOCUS_RING}`}
                        >
                          Track an order
                        </Link>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className={`w-full rounded-md px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 ${FOCUS_RING}`}
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className={`hidden items-center gap-2 rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-600 transition-colors hover:text-luxury-charcoal lg:flex ${FOCUS_RING}`}
              >
                <UserIcon />
                <span className="hidden xl:inline">Sign in</span>
              </Link>
            )}

            <Link
              href="/#calculator"
              onClick={email ? undefined : requireAuth}
              className={`hidden items-center rounded-full bg-luxury-charcoal px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-luxury-gold hover:text-luxury-charcoal hover:shadow-md sm:inline-flex ${FOCUS_RING}`}
            >
              Get a quote
            </Link>

            {/* Mobile trigger */}
            <button
              type="button"
              onClick={() => setDrawerOpen((open) => !open)}
              aria-expanded={drawerOpen}
              aria-controls="mobile-menu"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              className={`ml-0.5 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full transition-colors hover:bg-luxury-border/60 lg:hidden ${FOCUS_RING}`}
            >
              <span
                className={`block h-0.5 w-5 bg-luxury-charcoal transition-transform duration-300 ${
                  drawerOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-luxury-charcoal transition-opacity duration-300 ${
                  drawerOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-luxury-charcoal transition-transform duration-300 ${
                  drawerOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div
          className="nav-overlay fixed inset-0 z-50 bg-luxury-charcoal/60 backdrop-blur-sm lg:hidden"
          onClick={closeDrawer}
        >
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="nav-drawer absolute inset-y-0 right-0 flex h-full w-[min(23rem,100%)] flex-col border-l border-luxury-gold/30 bg-luxury-cream shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-luxury-border px-5 py-4">
              <Link
                href="/"
                onClick={closeDrawer}
                className={`flex items-center gap-2.5 ${FOCUS_RING} rounded-full`}
              >
                <span className="relative h-9 w-9 overflow-hidden rounded-full border border-luxury-gold/50 bg-white p-0.5">
                  <Image src="/Logo.png" alt="" width={36} height={36} className="h-full w-full object-contain" />
                </span>
                <span className="flex flex-col leading-none">
                  <span className="font-serif text-sm font-bold tracking-[0.12em] text-luxury-charcoal">
                    VECTOR LABELS
                  </span>
                  <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.28em] text-luxury-gold">
                    {SITE.city}
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close menu"
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-luxury-border/60 text-lg font-bold text-luxury-charcoal transition-colors hover:bg-luxury-gold hover:text-white ${FOCUS_RING}`}
              >
                ×
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <div>
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400">
                  Shop
                </p>
                <ul className="divide-y divide-luxury-border/70">
                  {PRODUCT_MENU.map((product) => (
                    <li key={product.slug}>
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={closeDrawer}
                        className={`flex items-center gap-3 py-2.5 ${FOCUS_RING} rounded`}
                      >
                        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded border border-luxury-border bg-white">
                          <Image src={product.image} alt="" fill sizes="36px" className="object-cover" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-luxury-charcoal">
                          {product.title}
                        </span>
                        <span className="shrink-0 text-[10px] font-bold text-luxury-charcoal">
                          {formatUnitPrice(product.from)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400">
                  Explore
                </p>
                <ul className="divide-y divide-luxury-border/70 text-xs font-semibold text-luxury-charcoal">
                  {[
                    { href: "/", label: "Home" },
                    { href: "/#calculator", label: "Pricing calculator", authRequired: true as const },
                    { href: "/track", label: "Track an order" },
                  ].map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={(e) => {
                          closeDrawer();
                          if (item.authRequired && !email) {
                            e.preventDefault();
                            router.push("/auth/login");
                          }
                        }}
                        className={`block py-3 transition-colors hover:text-luxury-gold ${FOCUS_RING} rounded`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/cart"
                      onClick={closeDrawer}
                      className={`flex items-center justify-between py-3 transition-colors hover:text-luxury-gold ${FOCUS_RING} rounded`}
                    >
                      <span>Cart</span>
                      <span className="rounded-full bg-luxury-charcoal px-2 py-0.5 text-[10px] font-bold text-white">
                        {count}
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400">
                  Account
                </p>
                {email ? (
                  <div className="space-y-2">
                    <p className="truncate text-[11px] text-gray-500">{email}</p>
                    <Link
                      href="/dashboard"
                      onClick={closeDrawer}
                      className={`block rounded-sm bg-luxury-charcoal py-3 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white ${FOCUS_RING}`}
                    >
                      Open dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className={`block w-full rounded-sm border border-luxury-border py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-red-600 ${FOCUS_RING}`}
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={closeDrawer}
                    className={`block rounded-sm border border-luxury-charcoal py-3 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-luxury-charcoal ${FOCUS_RING}`}
                  >
                    Sign in / create account
                  </Link>
                )}
              </div>

              <Link
                href="/ai-studio"
                onClick={closeDrawer}
                className={`flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-luxury-gold to-luxury-darkgold py-3.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-sm ${FOCUS_RING}`}
              >
                <SparkIcon />
                Create your design
              </Link>
            </div>

            <div className="space-y-3 border-t border-luxury-border px-5 py-4">
              <a
                href={whatsappLink(WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 rounded-sm bg-luxury-charcoal py-3.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white ${FOCUS_RING}`}
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                WhatsApp {SITE.phoneDisplay}
              </a>
              <p className="text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                © {SITE.copyrightYear} {SITE.name} · {SITE.city}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
