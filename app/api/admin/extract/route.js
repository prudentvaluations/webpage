import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminGuard";
import { extractTextFromPdf, parseReportText } from "@/lib/parseReport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let file;
  try {
    const form = await req.formData();
    file = form.get("file");
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  if (!file || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ error: "No PDF file provided." }, { status: 400 });
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromPdf(buf);
    const parsed = parseReportText(text);
    return NextResponse.json({ parsed, filename: file.name });
  } catch (e) {
    console.error("extract error:", e.message);
    return NextResponse.json({ error: "Could not read this PDF." }, { status: 422 });
  }
}
