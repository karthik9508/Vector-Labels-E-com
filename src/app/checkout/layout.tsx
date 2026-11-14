import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure checkout",
  description: "Confirm your delivery details and pay securely for your label batch.",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
