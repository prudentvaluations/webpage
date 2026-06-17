const ITEMS = [
  "Visa & Immigration",
  "Tax & FBR",
  "Legal & Court",
  "Audit & Stock",
  "Banking & Finance",
  "Inheritance",
  "Buying & Selling",
];

export default function Marquee() {
  // Render the list twice so the CSS loop is seamless.
  const loop = [...ITEMS, ...ITEMS];

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {loop.map((item, i) => (
          <span className="marquee-item" key={i}>
            <span className="marquee-diamond"></span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
