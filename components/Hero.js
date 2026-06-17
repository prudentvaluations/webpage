import RotatingWord from "./RotatingWord";

const SPECIALITIES = [
  "Property",
  "Gold & Jewellery",
  "Vehicles",
  "Movable Assets",
  "Immovable Assets",
  "Net-Worth Reports",
];

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-aurora" aria-hidden="true"></div>
      <div className="container hero-inner">
        <p className="eyebrow">Prudent Valuations</p>
        <h1>
          Professional Asset Valuation
          <br />
          You Can Trust
        </h1>
        <p className="hero-rotator">
          <span className="hero-rotator__label">Specialising in</span>
          <RotatingWord items={SPECIALITIES} />
        </p>
        <p className="hero-sub">
          Clear, market-based valuation reports for property, gold, vehicles, and movable &amp;
          immovable assets — prepared with accuracy and care.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="mailto:prudentvaluations@gmail.com">
            Contact Us
          </a>
          <a className="btn btn-ghost" href="#services">
            View Services
          </a>
        </div>
      </div>
    </section>
  );
}
