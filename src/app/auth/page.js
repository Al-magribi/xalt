import Login from "@/components/auth/Login";
import { getCurrentUser } from "@/actions/auth";
import { getDashboardPathByRole } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function AuthPage({ searchParams }) {
  const user = await getCurrentUser();
  if (user) {
    redirect(getDashboardPathByRole(user.role));
  }

  const params = await searchParams;
  const isActivated = params?.activated === "1";
  const initialMessage = isActivated
    ? "Akun berhasil diaktivasi. Silakan login."
    : "";

  return <Login initialMessage={initialMessage} />;
}
