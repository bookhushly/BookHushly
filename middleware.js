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

function isProtectedRoute(pathname) {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // CRITICAL: Use getUser() not getSession() in middleware
  // getUser() validates the JWT and refreshes if needed
  // getSession() only reads from storage without validation
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Protect routes that require authentication
  if (isProtectedRoute(pathname) && !user) {
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
        role === "vendor" ? "/vendor/dashboard" : `/dashboard/${role}`;
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

    // Receptionist routes protection
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
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vendor/dashboard/:path*",
    "/receptionist/dashboard/:path*",
  ],
};
