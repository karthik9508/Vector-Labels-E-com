"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatINR } from "@/lib/pricing";
import { SITE, whatsappLink } from "@/lib/site";

interface OrderRow {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  payment_pending: "Payment pending",
  paid: "Paid",
  proof_review: "Proof review",
  in_production: "In production",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isSupabaseConfigured()) {
        setOrdersError("Account features are not configured on this deployment.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/login");
        return;
      }

      if (cancelled) return;
      setEmail(user.email ?? null);

      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total_amount, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (cancelled) return;
      if (error) {
        setOrdersError("We could not load your orders right now.");
      } else {
        setOrders((data ?? []) as OrderRow[]);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSignOut() {
    if (isSupabaseConfigured()) {
      await createClient().auth.signOut();
    }
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Loading your dashboard…
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const activeOrders = orders.filter(
    (order) => !["delivered", "cancelled"].includes(order.status)
  );

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-luxury-border pb-8 mb-12">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">
              Client portal
            </span>
            <h1 className="text-3xl font-bold font-serif text-luxury-charcoal mt-1">
              Brand dashboard
            </h1>
            <p className="text-xs text-gray-500 mt-1">{email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="bg-transparent border border-luxury-charcoal text-luxury-charcoal hover:bg-luxury-charcoal hover:text-white px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-all rounded-sm"
          >
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg border border-luxury-border shadow-sm space-y-3">
            <span aria-hidden="true" className="text-2xl text-luxury-gold">📦</span>
            <h2 className="font-serif font-bold text-lg text-luxury-charcoal">
              Active orders
            </h2>
            <p className="text-3xl font-serif font-bold text-luxury-gold">
              {activeOrders.length}
            </p>
            <p className="text-xs text-gray-500 font-light">
              {activeOrders.length === 0
                ? "No batches in production right now."
                : "Batches currently with our Tirupur team."}
            </p>
            <Link
              href="/#calculator"
              className="inline-block text-xs font-bold uppercase tracking-widest text-luxury-gold hover:underline"
            >
              Start a new batch →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg border border-luxury-border shadow-sm space-y-3">
            <span aria-hidden="true" className="text-2xl text-luxury-gold">🎨</span>
            <h2 className="font-serif font-bold text-lg text-luxury-charcoal">
              Artwork proofs
            </h2>
            <p className="text-xs text-gray-500 font-light">
              Proofs we send for approval appear against the order. Confirm on the
              order page or reply on WhatsApp.
            </p>
            <Link
              href="/track"
              className="inline-block text-xs font-bold uppercase tracking-widest text-luxury-gold hover:underline"
            >
              Track an order →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg border border-luxury-border shadow-sm space-y-3">
            <span aria-hidden="true" className="text-2xl text-luxury-gold">💬</span>
            <h2 className="font-serif font-bold text-lg text-luxury-charcoal">
              Direct support
            </h2>
            <p className="text-xs text-gray-500 font-light">
              Talk to our manufacturing desk about vectors, rush orders or repeat
              batches.
            </p>
            <a
              href={whatsappLink(
                "Hi Vector Labels Team, I am in my dashboard and need assistance."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-bold uppercase tracking-widest text-luxury-gold hover:underline"
            >
              WhatsApp {SITE.phoneDisplay} →
            </a>
          </div>
        </div>

        <section className="bg-white rounded-lg border border-luxury-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-luxury-border flex items-center justify-between gap-4">
            <h2 className="font-serif font-bold text-lg text-luxury-charcoal">
              Recent orders
            </h2>
            <Link
              href="/track"
              className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold hover:underline"
            >
              Track by id →
            </Link>
          </div>

          {ordersError ? (
            <p className="p-6 text-xs text-amber-800 bg-amber-50">{ordersError}</p>
          ) : orders.length === 0 ? (
            <p className="p-8 text-xs text-gray-500 font-light">
              No orders yet. Place an order through the calculator or the AI studio
              and it will appear here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-luxury-slate uppercase tracking-widest text-[10px] text-luxury-charcoal">
                  <tr>
                    <th scope="col" className="text-left font-bold px-6 py-3">Order</th>
                    <th scope="col" className="text-left font-bold px-6 py-3">Placed</th>
                    <th scope="col" className="text-left font-bold px-6 py-3">Status</th>
                    <th scope="col" className="text-right font-bold px-6 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-luxury-cream/60">
                      <th scope="row" className="text-left px-6 py-4 font-semibold">
                        <Link
                          href={`/track?id=${order.id}`}
                          className="text-luxury-charcoal hover:text-luxury-gold"
                        >
                          #{order.id.slice(0, 8).toUpperCase()}
                        </Link>
                      </th>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-luxury-slate px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-luxury-charcoal">
                          {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-luxury-gold">
                        {formatINR(Number(order.total_amount) || 0, 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}
