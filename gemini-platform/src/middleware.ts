
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;

  // 1. Static Files & Public API Routes - Allow Access
  if (
    currentPath.startsWith("/_next") || 
    currentPath.startsWith("/static") || 
    currentPath.startsWith("/favicon.ico") || 
    currentPath.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // 2. Protect Admin Routes (Existing Custom Logic)
  if (currentPath.startsWith("/admin") || currentPath.startsWith("/api/admin")) {
    
    // Exception: Allow access to login page and login API
    if (currentPath === "/admin/login" || currentPath === "/api/admin/login") {
      return NextResponse.next();
    }

    // Check for session cookie
    const adminSession = request.cookies.get("admin_session");
    
    if (!adminSession) {
      if (currentPath.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "content-type": "application/json" } }
        );
      }
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Protect User Routes (Main App) - NextAuth Protection
  // Allow Auth Routes & Setup
  if (
    currentPath.startsWith("/auth") || 
    currentPath.startsWith("/api/auth") || 
    currentPath.startsWith("/api/setup-db")
  ) {
    return NextResponse.next();
  }

  // Check for NextAuth session token
  // Use generic secret if not defined, but ideally NEXTAUTH_SECRET is set
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req: request, secret });

  if (!token) {
    
    // API request without token -> 401
    if (currentPath.startsWith("/api/")) {
       return new NextResponse(
         JSON.stringify({ error: "Unauthorized" }),
         { status: 401, headers: { "content-type": "application/json" } }
       );
    }
    
    // Human request without token -> Redirect to Login
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", currentPath);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  // Catch-all matcher excluding specific static paths
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

