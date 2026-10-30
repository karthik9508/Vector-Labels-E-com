"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
      <Navbar />

      <div className="flex-1 max-w-md w-full mx-auto px-6 py-16 flex flex-col justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl border border-luxury-border space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold font-serif text-luxury-charcoal">Create Brand Account</h1>
            <p className="text-xs text-gray-500">Start ordering custom woven labels &amp; artwork proofs.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-luxury-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Brand / Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Couture Apparel Ltd."
                className="w-full px-4 py-3 border border-luxury-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@brand.com"
                className="w-full px-4 py-3 border border-luxury-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-luxury-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal py-3.5 text-xs font-bold tracking-widest uppercase transition-all rounded-sm shadow-md"
            >
              {loading ? "Creating account..." : "Register Account →"}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-luxury-border text-xs text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-luxury-gold font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
