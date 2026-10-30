export interface Product {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  description: string;
  image: string;
  moq: number;
  delivery: string;
  baseRatePerSqMm: number;
  specs: {
    material: string;
    densityOrWeight: string;
    foldTypes: string[];
    colors: string;
    idealFor: string;
  };
}

export const PRODUCTS: Product[] = [
  {
    slug: "woven-labels",
    title: "Woven Labels",
    tagline: "High Density Damask Weave",
    category: "Labels",
    description: "High-density damask weaves featuring detailed thread overlays. The industry benchmark for high-end clothing and luxury fashion brands.",
    image: "/images/woven_label_photo.png",
    moq: 2000,
    delivery: "3 - 5 Days",
    baseRatePerSqMm: 0.0012,
    specs: {
      material: "100% Premium Fine Polyester Thread Yarns",
      densityOrWeight: "50, 75, or 100 denier fine weaves",
      foldTypes: ["End Fold", "Center Fold", "Book Fold", "Miter Fold", "Laser Cut Flat"],
      colors: "Up to 6 thread colors per design",
      idealFor: "Outerwear, high-end jackets, denim collections, luxury neck labels",
    },
  },
  {
    slug: "cotton-labels",
    title: "Organic Cotton Labels",
    tagline: "Eco-Friendly & Sustainable",
    category: "Labels",
    description: "Natural 100% organic cotton and herringbone twill tapes. Soft to the touch, biodegradable, and perfect for sustainable apparel brands.",
    image: "/images/cotton_label_photo.png",
    moq: 1000,
    delivery: "5 - 7 Days",
    baseRatePerSqMm: 0.0018,
    specs: {
      material: "100% Organic Cotton / Herringbone Twill Tape",
      densityOrWeight: "Heavyweight 320 GSM natural cotton weave",
      foldTypes: ["Center Fold", "Straight Cut Flat", "Loop Fold"],
      colors: "Natural unbleached ecru, bleached white, or custom dyed base",
      idealFor: "Eco-apparel, organic cotton tees, linen wear, children's clothing",
    },
  },
  {
    slug: "satin-labels",
    title: "Satin Ribbon Labels",
    tagline: "Silky Smooth Finish",
    category: "Labels",
    description: "Lustrous, soft satin ribbon labels with heat-sealed edges. Ideal for inner collar care labels, lingerie, and silk garments.",
    image: "/images/satin_label_photo.png",
    moq: 1000,
    delivery: "4 - 6 Days",
    baseRatePerSqMm: 0.0010,
    specs: {
      material: "Double-faced woven edge satin polyester ribbon",
      densityOrWeight: "Soft silk-feel satin ribbon with anti-fray weave",
      foldTypes: ["End Fold", "Center Fold", "Flat Cut"],
      colors: "Single or multi-color thermal transfer & screen print",
      idealFor: "Lingerie, silk dresses, premium innerwear, sleepwear",
    },
  },
  {
    slug: "woven-patches",
    title: "Custom Woven Patches",
    tagline: "Heavy-Threaded Emblems",
    category: "Patches",
    description: "Sturdy, heavy-threaded woven emblems. Perfect for retro sleeve accents, heavy hats, caps, and technical outerwear.",
    image: "/images/woven_patch_photo.png",
    moq: 500,
    delivery: "9 - 12 Days",
    baseRatePerSqMm: 0.0025,
    specs: {
      material: "Heavy-gauge premium polyester threads with overlock border",
      densityOrWeight: "High-density reinforced backing",
      foldTypes: ["Laser Cut Outline", "Merrowed Edge", "Circle / Custom Shape"],
      colors: "Vibrant UV resistant color pigments",
      idealFor: "Sleeve embroidery accents, denim jackets, caps, duffel bags",
    },
  },
  {
    slug: "hang-tags",
    title: "Luxury Hang Tags",
    tagline: "Cardstock & Foil Stamping",
    category: "Packaging",
    description: "Stately, heavy cardboard and paper tags with foil stamping and custom twine. Perfect for display branding and customer unboxings.",
    image: "/images/hangtag_photo.png",
    moq: 500,
    delivery: "5 - 7 Days",
    baseRatePerSqMm: 0.0020,
    specs: {
      material: "350 GSM to 700 GSM Art Card, Kraft Paper, Textured Linen",
      densityOrWeight: "Rigid heavy cardstock",
      foldTypes: ["Die Cut Shape", "Rounded Corners", "Folded Booklet Tags"],
      colors: "Full CMYK print + Gold/Silver Foil Stamping + Spot UV",
      idealFor: "Retail display tags, price tags, brand story tags",
    },
  },
  {
    slug: "heat-transfer",
    title: "Heat Transfer Labels",
    tagline: "Tagless Comfort",
    category: "Labels",
    description: "Tagless neck care labels printed directly onto fabric using heat presses. Clean look with zero skin irritation.",
    image: "/images/heattransfer_photo.png",
    moq: 2000,
    delivery: "4 - 6 Days",
    baseRatePerSqMm: 0.0015,
    specs: {
      material: "Eco-friendly silicone or plastisol heat transfer inks",
      densityOrWeight: "Flexible stretchable print film",
      foldTypes: ["Direct Heat Press Transfer"],
      colors: "Full color pigmented transfer inks",
      idealFor: "Activewear, t-shirts, sportswear, babywear",
    },
  },
];
