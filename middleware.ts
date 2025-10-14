import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { Session } from "@/lib/better-auth/auth-types";
import { loggedInInvalidRoutes } from "./lib/constants/env";

async function getMiddlewareSession(req: NextRequest) {
  const { data: session } = await axios.get<Session>("/api/auth/get-session", {
    baseURL: req.nextUrl.origin,
    headers: {
      //get the cookie from the request
      cookie: req.headers.get("cookie") || "",
    },
  });

  return session;
}

export default async function authMiddleware(req: NextRequest) {
  const session = await getMiddlewareSession(req);
  const url = req.url;
  const pathname = req.nextUrl.pathname;

  if (loggedInInvalidRoutes.some((route) => pathname.startsWith(route))) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", url));
    }
    return NextResponse.next();
  }
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    // OR regex for advanced matching:
    "/((?!api|trpc|_next/static|_next/image|favicon.ico).*)",
  ],
};
