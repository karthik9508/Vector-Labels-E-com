import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "How Vector Labels quotes, produces and delivers custom clothing labels — pricing, proofs, lead times, payment and returns.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">
          Legal
        </span>
        <h1 className="text-3xl md:text-4xl font-bold font-serif mt-2 mb-3">
          Terms of service
        </h1>
        <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-8">
          Last updated {SITE.pricingReviewed}
        </p>

        <div className="space-y-8 text-sm text-gray-600 font-light leading-relaxed [&_h2]:text-luxury-charcoal [&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
          <p className="bg-luxury-slate border border-luxury-border rounded p-4 text-xs">
            These terms describe how we quote and manufacture custom label orders.
            They are a plain-language summary; a signed purchase order or contract
            takes precedence where one exists.
          </p>

          <section>
            <h2>1. Estimates and final pricing</h2>
            <p>
              Prices shown by the calculator, the design studio and the product
              pages are estimates based on our published rate card. They exclude GST
              and courier unless stated otherwise. The final price is confirmed in
              writing after we review your artwork and specifications.
            </p>
          </section>

          <section>
            <h2>2. Minimum order quantities</h2>
            <p>
              Each product has a minimum order quantity published on its product
              page and in the calculator. Quantities below MOQ may be accepted as a
              custom run, but are quoted separately by our sales team.
            </p>
          </section>

          <section>
            <h2>3. Proofs and approval</h2>
            <p>
              We send a digital proof before production. Production starts only once
              you approve that proof in writing (email or WhatsApp). Once approved,
              artwork, spelling, dimensions and colour references are your
              responsibility and cannot be changed without a new proof and revised
              pricing.
            </p>
          </section>

          <section>
            <h2>4. Lead times</h2>
            <p>
              Lead times are working days counted from proof approval and cleared
              payment, not from the date of inquiry. Courier transit time is
              additional. Delays caused by couriers, weather or statutory holidays
              are outside our control.
            </p>
          </section>

          <section>
            <h2>5. Colour and material variation</h2>
            <p>
              Thread and print colours may vary slightly between production batches
              and from what you see on screen. Natural materials such as organic
              cotton can show minor variation in shade and weave.
            </p>
          </section>

          <section>
            <h2>6. Payment</h2>
            <p>
              Online payment is collected through Razorpay (UPI, cards, net banking
              and wallets). Bank transfer is available for bulk orders. A GST
              invoice is issued for every order.
            </p>
          </section>

          <section>
            <h2>7. Cancellation, returns and defects</h2>
            <ul>
              <li>
                Because labels are manufactured to your own design, orders cannot be
                cancelled once a proof is approved and production has begun.
              </li>
              <li>
                If a delivered batch does not match the approved proof or has a
                manufacturing defect, tell us within 7 days of delivery with photos.
                We will re-produce or credit the affected pieces.
              </li>
              <li>We are not responsible for errors that were present in the approved proof.</li>
            </ul>
          </section>

          <section>
            <h2>8. Artwork and intellectual property</h2>
            <p>
              You confirm that you own or are licensed to use any logo or artwork you
              send us, and that producing it does not infringe anyone else&#8217;s
              rights. You keep ownership of your artwork; we use it only to produce
              your order. We may show finished labels as work samples unless you ask
              us in writing not to.
            </p>
          </section>

          <section>
            <h2>9. Liability</h2>
            <p>
              Our liability for any order is limited to the value of that order.
              We are not liable for lost profits or indirect losses.
            </p>
          </section>

          <section>
            <h2>10. Governing law</h2>
            <p>
              These terms are governed by Indian law, and the courts at Tirupur,
              Tamil Nadu have exclusive jurisdiction.
            </p>
          </section>

          <section>
            <h2>Questions</h2>
            <p>
              {SITE.legalName}, {SITE.street}, {SITE.city}, {SITE.region}{" "}
              {SITE.postalCode} · <a href={`mailto:${SITE.email}`} className="text-luxury-gold font-semibold hover:underline">{SITE.email}</a>{" "}
              · {SITE.phoneDisplay}. See also our{" "}
              <Link href="/privacy" className="text-luxury-gold font-semibold hover:underline">
                privacy policy
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
