// /middleware.js
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/api/wallet",
  "/api/webhooks",
  "/vendor/dashboard",
  "/profile",
  "/settings",
];

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/signup",
  "/auth",
  "/error",
  "/about",
  "/contact",
  "/forgot-password",
  "/reset-password",
  "/terms",
  "/privacy",
];

function isProtectedRoute(pathname) {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip static files, _next, and favicon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              supabaseResponse.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Get session directly (more reliable than getClaims for middleware)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    // 1. Protect routes that require authentication
    if (isProtectedRoute(pathname) && !user) {
      // Check if there's a refresh token cookie indicating recent auth
      const refreshToken = request.cookies.get("sb-refresh-token");
      const accessToken = request.cookies.get("sb-access-token");

      // If tokens exist but session is null, allow the request through
      // The client will handle the loading state and redirect if truly unauthenticated
      if (refreshToken || accessToken) {
        return supabaseResponse;
      }

      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(url);
    }

    // 2. Role-based protection for authenticated users
    if (user) {
      const role = user.user_metadata?.role || "customer";

      // Redirect from auth pages if already logged in
      if (pathname === "/login" || pathname === "/register") {
        const url = request.nextUrl.clone();
        url.pathname =
          role === "vendor" ? "/vendor/dashboard" : `/${role}/dashboard`;
        return NextResponse.redirect(url);
      }

      // Vendor routes protection
      if (pathname.startsWith("/vendor/dashboard") && role !== "vendor") {
        const url = request.nextUrl.clone();
        url.pathname = `/dashboard/${role}`;
        return NextResponse.redirect(url);
      }

      // Admin routes protection
      if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = `/dashboard/${role}`;
        return NextResponse.redirect(url);
      }

      // Customer routes protection
      if (pathname.startsWith("/dashboard/customer") && role === "vendor") {
        const url = request.nextUrl.clone();
        url.pathname = "/vendor/dashboard";
        return NextResponse.redirect(url);
      }
      if (
        pathname.startsWith("/receptionist/dashboard") &&
        role !== "receptionist"
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware error:", error);

    // On error, redirect protected routes to login
    if (isProtectedRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vendor/dashboard/:path*",
    "/receptionist/dashboard/:path*",
  ],
};
