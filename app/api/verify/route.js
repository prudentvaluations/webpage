import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const onlyDigits = (s) => (s || "").replace(/\D/g, "");

// "Zoya Tahir" -> "Z*** T****" (recognisable but privacy-preserving)
function maskName(name) {
  if (!name) return null;
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0] + "*".repeat(Math.max(1, w.length - 1)))
    .join(" ");
}

// PostgREST one-to-one embeds usually return an object, but tolerate arrays.
const one = (v) => (Array.isArray(v) ? v[0] : v) || null;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const reference = (body.reference || "").trim();
  const cnicInput = onlyDigits(body.cnic);

  if (!reference || cnicInput.length < 5) {
    return NextResponse.json(
      { found: false, error: "Enter a valid report reference and CNIC." },
      { status: 200 }
    );
  }

  let data, error;
  try {
    const supabase = getAdminClient();
    ({ data, error } = await supabase
      .from("valuation_requests")
      .select(
        `request_reference,
         status:verification_statuses(code,name),
         type:valuation_types(code,name),
         result:valuation_results(market_value_pkr, market_value_cad, valuation_date, valid_until),
         owner:users(profile:user_profiles(first_name,last_name,cnic))`
      )
      .eq("request_reference", reference)
      .maybeSingle());
  } catch (e) {
    console.error("verify config error:", e.message);
    return NextResponse.json({ found: false, error: "Service unavailable." }, { status: 500 });
  }

  if (error) {
    console.error("verify query error:", error.message);
    return NextResponse.json({ found: false, error: "Lookup failed." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ found: false }, { status: 200 });
  }

  // Second factor: CNIC must match the record's profile. If it doesn't,
  // respond exactly like "not found" so the reference alone reveals nothing.
  const profile = one(one(data.owner)?.profile);
  const dbCnic = onlyDigits(profile?.cnic);
  if (!dbCnic || dbCnic !== cnicInput) {
    return NextResponse.json({ found: false }, { status: 200 });
  }

  const status = one(data.status);
  const type = one(data.type);
  const result = one(data.result);
  const verified = status?.code === "verified";
  const ownerName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");

  return NextResponse.json({
    found: true,
    verified,
    reference: data.request_reference,
    statusCode: status?.code || null,
    status: status?.name || null,
    type: type?.name || null,
    ownerNameMasked: maskName(ownerName),
    value:
      verified && result
        ? {
            pkr: result.market_value_pkr,
            cad: result.market_value_cad,
            valuationDate: result.valuation_date,
            validUntil: result.valid_until,
          }
        : null,
  });
}
