import { getAdminProfileData } from "@/actions/auth";
import AdminProfile from "@/components/admin/profile/AdminProfile";

export default async function AdminProfilePage() {
  const profile = await getAdminProfileData();
  return <AdminProfile profile={profile} />;
}
