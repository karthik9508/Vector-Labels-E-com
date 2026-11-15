"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { whatsappLink } from "@/lib/site";
import { useAuthGuard } from "@/hooks/use-auth-guard";

const LUXURY_GOLD = "#D4AF37";

export default function LoginGate({
  title = "Pricing & Design Calculator",
  description = "Sign in to access live pricing, the AI design studio, and instant quotes.",
  ctaHref = "/auth/login",
  ctaLabel = "Sign in to continue",
  fallbackLabel = "Or request a quote via WhatsApp",
  children,
}: {
  title?: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
  fallbackLabel?: string;
  children?: ReactNode;
}) {
  const { loading } = useAuthGuard();

  if (children) {
    // Children mode: render children when authenticated, login gate when not.
    const { email } = useAuthGuard();

    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Loading&hellip;</div>
        </div>
      );
    }

    if (!email) {
      return (
        <section className="relative py-20 bg-luxury-cream border-t border-b border-luxury-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto space-y-6">
              <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">
                Login required
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-luxury-charcoal">
                {title}
              </h2>
              <p className="text-sm text-gray-500 font-light leading-relaxed">{description}</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link
                  href={ctaHref}
                  className="bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal px-8 py-4 rounded-sm text-xs font-bold tracking-widest uppercase transition-all shadow-lg"
                >
                  {ctaLabel} &rarr;
                </Link>
                <a
                  href={whatsappLink(
                    "Hi Vector Labels Team, I would like a quotation for clothing labels. Please share your price list and MOQ details."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-luxury-charcoal text-luxury-charcoal hover:bg-luxury-charcoal hover:text-white px-8 py-4 rounded-sm text-xs font-bold tracking-widest uppercase transition-all"
                >
                  {fallbackLabel}
                </a>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return <>{children}</>;
  }

  // Standalone gate (no children)
  return (
    <section className="relative py-20 bg-luxury-cream border-t border-b border-luxury-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">
            Login required
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-luxury-charcoal">
            {title}
          </h2>
          <p className="text-sm text-gray-500 font-light leading-relaxed">{description}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href={ctaHref}
              className="bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal px-8 py-4 rounded-sm text-xs font-bold tracking-widest uppercase transition-all shadow-lg"
            >
              {ctaLabel} &rarr;
            </Link>
            <a
              href={whatsappLink(
                "Hi Vector Labels Team, I would like a quotation for clothing labels. Please share your price list and MOQ details."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-luxury-charcoal text-luxury-charcoal hover:bg-luxury-charcoal hover:text-white px-8 py-4 rounded-sm text-xs font-bold tracking-widest uppercase transition-all"
            >
              {fallbackLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** HOC: wraps any section with a blurred backdrop + login prompt overlay. */
export function withLoginGate<P extends object>(
  Content: React.ComponentType<P>,
  options?: { title?: string; description?: string }
) {
  return function GatedSection(props: P) {
    const { email, loading } = useAuthGuard();

    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Loading&hellip;</div>
        </div>
      );
    }

    if (!email) {
      return (
        <div className="relative">
          {/* Blurred preview */}
          <div className="pointer-events-none select-none blur-sm opacity-40">
            <Content {...props} />
          </div>
          {/* Overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center z-10 bg-luxury-cream/60 backdrop-blur-[2px]"
            aria-hidden="false"
          >
            <div className="bg-white/90 border border-luxury-border shadow-2xl rounded-xl p-8 md:p-10 max-w-lg mx-4 text-center space-y-5">
              <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">
                Sign in to access
              </span>
              <h3 className="text-2xl md:text-3xl font-bold font-serif text-luxury-charcoal">
                {options?.title ?? "Pricing &amp; Design Tools"}
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                {options?.description ??
                  "Log in to view live pricing, use the cost calculator, and design your labels in the AI studio."}
              </p>
              <Link
                href="/auth/login"
                className="inline-block bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal px-8 py-3.5 rounded-sm text-xs font-bold tracking-widest uppercase transition-all shadow-md"
              >
                Sign in &rarr;
              </Link>
              <p className="text-[10px] text-gray-400">
                Don&rsquo;t have an account?{" "}
                <Link href="/auth/signup" className="text-luxury-gold font-bold hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return <Content {...props} />;
  };
}
