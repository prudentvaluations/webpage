import VerifyForm from "@/components/VerifyForm";

export const metadata = {
  title: "Verify a Report | Prudent Valuations",
  description:
    "Verify the authenticity and status of a Prudent Valuations report online using its reference number and the owner's CNIC.",
  alternates: { canonical: "/verify" },
};

export default function VerifyPage() {
  return (
    <main id="main">
      <section className="page-hero">
        <div className="hero-aurora" aria-hidden="true"></div>
        <div className="container page-hero-inner">
          <p className="eyebrow">Report Verification</p>
          <h1>Verify a Valuation Report</h1>
          <p className="page-hero-sub">
            Confirm that a Prudent Valuations report is genuine and check its current status. Enter the
            report reference and the owner&apos;s CNIC — no account needed.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container verify-wrap">
          <VerifyForm />
        </div>
      </section>
    </main>
  );
}
