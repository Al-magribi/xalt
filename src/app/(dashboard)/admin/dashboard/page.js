import { getAdminDashboardData } from "@/actions/dashboard";
import Dashboard from "@/components/admin/dashboard/Dashboard";

export default async function DashboardPage() {
  const data = await getAdminDashboardData();

  return <Dashboard data={data} />;
}
