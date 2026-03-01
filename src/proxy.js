import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "xalt_session";

export function proxy(request) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  const isProtectedDashboardPath =
    pathname.startsWith("/admin/dashboard") ||
    pathname.startsWith("/user/dashboard");

  if (isProtectedDashboardPath && !token) {
    const loginUrl = new URL("/auth", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth",
    "/auth/register",
    "/admin/dashboard/:path*",
    "/user/dashboard/:path*",
  ],
};
