export function getDashboardPathByRole(role) {
  return role === "admin" ? "/admin/dashboard" : "/user/dashboard";
}
