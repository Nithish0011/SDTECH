import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_TOKEN = "Kumar@123";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect ALL /admin/* routes - no exceptions
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("admin_session")?.value;

    if (session !== ADMIN_TOKEN) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
