"use client";

import { useState } from "react";

const STEPS = ["submitted", "under_review", "verified"];
const STATUS_LABEL = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  verified: "Verified",
  rejected: "Rejected",
  expired: "Expired",
  cancelled: "Cancelled",
};

function fmtPKR(n) {
  if (n == null) return null;
  return "PKR " + Number(n).toLocaleString("en-PK", { maximumFractionDigits: 0 });
}
function fmtCAD(n) {
  if (n == null) return null;
  return "CAD " + Number(n).toLocaleString("en-CA", { maximumFractionDigits: 2 });
}
function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

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

  return (
    <div className="verify">
      <form className="verify-form" onSubmit={onSubmit}>
        <div className="verify-field">
          <label htmlFor="reference">Report reference</label>
          <input
            id="reference"
            type="text"
            placeholder="e.g. TE/EVL/312/2026"
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
            placeholder="e.g. 35202-5782390-2"
            value={cnic}
            onChange={(e) => setCnic(e.target.value)}
            autoComplete="off"
            required
          />
        </div>
        <button className="btn btn-primary verify-submit" type="submit" disabled={loading}>
          {loading ? "Checking…" : "Verify Report"}
        </button>
        <p className="verify-hint">
          Enter the reference exactly as printed on the report, plus the CNIC of the asset owner.
        </p>
      </form>

      {submitted && !loading && (
        <div className="verify-result" aria-live="polite">
          {error && !result?.found && <p className="verify-error">{error}</p>}

          {result && !result.found && !error && (
            <div className="verify-card verify-card--notfound">
              <span className="verify-badge verify-badge--gray">Not found</span>
              <h3>No matching report</h3>
              <p>
                We couldn&apos;t find a report matching that reference and CNIC. Check both values and
                try again, or contact us if you believe this is an error.
              </p>
            </div>
          )}

          {result && result.found && (
            <div
              className={`verify-card ${
                result.verified ? "verify-card--ok" : "verify-card--pending"
              }`}
            >
              <span
                className={`verify-badge ${
                  result.verified ? "verify-badge--ok" : "verify-badge--pending"
                }`}
              >
                {result.verified ? "✓ Verified" : STATUS_LABEL[result.statusCode] || result.status}
              </span>

              <h3>{result.type || "Valuation Report"}</h3>
              <dl className="verify-details">
                <div>
                  <dt>Reference</dt>
                  <dd>{result.reference}</dd>
                </div>
                {result.ownerNameMasked && (
                  <div>
                    <dt>Owner</dt>
                    <dd>{result.ownerNameMasked}</dd>
                  </div>
                )}
                <div>
                  <dt>Status</dt>
                  <dd>{result.status}</dd>
                </div>
                {result.value && (
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
                    {result.value.valuationDate && (
                      <div>
                        <dt>Valuation date</dt>
                        <dd>{fmtDate(result.value.valuationDate)}</dd>
                      </div>
                    )}
                    {result.value.validUntil && (
                      <div>
                        <dt>Valid until</dt>
                        <dd>{fmtDate(result.value.validUntil)}</dd>
                      </div>
                    )}
                  </>
                )}
              </dl>

              {/* Tracking timeline for non-rejected/expired states */}
              {!["rejected", "expired", "cancelled"].includes(result.statusCode) && (
                <ol className="verify-timeline" aria-label="Status progress">
                  {STEPS.map((s) => {
                    const reached =
                      STEPS.indexOf(result.statusCode) >= STEPS.indexOf(s) || result.verified;
                    return (
                      <li key={s} className={reached ? "is-done" : ""}>
                        <span className="verify-timeline__dot" />
                        {STATUS_LABEL[s]}
                      </li>
                    );
                  })}
                </ol>
              )}

              <p className="verify-note">
                This confirms the report&apos;s status in our records. For the full document, contact
                Prudent Valuations.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
