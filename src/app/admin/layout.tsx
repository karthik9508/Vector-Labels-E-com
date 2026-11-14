import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Production admin",
  description: "Internal production dashboard.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
