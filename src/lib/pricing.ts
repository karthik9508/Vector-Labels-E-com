/**
 * Pricing engine — the single source of truth for money.
 *
 * Every rate below is taken from the manufacturer's price sheet
 * (`Product detail .md` at the repository root) unless a line is explicitly
 * marked as indicative. UI components must never hard-code a rate again:
 * import from here so the calculator, the customizer, the AI studio, the
 * product pages and the payment route all quote the same number.
 *
 * Two pricing models are supported:
 *
 * - `area`  — labels sold by surface area: `ratePerSqMm * width * height`.
 * - `piece` — printed goods sold at a flat price per piece, where the price
 *             depends on the chosen size/board stock (hang tags, stickers,
 *             cards). Prices live in `variants`.
 */

export type PricingModel = "area" | "piece";

/** A flat-priced size / board-stock option for `piece` products. */
export interface PriceVariant {
  id: string;
  label: string;
  /** Nominal size in millimetres, used for display and the visual preview. */
  widthMm?: number;
  heightMm?: number;
  /** Rupees per piece. */
  unitRate: number;
}

/** An optional extra charged per piece (string, lamination, backing…). */
export interface PriceAddOn {
  id: string;
  label: string;
  /** Extra rupees per piece. */
  unitRate: number;
}

/** A quantity break. `factor` multiplies the unit price (0.88 = 12% off). */
export interface BulkTier {
  minQty: number;
  factor: number;
}

export interface ProductPricing {
  model: PricingModel;
  /** Rupees per square millimetre. Required when `model` is `area`. */
  ratePerSqMm?: number;
  /** Flat-price options. Required when `model` is `piece`. */
  variants?: PriceVariant[];
  addOns?: PriceAddOn[];
  /** Minimum order quantity in pieces. */
  moq: number;
  leadTime: string;
  /** Thread/print colours included in the base rate. */
  includedColors: number;
  /** Fractional surcharge per colour above `includedColors`. */
  colorSurcharge: number;
  bulkTiers: BulkTier[];
  /** Shown next to the quote when a price needs a human to confirm it. */
  note?: string;
}

/**
 * Quantity breaks that were already live in the Customizer before this
 * module existed. They are indicative only — the final bulk price is
 * confirmed by the sales team, which is why every quote is labelled an
 * estimate.
 */
export const BULK_TIERS: BulkTier[] = [
  { minQty: 10000, factor: 0.65 },
  { minQty: 5000, factor: 0.75 },
  { minQty: 2000, factor: 0.88 },
];

/** Sizes offered on the price sheet for area-priced labels. */
export const COMMON_LABEL_SIZES = [
  { widthMm: 10, heightMm: 60 },
  { widthMm: 15, heightMm: 60 },
  { widthMm: 20, heightMm: 60 },
  { widthMm: 30, heightMm: 60 },
  { widthMm: 30, heightMm: 75 },
];

const AREA_PRODUCT_DEFAULTS = {
  model: "area" as const,
  includedColors: 1,
  colorSurcharge: 0.1,
  bulkTiers: BULK_TIERS,
};

const PIECE_PRODUCT_DEFAULTS = {
  model: "piece" as const,
  includedColors: 1,
  colorSurcharge: 0,
  bulkTiers: [] as BulkTier[],
};

