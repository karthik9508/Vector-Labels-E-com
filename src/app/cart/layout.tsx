import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your label cart",
  description:
    "Review the custom clothing label batches in your cart and their estimated pricing.",
  robots: { index: false, follow: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
