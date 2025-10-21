import { NextRequest, NextResponse } from "next/server";
import { loggedInInvalidRoutes } from "./lib/constants/env";

function hasSessionCookie(req: NextRequest): boolean {
  const sessionCookie = req.cookies.get("better-auth.session_token");
  // Existence check
  return !!sessionCookie?.value;
}

export default async function authMiddleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  // Skip middleware for static files and most API routes
  if (
    pathname.startsWith("/_next") ||
    (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) ||
    pathname.includes("/favicon") ||
    pathname.includes("/static") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Quick cookie check
  const hasSession = hasSessionCookie(req);

  // Handle logged-in users trying to access auth pages
  if (loggedInInvalidRoutes.some((route) => pathname.startsWith(route))) {
    if (hasSession) {
      const redirectUrl = new URL("/dashboard", req.url);
      // Preserve search params
      redirectUrl.search = req.nextUrl.search;
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // Handle protected routes
  const protectedPrefixes = ["/dashboard", "/admin"];
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected) {
    if (!hasSession) {
      const signInUrl = new URL("/sign-in", req.url);
      // Store intended destination for post-login redirect
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  // All other routes - allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/dashboard/:path*",
    "/verify-email",
  ],
};
