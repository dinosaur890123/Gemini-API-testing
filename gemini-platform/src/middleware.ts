
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;

  // 1. Protect ALL admin routes (UI and API)
  if (currentPath.startsWith("/admin") || currentPath.startsWith("/api/admin")) {
    
    // Exception: Allow access to login page and login API
    if (currentPath === "/admin/login" || currentPath === "/api/admin/login") {
      return NextResponse.next();
    }

    // Check for session cookie
    const adminSession = request.cookies.get("admin_session");
    
    if (!adminSession) {
      // API routes should return 401 JSON
      if (currentPath.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "content-type": "application/json" } }
        );
      }

      // Pages should redirect to login UI
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

