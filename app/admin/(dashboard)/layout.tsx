import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();

  return (
    <div className="flex min-h-screen md:flex-row flex-col">
      <AdminSidebar adminEmail={profile.email} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
    </div>
  );
}
