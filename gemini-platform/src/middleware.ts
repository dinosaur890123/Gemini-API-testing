
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;

  // 1. Protect all /admin routes
  if (currentPath.startsWith("/admin")) {
    
    // Exception: Allow access to login page
    if (currentPath === "/admin/login") {
      return NextResponse.next();
    }

    // Check for session cookie
    const adminSession = request.cookies.get("admin_session");
    
    if (!adminSession) {
      // Redirect to login if cookie is missing
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};

