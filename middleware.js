import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Define routes that REQUIRE authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/api/wallet",
  "/api/webhooks",
  "/profile",
  "/settings",
  "/vendor/dashboard",
];

// Define public routes (explicitly allowed without auth)
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/auth",
  "/error",
  "/signup",
  "/about",
  "/contact",
  "/forgot-password",
  "/reset-password",
  "/terms",
  "/privacy",
];

// Helper function to check if a path requires authentication
function isProtectedRoute(pathname) {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

// Helper function to check if a path is explicitly public
function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // Skip static/api
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  try {
    let supabaseResponse = NextResponse.next({
      request,
    });

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

    // ✅ FIX: Use getSession() for better reliability
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    // 1. Protect routes that require authentication
    if (isProtectedRoute(pathname) && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(url);
    }

    // 2. Role-based protection
    if (user) {
      const role = user.user_metadata?.role || "customer";

      // Vendor routes protection
      if (pathname.startsWith("/vendor/dashboard") && role !== "vendor") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard/customer";
        return NextResponse.redirect(url);
      }

      // Admin routes protection
      if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard/customer";
        return NextResponse.redirect(url);
      }

      // Customer routes protection (prevent vendors from accessing customer dashboard)
      if (pathname.startsWith("/dashboard/customer") && role === "vendor") {
        const url = request.nextUrl.clone();
        url.pathname = "/vendor/dashboard";
        return NextResponse.redirect(url);
      }
    }

    // 3. Redirect authenticated users away from auth pages
    if ((pathname === "/login" || pathname === "/register") && user) {
      const role = user.user_metadata?.role || "customer";
      const url = request.nextUrl.clone();
      url.pathname =
        role === "vendor" ? "/vendor/dashboard" : `/dashboard/${role}`;
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware error:", error);

    // ✅ FIX: On error, redirect protected routes to login
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
  matcher: ["/dashboard/:path*", "/vendor/dashboard/:path*"],
};
