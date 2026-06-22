// Shared report parsing: PDF text extraction + field parsing.
// Used by scripts/ingest-report.mjs and app/api/admin/extract.
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export async function extractTextFromPdf(buffer) {
  const { PDFParse } = require("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const { text } = await parser.getText();
  return text;
}

const num = (s) => (s == null ? null : Number(String(s).replace(/,/g, "")));
const clean = (s) => (s == null ? null : s.replace(/\s+/g, " ").trim());
const m1 = (re, t) => {
  const m = t.match(re);
  return m ? m[1] : null;
};

function parseDate(s) {
  if (!s) return null;
  const d = new Date(s.replace(/(\d+)(st|nd|rd|th)/, "$1"));
  if (isNaN(d)) return null;
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function detectType(subject = "") {
  if (/gold/i.test(subject)) return "gold";
  if (/vehicle|motor\s*car/i.test(subject)) return "vehicle";
  if (/plot|propert|residential|commercial|land|house/i.test(subject)) return "property";
  return null;
}

export function parseReportText(text) {
  const t = (text || "").replace(/\r/g, "");

  // owner name line = the line directly above "CNIC #:"
  let ownerLine = null;
  const lines = t.split("\n").map((l) => l.trim());
  const cnicIdx = lines.findIndex((l) => /^CNIC #:/i.test(l));
  if (cnicIdx > 0) ownerLine = lines[cnicIdx - 1];

  let owner_name = ownerLine,
    owner_guardian = null;
  const og = (ownerLine || "").match(/^(.+?),\s*(?:wife|son|daughter|husband)\s+of\s+(.+)$/i);
  if (og) {
    owner_name = clean(og[1]);
    owner_guardian = clean(og[2]);
  }

  const subject = clean(m1(/Subject:\s*(.+)/i, t));
  const valuation_type = detectType(subject);

  // Addresses (between the label and the next label)
  const present_address = clean(
    m1(/Present Address:\s*([\s\S]+?)\n(?:Permanent Address:|Subject:)/i, t)
  );
  const permanent_address = clean(
    m1(/Permanent Address:\s*([\s\S]+?)\n(?:Subject:|Owner of|Registered Owner|Property Description)/i, t)
  );

  // Remarks paragraph: between "REMARKS:" and the first bullet/disclaimer
  let remarks = m1(/REMARKS:\s*([\s\S]+?)(?:\n\s*•|This report reflects)/i, t);
  remarks = clean(remarks);

  const common = {
    reference: clean(m1(/REF #:\s*([^\s]+)/i, t)),
    cnic: clean(m1(/CNIC #:\s*([0-9-]+)/i, t)),
    passport_no: clean(m1(/Passport #:\s*([^\s]+)/i, t)),
    report_date: parseDate(clean(m1(/\bDate:\s*([A-Za-z]+\.?\s+\d{1,2},?\s*\d{4})/i, t))),
    owner_name: clean(owner_name),
    owner_guardian,
    valuation_type,
    present_address,
    permanent_address,
    remarks,
    market_value_pkr: num(m1(/Pakistani Rupees\s+PKR\s*([\d,]+(?:\.\d+)?)/i, t)),
    market_value_cad: num(m1(/(?:Canadian Dollars\s+CAD|CAD)\s*([\d,]+(?:\.\d+)?)/i, t)),
    exchange_rate: num(m1(/1\s*[A-Z]{3}\s*=\s*([\d.,]+)\s*PKR/i, t)),
    currency_code: (m1(/1\s*([A-Z]{3})\s*=\s*[\d.,]+\s*PKR/i, t) || "USD").toUpperCase(),
  };

  let details = {};
  if (valuation_type === "gold") {
    const gt = t.match(/Total\s+\d+\s*Karat Gold in Grams\s+([\d,.]+)\s*\(([\d,.]+)\s*Tola\)/i);
    details = {
      purity_karat:
        num(m1(/Gold Jewellery\s*\((\d+)\s*Karat\)/i, t)) ||
        num(m1(/assessed at\s+(\d+)\s*karat/i, t)),
      total_grams: gt ? num(gt[1]) : null,
      total_tola: gt ? num(gt[2]) : null,
      rate_per_gram_pkr: num(m1(/Market Rate of\s+\d+\s*Karat Gold\s+PKR\s*([\d,.]+)\s*Per Gram/i, t)),
    };
  } else if (valuation_type === "vehicle") {
    details = {
      make_model: clean(m1(/Vehicle Details\s+(.+)/i, t)),
      model_year: num(m1(/^Model\s+(\d{4})\b/im, t)),
      registration_no: clean(m1(/Registration No\.?\s+([A-Z0-9-]+)/i, t)),
      engine_no: clean(m1(/Engine No\.?\s+([A-Z0-9-]+)/i, t)),
      chassis_no: clean(m1(/Chassis No\.?\s+([A-Z0-9-]+)/i, t)),
      transfer_date: clean(m1(/Date of Transfer to Current Owner\s+([\d/]+)/i, t)),
      odometer_km: num(m1(/odometer reading\s+was\s+([\d,]+)\s*kilometers/i, t)),
    };
  } else if (valuation_type === "property") {
    const desc = m1(/Property Description\s+([\s\S]+?)\n(?:Nature of Property|Nature)/i, t);
    details = {
      description: clean(desc),
      nature: clean(m1(/Nature of Property\s+(.+)/i, t)),
      land_area: clean(m1(/Land Area\s+(.+)/i, t)),
      value_per_marla_pkr: num(m1(/Market Value per\s+Marla\s+PKR\s*([\d,.]+)/i, t)),
    };
  }

  return { ...common, details };
}
