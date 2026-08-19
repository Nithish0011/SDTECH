import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_TOKEN = "sdtech-admin-2024";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and API routes
  if (pathname === "/admin/login" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Protect all /admin/* routes
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("admin_session")?.value;

    if (session !== ADMIN_TOKEN) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
