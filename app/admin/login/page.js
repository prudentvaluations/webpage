import AdminLogin from "@/components/AdminLogin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Login", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return <AdminLogin />;
}
