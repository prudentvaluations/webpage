"use client";

const COMPANY = {
  legal: "The Experts - A House of Prudent (Pvt.) Limited.",
  ntn: "8916514-7",
  secp: "0114065",
  pba: "0414",
  icap: "5598",
  address: "Suite #38, 2nd Floor, Liberty Round About, Main Boulevard Gulberg-III, Lahore.",
  website: "www.prudentvaluations.com",
  email: "support@prudentvaluations.com",
  services: ["Chartered Accountant", "Property Valuations", "Income Estimations", "Tax & Legal Consultants"],
};

const DISCLAIMERS = [
  "This report reflects an estimated market value and is provided to the best of our professional knowledge and assessment.",
  "This report is issued without any guarantee of future market fluctuations.",
  "The firm shall not be held liable for any reliance placed on this report and is not obligated to appear before any financial institution, legal authority, or any court of law in connection with this valuation.",
];

const pkr = (n) => (n == null ? "—" : "PKR " + Number(n).toLocaleString("en-PK", { maximumFractionDigits: 2 }));
const sec = (n, code) => (n == null ? "—" : `${code} ` + Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 }));
const fdate = (d) => (!d ? "—" : new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" }));

const REL = { wife: ["wife", "w/o"], son: ["son", "s/o"], daughter: ["daughter", "d/o"], husband: ["husband", "h/o"] };
const relWord = (r) => (REL[r.guardian_relation] || REL.wife)[0];
const relAbbr = (r) => (REL[r.guardian_relation] || REL.wife)[1];
const ownerLine = (r) => r.owner_name + (r.owner_guardian ? `, ${relAbbr(r)} ${r.owner_guardian}` : "");

function subjectFor(r) {
  if (r.valuation_type === "gold") return `Valuation of Gold Jewellery (${r.details?.purity_karat || 22} Karat)`;
  if (r.valuation_type === "vehicle") return "Valuation of Vehicle (Motor Car)";
  if (r.valuation_type === "movable") return "Valuation of Movable Assets";
  if (r.valuation_type === "wealth") return "Statement of Net Worth";
  return "Valuation of Property";
}

function rowsFor(r) {
  const d = r.details || {};
  const cc = r.currency_code || "USD";
  const owner = ownerLine(r);
  const valueRows = [
    ["Estimated Market Value (PKR)", pkr(r.market_value_pkr)],
    [`Equivalent Market Value (${cc})`, sec(r.market_value_cad, cc)],
  ];
  if (r.valuation_type === "gold") {
    return [
      ["Owner of Gold", owner],
      ["Total Gold", `${d.total_grams ?? "—"} grams${d.total_tola ? ` (${d.total_tola} Tola)` : ""}`],
      ["Purity", d.purity_karat ? `${d.purity_karat} Karat` : "—"],
      ["Market Rate of Gold", d.rate_per_gram_pkr ? `${pkr(d.rate_per_gram_pkr)} per gram` : "—"],
      ...valueRows,
    ];
  }
  if (r.valuation_type === "vehicle") {
    return [
      ["Registered Owner", owner],
      ["Date of Transfer to Current Owner", d.transfer_date || "—"],
      ["Vehicle Details", d.make_model || "—"],
      ["Model", d.model_year || "—"],
      ["Registration No.", d.registration_no || "—"],
      ["Engine No.", d.engine_no || "—"],
      ["Chassis No.", d.chassis_no || "—"],
      ...valueRows,
    ];
  }
  if (r.valuation_type === "movable") {
    return [
      ["Owner", owner],
      ["Asset Description", d.description || "—"],
      ["Asset Type", d.asset_type || "—"],
      ["Condition", d.condition || "—"],
      ["Basis of Valuation", d.basis || "Fair market value"],
      ...valueRows,
    ];
  }
  return [
    ["Registered Owner", owner],
    ["Property Description", d.description || "—"],
    ["Nature of Property", d.nature || "—"],
    ["Land Area", d.land_area || "—"],
    ["Estimated Market Value per Marla", d.value_per_marla_pkr ? pkr(d.value_per_marla_pkr) : "—"],
    ...valueRows,
  ];
}

function WealthBody({ report }) {
  const d = report.details || {};
  const items = Array.isArray(d.items) ? d.items : [];
  const liquid = items.filter((i) => i.section === "liquid");
  const assets = items.filter((i) => i.section !== "liquid");
  const sum = (arr) => arr.reduce((t, i) => t + (Number(i.value_pkr) || 0), 0);
  const liquidTotal = sum(liquid);
  const assetTotal = sum(assets);
  const grand = liquidTotal + assetTotal;
  const cc = report.currency_code || "USD";
  const rate = Number(report.exchange_rate) || null;
  const secTotal = rate ? grand / rate : report.market_value_cad;

  let sr = 0;
  const groupRows = (label, arr, subtotal) => (
    <>
      <tr className="rep-w-group">
        <td colSpan={4}>{label}</td>
      </tr>
      {arr.length === 0 && (
        <tr>
          <td></td>
          <td colSpan={3} className="rep-w-empty">None declared</td>
        </tr>
      )}
      {arr.map((i, k) => (
        <tr key={label + k}>
          <td className="rep-w-sr">{++sr}</td>
          <td>{i.description}</td>
          <td>{i.ownership || ownerLine(report)}</td>
          <td className="rep-w-val">{pkr(i.value_pkr)}</td>
        </tr>
      ))}
      <tr className="rep-w-subtotal">
        <td colSpan={3}>{subtotal}</td>
        <td className="rep-w-val">{pkr(arr === liquid ? liquidTotal : assetTotal)}</td>
      </tr>
    </>
  );

  return (
    <>
      <p className="rep-w-cert">
        This is to certify that, based on the documents produced and verified to our satisfaction, the
        net worth of <strong>{ownerLine(report)}</strong> is <strong>{pkr(grand)}</strong>
        {secTotal != null ? <> (equivalent <strong>{sec(secTotal, cc)}</strong>)</> : null} as of{" "}
        {fdate(report.report_date)}.
      </p>

      <div className="rep-w-summary">
        <div>
          <span>Liquid funds (readily available)</span>
          <strong>{pkr(liquidTotal)}</strong>
        </div>
        <div>
          <span>Appraised assets (market value)</span>
          <strong>{pkr(assetTotal)}</strong>
        </div>
        <div className="rep-w-summary-total">
          <span>Total net worth</span>
          <strong>{pkr(grand)}</strong>
        </div>
      </div>

      <table className="rep-table rep-w-table">
        <thead>
          <tr>
            <th className="rep-w-sr">Sr</th>
            <th>Description</th>
            <th>Ownership</th>
            <th className="rep-w-val">Value (PKR)</th>
          </tr>
        </thead>
        <tbody>
          {groupRows("A. Liquid Funds — Cash & Bank Balances", liquid, "Total Liquid Funds")}
          {groupRows("B. Appraised Assets — Estimated Market Value", assets, "Total Appraised Assets")}
          <tr className="rep-w-grand">
            <td colSpan={3}>TOTAL NET WORTH</td>
            <td className="rep-w-val">{pkr(grand)}</td>
          </tr>
        </tbody>
      </table>
      {rate && <p className="rep-rate">Exchange Rate (Forex.pk) Used: 1 {cc} = {rate} PKR</p>}

      {d.support_note && (
        <p className="rep-w-note">
          <strong>Financial support:</strong> {d.support_note}
        </p>
      )}
      <p className="rep-w-note">
        <strong>Note for the reviewing officer:</strong> Liquid funds (cash and bank balances) are
        readily available for settlement, whereas appraised assets reflect estimated market value and are
        not immediately liquid. Ownership of each item is stated above.
      </p>
    </>
  );
}

export default function ReportDocument({ report, qrDataUrl, siteUrl, settings = {} }) {
  const verifyUrl = `${siteUrl}/v/${report.verify_token}`;
  const cc = report.currency_code || "USD";
  const isWealth = report.valuation_type === "wealth";
  const rows = isWealth ? [] : rowsFor(report);

  // Wealth statements are signed by the Chartered Accountant (Director) with a
  // distinct signature/stamp; fall back to the default set if not configured.
  const signature = isWealth ? settings.wealth_signature_data || settings.signature_data : settings.signature_data;
  const seal = isWealth ? settings.wealth_seal_data : settings.seal_data;
  const signatory = isWealth
    ? settings.wealth_signatory_name || "Chartered Accountant (Director)"
    : settings.signatory_name || "Director (Valuations)";

  return (
    <div className="report-screen admin-route">
      <div className="report-toolbar">
        <a className="btn btn-ghost" href="/admin">← Back</a>
        <button className="btn btn-primary" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>

      <article className={"report-sheet" + (isWealth ? " rep-compact" : "")}>
        <div className="rep-letterhead">
          <header className="rep-head">
            <img className="rep-logo" src="/assets/logo.png" alt="Prudent Valuations" />
            <ul className="rep-services">
              {COMPANY.services.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </header>
          <div className="rep-rule" />
        </div>

        <div className="rep-body">
        <div className="rep-meta">
          <div>
            <p className="rep-owner">
              {report.owner_name}
              {report.owner_guardian ? `, ${relWord(report)} of ${report.owner_guardian}` : ""}
            </p>
            <p><strong>CNIC #:</strong> {report.cnic}</p>
            {report.passport_no && <p><strong>Passport #:</strong> {report.passport_no}</p>}
          </div>
          <div className="rep-meta-right">
            <p><strong>REF #:</strong> {report.reference}</p>
            <p><strong>Date:</strong> {fdate(report.report_date)}</p>
          </div>
        </div>

        {report.present_address && <p className="rep-addr"><strong>Present Address:</strong> {report.present_address}</p>}
        {report.permanent_address && <p className="rep-addr"><strong>Permanent Address:</strong> {report.permanent_address}</p>}

        <h2 className="rep-subject">Subject: {subjectFor(report)}</h2>

        {isWealth ? (
          <WealthBody report={report} />
        ) : (
          <>
            <table className="rep-table">
              <thead>
                <tr><th className="rep-t-head" colSpan={2}>Valuation Particulars</th></tr>
              </thead>
              <tbody>
                {rows.map(([label, value]) => (
                  <tr key={label}><th>{label}</th><td>{value}</td></tr>
                ))}
              </tbody>
            </table>
            {report.exchange_rate && (
              <p className="rep-rate">Exchange Rate (Forex.pk) Used: 1 {cc} = {report.exchange_rate} PKR</p>
            )}
          </>
        )}

        {report.remarks && (
          <div className="rep-remarks">
            <h3>REMARKS:</h3>
            <p>{report.remarks}</p>
          </div>
        )}
        {!isWealth && (
          <ul className="rep-disclaimers">
            {DISCLAIMERS.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        )}

        <div className="rep-signoff">
          <div className="rep-verify">
            <img className="rep-qr" src={qrDataUrl} alt="Verification QR code" />
            <div className="rep-verify-text">
              <strong>Verify this report online</strong>
              <p>
                Scan the QR code, or visit{" "}
                <span className="rep-url">{siteUrl.replace(/^https?:\/\//, "")}/verify</span> and enter the
                reference number and CNIC.
              </p>
              <p className="rep-verify-url">{verifyUrl}</p>
            </div>
          </div>

          <div className="rep-sign">
            <p>Yours truly,</p>
            <div className="rep-sign-imgs">
              {signature && <img className="rep-signature" src={signature} alt="signature" />}
              {seal && <img className="rep-seal" src={seal} alt="seal" />}
            </div>
            <p className="rep-signatory">{signatory}</p>
            <p className="rep-sign-for">{COMPANY.legal}</p>
          </div>
        </div>
        </div>

        <footer className="rep-foot">
          <p className="rep-foot-legal">{COMPANY.legal}</p>
          <p>NTN #: {COMPANY.ntn} &nbsp;|&nbsp; SECP #: {COMPANY.secp} &nbsp;|&nbsp; PBA #: {COMPANY.pba} &nbsp;|&nbsp; ICAP #: {COMPANY.icap}</p>
          <p>{COMPANY.address}</p>
          <p>Website: {COMPANY.website} &nbsp;|&nbsp; Email: {COMPANY.email}</p>
        </footer>
      </article>
    </div>
  );
}
