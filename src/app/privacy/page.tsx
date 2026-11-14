import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What Vector Labels collects when you order custom clothing labels, why we collect it, and how to have it removed.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">
          Legal
        </span>
        <h1 className="text-3xl md:text-4xl font-bold font-serif mt-2 mb-3">
          Privacy policy
        </h1>
        <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-8">
          Last updated {SITE.pricingReviewed}
        </p>

        <div className="space-y-8 text-sm text-gray-600 font-light leading-relaxed [&_h2]:text-luxury-charcoal [&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
          <p className="bg-luxury-slate border border-luxury-border rounded p-4 text-xs">
            This is a plain-language summary of how this website handles your
            information, written to match exactly what the site does. For a formal
            data-processing agreement, contact us.
          </p>

          <section>
            <h2>What we collect</h2>
            <ul>
              <li>
                <strong>Order details</strong> — the name, email, phone number and
                delivery address you enter at checkout, plus the label
                specifications you configured.
              </li>
              <li>
                <strong>Inquiry details</strong> — whatever you type into the quote
                form or send to us on WhatsApp.
              </li>
              <li>
                <strong>Artwork</strong> — any logo or design file you upload in the
                AI Studio or send us for production.
              </li>
              <li>
                <strong>Account details</strong> — your email address if you create
                an account, so you can see your orders and proofs.
              </li>
              <li>
                <strong>Payment records</strong> — the amount, date and a payment
                reference. Card, UPI and bank details are entered on Razorpay&#8217;s
                secure page; we never see or store them.
              </li>
            </ul>
          </section>

          <section>
            <h2>What stays in your browser</h2>
            <p>
              The items in your cart, your last AI-generation count and your
              sign-in session are stored in your own browser (local storage and
              cookies). Your cart is not sent to us until you start checkout. You
              can clear it with the &#8220;Empty cart&#8221; button or by clearing
              site data.
            </p>
          </section>

          <section>
            <h2>Why we use it</h2>
            <ul>
              <li>To quote, produce, invoice and ship your order.</li>
              <li>To send artwork proofs for your approval before production.</li>
              <li>To answer questions and provide support.</li>
              <li>To keep legally required business and tax records.</li>
            </ul>
            <p className="mt-2">We do not sell your data or rent it to advertisers.</p>
          </section>

          <section>
            <h2>Who we share it with</h2>
            <ul>
              <li><strong>Razorpay</strong> — to process your payment.</li>
              <li><strong>Courier partners</strong> — name, address and phone, to deliver your order.</li>
              <li><strong>Our hosting and database providers</strong> — who store the site and order records on our behalf.</li>
            </ul>
          </section>

          <section>
            <h2>How long we keep it</h2>
            <p>
              Order and invoice records are kept for the period required by Indian
              tax law. Artwork files are kept while the design is in production and
              for as long as needed to repeat an order. Ask us to delete anything
              else and we will, unless we are required to keep it.
            </p>
          </section>

          <section>
            <h2>Your choices</h2>
            <p>
              Write to{" "}
              <a href={`mailto:${SITE.email}`} className="text-luxury-gold font-semibold hover:underline">
                {SITE.email}
              </a>{" "}
              or message {SITE.phoneDisplay} to ask for a copy of your data, a
              correction, or deletion. We will confirm within a reasonable time.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              {SITE.legalName}, {SITE.street}, {SITE.city}, {SITE.region}{" "}
              {SITE.postalCode}, India · {SITE.email} · {SITE.phoneDisplay}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
