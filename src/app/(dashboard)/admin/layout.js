import { requireRole } from "@/actions/auth";
import { getAdminNavItems } from "@/actions/dashboard";
import { getWebsiteBranding } from "@/actions/setting";
import AdminShell from "@/components/admin/layout/AdminShell";

export default async function AdminLayout({ children }) {
  const user = await requireRole("admin");
  const [menuItems, websiteConfig] = await Promise.all([getAdminNavItems(), getWebsiteBranding()]);

  return (
    <AdminShell user={user} menuItems={menuItems} websiteConfig={websiteConfig} title='Admin Panel'>
      {children}
    </AdminShell>
  );
}
