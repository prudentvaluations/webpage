import { getAdminClient } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Report Verification | Prudent Valuations",
  robots: { index: false, follow: false },
};

const SUPPORT_EMAIL = "support@prudentvaluations.com";
const TYPE_LABEL = { gold: "Gold Valuation", vehicle: "Vehicle Valuation", property: "Property Valuation" };

const fmtPKR = (n) => (n == null ? null : "PKR " + Number(n).toLocaleString("en-PK", { maximumFractionDigits: 2 }));
const fmtCAD = (n) => (n == null ? null : "CAD " + Number(n).toLocaleString("en-CA", { maximumFractionDigits: 2 }));
const fmtDate = (d) => (!d ? null : new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" }));

const DETAIL_FIELDS = {
  gold: [
    ["purity_karat", "Purity", (v) => `${v}K`],
    ["total_grams", "Total gold", (v, d) => `${v} g${d.total_tola ? ` (${d.total_tola} tola)` : ""}`],
    ["rate_per_gram_pkr", "Rate per gram", (v) => fmtPKR(v)],
  ],
  vehicle: [
    ["make_model", "Vehicle", (v) => v],
    ["model_year", "Model year", (v) => v],
    ["registration_no", "Registration No.", (v) => v],
    ["engine_no", "Engine No.", (v) => v],
    ["chassis_no", "Chassis No.", (v) => v],
    ["transfer_date", "Transfer date", (v) => v],
    ["odometer_km", "Odometer", (v) => `${Number(v).toLocaleString()} km`],
  ],
  property: [
    ["description", "Property", (v) => v],
    ["nature", "Nature", (v) => v],
    ["land_area", "Land area", (v) => v],
    ["value_per_marla_pkr", "Value per Marla", (v) => fmtPKR(v)],
  ],
};

export default async function TokenVerifyPage({ params }) {
  let report = null;
  try {
    const sb = getAdminClient();
    const { data } = await sb
      .from("valuation_reports")
      .select(
        "reference, valuation_type, status, owner_name, owner_guardian, report_date, market_value_pkr, market_value_cad, valid_until, details"
      )
      .eq("verify_token", params.token)
      .maybeSingle();
    report = data;
  } catch {
    report = null;
  }

  const status = report?.status;
  const verified = status === "verified";
  const details = report?.details || {};
  const detailRows =
    verified && DETAIL_FIELDS[report.valuation_type]
      ? DETAIL_FIELDS[report.valuation_type]
          .filter(([k]) => details[k] != null && details[k] !== "")
          .map(([k, label, f]) => [label, f(details[k], details)])
      : [];

  return (
    <main id="main">
      <section className="page-hero">
        <div className="hero-aurora" aria-hidden="true"></div>
        <div className="container page-hero-inner">
          <p className="eyebrow">Report Verification</p>
          <h1>Prudent Valuations Report</h1>
          <p className="page-hero-sub">Authenticity and status of this valuation report, direct from our records.</p>
        </div>
      </section>

      <section className="section">
        <div className="container verify-wrap">
          {!report && (
            <div className="verify-card verify-card--notfound">
              <span className="verify-badge verify-badge--gray">No report found</span>
              <h3>This code is not recognised</h3>
              <p>
                We couldn&apos;t find a report for this link. If you believe this is an error, email{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
              </p>
            </div>
          )}

          {report && (
            <div
              className={
                "verify-card " +
                (verified ? "verify-card--ok" : status === "rejected" ? "verify-card--rejected" : "verify-card--pending")
              }
            >
              <span
                className={
                  "verify-badge " +
                  (verified ? "verify-badge--ok" : status === "rejected" ? "verify-badge--rejected" : "verify-badge--pending")
                }
              >
                {verified ? "✓ Verified" : status === "rejected" ? "Rejected" : "Under Review"}
              </span>
              <h3>{TYPE_LABEL[report.valuation_type] || "Valuation Report"}</h3>

              {status === "under_review" && (
                <p className="verify-status-msg">
                  This document has been received and is currently under review. Please check back shortly.
                </p>
              )}
              {status === "rejected" && (
                <p className="verify-status-msg">
                  This report could not be verified. Please email{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> for details.
                </p>
              )}

              <dl className="verify-details">
                <div>
                  <dt>Reference</dt>
                  <dd>{report.reference}</dd>
                </div>
                <div>
                  <dt>Owner</dt>
                  <dd>
                    {report.owner_name}
                    {report.owner_guardian ? <span className="verify-guardian"> (w/o {report.owner_guardian})</span> : null}
                  </dd>
                </div>
                {report.report_date && (
                  <div>
                    <dt>Report date</dt>
                    <dd>{fmtDate(report.report_date)}</dd>
                  </div>
                )}
                {verified && (
                  <>
                    {report.market_value_pkr != null && (
                      <div>
                        <dt>Assessed value</dt>
                        <dd>{fmtPKR(report.market_value_pkr)}</dd>
                      </div>
                    )}
                    {report.market_value_cad != null && (
                      <div>
                        <dt>Equivalent</dt>
                        <dd>{fmtCAD(report.market_value_cad)}</dd>
                      </div>
                    )}
                    {detailRows.map(([label, val]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{val}</dd>
                      </div>
                    ))}
                  </>
                )}
              </dl>

              <p className="verify-note">
                To obtain the complete <strong>signed and stamped</strong> valuation report, contact{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
