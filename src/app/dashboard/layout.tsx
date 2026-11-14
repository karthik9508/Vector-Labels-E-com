import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand dashboard",
  description: "Your label orders, artwork proofs and direct support.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
