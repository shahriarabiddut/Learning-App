import { Session } from "@/lib/better-auth/auth-types";
import { loggedInInvalidRoutes } from "@/lib/constants/env";
import {
  addCorsHeaders,
  handleOptionsRequest,
  handleRateLimit,
} from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

async function getMiddlewareSession(req: NextRequest) {
  const response = await fetch(`${req.nextUrl.origin}/api/auth/get-session`, {
    headers: {
      cookie: req.headers.get("cookie") || "",
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch session: ${response.status}`);
    return null;
  }

  const data = await response.json();

  // Check if data is wrapped in { data: session } or is the session directly
  const session = data?.data ?? data;

  return session as Session | null;
}

export default async function authMiddleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Handle OPTIONS requests first
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }

  // Apply rate limiting to API routes (except auth)
  const rateLimitResponse = await handleRateLimit(req);
  if (rateLimitResponse) {
    return addCorsHeaders(rateLimitResponse);
  }

  // Skip auth checks for API routes, static files, etc.
  if (
    (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    const response = NextResponse.next();
    return addCorsHeaders(response);
  }

  // Only check session for protected routes
  const session = await getMiddlewareSession(req);
  const url = req.url;

  if (loggedInInvalidRoutes.some((route) => pathname.startsWith(route))) {
    if (session) {
      const response = NextResponse.redirect(new URL("/dashboard", url));
      return addCorsHeaders(response);
    }
    const response = NextResponse.next();
    return addCorsHeaders(response);
  }

  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const response = NextResponse.redirect(new URL("/sign-in", url));
      return addCorsHeaders(response);
    }
    const response = NextResponse.next();
    return addCorsHeaders(response);
  }

  // For all other routes, add CORS headers and continue
  const response = NextResponse.next();
  return addCorsHeaders(response);
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/sign-in",
    "/sign-up",
    "/forget-password",
    "/verify-email",
    // API routes (for rate limiting, excluding auth)
    "/api/((?!auth).*)",
    // OR regex for advanced matching:
    "/((?!api|trpc|_next/static|_next/image|favicon.ico).*)",
  ],
};
