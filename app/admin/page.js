import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/adminGuard";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function AdminPage() {
  if (!isAdmin()) redirect("/admin/login");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  return <AdminDashboard siteUrl={siteUrl} />;
}
