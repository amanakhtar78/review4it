import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

async function verifyToken(authHeader: string | null) {
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer "))
    return null;
  const token = authHeader.slice(7);
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET ||
        "your-default-secret-key-that-is-at-least-32-chars-long"
    );
    const { payload } = await jwtVerify(token, secret);
    return payload as any;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  // Admin-only API prefixes (all methods require admin)
  const adminOnlyPrefixes = ["/api/admins"];

  // Write-protected prefixes (POST/PUT/DELETE require any valid token; adjust to admin if needed)
  const writeProtectedPrefixes = [
    "/api/movies",
    "/api/movieseries",
    "/api/cast",
    "/api/earnings",
    "/api/actors/earnings",
    "/api/quizzes",
    "/api/users/actions",
  ];

  const isAdminOnly = adminOnlyPrefixes.some((p) => pathname.startsWith(p));
  const isWriteMethod = method !== "GET" && method !== "OPTIONS";
  const isWriteProtected = writeProtectedPrefixes.some((p) =>
    pathname.startsWith(p)
  );

  // Determine if this request needs auth
  const needsAuth = isAdminOnly || (isWriteMethod && isWriteProtected);
  if (!needsAuth) {
    return NextResponse.next();
  }

  const payload = await verifyToken(request.headers.get("authorization"));
  if (!payload) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (isAdminOnly && payload.isAdmin !== true) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
