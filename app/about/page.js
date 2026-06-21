export const metadata = {
  title: "About | Prudent Valuations",
  description:
    "Prudent Valuations is a professional valuation firm producing clear, credible, market-based reports for property, gold, vehicles, and movable & immovable assets.",
  alternates: { canonical: "/about" },
};

const TRUST = [
  "Market-based, fair-value methodology",
  "Recognised and defensible valuation methods",
  "Clear documentation and transparent reasoning",
  "Formats suited to banks, courts, and tax authorities",
];

const USE_CASES = [
  "An embassy or consulate has requested a certified valuation",
  "A court or lawyer requires a valuation report",
  "FBR or auditors have raised questions on asset value",
  "A bank needs a fair-market value assessment",
  "Inheritance or a family settlement must be documented",
  "An asset's value needs to be recorded correctly",
];

const VALUES = [
  {
    title: "Accuracy over assumptions",
    body: "Every figure is grounded in real market evidence and verified documentation, never rough guesswork.",
  },
  {
    title: "Clarity in every report",
    body: "We present value in a way that is easy to understand and difficult to dispute, so reviews move quickly.",
  },
  {
    title: "Compliance you can rely on",
    body: "Our reports follow recognised valuation standards, making them suitable for official and institutional use.",
  },
];

export default function AboutPage() {
  return (
    <main id="main">
      <section className="page-hero">
        <div className="hero-aurora" aria-hidden="true"></div>
        <div className="container page-hero-inner">
          <p className="eyebrow">About Us</p>
          <h1>Clear, Credible, Market-Based Valuations</h1>
          <p className="page-hero-sub">
            Prudent Valuations is a professional valuation firm dedicated to producing precise,
            well-documented reports for property, gold, vehicles, and a broad range of movable and
            immovable assets.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <div className="prose">
            <h2>Who we are</h2>
            <p>
              We help individuals and businesses establish the fair value of their assets for financial,
              legal, and documentation purposes. Every report we prepare is grounded in genuine market
              evidence and recognised valuation methods, presented with the clarity that
              institutions, auditors, and authorities expect.
            </p>
            <p>
              Our purpose is straightforward: to make value easy to understand and difficult to dispute.
              Whether a report supports a financial decision, a legal matter, or formal documentation, it
              should strengthen your case rather than complicate it.
            </p>
            <p className="prose-note">
              Prudent Valuations operates under <strong>The Experts &ndash; A House of Prudent (Pvt.)
              Ltd.</strong>, a registered private limited company in Pakistan. This gives our reports
              the standing that banks, courts, and authorities expect.
            </p>
          </div>

          <aside className="trust-card" aria-label="Why clients trust our reports">
            <h3>Why clients trust our reports</h3>
            <ul className="feature-list">
              {TRUST.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <header className="section-head">
            <p className="eyebrow">Our Approach</p>
            <h2>Built on evidence, prepared with care</h2>
            <p className="section-lead">
              A valuation is only as strong as the reasoning behind it. We focus on method, documentation,
              and clarity so every report holds up to scrutiny.
            </p>
          </header>

          <ul className="cards" role="list">
            {VALUES.map((value) => (
              <li className="card" key={value.title}>
                <h3>{value.title}</h3>
                <p>{value.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <header className="section-head">
            <p className="eyebrow">When It Matters</p>
            <h2>When a professional valuation is needed</h2>
            <p className="section-lead">
              A credible, well-documented report protects your position. Reaching out early helps avoid
              delays and objections.
            </p>
          </header>
          <ul className="feature-list use-cases" role="list">
            {USE_CASES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-contact">
        <div className="container contact-inner">
          <p className="eyebrow eyebrow-light">Get in Touch</p>
          <h2>Ready to request a valuation?</h2>
          <p className="contact-lead">
            Tell us about your asset and the purpose of the report, and we&apos;ll guide you from there.
          </p>
          <a className="btn btn-primary btn-lg" href="mailto:support@prudentvaluations.com">
            support@prudentvaluations.com
          </a>
        </div>
      </section>
    </main>
  );
}
