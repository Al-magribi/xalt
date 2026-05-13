import { requireRole } from "@/actions/auth";

export default async function UserDashPage() {
  const user = await requireRole("user");

  return <div>userDashPage - {user.full_name || user.email}</div>;
}
