import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/** Dev uses `-H 127.0.0.1`; next-intl rewrites use `request.url` as base. If the client hits `localhost`, rewrites become `http://localhost:…` and Next tries to HTTP-proxy to ::1, which fails. */
function normalizeDevHost(request: NextRequest): NextRequest {
  const hostname = request.nextUrl.hostname;
  if (hostname !== "localhost" && hostname !== "::1") {
    return request;
  }
  const url = request.nextUrl.clone();
  url.hostname = "127.0.0.1";
  return new NextRequest(url, { headers: request.headers, method: request.method });
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Archi-Client",
};

export default function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/download")) {
    return NextResponse.next();
  }
  if (request.nextUrl.pathname.startsWith("/api")) {
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
    }
    const res = NextResponse.next();
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }
  return intlMiddleware(normalizeDevHost(request));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