export const PRICE_BOOK: Record<string, ProductPricing> = {
  "woven-labels": {
    ...AREA_PRODUCT_DEFAULTS,
    ratePerSqMm: 0.001,
    moq: 2000,
    leadTime: "3–5 days",
  },
  "cotton-labels": {
    ...AREA_PRODUCT_DEFAULTS,
    ratePerSqMm: 0.00075,
    moq: 2000,
    leadTime: "2–3 days",
  },
  "satin-labels": {
    ...AREA_PRODUCT_DEFAULTS,
    ratePerSqMm: 0.0005,
    moq: 2000,
    leadTime: "2–3 days",
  },
  "taffeta-labels": {
    ...AREA_PRODUCT_DEFAULTS,
    ratePerSqMm: 0.0005,
    moq: 2000,
    leadTime: "2–3 days",
  },
  "woven-patches": {
    ...AREA_PRODUCT_DEFAULTS,
    ratePerSqMm: 0.0025,
    moq: 500,
    leadTime: "9–12 days",
    note: "Patch pricing is indicative — backings and border finishes are quoted per artwork.",
  },
  "hang-tags": {
    ...PIECE_PRODUCT_DEFAULTS,
    moq: 1000,
    leadTime: "2–3 days",
    variants: [
      { id: "300-50x90-straight", label: "300 GSM · 50×90 mm · straight cut", widthMm: 50, heightMm: 90, unitRate: 1.4 },
      { id: "300-50x90-curved", label: "300 GSM · 50×90 mm · curved edge", widthMm: 50, heightMm: 90, unitRate: 1.6 },
      { id: "300-50x100-straight", label: "300 GSM · 50×100 mm · straight cut", widthMm: 50, heightMm: 100, unitRate: 1.7 },
      { id: "300-50x100-curved", label: "300 GSM · 50×100 mm · curved edge", widthMm: 50, heightMm: 100, unitRate: 1.9 },
      { id: "600-50x90-straight", label: "600 GSM · 50×90 mm · straight cut", widthMm: 50, heightMm: 90, unitRate: 3.8 },
      { id: "600-50x90-curved", label: "600 GSM · 50×90 mm · curved edge", widthMm: 50, heightMm: 90, unitRate: 4.0 },
      { id: "600-50x100-straight", label: "600 GSM · 50×100 mm · straight cut", widthMm: 50, heightMm: 100, unitRate: 4.0 },
      { id: "600-50x100-curved", label: "600 GSM · 50×100 mm · curved edge", widthMm: 50, heightMm: 100, unitRate: 4.2 },
    ],
    addOns: [
      { id: "string-lamination", label: "String + lamination", unitRate: 0.2 },
    ],
  },
  "heat-transfer": {
    ...PIECE_PRODUCT_DEFAULTS,
    moq: 500,
    leadTime: "2–3 days",
    variants: [
      { id: "50x50", label: "50 × 50 mm", widthMm: 50, heightMm: 50, unitRate: 2.5 },
      { id: "50x60", label: "50 × 60 mm", widthMm: 50, heightMm: 60, unitRate: 2.0 },
    ],
  },
  "paper-stickers": {
    ...PIECE_PRODUCT_DEFAULTS,
    moq: 500,
    leadTime: "2–3 days",
    variants: [
      { id: "60x60", label: "60 × 60 mm", widthMm: 60, heightMm: 60, unitRate: 2.5 },
      { id: "50x60", label: "50 × 60 mm", widthMm: 50, heightMm: 60, unitRate: 2.0 },
    ],
  },
  "thanks-cards": {
    ...PIECE_PRODUCT_DEFAULTS,
    moq: 200,
    leadTime: "2–3 days",
    variants: [
      { id: "300-100x75", label: "300 GSM · 100 × 75 mm", widthMm: 100, heightMm: 75, unitRate: 4.25 },
      { id: "300-100x70", label: "300 GSM · 100 × 70 mm", widthMm: 100, heightMm: 70, unitRate: 4.75 },
    ],
  },
};

export const PRICED_SLUGS = Object.keys(PRICE_BOOK);

const FALLBACK_PRICING: ProductPricing = {
  ...AREA_PRODUCT_DEFAULTS,
  ratePerSqMm: 0.001,
  moq: 2000,
  leadTime: "3–5 days",
};

export function getPricing(slug: string): ProductPricing {
  return PRICE_BOOK[slug] ?? FALLBACK_PRICING;
}

/* ------------------------------------------------------------------ */
/* Quoting                                                             */
/* ------------------------------------------------------------------ */

export interface QuoteRequest {
  slug: string;
  quantity: number;
  widthMm?: number;
  heightMm?: number;
  colors?: number;
  variantId?: string;
  addOnIds?: string[];
}

export interface Quote {
  slug: string;
  model: PricingModel;
  quantity: number;
  widthMm: number;
  heightMm: number;
  areaSqMm: number;
  colors: number;
  variant?: PriceVariant;
  addOns: PriceAddOn[];
  /** Base price before colour and volume adjustments, per piece. */
  baseUnit: number;
  colorFactor: number;
  volumeFactor: number;
  /** Combined extra from add-ons, per piece. */
  addOnUnit: number;
  /** Effective price per piece, rounded to paise. */
  unitPrice: number;
  /** What the same quote would cost with no quantity break. */
  unitPriceBeforeBulk: number;
  /** unitPrice × quantity, rounded to the nearest rupee. */
  total: number;
  /** Rupee saving from the quantity break. */
  bulkSaving: number;
  moq: number;
  meetsMoq: boolean;
  leadTime: string;
  note?: string;
}

const MAX_QTY = 1_000_000;
const MAX_COLORS = 10;

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function volumeFactorFor(tiers: BulkTier[], quantity: number): number {
  let factor = 1;
  for (const tier of tiers) {
    if (quantity >= tier.minQty) {
      factor = Math.min(factor, tier.factor);
    }
  }
  return factor;
}

/**
 * Pure quote function. Safe to call on the server (payment route) and in the
 * browser (live estimates) — it never reads state, so both must agree.
 */
