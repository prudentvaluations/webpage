import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const onlyDigits = (s) => (s || "").replace(/\D/g, "");

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const reference = (body.reference || "").trim();
  const cnicInput = onlyDigits(body.cnic);

  if (!reference || cnicInput.length !== 13) {
    return NextResponse.json(
      { found: false, error: "Enter the report reference and the 13-digit CNIC." },
      { status: 200 }
    );
  }

  let data, error;
  try {
    const supabase = getAdminClient();
    ({ data, error } = await supabase
      .from("valuation_reports")
      .select(
        "reference, valuation_type, status, owner_name, owner_guardian, cnic, report_date, market_value_pkr, market_value_cad, exchange_rate, valid_until, details"
      )
      .eq("reference", reference)
      .maybeSingle());
  } catch (e) {
    console.error("verify config error:", e.message);
    return NextResponse.json({ found: false, error: "Service unavailable." }, { status: 500 });
  }

  if (error) {
    console.error("verify query error:", error.message);
    return NextResponse.json({ found: false, error: "Lookup failed." }, { status: 500 });
  }

  // Second factor: CNIC must match. If not, respond exactly like "not found"
  // so the reference alone reveals nothing.
  if (!data || onlyDigits(data.cnic) !== cnicInput) {
    return NextResponse.json({ found: false }, { status: 200 });
  }

  const TYPE_LABEL = {
    gold: "Gold Valuation",
    vehicle: "Vehicle Valuation",
    property: "Property Valuation",
  };

  return NextResponse.json({
    found: true,
    status: data.status, // under_review | verified | rejected
    reference: data.reference,
    type: TYPE_LABEL[data.valuation_type] || "Valuation Report",
    valuationType: data.valuation_type,
    ownerName: data.owner_name,
    ownerGuardian: data.owner_guardian,
    reportDate: data.report_date,
    validUntil: data.valid_until,
    value:
      data.status === "verified"
        ? {
            pkr: data.market_value_pkr,
            cad: data.market_value_cad,
            exchangeRate: data.exchange_rate,
          }
        : null,
    details: data.status === "verified" ? data.details || {} : null,
  });
}
