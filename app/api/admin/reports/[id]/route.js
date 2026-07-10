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

export async function PATCH(req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const rec = {};
  for (const k of FIELDS) if (k in body) rec[k] = body[k] === "" ? null : body[k];
  if (!Object.keys(rec).length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

  const sb = getAdminClient();
  const { data, error } = await sb
    .from("valuation_reports")
    .update(rec)
    .eq("id", params.id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ report: data });
}

export async function DELETE(_req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getAdminClient();
  const { error } = await sb.from("valuation_reports").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
