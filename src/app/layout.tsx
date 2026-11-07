import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import WhatsAppWidget from "@/components/WhatsAppWidget";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clothing Labels Manufacturer in India | Woven, Cotton & Satin Labels | Vector Labels",
  description: "Looking for a premium clothing labels manufacturer in India? Vector Labels offers custom woven, cotton, satin labels, and hang tags. Request a quote today!",
  keywords: "woven labels manufacturer, custom woven labels, garment labels manufacturer, clothing labels manufacturer, apparel labels manufacturer, cotton labels manufacturer, satin labels manufacturer, heat transfer labels manufacturer, custom hang tags manufacturer, woven patches manufacturer, labels price calculator",
  icons: {
    icon: "/Icon.ico",
    shortcut: "/Icon.ico",
    apple: "/Logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${playfair.variable} scroll-smooth`}>
      <body className="bg-luxury-cream text-luxury-charcoal font-sans antialiased min-h-screen flex flex-col selection:bg-luxury-gold selection:text-white">
        {children}
        <WhatsAppWidget />
      </body>
    </html>
  );
}
