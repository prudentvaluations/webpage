const QUICK_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/#process", label: "Process" },
  { href: "/#contact", label: "Contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-col footer-about">
          <span className="footer-brand-name">
            <span className="brand-name-1">Prudent</span>{" "}
            <span className="brand-name-2">Valuations</span>
          </span>
          <p className="footer-tagline">Registered Private Limited Valuation Firm in Pakistan</p>
          <p>
            Market-based valuation reports prepared for visa, legal, tax, and audit purposes. Trusted by
            local and overseas clients for clear and compliant valuations.
          </p>
        </div>

        <div className="footer-col">
          <h2 className="footer-heading">Quick Links</h2>
          <ul className="footer-links">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h2 className="footer-heading">Contact</h2>
          <ul className="footer-contact-list">
            <li>
              <span className="footer-label">Phone</span>
              <a href="tel:+923214340094">+92 321 4340094</a>
            </li>
            <li>
              <span className="footer-label">Email</span>
              <a href="mailto:prudentvaluations@gmail.com">prudentvaluations@gmail.com</a>
            </li>
            <li>
              <span className="footer-label">Address</span>
              <address>
                2nd Floor, Liberty,
                <br />
                Main Boulevard, Gulberg,
                <br />
                Lahore
              </address>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>&copy; {year} Prudent Valuations. All rights reserved.</p>
      </div>
    </footer>
  );
}
