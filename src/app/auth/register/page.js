import RegisterForm from "@/components/auth/RegisterForm";
import { getCurrentUser } from "@/actions/auth";
import { getDashboardPathByRole } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(getDashboardPathByRole(user.role));
  }

  return <RegisterForm />;
}
