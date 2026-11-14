import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track your order",
  description:
    "Follow your custom label batch through proof review, production and dispatch in Tirupur.",
  robots: { index: false, follow: false },
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
