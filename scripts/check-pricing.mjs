/**
 * Pricing regression checks.
 *
 * Run with: npm run check:pricing   (requires Node 22.6+ for type stripping)
 *
 * These assertions pin the numbers in the manufacturer's rate card, so a
 * stray edit to `src/lib/pricing.ts` is caught before it reaches the
 * calculator, the product pages or the payment route.
 */
import { formatINR, formatRatePerSqMm, priceRows, quote } from "../src/lib/pricing.ts";

let failures = 0;

function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}  ->  ${JSON.stringify(actual)}${
      ok ? "" : `  (expected ${JSON.stringify(expected)})`
    }`
  );
}

// Woven, 20x60mm, 1 colour, MOQ 2000 -> 1200mm2 * 0.0010 * 0.88 bulk
const w1 = quote({ slug: "woven-labels", quantity: 2000, widthMm: 20, heightMm: 60, colors: 1 });
check("woven unit", w1.unitPrice, 1.06);
check("woven total", w1.total, 2120);
check("woven bulk saving", w1.bulkSaving, 280);
check("woven meets MOQ", w1.meetsMoq, true);
check("woven lead time", w1.leadTime, "3–5 days");

// Each extra colour adds 10% of the base rate
const w2 = quote({ slug: "woven-labels", quantity: 2000, widthMm: 20, heightMm: 60, colors: 2 });
check("woven 2-colour unit", w2.unitPrice, 1.16);
check("woven 2-colour total", w2.total, 2320);

// Quantity break
const w3 = quote({ slug: "woven-labels", quantity: 10000, widthMm: 20, heightMm: 60, colors: 1 });
check("woven 10k unit", w3.unitPrice, 0.78);
check("woven 10k total", w3.total, 7800);

// Cotton is 0.00075 per mm2 (the old site charged 0.0018 — a 2.4x overquote)
const c1 = quote({ slug: "cotton-labels", quantity: 2000, widthMm: 20, heightMm: 60, colors: 1 });
check("cotton unit", c1.unitPrice, 0.79);

// Below MOQ still quotes, and flags it
const s1 = quote({ slug: "satin-labels", quantity: 1000, widthMm: 10, heightMm: 60, colors: 1 });
check("satin below-MOQ unit", s1.unitPrice, 0.3);
check("satin below-MOQ flag", s1.meetsMoq, false);

// Piece-priced products ignore area and use the variant rate
const h1 = quote({ slug: "hang-tags", quantity: 1000, variantId: "300-50x90-straight" });
check("hang tag unit", h1.unitPrice, 1.4);
check("hang tag total", h1.total, 1400);

const h2 = quote({
  slug: "hang-tags",
  quantity: 1000,
  variantId: "300-50x90-straight",
  addOnIds: ["string-lamination"],
});
check("hang tag + string unit", h2.unitPrice, 1.6);
check("hang tag add-on count", h2.addOns.length, 1);

const t1 = quote({ slug: "heat-transfer", quantity: 500, variantId: "50x60" });
check("heat transfer unit", t1.unitPrice, 2);
check("heat transfer total", t1.total, 1000);

const g1 = quote({ slug: "thanks-cards", quantity: 200, variantId: "300-100x75" });
check("thanks card total", g1.total, 850);

// Unknown slug falls back instead of throwing (never NaN)
const unknown = quote({ slug: "does-not-exist", quantity: 2000, widthMm: 20, heightMm: 60 });
check("unknown slug total is finite", Number.isFinite(unknown.total), true);

// Guard rails
const zero = quote({ slug: "woven-labels", quantity: 0 });
check("zero qty total", zero.total, 0);
check("zero qty clamps width", zero.widthMm >= 5, true);

// Formatting
check("format 2dp", formatINR(1.056), "₹1.06");
check("format 0dp", formatINR(2120, 0), "₹2,120");
check("format 5dp rate", formatRatePerSqMm(0.00075), "₹0.00075 / mm²");

// Product-page rate tables
const rows = priceRows("woven-labels", { quantity: 2000 });
check("woven row count", rows.length, 5);
check("woven first row", [rows[0].label, rows[0].unitPrice], ["10 × 60 mm", 0.53]);
const tagRows = priceRows("hang-tags", { quantity: 1000 });
check("hang tag rows", tagRows.length, 8);

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
