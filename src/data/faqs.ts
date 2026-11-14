/**
 * Shared FAQ content — used by the accordion on the home page and by the
 * FAQPage structured data. Keeping it in one place means the visible answer
 * and the answer search engines read can never disagree.
 */

export interface Faq {
  question: string;
  answer: string;
}

export const FAQS: Faq[] = [
  {
    question: "What is the minimum order quantity (MOQ) for custom labels?",
    answer:
      "Woven, cotton, satin and taffeta labels start at 2,000 pieces per design. Heat transfer labels and woven patches start at 500 pieces, hang tags at 1,000 pieces, and thank-you cards at 200 pieces. Smaller trial runs can be quoted as a custom job — ask our team on WhatsApp.",
  },
  {
    question: "Where are the labels manufactured and how long does production take?",
    answer:
      "Every label, hang tag and card is manufactured in Tirupur, Tamil Nadu — India's knitwear capital. Labels are typically woven or printed in 2–5 working days after proof approval, patches take 9–12 days, and dispatch is by express courier across India and worldwide.",
  },
  {
    question: "How is the price of a label calculated?",
    answer:
      "Labels are priced by area: width × height in millimetres multiplied by the material rate (for example ₹0.0010 per mm² for woven labels). One colour is included and each additional colour adds 10%. Larger quantities move into lower bulk rates automatically. Hang tags, heat transfer labels and cards are priced per piece by size and board stock instead.",
  },
  {
    question: "Will I see a proof before production starts?",
    answer:
      "Yes. After you confirm the specification, our technicians send a digital proof showing thread density, fold lines and colour references. Production only begins once you approve that proof.",
  },
  {
    question: "What artwork file formats do you accept?",
    answer:
      "Vector files are best: AI, EPS, PDF or CDR. We also accept high-resolution PNG or SVG. If you only have a sketch or a brand name, our design team can vectorise it for the weaving machinery at no extra charge.",
  },
  {
    question: "Which payment methods do you accept?",
    answer:
      "Online orders are paid securely through Razorpay — UPI, debit and credit cards, net banking and wallets. Bank transfer is available for bulk orders. A GST invoice is issued for every order.",
  },
  {
    question: "Can I order a size that is not listed?",
    answer:
      "Yes. The sizes in our rate card (10×60, 15×60, 20×60, 30×60 and 30×75 mm) are the most common, but we cut and weave to any custom dimension. Use the calculator for an instant estimate on your size, then confirm the exact specification with the team.",
  },
  {
    question: "Do you offer an organic or sustainable option?",
    answer:
      "Yes — our cotton labels are made from organic cotton and herringbone twill tape that is soft, biodegradable and a natural fit for sustainable collections. Tell us your certification requirements and we will confirm the matching material before production.",
  },
];
