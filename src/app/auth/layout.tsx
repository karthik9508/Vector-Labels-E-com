import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
  description: "Sign in to see your label orders and artwork proofs.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