export function quote(request: QuoteRequest): Quote {
  const pricing = getPricing(request.slug);

  const quantity = Math.round(clamp(Number(request.quantity) || 0, 0, MAX_QTY));
  const variant =
    pricing.variants?.find((item) => item.id === request.variantId) ?? pricing.variants?.[0];

  const widthMm = Math.round(
    clamp(request.widthMm ?? variant?.widthMm ?? 20, 5, 200)
  );
  const heightMm = Math.round(
    clamp(request.heightMm ?? variant?.heightMm ?? 60, 5, 300)
  );
  const colors = Math.round(clamp(request.colors ?? 1, 1, MAX_COLORS));
  const addOns = (pricing.addOns ?? []).filter((addOn) =>
    request.addOnIds?.includes(addOn.id)
  );

  const areaSqMm = widthMm * heightMm;

  const baseUnit =
    pricing.model === "area"
      ? (pricing.ratePerSqMm ?? 0) * areaSqMm
      : (variant?.unitRate ?? 0);

  const colorFactor =
    1 + Math.max(0, colors - pricing.includedColors) * pricing.colorSurcharge;
  const volumeFactor = volumeFactorFor(pricing.bulkTiers, quantity);
  const addOnUnit = addOns.reduce((sum, addOn) => sum + addOn.unitRate, 0);

  const unitPriceBeforeBulk = round2(baseUnit * colorFactor + addOnUnit);
  const unitPrice = round2(baseUnit * colorFactor * volumeFactor + addOnUnit);

  const total = Math.round(unitPrice * quantity);
  const totalBeforeBulk = Math.round(unitPriceBeforeBulk * quantity);

  return {
    slug: request.slug,
    model: pricing.model,
    quantity,
    widthMm,
    heightMm,
    areaSqMm,
    colors,
    variant,
    addOns,
    baseUnit,
    colorFactor,
    volumeFactor,
    addOnUnit,
    unitPrice,
    unitPriceBeforeBulk,
    total,
    bulkSaving: Math.max(0, totalBeforeBulk - total),
    moq: pricing.moq,
    meetsMoq: quantity >= pricing.moq,
    leadTime: pricing.leadTime,
    note: pricing.note,
  };
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

const inrCache = new Map<number, Intl.NumberFormat>();

function inrFormatter(decimals: number): Intl.NumberFormat {
  const cached = inrCache.get(decimals);
  if (cached) return cached;
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  inrCache.set(decimals, formatter);
  return formatter;
}

/**
 * Indian rupee formatting. Defaults to two decimals (paise); pass `0` for
 * whole-rupee totals and `5` for per-mm² rates.
 */
export function formatINR(value: number, decimals = 2): string {
  return inrFormatter(decimals).format(Number.isFinite(value) ? value : 0);
}

export function formatUnitPrice(value: number): string {
  return formatINR(value, 2);
}

export function formatQuantity(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatRatePerSqMm(value: number): string {
  return `${formatINR(value, 5)} / mm²`;
}

/* ------------------------------------------------------------------ */
/* Size / variant price table (product pages, calculator presets)      */
/* ------------------------------------------------------------------ */

export interface PriceRow {
  id: string;
  label: string;
  unitPrice: number;
  total: number;
}

/**
 * Price rows for a product page: one row per common label size for area
 * products, one row per flat-price variant otherwise.
 */
export function priceRows(
  slug: string,
  options: { quantity?: number; colors?: number; addOnIds?: string[] } = {}
): PriceRow[] {
  const pricing = getPricing(slug);
  const quantity = options.quantity ?? pricing.moq;
  const colors = options.colors ?? 1;

  if (pricing.model === "piece") {
    return (pricing.variants ?? []).map((variant) => {
      const result = quote({
        slug,
        quantity,
        colors,
        variantId: variant.id,
        addOnIds: options.addOnIds,
      });
      return {
        id: variant.id,
        label: variant.label,
        unitPrice: result.unitPrice,
        total: result.total,
      };
    });
  }

  return COMMON_LABEL_SIZES.map((size) => {
    const result = quote({ slug, quantity, colors, ...size });
    return {
      id: `${size.widthMm}x${size.heightMm}`,
      label: `${size.widthMm} × ${size.heightMm} mm`,
      unitPrice: result.unitPrice,
      total: result.total,
    };
  });
}

/**
 * Cheapest per-piece price at MOQ — the "from ₹x" figure shown on cards and in
 * the navigation menu.
 */
export function fromPrice(slug: string): { unitPrice: number; label: string } {
  const rows = priceRows(slug, { quantity: getPricing(slug).moq });
  return rows.reduce(
    (best, row) =>
      row.unitPrice < best.unitPrice
        ? { unitPrice: row.unitPrice, label: row.label }
        : best,
    { unitPrice: Number.POSITIVE_INFINITY, label: "" }
  );
}
