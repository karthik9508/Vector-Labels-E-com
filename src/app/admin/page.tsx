"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
      } else {
        setUser(user);
        // Check profile role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile && profile.role === "admin") {
          setIsAuthenticated(true);
        } else {
          router.push("/dashboard");
        }
      }
      setLoading(false);
    }
    checkAdmin();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs uppercase tracking-widest text-gray-500">Loading Admin Panel...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-luxury-charcoal text-white">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8 mb-12">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">Production Admin</span>
            <h1 className="text-3xl font-bold font-serif text-white mt-1">Admin Production Dashboard</h1>
            <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-transparent border border-white/30 text-white hover:bg-white/10 px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-all rounded-sm"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Pending Quotes", value: "0", icon: "📄" },
            { label: "Active Orders", value: "0", icon: "📦" },
            { label: "Proofs Pending", value: "0", icon: "🎨" },
            { label: "In Production", value: "0", icon: "🏭" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-lg">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-3xl font-bold font-serif text-luxury-gold mt-3">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-8">
          <h3 className="text-lg font-serif font-bold text-white mb-4">Production Workflow</h3>
          <div className="space-y-4 text-sm text-gray-300">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-luxury-gold"></span>
              <span>Quotes &amp; Orders are submitted via the customer portal or WhatsApp.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-luxury-gold"></span>
              <span>Technicians generate digital artwork proofs for customer approval.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-luxury-gold"></span>
              <span>Once approved, orders move into weaving, printing, and finishing stages.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-luxury-gold"></span>
              <span>Dispatched with tracking updates pushed back to the customer portal.</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}