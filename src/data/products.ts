import { PRICE_BOOK, type ProductPricing, getPricing } from "@/lib/pricing";

/**
 * Marketing content for every product we sell.
 *
 * Commercial terms (MOQ, lead time, rates) are *not* stored here — they are
 * derived from `@/lib/pricing`, which mirrors the manufacturer's price sheet.
 * That keeps a single source of truth for money and prevents the drift that
 * had crept in between the calculator, the customizer and the product pages.
 */

export interface ProductSpecs {
  material: string;
  densityOrWeight: string;
  foldTypes: string[];
  colors: string;
  idealFor: string;
}

export interface Product {
  slug: string;
  title: string;
  /** Short label used on cards and badges. */
  tagline: string;
  category: "Labels" | "Patches" | "Packaging";
  description: string;
  image: string;
  imageAlt: string;
  highlights: string[];
  specs: ProductSpecs;
  pricing: ProductPricing;
}

type ProductContent = Omit<Product, "pricing"> & { slug: keyof typeof PRICE_BOOK };

const CONTENT: ProductContent[] = [
  {
    slug: "woven-labels",
    title: "Woven Labels",
    tagline: "High-density damask weave",
    category: "Labels",
    description:
      "High-density damask weaves with detailed thread overlays — the benchmark finish for premium garments, denim and outerwear.",
    image: "/images/woven_label_photo.png",
    imageAlt: "High-density woven damask neck label",
    highlights: ["Up to 6 thread colours", "Five fold styles", "50 / 75 / 100 denier"],
    specs: {
      material: "Fine polyester thread yarns in a damask weave",
      densityOrWeight: "50, 75 or 100 denier yarns for high-resolution lettering",
      foldTypes: ["End fold", "Center fold", "Book fold", "Miter fold", "Laser-cut flat"],
      colors: "Up to 6 thread colours per design; first colour included in the rate",
      idealFor: "Outerwear, jackets, denim, luxury neck labels",
    },
  },
  {
    slug: "cotton-labels",
    title: "Organic Cotton Labels",
    tagline: "Eco-friendly and soft",
    category: "Labels",
    description:
      "Natural organic cotton and herringbone twill tapes. Soft against the skin, biodegradable, and a natural fit for sustainable apparel.",
    image: "/images/cotton_label_photo.png",
    imageAlt: "Organic cotton printed label",
    highlights: ["Organic cotton tape", "Soft hand-feel", "Screen, rotary or foil print"],
    specs: {
      material: "100% organic cotton / herringbone twill tape",
      densityOrWeight: "Heavyweight natural cotton weave",
      foldTypes: ["Center fold", "Straight-cut flat", "Loop fold"],
      colors: "Natural ecru, bleached white, or a custom dyed base",
      idealFor: "Organic tees, linen wear, kidswear, sustainable collections",
    },
  },
  {
    slug: "satin-labels",
    title: "Satin Ribbon Labels",
    tagline: "Silky smooth finish",
    category: "Labels",
    description:
      "Lustrous satin ribbon labels with heat-sealed edges. Soft enough for inner collars, lingerie and silk garments.",
    image: "/images/satin_label_photo.png",
    imageAlt: "Satin ribbon care label",
    highlights: ["Heat-sealed edges", "Thermal transfer print", "Non-scratch finish"],
    specs: {
      material: "Double-faced, woven-edge satin polyester ribbon",
      densityOrWeight: "Soft silk-feel ribbon with an anti-fray weave",
      foldTypes: ["End fold", "Center fold", "Flat cut"],
      colors: "Single or multi-colour thermal transfer and screen print",
      idealFor: "Lingerie, silk dresses, innerwear, sleepwear",
    },
  },
  {
    slug: "taffeta-labels",
    title: "Taffeta Labels",
    tagline: "Crisp and economical",
    category: "Labels",
    description:
      "Crisp woven taffeta labels with clean heat-cut edges — the economical workhorse for care labels and volume programmes.",
    image: "/images/taffeta_label_photo.png",
    imageAlt: "Taffeta woven care label",
    highlights: ["Heat-cut edges", "Fast turnaround", "Volume-friendly pricing"],
    specs: {
      material: "Woven taffeta polyester ribbon",
      densityOrWeight: "Lightweight ribbon with a crisp structure",
      foldTypes: ["End fold", "Center fold", "Flat cut"],
      colors: "Up to 4 print colours on a white, black or custom base",
      idealFor: "Care labels, innerwear, uniform programmes, value fashion",
    },
  },
  {
    slug: "woven-patches",
    title: "Custom Woven Patches",
    tagline: "Heavy-threaded emblems",
    category: "Patches",
    description:
      "Sturdy, heavy-threaded woven emblems for sleeve accents, caps and technical outerwear.",
    image: "/images/woven_patch_photo.png",
    imageAlt: "Custom woven patch with merrowed edge",
    highlights: ["Merrowed or laser-cut border", "Sew-on, iron-on or velcro", "UV-stable threads"],
    specs: {
      material: "Heavy-gauge polyester threads with an overlock border",
      densityOrWeight: "High-density weave on a reinforced backing",
      foldTypes: ["Laser-cut outline", "Merrowed edge", "Circle / custom shape"],
      colors: "Vibrant, UV-resistant colour pigments",
      idealFor: "Sleeve accents, denim jackets, caps, duffel bags",
    },
  },
  {
    slug: "hang-tags",
    title: "Luxury Hang Tags",
    tagline: "300–600 GSM cardstock",
    category: "Packaging",
    description:
      "Rigid art-card hang tags with foil stamping, lamination and stringing — the finishing touch on a retail unboxing.",
    image: "/images/hangtag_photo.png",
    imageAlt: "Premium printed hang tag with string",
    highlights: ["300 or 600 GSM", "Straight or curved edge", "Optional string + lamination"],
    specs: {
      material: "300 GSM / 600 GSM art card, kraft or textured linen paper",
      densityOrWeight: "Rigid cardstock with an optional matte or gloss lamination",
      foldTypes: ["Straight cut", "Curved edge", "Die-cut custom shape"],
      colors: "Full CMYK print, gold/silver foil, spot UV and embossing",
      idealFor: "Retail display tags, price tags, brand story tags",
    },
  },
  {
    slug: "heat-transfer",
    title: "Heat Transfer Labels",
    tagline: "Tagless comfort",
    category: "Labels",
    description:
      "Tagless neck and care labels pressed straight onto the garment. A clean, scratch-free finish that survives industrial washes.",
    image: "/images/heattransfer_photo.png",
    imageAlt: "Heat transfer tagless neck label",
    highlights: ["Tagless comfort", "50+ wash durability", "Stretchable film"],
    specs: {
      material: "Eco-friendly silicone or plastisol transfer inks",
      densityOrWeight: "Flexible, stretchable print film",
      foldTypes: ["Direct heat-press transfer"],
      colors: "Full-colour pigmented transfer inks",
      idealFor: "Activewear, t-shirts, sportswear, babywear",
    },
  },
  {
    slug: "paper-stickers",
    title: "Paper Stickers",
    tagline: "Die-cut or kiss-cut",
    category: "Packaging",
    description:
      "Durable paper stickers for branding, sealing and retail. Die-cut or kiss-cut finishes in standard and custom sizes.",
    image: "/images/papersticker_photo.png",
    imageAlt: "Custom paper sticker",
    highlights: ["Die-cut and kiss-cut", "Water-resistant stock", "High-adhesive backing"],
    specs: {
      material: "300 GSM art paper or waterproof synthetic stock",
      densityOrWeight: "High-quality coated paper with matte or gloss finish",
      foldTypes: ["Die-cut", "Kiss-cut", "Straight cut"],
      colors: "Full CMYK print with optional spot colour and foil accents",
      idealFor: "Branding, sealing, packaging inserts, retail labels",
    },
  },
  {
    slug: "thanks-cards",
    title: "Thank You Cards",
    tagline: "Premium branded inserts",
    category: "Packaging",
    description:
      "Heavy 300 GSM cards that turn a delivery box into a branded moment — thank-you notes, care instructions or discount inserts.",
    image: "/images/photocard_photo.png",
    imageAlt: "Printed thank you card insert",
    highlights: ["300 GSM art card", "Two standard sizes", "Low 200 pc minimum"],
    specs: {
      material: "300 GSM art card",
      densityOrWeight: "Rigid card with a matte or gloss finish",
      foldTypes: ["Straight cut", "Rounded corners"],
      colors: "Full CMYK print with optional foil accents",
      idealFor: "Order inserts, thank-you notes, care cards, discount cards",
    },
  },
];

export const PRODUCTS: Product[] = CONTENT.map((content) => ({
  ...content,
  pricing: getPricing(content.slug),
}));

export const PRODUCT_SLUGS = PRODUCTS.map((product) => product.slug);

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

/** Products grouped for the showcase and sitemap. */
export const PRODUCT_CATEGORIES = ["Labels", "Patches", "Packaging"] as const;
