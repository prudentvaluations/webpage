import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { isAdmin } from "@/lib/adminGuard";
import { getAdminClient } from "@/lib/supabaseAdmin";
import ReportDocument from "@/components/ReportDocument";

export const dynamic = "force-dynamic";
export const metadata = { title: "Report", robots: { index: false, follow: false } };

export default async function ReportPage({ params }) {
  if (!isAdmin()) redirect("/admin/login");

  const sb = getAdminClient();
  const { data: report } = await sb
    .from("valuation_reports")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  const { data: settings } = await sb.from("company_settings").select("*").eq("id", 1).maybeSingle();

  if (!report) {
    return (
      <div className="admin-route" style={{ padding: "2rem", textAlign: "center" }}>
        <p>Report not found. <a href="/admin">Back to admin</a></p>
      </div>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const qrDataUrl = await QRCode.toDataURL(`${siteUrl}/v/${report.verify_token}`, {
    width: 320,
    margin: 1,
  });

  return <ReportDocument report={report} qrDataUrl={qrDataUrl} siteUrl={siteUrl} settings={settings || {}} />;
}
