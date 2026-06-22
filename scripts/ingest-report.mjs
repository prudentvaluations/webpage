/**
 * Ingest a final Prudent Valuations PDF into the verification database.
 *
 * Usage:
 *   node --env-file=.env.local scripts/ingest-report.mjs "<path-to.pdf>" [--status verified|under_review|rejected] [--dry]
 *
 * Parses the report's fields and upserts them into public.valuation_reports
 * (keyed on reference). Most records will be added via the /admin panel; this
 * script is a power-user / batch alternative.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { extractTextFromPdf, parseReportText } from "../lib/parseReport.js";

const args = process.argv.slice(2);
const pdfPath = args.find((a) => !a.startsWith("--"));
const status =
  args.find((a) => a.startsWith("--status="))?.split("=")[1] ||
  (args.includes("--status") ? args[args.indexOf("--status") + 1] : "under_review");
const dry = args.includes("--dry");

if (!pdfPath) {
  console.error('Usage: node --env-file=.env.local scripts/ingest-report.mjs "<file.pdf>" [--status verified] [--dry]');
  process.exit(1);
}

const buf = fs.readFileSync(pdfPath);
const text = await extractTextFromPdf(buf);
const record = parseReportText(text);
record.status = status;
record.pdf_filename = path.basename(pdfPath);

console.log("\nParsed report:");
console.log(JSON.stringify(record, null, 2));

const missing = ["reference", "cnic", "owner_name", "valuation_type"].filter((k) => !record[k]);
if (missing.length) {
  console.error("\n⚠️  Missing required fields:", missing.join(", "), "— not saved.");
  process.exit(1);
}

if (dry) {
  console.log("\n(dry run — nothing written)");
  process.exit(0);
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const { error } = await sb.from("valuation_reports").upsert(record, { onConflict: "reference" });
if (error) {
  console.error("\nDB error:", error.message);
  process.exit(1);
}
console.log(`\n✓ Saved ${record.reference} (${record.valuation_type}, status=${record.status})`);
