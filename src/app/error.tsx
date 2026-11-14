"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the failure in the server/browser logs so it is not silent.
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-luxury-cream px-6 py-24">
      <div className="max-w-lg text-center space-y-6">
        <p className="text-[10px] uppercase tracking-[0.35em] text-luxury-gold font-bold">
          Something went wrong
        </p>
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-luxury-charcoal">
          We couldn&#8217;t load this page
        </h1>
        <p className="text-sm text-gray-500 font-light">
          The error has been logged. You can try again, or head back to the shop —
          nothing in your cart is lost.
        </p>
        {error.digest ? (
          <p className="text-[10px] uppercase tracking-widest text-gray-400">
            Reference: {error.digest}
          </p>
        ) : null}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={reset}
            className="bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal px-8 py-4 rounded-sm text-xs font-bold tracking-widest uppercase transition-all"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-transparent border-2 border-luxury-charcoal text-luxury-charcoal hover:bg-luxury-charcoal hover:text-white px-8 py-4 rounded-sm text-xs font-bold tracking-widest uppercase transition-all"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
