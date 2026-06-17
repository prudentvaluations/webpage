const STEPS = [
  {
    title: "Share asset details",
    body: "Tell us what needs valuing and the purpose of the report.",
  },
  {
    title: "Document review or inspection",
    body: "We review documentation and inspect the asset where required.",
  },
  {
    title: "Valuation assessment",
    body: "We assess value using current market data and accepted methods.",
  },
  {
    title: "Receive your report",
    body: "A clear, professional valuation report is delivered to you.",
  },
];

export default function Process() {
  return (
    <section className="section" id="process" aria-labelledby="process-title">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow">How It Works</p>
          <h2 id="process-title">A Simple, Clear Process</h2>
          <p className="section-lead">From first enquiry to final report in four straightforward steps.</p>
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
  );
}
