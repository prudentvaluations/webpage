export default function Contact() {
  return (
    <section className="section section-contact" id="contact" aria-labelledby="contact-title">
      <div className="container contact-inner">
        <p className="eyebrow eyebrow-light">Get in Touch</p>
        <h2 id="contact-title">Request a Valuation</h2>
        <p className="contact-lead">
          Share your asset details and the purpose of the report. We review the requirement, confirm the
          documents needed, and respond with a clear fee and timeline — usually within one working day.
        </p>
        <a className="btn btn-primary btn-lg" href="mailto:support@prudentvaluations.com">
          support@prudentvaluations.com
        </a>

        <ul className="contact-meta" role="list">
          <li>
            <span className="contact-meta__label">Office Hours</span>
            <span>Mon&ndash;Fri &middot; 10 AM &ndash; 6 PM</span>
          </li>
          <li>
            <span className="contact-meta__label">Office</span>
            <span>2nd Floor, Liberty, Main Boulevard, Gulberg, Lahore</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
