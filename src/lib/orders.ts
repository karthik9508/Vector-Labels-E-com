import { getProduct } from "@/data/products";
import { PRICE_BOOK, formatINR, quote, type QuoteRequest } from "@/lib/pricing";

/**
 * Server-side pricing for a checkout.
 *
 * The browser sends what the customer configured, never a price. Every line
 * is re-quoted here with the same pure `quote()` function the UI uses, so a
 * tampered `localStorage` cart cannot change what gets charged.
 */

const MAX_LINES = 20;

export interface PricedLine {
  slug: string;
  title: string;
  quantity: number;
  unitPrice: number;
  total: number;
  specification: string;
  request: QuoteRequest;
  /** AI concept image URL attached to this line, if any. */
  conceptImageUrl?: string;
  /** AI concept ID for reference. */
  conceptId?: string;
}

export type PriceResult =
  | { ok: true; lines: PricedLine[]; total: number }
  | { ok: false; error: string };

function isQuoteRequest(value: unknown): value is QuoteRequest {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<QuoteRequest>;
  return typeof candidate.slug === "string" && Number.isFinite(Number(candidate.quantity));
}

export function priceLines(raw: unknown): PriceResult {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  if (raw.length > MAX_LINES) {
    return { ok: false, error: `A single order can contain at most ${MAX_LINES} lines.` };
  }

  const lines: PricedLine[] = [];

  for (const entry of raw) {
    const item = entry as { pricingRequest?: unknown; conceptImageUrl?: unknown; conceptId?: unknown } | null;
    if (!item || !isQuoteRequest(item.pricingRequest)) {
      return {
        ok: false,
        error:
          "One of your cart items is missing its configuration. Please remove it and add the product again.",
      };
    }

    const request = item.pricingRequest;
    if (!PRICE_BOOK[request.slug]) {
      return { ok: false, error: `Unknown product "${request.slug}".` };
    }

    const quantity = Math.floor(Number(request.quantity));
    if (!Number.isFinite(quantity) || quantity < 1) {
      return { ok: false, error: "Each line needs a quantity of at least 1." };
    }

    const product = getProduct(request.slug);
    const priced = quote({ ...request, quantity });
    const conceptImageUrl = typeof item.conceptImageUrl === "string" ? item.conceptImageUrl : undefined;
    const conceptId = typeof item.conceptId === "string" ? item.conceptId : undefined;

    lines.push({
      slug: request.slug,
      title: product?.title ?? request.slug,
      quantity,
      unitPrice: priced.unitPrice,
      total: priced.total,
      specification: [
        priced.model === "piece"
          ? priced.variant?.label
          : `${priced.widthMm}×${priced.heightMm} mm`,
        `${quantity} pcs`,
        priced.model === "area" ? `${priced.colors} colour(s)` : null,
        priced.addOns.length ? priced.addOns.map((addOn) => addOn.label).join(", ") : null,
        `${formatINR(priced.unitPrice)} / pc`,
        conceptImageUrl ? "AI concept attached" : null,
      ]
        .filter(Boolean)
        .join(" · "),
      request: { ...request, quantity },
      conceptImageUrl,
      conceptId,
    });
  }

  const total = lines.reduce((sum, line) => sum + line.total, 0);
  return { ok: true, lines, total };
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const REQUIRED_FIELDS: (keyof ShippingAddress)[] = [
  "name",
  "email",
  "phone",
  "address",
  "city",
  "state",
  "pincode",
];

export function parseShippingAddress(raw: unknown): ShippingAddress | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Record<string, unknown>;
  const address = {} as ShippingAddress;
  for (const field of REQUIRED_FIELDS) {
    const value = candidate[field];
    if (typeof value !== "string" || value.trim().length < 2) return null;
    address[field] = value.trim().slice(0, 200);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address.email)) return null;
  if (!/^[0-9]{5,6}$/.test(address.pincode)) return null;
  return address;
}
