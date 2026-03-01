import { getAdminSettingsData } from "@/actions/setting";
import Setting from "@/components/admin/setting/Setting";

function resolveTab(rawTab) {
  const supportedTabs = new Set(["website", "seo", "integrations", "smtp"]);
  return supportedTabs.has(rawTab) ? rawTab : "website";
}

export default async function AdminSettingPage({ searchParams }) {
  const params = await searchParams;
  const activeTab = resolveTab(params?.tab);
  const data = await getAdminSettingsData();

  return <Setting data={data} activeTab={activeTab} />;
}
