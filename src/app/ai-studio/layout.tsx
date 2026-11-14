import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI label design studio",
  description:
    "Design a custom woven, cotton, satin or hang-tag label by hand or with AI, download the artwork as SVG or PNG, and get an instant price estimate.",
  alternates: { canonical: "/ai-studio" },
};

export default function AIStudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
