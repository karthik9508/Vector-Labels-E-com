# Vector Labels — e-commerce site

Marketing site and order flow for **Vector Labels**, a clothing-label manufacturer in
Tirupur, India. Customers price a label batch, design it in the studio, and pay online
(or hand the order to the team on WhatsApp).

Built with Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS v4,
Supabase (auth + Postgres) and Razorpay.

---

## Quick start

```bash
npm install
cp .env.example .env      # then fill in real values
npm run dev               # http://localhost:3000
```

```bash
npm run build   # production build
npm run start   # serve the build
npm run lint    # eslint (Next 16 removed `next lint`)
npm run typecheck   # tsc --noEmit
npm run check:pricing  # asserts the rate card numbers (needs Node 22.6+)
npm run check:design   # asserts the label SVG never overflows
npm run preview:design > demo.html   # eyeball six rendered label designs
```

Node.js 20.9+ is required by Next.js 16.

---

## Environment variables

| Variable | Required | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | yes | Canonical URLs, sitemap, Open Graph |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | yes | Every `wa.me` link (digits only) |
| `NEXT_PUBLIC_SUPABASE_URL` | for accounts | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for accounts | Browser + RLS-bound server client |
| `SUPABASE_SERVICE_ROLE_KEY` | for orders | Server-only order writes and the public tracker |
| `PAYMENT_PUBLIC_KEY` | for payments | Razorpay key id |
| `PAYMENT_SECRET_KEY` | for payments | Razorpay key secret |
| `PAYMENT_WEBHOOK_SECRET` | for payments | Verifies the Razorpay webhook signature |
| `AI_API_KEY` | optional | Image generation for the AI studio (`sk-…`) |
| `AI_MODEL` | optional | Image model name |

Without Supabase the marketing pages, calculator and studio still work; checkout
reports that online payment is unavailable and offers WhatsApp instead. Nothing
fakes a successful order.

---

## Pricing lives in one place

`src/lib/pricing.ts` is the **single source of truth** for money. It encodes the
manufacturer's rate card:

- Labels priced by area (`ratePerSqMm × width × height`), one colour included,
  +10% per extra colour.
- Hang tags, heat-transfer labels and cards priced per piece by size/board stock.
- Quantity breaks (2,000 / 5,000 / 10,000 pcs) applied as documented multipliers.
- MOQ and lead time per product.

`quote()` is a pure function, so the browser estimate, the product-page rate table
and the server-side amount in `/api/payments/create-order` all produce the same
number. **Change a rate here — nowhere else.** `src/data/products.ts` pulls MOQ and
lead time from the same module.

Commercial content (descriptions, specs, images) lives in `src/data/products.ts`;
FAQ copy lives in `src/data/faqs.ts` so the visible answers and the `FAQPage`
structured data cannot drift apart.

---

## The design studio (`/ai-studio`)

The studio has two halves and they are deliberately coupled:

1. **Manual design** — `src/lib/label-design.ts` owns the design state
   (brand text, second line, ground colour, thread colour, typeface, border,
   alignment, and the uploaded artwork) and renders it to a self-contained SVG.
   This path needs no API key, works offline, and is what the customer can
   download as SVG or PNG.
2. **AI concept** — the prompt is pre-filled from the manual design
   (`designToPrompt`), and when the customer uploads artwork the request goes
   to `/v1/images/edits` with that artwork as the input image, so the concept
   is rendered *from* their design rather than a description of it. The AI
   image is reference artwork; the *manual* design is what goes into the cart
   and the order.

Uploads are decoded in the browser (`src/lib/logo-image.ts`) and downscaled to
a 360 px PNG before embedding, which keeps the SVG small and puts the file in a
format the image edit endpoint accepts. The artwork is placed either above the
brand text or as the whole label, and the text layout re-flows around it.

### Editing on the canvas

The preview is interactive (`src/components/LabelCanvas.tsx`). Drag the brand
text, the second line or the artwork to position it; drag the corner handle to
resize the artwork and the round handle to rotate it; double-click an element to
reset it. Elements snap to the label's centre lines, arrow keys nudge the
selected layer (Shift for bigger steps), and undo/redo (buttons or Ctrl/⌘+Z)
covers every canvas gesture.

Positions live in `LabelDesign.transforms` as millimetre offsets, so the same
numbers drive the live preview, the sliders in the toolbar and the exported
SVG/PNG. `computeLayout()` is the single source of geometry for all of them, and
`clampLayerOffset()` keeps elements inside the border — including after the
label size changes.

The SVG builder wraps the brand text into at most three lines and shrinks it
until every line fits the label — SVG `<text>` does not reflow, so this is the
one invariant that keeps the preview and the downloaded file from clipping.
`npm run check:design` guards it, along with XML escaping of user text.

When `AI_API_KEY` is not configured the API returns the product photograph and
sets `generated: false`; the UI then labels it a reference preview rather than
claiming it was AI generated.

---

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page: products, live customizer, calculator, process, FAQ |
| `/products/[slug]` | Product detail, rate table, specs, JSON-LD |
| `/ai-studio` | Concept generator with live pricing |
| `/cart`, `/checkout` | Cart and Razorpay checkout |
| `/track` | Production tracker (real orders by id) |
| `/auth/login`, `/auth/signup`, `/dashboard` | Customer account |
| `/admin` | Production dashboard (requires `profiles.role = 'admin'`) |
| `/privacy`, `/terms` | Policies |
| `/sitemap.xml`, `/robots.txt` | Generated by `src/app/sitemap.ts`, `src/app/robots.ts` |

API routes:

| Route | Purpose |
| --- | --- |
| `POST /api/payments/create-order` | Re-prices the cart server-side, creates the order + Razorpay order |
| `POST /api/payments/webhook` | Verified Razorpay webhook; marks the order paid |
| `GET /api/orders/[id]` | Public, read-only order snapshot for the tracker |
| `POST /api/ai/generate` | Concept generation (image model, or product photo fallback) |

---

## Database

The schema lives in `supabase/migrations/`.

1. `001_initial_schema.sql` — profiles, products, quotes, orders, order items,
   artwork proofs, AI concepts, and RLS policies.
2. `002_admin_access.sql` — creates a `profiles` row for every new sign-up,
   backfills existing accounts, and grants admins read access to all orders/proofs
   (the admin dashboard needs this).

Apply them with the Supabase CLI (`supabase db push`) or by pasting them into the
SQL editor, in order.

To make someone an admin:

```sql
update public.profiles set role = 'admin' where id = '<auth user id>';
```

---

## Security notes

- `.env` is **git-ignored**. If real keys were ever committed, rotate them in the
  Supabase and Razorpay dashboards — they stay in git history until rotated.
- The payment webhook verifies `x-razorpay-signature` with
  `PAYMENT_WEBHOOK_SECRET`; unsigned payloads are rejected.
- The amount charged is always recalculated on the server from line
  specifications, never taken from the browser.
- `SUPABASE_SERVICE_ROLE_KEY` is imported only by `src/lib/supabase/admin.ts`,
  which is server-only. Never import it into a Client Component.

---

## Repo hygiene

Legacy static-site files (`index.html`, `404.html`, `test-404.html`, `.htaccess`,
`public/images/css.css`, `public/images/script.js.download`) are unused by the
Next.js app and can be deleted once the old host is retired. The
`public/images/texture_*.png` fabric scans (~4.5 MB total) are not referenced by
any component — either use them in the customizer or delete them.
