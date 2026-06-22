import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminGuard";
import { getAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIELDS = [
  "reference",
  "valuation_type",
  "status",
  "owner_name",
  "owner_guardian",
  "guardian_relation",
  "cnic",
  "passport_no",
  "report_date",
  "valid_until",
  "present_address",
  "permanent_address",
  "remarks",
  "market_value_pkr",
  "market_value_cad",
  "currency_code",
  "exchange_rate",
  "details",
  "pdf_filename",
];

function pick(body) {
  const o = {};
  for (const k of FIELDS) if (k in body) o[k] = body[k] === "" ? null : body[k];
  return o;
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getAdminClient();
  const { data, error } = await sb
    .from("valuation_reports")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reports: data });
}

export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const rec = pick(body);
  for (const k of ["reference", "valuation_type", "owner_name", "cnic"]) {
    if (!rec[k]) return NextResponse.json({ error: `Missing required field: ${k}` }, { status: 400 });
  }

  const sb = getAdminClient();
  const { data, error } = await sb
    .from("valuation_reports")
    .upsert(rec, { onConflict: "reference" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ report: data });
}
