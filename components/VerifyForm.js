"use client";

import { useState } from "react";

const SUPPORT_EMAIL = "support@prudentvaluations.com";

function fmtPKR(n) {
  if (n == null) return null;
  return "PKR " + Number(n).toLocaleString("en-PK", { maximumFractionDigits: 2 });
}
function fmtCAD(n) {
  if (n == null) return null;
  return "CAD " + Number(n).toLocaleString("en-CA", { maximumFractionDigits: 2 });
}
function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}
function formatCnic(s) {
  const d = (s || "").replace(/\D/g, "").slice(0, 13);
  const parts = [d.slice(0, 5)];
  if (d.length > 5) parts.push(d.slice(5, 12));
  if (d.length > 12) parts.push(d.slice(12, 13));
  return parts.join("-");
}

// Which detail fields to show per valuation type, in order.
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

export default function VerifyForm() {
  const [reference, setReference] = useState("");
  const [cnic, setCnic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setSubmitted(true);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, cnic }),
      });
      const data = await res.json();
      if (data.error && !data.found) setError(data.error);
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const status = result?.found ? result.status : null;
  const detailRows =
    result?.details && DETAIL_FIELDS[result.valuationType]
      ? DETAIL_FIELDS[result.valuationType]
          .filter(([k]) => result.details[k] != null && result.details[k] !== "")
          .map(([k, label, fmt]) => [label, fmt(result.details[k], result.details)])
      : [];

  return (
    <div className="verify">
      <form className="verify-form" onSubmit={onSubmit}>
        <div className="verify-field">
          <label htmlFor="reference">Report reference</label>
          <input
            id="reference"
            type="text"
            placeholder="PV/EVL/XXX/XXXX"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            autoComplete="off"
            required
          />
        </div>
        <div className="verify-field">
          <label htmlFor="cnic">CNIC of the owner</label>
          <input
            id="cnic"
            type="text"
            inputMode="numeric"
            placeholder="XXXXX-XXXXXXX-X"
            value={cnic}
            onChange={(e) => setCnic(formatCnic(e.target.value))}
            autoComplete="off"
            maxLength={15}
            required
          />
        </div>
        <button className="btn btn-primary verify-submit" type="submit" disabled={loading}>
          {loading ? "Checking…" : "Verify Report"}
        </button>
        <p className="verify-hint">
          Enter the reference exactly as printed on the report, plus the owner&apos;s 13-digit CNIC.
        </p>
      </form>

      {submitted && !loading && (
        <div className="verify-result" aria-live="polite">
          {error && !result?.found && <p className="verify-error">{error}</p>}

          {/* No match */}
          {result && !result.found && !error && (
            <div className="verify-card verify-card--notfound">
              <span className="verify-badge verify-badge--gray">No report found</span>
              <h3>No matching report</h3>
              <p>
                We couldn&apos;t find a report matching that reference and CNIC. Please check both values
                and try again, or email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> for help.
              </p>
            </div>
          )}

          {/* Found */}
          {result && result.found && (
            <div
              className={
                "verify-card " +
                (status === "verified"
                  ? "verify-card--ok"
                  : status === "rejected"
                  ? "verify-card--rejected"
                  : "verify-card--pending")
              }
            >
              <span
                className={
                  "verify-badge " +
                  (status === "verified"
                    ? "verify-badge--ok"
                    : status === "rejected"
                    ? "verify-badge--rejected"
                    : "verify-badge--pending")
                }
              >
                {status === "verified"
                  ? "✓ Verified"
                  : status === "rejected"
                  ? "Rejected"
                  : "Under Review"}
              </span>

              <h3>{result.type}</h3>

              {status === "under_review" && (
                <p className="verify-status-msg">
                  Your document has been received and is currently under review. Please check back
                  shortly.
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
                  <dd>{result.reference}</dd>
                </div>
                <div>
                  <dt>Owner</dt>
                  <dd>
                    {result.ownerName}
                    {result.ownerGuardian ? (
                      <span className="verify-guardian"> &mdash; w/o {result.ownerGuardian}</span>
                    ) : null}
                  </dd>
                </div>
                {result.reportDate && (
                  <div>
                    <dt>Report date</dt>
                    <dd>{fmtDate(result.reportDate)}</dd>
                  </div>
                )}

                {status === "verified" && result.value && (
                  <>
                    <div>
                      <dt>Assessed value</dt>
                      <dd>{fmtPKR(result.value.pkr)}</dd>
                    </div>
                    {result.value.cad != null && (
                      <div>
                        <dt>Equivalent</dt>
                        <dd>{fmtCAD(result.value.cad)}</dd>
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
      )}
    </div>
  );
}
