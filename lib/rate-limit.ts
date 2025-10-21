import { NextRequest, NextResponse } from "next/server";

// Edge-compatible rate limiting store with automatic cleanup
const rateLimitStore = new Map();
let lastCleanup = Date.now();

// Extracts IP address from NextRequest
function getClientIP(request: NextRequest): string {
  // Check forwarded IP headers (common in production)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback for local development
  return "anonymous";
}

// Cleans up expired rate limit entries to prevent memory leaks
function cleanupExpiredEntries() {
  const now = Date.now();
  // Only cleanup every 5 minutes to avoid performance issues
  if (now - lastCleanup < 5 * 60 * 1000) return;

  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  lastCleanup = now;
}

/**
 * Adds CORS headers to any NextResponse
 * Supports preflight OPTIONS requests and general CORS policy
 * @param response - NextResponse to add headers to
 * @returns Modified NextResponse with CORS headers
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}

/**
 * Handles rate limiting for specific API endpoints
 * Currently configured for email endpoints with different limits for GET/POST
 * @param request - NextRequest to check for rate limiting
 * @returns NextResponse with 429 error if rate limited, null if allowed
 */
export async function handleRateLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  // Only apply rate limiting to API endpoints (except auth)
  if (
    !request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/api/auth")
  ) {
    return null;
  }

  // Cleanup expired entries periodically
  cleanupExpiredEntries();

  const ip = getClientIP(request);
  // FIXED: Include method in key so GET and POST have separate counters
  const key = `${ip}_${request.nextUrl.pathname}_${request.method}`;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = request.method === "POST" ? 10 : 60; // Stricter limit for POST

  // Debugging
  // console.log('🔍 Rate Limit Check:', {
  //   ip,
  //   path: request.nextUrl.pathname,
  //   method: request.method,
  //   key,
  //   maxRequests,
  //   currentCount: rateLimitStore.get(key)?.count || 0
  // });

  if (!rateLimitStore.has(key)) {
    // First request in window
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
  } else {
    const limit = rateLimitStore.get(key);
    if (now > limit.resetTime) {
      // Reset expired window
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    } else if (limit.count >= maxRequests) {
      // Rate limit exceeded - return 429 error
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((limit.resetTime - now) / 1000).toString(),
          },
        }
      );
    } else {
      // Increment counter within window
      limit.count++;
      rateLimitStore.set(key, limit);
    }
  }

  return null; // Request allowed
}

/**
 * Handles OPTIONS preflight requests for CORS
 * @returns NextResponse with CORS headers for OPTIONS requests
 */
export function handleOptionsRequest(): NextResponse {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}
