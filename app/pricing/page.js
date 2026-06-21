export const metadata = {
  title: "Pricing | Prudent Valuations",
  description:
    "Transparent starting prices for property, gold, and vehicle valuation reports. Final pricing depends on asset type, location, and the purpose of the report.",
  alternates: { canonical: "/pricing" },
};

// NOTE: Property & Gold use the firm's published starting prices.
// Adjust any figure here — it's the single source of truth for the page.
const PACKAGES = [
  {
    name: "Property Valuation",
    price: "Rs. 5,000",
    unit: "starting from",
    popular: true,
    features: [
      "Residential, commercial & plot property",
      "Market-based fair-value assessment",
      "Report suitable for banks, courts & authorities",
    ],
  },
  {
    name: "Gold & Jewellery Valuation",
    price: "Rs. 6,000",
    unit: "starting from",
    popular: false,
    features: [
      "Assessment by purity and weight",
      "Valued at current market rates",
      "Clear, itemised written report",
    ],
  },
  {
    name: "Vehicle Valuation",
    price: "Rs. 5,000",
    unit: "starting from",
    popular: false,
    features: [
      "Cars and other vehicles",
      "Fair-market value assessment",
      "Documentation-ready report",
    ],
  },
];

const STEPS = [
  {
    title: "We review your requirement",
    body: "We confirm the purpose of the valuation — financial, legal, audit, or documentation — so the report is fit for purpose.",
  },
  {
    title: "We confirm the documents",
    body: "We tell you exactly which documents and details are needed, with no guesswork or back-and-forth.",
  },
  {
    title: "You receive a clear fee & timeline",
    body: "Before any work begins, you get a transparent quote and a realistic delivery date.",
  },
  {
    title: "We prepare and deliver the report",
    body: "Your valuation is prepared to recognised standards and delivered ready for official use.",
  },
];

const FAQ = [
  {
    q: "What determines the final valuation price?",
    a: "Pricing reflects the type of asset, its location, the documentation involved, and the purpose of the valuation.",
  },
  {
    q: "Are valuation reports accepted by authorities?",
    a: "Yes. Reports are prepared using market evidence and recognised valuation standards, making them suitable for official use.",
  },
  {
    q: "How quickly is a report delivered?",
    a: "Most reports are completed within one working day. Complex or back-dated cases may take a little longer.",
  },
];

export default function PricingPage() {
  return (
    <main id="main">
      <section className="page-hero">
        <div className="hero-aurora" aria-hidden="true"></div>
        <div className="container page-hero-inner">
          <p className="eyebrow">Pricing</p>
          <h1>Transparent Valuation Pricing</h1>
          <p className="page-hero-sub">
            Choose the valuation that fits your purpose. Every report follows market evidence and
            recognised standards — the prices below are starting points for our most requested services.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <ul className="cards price-cards" role="list">
            {PACKAGES.map((pkg) => (
              <li className={`card price-card${pkg.popular ? " is-popular" : ""}`} key={pkg.name}>
                {pkg.popular && <span className="price-badge">Most Popular</span>}
                <h3>{pkg.name}</h3>
                <p className="price-amount">
                  <span className="price-unit">{pkg.unit}</span>
                  <span className="price-value">{pkg.price}</span>
                </p>
                <ul className="feature-list">
                  {pkg.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <a
                  className={`btn ${pkg.popular ? "btn-primary" : "btn-ghost"} price-cta`}
                  href="mailto:support@prudentvaluations.com"
                >
                  Request This Valuation
                </a>
              </li>
            ))}
          </ul>

          <p className="price-note">
            Prices shown are starting points. Final pricing depends on the asset type, location,
            documentation, and the purpose of the report. <a href="mailto:support@prudentvaluations.com">Contact us</a> for an exact quote.
          </p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <header className="section-head">
            <p className="eyebrow">What to Expect</p>
            <h2>What happens after you reach out</h2>
            <p className="section-lead">
              A clear, no-pressure process — you know the documents, the fee, and the timeline before any
              work starts.
            </p>
          </header>
          <ol className="steps" role="list">
            {STEPS.map((step, i) => (
              <li className="step" key={step.title}>
                <span className="step-num">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container faq-wrap">
          <header className="section-head">
            <p className="eyebrow">Pricing FAQ</p>
            <h2>Good to know</h2>
          </header>
          <ul className="faq-list" role="list">
            {FAQ.map((item) => (
              <li className="faq-item" key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-contact">
        <div className="container contact-inner">
          <p className="eyebrow eyebrow-light">Need Help Choosing?</p>
          <h2>Tell us what you need valued</h2>
          <p className="contact-lead">
            Share your asset details and the purpose of the report, and we&apos;ll recommend the right
            option and a precise quote.
          </p>
          <a className="btn btn-primary btn-lg" href="mailto:support@prudentvaluations.com">
            support@prudentvaluations.com
          </a>
        </div>
      </section>
    </main>
  );
}
