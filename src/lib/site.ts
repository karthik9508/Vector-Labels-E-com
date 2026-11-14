/**
 * Site-wide business constants.
 *
 * The phone number used to be copy-pasted into ten components; changing it
 * meant finding every one of them. Import from here instead.
 */

const rawWhatsApp =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "918608847513";

const rawUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vectorlabel.com";

export const SITE = {
  name: "Vector Labels",
  legalName: "Vector Labels",
  tagline: "Premium clothing label manufacturer in Tirupur",
  description:
    "Look for a premium clothing labels manufacturer in India? Vector Labels makes custom woven, cotton, satin and taffeta labels, hang tags and heat transfer labels for apparel brands.",
  url: rawUrl.replace(/\/$/, ""),
  locale: "en_IN",
  city: "Tirupur",
  region: "Tamil Nadu",
  country: "IN",
  postalCode: "641687",
  street: "7th Street, Mahalakshmi Nagar",
  email: "contact@vectorlabels.com",
  /** Digits only, international format — used to build wa.me links. */
  whatsapp: rawWhatsApp,
  /** Human-readable phone number. */
  phoneDisplay: "+91 86088 47513",
  /** ISO-8601 timestamp of the last verified price-sheet review. */
  pricingReviewed: "2026-11-10",
  /**
   * Copyright year shown in the footer. It is a constant rather than
   * `new Date()` because the footer is a Client Component and Cache Components
   * forbids reading the current time during prerender. Bump it each January.
   */
  copyrightYear: 2026,
  hours: "Mon–Sat, 09:30–18:30 IST",
  foundingYear: 2015,
} as const;

/**
 * Build a WhatsApp deep link. Always use this instead of concatenating
 * `https://wa.me/...` so the number and the encoding stay in one place.
 */
export function whatsappLink(message: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${SITE.url}/`).toString();
}
