import type { Metadata, Viewport } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { SITE } from "@/lib/site";

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

const HOME_TITLE =
  "Clothing Labels Manufacturer in India | Woven, Cotton & Satin Labels | Vector Labels";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "woven labels manufacturer",
    "custom woven labels",
    "clothing labels manufacturer",
    "garment labels manufacturer",
    "cotton labels manufacturer",
    "satin labels manufacturer",
    "taffeta labels",
    "heat transfer labels",
    "hang tags manufacturer",
    "woven patches manufacturer",
    "labels manufacturer Tirupur",
    "label price calculator",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: HOME_TITLE,
    description: SITE.description,
    images: [
      {
        url: "/images/premium_labels_showcase.png",
        width: 1200,
        height: 630,
        alt: "Premium custom clothing labels by Vector Labels, Tirupur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: SITE.description,
    images: ["/images/premium_labels_showcase.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/Icon.ico",
    shortcut: "/Icon.ico",
    apple: "/Logo.png",
  },
  category: "manufacturing",
};

export const viewport: Viewport = {
  themeColor: "#121212",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/Logo.png`,
  description: SITE.description,
  email: SITE.email,
  telephone: SITE.phoneDisplay,
  foundingDate: String(SITE.foundingYear),
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.street,
    addressLocality: SITE.city,
    addressRegion: SITE.region,
    postalCode: SITE.postalCode,
    addressCountry: SITE.country,
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: SITE.phoneDisplay,
    contactType: "sales",
    areaServed: "Worldwide",
    availableLanguage: ["English", "Tamil", "Hindi"],
  },
  knowsAbout: [
    "woven labels",
    "cotton labels",
    "satin labels",
    "hang tags",
    "heat transfer labels",
    "garment branding",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${outfit.variable} ${playfair.variable} scroll-smooth`}
    >
      <body className="bg-luxury-cream text-luxury-charcoal font-sans antialiased min-h-screen flex flex-col selection:bg-luxury-gold selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
        <WhatsAppWidget />
      </body>
    </html>
  );
}
