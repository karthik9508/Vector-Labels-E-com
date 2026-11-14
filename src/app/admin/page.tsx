"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatINR } from "@/lib/pricing";

interface AdminOrder {
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

export default function AdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      if (!isSupabaseConfigured()) {
        setFailure("Account features are not configured on this deployment.");
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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profileError || profile?.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      setEmail(user.email ?? null);

      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total_amount, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (cancelled) return;

      if (error) {
        setFailure(
          "Could not read orders. Run supabase/migrations/002_admin_access.sql to grant admins read access."
        );
      } else {
        setOrders((data ?? []) as AdminOrder[]);
      }
      setLoading(false);
    }

    checkAdmin();
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
            Loading admin panel…
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const countByStatus = (statuses: string[]) =>
    orders.filter((order) => statuses.includes(order.status)).length;

  const stats = [
    { label: "Awaiting payment", value: countByStatus(["payment_pending"]), icon: "⏳" },
    { label: "Paid / to proof", value: countByStatus(["paid", "proof_review"]), icon: "🎨" },
    { label: "In production", value: countByStatus(["in_production"]), icon: "🏭" },
    { label: "Dispatched", value: countByStatus(["dispatched"]), icon: "📦" },
  ];

  const revenue = orders
    .filter((order) => !["cancelled", "payment_pending"].includes(order.status))
    .reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-luxury-charcoal text-white">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8 mb-12">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">
              Production admin
            </span>
            <h1 className="text-3xl font-bold font-serif text-white mt-1">
              Admin production dashboard
            </h1>
            <p className="text-xs text-gray-400 mt-1">{email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="bg-transparent border border-white/30 text-white hover:bg-white/10 px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-all rounded-sm"
          >
            Sign out
          </button>
        </div>

        {failure ? (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-400/40 rounded text-xs text-amber-200">
            {failure}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 p-6 rounded-lg">
              <span aria-hidden="true" className="text-2xl">{stat.icon}</span>
              <p className="text-3xl font-bold font-serif text-luxury-gold mt-3">
                {stat.value}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <section className="bg-white/5 border border-white/10 rounded-lg overflow-hidden mb-12">
          <div className="p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-serif font-bold text-lg text-white">
              Latest orders
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-gray-400">
              Paid value: <span className="text-luxury-gold font-bold">{formatINR(revenue, 0)}</span>
            </p>
          </div>

          {orders.length === 0 ? (
            <p className="p-8 text-xs text-gray-400">
              No orders yet. New paid and pending orders will appear here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-white/10 uppercase tracking-widest text-[10px] text-gray-300">
                  <tr>
                    <th scope="col" className="text-left font-bold px-6 py-3">Order</th>
                    <th scope="col" className="text-left font-bold px-6 py-3">Placed</th>
                    <th scope="col" className="text-left font-bold px-6 py-3">Status</th>
                    <th scope="col" className="text-right font-bold px-6 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5">
                      <th scope="row" className="text-left px-6 py-4 font-semibold">
                        <Link href={`/track?id=${order.id}`} className="hover:text-luxury-gold">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </Link>
                      </th>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {STATUS_LABEL[order.status] ?? order.status}
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

        <div className="bg-white/5 border border-white/10 rounded-lg p-8">
          <h2 className="text-lg font-serif font-bold text-white mb-4">
            Production workflow
          </h2>
          <div className="space-y-4 text-sm text-gray-300">
            {[
              "A customer configures a batch and pays online; the order lands here as “Paid”.",
              "Technicians generate a digital artwork proof and the status moves to “Proof review”.",
              "Once the customer approves, the batch moves through weaving, printing and finishing.",
              "Dispatch updates the status to “Dispatched”; the customer follows it from the tracker.",
            ].map((step) => (
              <p key={step} className="flex items-start gap-3">
                <span aria-hidden="true" className="w-2 h-2 rounded-full bg-luxury-gold mt-1.5 shrink-0" />
                <span>{step}</span>
              </p>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
