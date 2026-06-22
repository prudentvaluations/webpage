import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminGuard";
import { getAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getAdminClient();
  const { data, error } = await sb.from("company_settings").select("*").eq("id", 1).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data || {} });
}

export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const patch = { updated_at: new Date().toISOString() };
  for (const k of [
    "signature_data", "seal_data", "signatory_name",
    "wealth_signature_data", "wealth_seal_data", "wealth_signatory_name",
  ]) {
    if (k in body) patch[k] = body[k] === "" ? null : body[k];
  }
  // basic size guard for inline images (~1.5MB base64)
  for (const k of ["signature_data", "seal_data", "wealth_signature_data", "wealth_seal_data"]) {
    if (patch[k] && patch[k].length > 2_000_000) {
      return NextResponse.json({ error: `${k} image is too large (max ~1.5MB).` }, { status: 413 });
    }
  }

  const sb = getAdminClient();
  const { data, error } = await sb
    .from("company_settings")
    .update(patch)
    .eq("id", 1)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}
