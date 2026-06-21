export const metadata = {
  title: "Services | Prudent Valuations",
  description:
    "Professional valuation services in Pakistan — property, gold, vehicle, movable, immovable, and general asset valuation reports prepared to recognised standards.",
  alternates: { canonical: "/services" },
};

const SERVICES = [
  {
    icon: "\u{1F3E0}",
    title: "Property Valuation",
    overview:
      "Independent, market-based valuations of residential, commercial, and plot property, prepared to a standard that embassies, banks, courts, and authorities accept.",
    covers: [
      "Houses, apartments & commercial units",
      "Open plots and agricultural land",
      "Fair-market value with supporting evidence",
    ],
    usedFor: "Visa & immigration, bank finance, court & tax, buying & selling",
  },
  {
    icon: "\u{1F48D}",
    title: "Gold & Jewellery Valuation",
    overview:
      "Certified assessment of gold and jewellery based on purity, net weight, and prevailing market rates, presented in a clear, itemised written report.",
    covers: [
      "Purity testing and net-weight assessment",
      "Item-by-item jewellery evaluation",
      "Valued at current market rates",
    ],
    usedFor: "Visa & immigration, asset declarations, inheritance, insurance",
  },
  {
    icon: "\u{1F697}",
    title: "Vehicle Valuation",
    overview:
      "Fair-market valuations for cars and other vehicles, assessed on condition and market data and suitable for visa, financial, and legal documentation.",
    covers: [
      "Cars and commercial vehicles",
      "Condition and market-based assessment",
      "Documentation-ready report",
    ],
    usedFor: "Visa & immigration, bank finance, insurance, legal & tax",
  },
  {
    icon: "\u{1F4E6}",
    title: "Movable Asset Valuation",
    overview:
      "Valuation of plant, machinery, equipment, and stock — the movable assets that strengthen a net-worth statement or business report.",
    covers: [
      "Plant, machinery & equipment",
      "Inventory and stock-in-trade",
      "Replacement and fair-market basis",
    ],
    usedFor: "Visa net-worth files, audits, financing, insurance",
  },
  {
    icon: "\u{1F3E2}",
    title: "Immovable Asset Valuation",
    overview:
      "Assessment of land, buildings, and fixed assets, prepared to recognised valuation standards with clear, defensible reasoning.",
    covers: [
      "Land and built structures",
      "Fixed installations and improvements",
      "Standards-based fair value",
    ],
    usedFor: "Visa & immigration, financial statements, legal, asset verification",
  },
  {
    icon: "\u{1F4CB}",
    title: "General Asset & Net-Worth Reports",
    overview:
      "Comprehensive net-worth statements that bring all your holdings into one credible document — the asset proof most visa and immigration files require.",
    covers: [
      "Consolidated assets and liabilities",
      "Net-worth statements",
      "Tailored to your specific requirement",
    ],
    usedFor: "Visa & immigration, financial documentation, legal use",
  },
];

export default function ServicesPage() {
  return (
    <main id="main">
      <section className="page-hero">
        <div className="hero-aurora" aria-hidden="true"></div>
        <div className="container page-hero-inner">
          <p className="eyebrow">Our Services</p>
          <h1>Valuation Services for Every Asset</h1>
          <p className="page-hero-sub">
            From property and gold to vehicles and business assets, every report is built on real market
            evidence and recognised methods — widely used for visa and immigration applications, as well
            as financial, legal, and audit requirements.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="visa-callout">
            <span className="visa-callout__icon" aria-hidden="true">&#128737;</span>
            <div className="visa-callout__text">
              <strong>Trusted for visa &amp; immigration</strong>
              <p>
                Our valuation reports provide the verified asset proof that embassies and consulates
                require — prepared in clear, accepted formats that help applications move forward without
                objections.
              </p>
            </div>
          </div>

          <ul className="cards service-cards" role="list">
            {SERVICES.map((service) => (
              <li className="card service-card" key={service.title}>
                <span className="card-icon" aria-hidden="true">
                  {service.icon}
                </span>
                <h2 className="service-title">{service.title}</h2>
                <p className="service-overview">{service.overview}</p>

                <p className="service-covers-label">What it covers</p>
                <ul className="feature-list">
                  {service.covers.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>

                <p className="service-usedfor">
                  <span className="service-usedfor__label">Commonly used for</span>
                  {service.usedFor}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container cta-split">
          <div className="cta-split__text">
            <p className="eyebrow">Transparent Pricing</p>
            <h2>Know the cost before you commit</h2>
            <p className="section-lead">
              See starting prices for our most requested valuations, and exactly what happens after you
              reach out.
            </p>
          </div>
          <a className="btn btn-ghost btn-lg" href="/pricing">
            View Pricing
          </a>
        </div>
      </section>

      <section className="section section-contact">
        <div className="container contact-inner">
          <p className="eyebrow eyebrow-light">Get in Touch</p>
          <h2>Request a valuation</h2>
          <p className="contact-lead">
            Tell us about your asset and the purpose of the report, and we&apos;ll confirm the documents,
            fee, and timeline.
          </p>
          <a className="btn btn-primary btn-lg" href="mailto:support@prudentvaluations.com">
            support@prudentvaluations.com
          </a>
        </div>
      </section>
    </main>
  );
}
