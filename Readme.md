# AI-Powered Custom Clothing Label Platform

A Next.js platform for customers to configure custom clothing labels,
explore AI-assisted design concepts, request pricing, place orders,
approve artwork proofs, pay securely, and track production.

> **Project status:** Planning / development starter. The features below
> describe the target scope; AI generation, payments, shipping, and
> production tracking must be implemented and configured before they are
> live.

## Contents

-   [Project goals](#project-goals)
-   [Planned features](#planned-features)
-   [Technology stack](#technology-stack)
-   [Getting started](#getting-started)
-   [Supabase setup](#supabase-setup)
-   [Environment variables](#environment-variables)
-   [Suggested project structure](#suggested-project-structure)
-   [Database design](#database-design)
-   [Core customer workflow](#core-customer-workflow)
-   [Development roadmap](#development-roadmap)
-   [Security considerations](#security-considerations)
-   [Deployment](#deployment)
-   [Implementation checklist](#implementation-checklist)

## Project goals

Upgrade an existing HTML, CSS, and JavaScript clothing-label business
website into a responsive online ordering platform. Preserve the current
brand identity and useful content where possible while migrating the
interface to Next.js and adding the backend capabilities needed for
online orders.

The platform should support customers in India and international
markets. Currency, taxes, shipping, payment methods, and delivery rules
should be configurable for the markets actually served.

## Planned features

### Product catalogue and customization

Support products such as:

-   Woven labels
-   Printed labels
-   Care and composition labels
-   Size labels
-   Satin or cotton labels
-   Hang tags and related branding products

Depending on the product, customers may configure dimensions, material,
colors, fold type, print/weave method, quantity, and other manufacturing
options. Define supported choices according to actual production
capabilities.

### AI-assisted design studio

-   Generate design concepts from a text prompt.
-   Upload a logo or reference artwork.
-   Revise concepts and save versions.
-   Preview a design in a product mockup.
-   Attach selected designs to quotes and orders.

**Manufacturing safeguard:** An AI-generated preview is not
automatically production-ready. Validate text, dimensions, colors,
material constraints, and required file formats. Require explicit
approval of the final artwork proof before manufacturing.

### Quotes, cart, and checkout

-   Calculate indicative pricing from server-side pricing rules.
-   Support manual quote requests for complex products.
-   Add configured products to a cart.
-   Capture billing and shipping information.
-   Apply shipping, taxes, and discounts where supported.
-   Create orders and display order status.

Never trust prices or totals sent by the browser. Recalculate them on
the server before creating an order or payment.

### Customer accounts and tracking

-   Sign up and sign in with Supabase Auth.
-   View saved designs and order history.
-   Review and approve artwork proofs.
-   Follow production and shipment status.

### Admin and production management

Authorized staff should manage products, specifications, pricing,
quotes, orders, proof approvals, payment status, production stages, and
shipment information. Protect admin functions with server-side
authorization and appropriate database policies.

## Technology stack

  -----------------------------------------------------------------------
  Area                                Recommended technology
  ----------------------------------- -----------------------------------
  Frontend and routing                Next.js App Router

  Language                            TypeScript

  Styling                             Tailwind CSS

  Database                            Supabase PostgreSQL

  Authentication                      Supabase Auth

  File storage                        Supabase Storage

  Database access                     `@supabase/supabase-js` and
                                      `@supabase/ssr`

  Backend operations                  Next.js Server Actions and Route
                                      Handlers

  AI concepts                         OpenAI API called from server-side
                                      code

  Payments                            A gateway supported for the
                                      business's registered country and
                                      target markets

  Deployment                          Next.js-compatible hosting platform
  -----------------------------------------------------------------------

**ORM note:** Prisma is optional. This project can use Supabase's client
libraries and SQL migrations directly, without Prisma. Choose one
primary database access pattern and document it consistently.

## Getting started

### Prerequisites

-   A supported Node.js LTS version
-   npm or another package manager
-   Git
-   A Supabase project
-   Provider credentials only for integrations currently being developed

### 1. Create or open the Next.js application

If the project has not been created yet:

``` bash
npx create-next-app@latest clothing-label-platform
cd clothing-label-platform
```

Choose TypeScript and App Router. Tailwind CSS is recommended. If you
already have a repository, continue with that repository instead of
creating a second application.

### 2. Install Supabase packages

``` bash
npm install @supabase/supabase-js @supabase/ssr
```

Use the official Supabase Next.js SSR guidance when configuring browser
and server clients. Keep server-only credentials in server-side modules.

### 3. Create a Supabase project

1.  Create a project in the Supabase dashboard.
2.  Choose a secure database password and keep it private.
3.  Copy the project's Project URL and publishable key from the API
    settings.
4.  Configure local environment variables as described below.
5.  Create tables and policies using reviewed SQL migrations.
6.  Create private storage buckets for customer uploads and production
    artwork as appropriate.

### 4. Run the app locally

``` bash
npm run dev
```

Open <http://localhost:3000>.

These steps configure the application foundation; they do not implement
all ordering, AI, payment, or production features by themselves.

## Supabase setup

### Environment variables

Create a local `.env.local` file in the project root. A safe starter
template is:

``` dotenv
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_PUBLISHABLE_KEY"

# Add only when you implement the relevant integration:
OPENAI_API_KEY=""
PAYMENT_SECRET_KEY=""
PAYMENT_WEBHOOK_SECRET=""
```

The Supabase URL and publishable key are designed to be used in the
client when Row Level Security (RLS) is correctly configured. **Never
expose a Supabase secret/service-role key in a `NEXT_PUBLIC_` variable
or in client-side code.** If a server-only secret key is required for a
trusted administrative operation, store it in a server-only environment
variable and restrict its use carefully.

Do not commit `.env.local` or real credentials to Git. Commit a
`.env.example` containing placeholder values only.

### Database schema and migrations

Use Supabase SQL migrations to define tables, constraints, indexes,
triggers, and RLS policies. You can create and test SQL in the Supabase
SQL Editor for early development, but keep repeatable schema changes in
version-controlled migrations as the project matures.

Suggested tables:

-   `profiles` --- user profile and application-specific role
    information associated with the authenticated user.
-   `products` --- product types, descriptions, active status, and
    catalogue details.
-   `product_specifications` --- supported materials, dimensions, folds,
    colors, and configuration rules.
-   `designs` --- owner, prompt, design metadata, and current version.
-   `design_versions` --- history of design revisions and generated
    asset references.
-   `quotes` --- configured product, price breakdown, validity, and
    status.
-   `orders` --- customer, currency, totals, address snapshot, and
    workflow status.
-   `order_items` --- product configuration and price snapshot at
    purchase time.
-   `payments` --- payment provider reference, amount, currency, and
    verified status.
-   `artwork_approvals` --- proof version, reviewer, decision, and
    timestamp.
-   `shipments` --- carrier, tracking reference, and delivery status.

Use foreign keys, check constraints, unique constraints, and indexes
where appropriate. Save a snapshot of the product configuration and
price in each order item so later catalogue changes do not alter
historical orders.

### Row Level Security (RLS)

Enable RLS on tables exposed through the Supabase Data API. Write and
test policies before allowing application access.

Typical policy intentions:

-   Customers can read and update only their own permitted profile
    fields.
-   Customers can access only their own designs, quotes, and orders.
-   Customers cannot grant themselves an admin role or set their own
    order/payment status.
-   Public visitors can read only published product information.
-   Admin operations require a trusted server-side role check.
-   Payment status is updated only through a verified server-side
    payment workflow.

These are policy goals, not ready-made SQL policies. Implement policies
based on your exact schema and threat model; do not assume that hiding a
UI control provides security.

### Supabase Storage

Suggested buckets and access patterns:

-   `design-uploads` --- private customer logos and reference artwork.
-   `design-previews` --- generated previews, private unless
    deliberately published.
-   `production-artwork` --- private approved artwork and production
    files.

Use private buckets by default, storage policies tied to the
authenticated user or order permissions, upload size/type validation,
and signed URLs where appropriate. Do not make production files public
just to simplify previews.

## Suggested project structure

Adapt this structure to the actual app and installed Next.js version.

``` text
clothing-label-platform/
├── public/
│   ├── images/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── products/
│   │   │   └── [slug]/page.tsx
│   │   ├── design-studio/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── account/page.tsx
│   │   ├── orders/
│   │   │   └── [id]/page.tsx
│   │   ├── admin/page.tsx
│   │   └── api/
│   │       ├── designs/route.ts
│   │       ├── quotes/route.ts
│   │       ├── orders/route.ts
│   │       ├── ai/generate/route.ts
│   │       └── payments/webhook/route.ts
│   ├── components/
│   │   ├── layout/
│   │   ├── products/
│   │   ├── design-studio/
│   │   ├── checkout/
│   │   └── ui/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── auth.ts
│   │   ├── pricing.ts
│   │   ├── ai.ts
│   │   └── payments/
│   ├── types/
│   └── styles/
├── supabase/
│   ├── migrations/
│   └── config.toml
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

Do not create every route or folder at once. Add features incrementally
and keep privileged database operations and API secrets out of client
components.

## Core customer workflow

1.  Browse the catalogue and select a product.
2.  Configure supported material, size, colors, fold, quantity, and
    options.
3.  Upload artwork or generate an AI-assisted concept.
4.  Review the mockup and request a quote or add the configured item to
    the cart.
5.  Confirm the price, delivery details, and checkout information.
6.  Complete payment through the selected gateway.
7.  Review and approve the final artwork proof according to the
    business's production policy.
8.  Follow production and shipment status from the account area.

Decide whether payment happens before or after quote/proof approval and
implement that sequence consistently.

## Development roadmap

### Phase 1 --- Migrate the existing website

-   Inventory current HTML, CSS, JavaScript, images, fonts, and page
    content.
-   Set up Next.js and TypeScript.
-   Migrate the shared navigation, footer, homepage, and product pages.
-   Preserve branding and improve mobile responsiveness.
-   Deploy a staging version and compare it with the current site.

### Phase 2 --- Supabase and ordering foundation

-   Configure Supabase Auth and SSR-compatible clients.
-   Create version-controlled SQL migrations, tables, indexes, and RLS
    policies.
-   Add product catalogue and specification rules.
-   Implement server-side pricing, quote requests, cart, and order
    creation.
-   Add customer account and order history pages.

### Phase 3 --- AI design studio

-   Add private artwork uploads and server-side AI concept generation.
-   Build previews, revisions, and saved-design flows.
-   Track AI usage, rate limits, and provider failures.
-   Define the process for converting concepts into approved production
    artwork.

### Phase 4 --- Payments and production workflow

-   Integrate a suitable payment gateway.
-   Verify webhook signatures and make webhook handling safe to retry.
-   Add artwork proof approval and protected admin tools.
-   Add production stages and shipment updates.
-   Test failed payments, refunds, cancelled orders, and manual quote
    scenarios.

### Phase 5 --- Launch readiness

-   Test mobile and desktop layouts.
-   Review accessibility, performance, authorization, and RLS policies.
-   Configure monitoring, backups, and operational support.
-   Test end-to-end orders before launch.
-   Publish appropriate terms, privacy information, shipping policy, and
    refund/cancellation policy.

## Security considerations

-   Keep AI, payment, and any privileged Supabase credentials
    server-side.
-   Never expose a Supabase service-role/secret key to browser code.
-   Enable and test RLS for all relevant tables and storage buckets.
-   Validate inputs and authorization on the server; do not trust
    browser-supplied prices, roles, order status, or payment status.
-   Restrict uploads by file type and size; consider malware scanning.
-   Use private storage for customer and production files.
-   Verify payment webhooks and make processing idempotent.
-   Apply rate limits and abuse controls to AI generation and uploads.
-   Record sensitive order and admin actions in an audit trail.
-   Require approval of final production artwork before manufacturing.
-   Configure backups and test restoration.
-   Establish data retention, consent, and deletion practices for
    customer data and uploaded artwork.

## Deployment

A typical deployment includes:

1.  A Git repository for the Next.js application and SQL migrations.
2.  A Next.js-compatible hosting platform.
3.  A Supabase project with production database, Auth, RLS, and Storage
    configuration.
4.  Production environment variables configured in the hosting platform.
5.  AI/payment provider credentials and correctly configured webhook
    URLs.
6.  Reviewed migrations applied through a controlled release process.
7.  Monitoring, backups, and a separate staging environment.

Use separate development, staging, and production credentials. Confirm
payment gateway eligibility, supported currencies, taxes, shipping
coverage, and legal requirements for the business's operating locations.

## Contributing

1.  Create a feature branch.
2.  Keep changes focused and use TypeScript types.
3.  Validate data at system boundaries.
4.  Add tests for pricing, order transitions, RLS/authorization, and
    payment webhook handling.
5.  Run linting, type checks, and tests before merging.
6.  Never commit `.env.local`, API keys, customer artwork, or production
    data.

## Implementation checklist

Update this list as work is completed.

-   [ ] Existing website reviewed and assets inventoried
-   [ ] Next.js app configured
-   [ ] Homepage and shared layout migrated
-   [ ] Supabase project and SSR clients configured
-   [ ] Database migrations, tables, and RLS policies implemented
-   [ ] Supabase Auth and role-based authorization implemented
-   [ ] Product catalogue and specification rules implemented
-   [ ] Quote, cart, and checkout flows implemented
-   [ ] AI design studio and private uploads implemented
-   [ ] Payment integration and verified webhooks implemented
-   [ ] Artwork proof approval implemented
-   [ ] Admin and production tracking implemented
-   [ ] Tests, monitoring, backups, and launch review completed
