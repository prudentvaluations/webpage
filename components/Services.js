const SERVICES = [
  {
    icon: "\u{1F3E0}",
    title: "Property Valuation",
    body: "Accurate, market-based valuations of residential, commercial, and plot property for personal, financial, and legal needs.",
  },
  {
    icon: "\u{1F48D}",
    title: "Gold Valuation",
    body: "Gold and jewellery assessed by purity, weight, and current market rates, with a clear written report.",
  },
  {
    icon: "\u{1F697}",
    title: "Vehicle Valuation",
    body: "Fair-market valuations for cars and other vehicles, suitable for documentation and financial purposes.",
  },
  {
    icon: "\u{1F4E6}",
    title: "Movable Asset Valuation",
    body: "Valuation of equipment, machinery, stock, and other movable assets for reporting and decision-making.",
  },
  {
    icon: "\u{1F3E2}",
    title: "Immovable Asset Valuation",
    body: "Assessment of land, buildings, and fixed assets prepared to recognised valuation standards.",
  },
  {
    icon: "\u{1F4CB}",
    title: "General Asset Valuation Reports",
    body: "Comprehensive net-worth and general asset reports for financial, legal, and documentation requirements.",
  },
];

export default function Services() {
  return (
    <section className="section" id="services" aria-labelledby="services-title">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow">What We Do</p>
          <h2 id="services-title">Valuation Services</h2>
          <p className="section-lead">
            Comprehensive valuation reports prepared to recognised standards for personal, business,
            financial, and legal purposes.
          </p>
        </header>

        <ul className="cards" role="list">
          {SERVICES.map((service) => (
            <li key={service.title}>
              <a className="card card-link" href="/services">
                <span className="card-icon" aria-hidden="true">
                  {service.icon}
                </span>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
                <span className="card-more">Learn more &rarr;</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="section-cta">
          <a className="btn btn-primary" href="/services">
            View All Services
          </a>
        </div>
      </div>
    </section>
  );
}
