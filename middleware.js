// middleware.js
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Validate environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Define routes that REQUIRE authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/api/wallet",
  "/api/webhooks",
  "/profile",
  "/settings",
];

// Define public routes (explicitly allowed without auth)
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/auth",
  "/error",
  "/signup",
  "/about",
  "/contact",
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

  try {
    // If Supabase is not configured, allow all requests to proceed
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.warn("Supabase not configured - allowing all requests");
      return NextResponse.next({ request });
    }

    const supabaseResponse = await updateSession(request);
    return supabaseResponse;
  } catch (error) {
    console.error("Middleware error:", {
      message: error.message,
      path: pathname,
      method: request.method,
    });

    // Only redirect to error page for protected routes
    // Public routes should still work even if auth fails
    if (isProtectedRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectedFrom", pathname);
      url.searchParams.set("error", "authentication_required");
      return NextResponse.redirect(url);
    }

    // For public routes, allow access even if auth fails
    return NextResponse.next({ request });
  }
}

async function updateSession(request) {
  const pathname = request.nextUrl.pathname;
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          supabaseResponse.cookies.set(name, value, {
            ...options,
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "lax",
            path: "/",
          });
        });
      },
    },
  });

  // Try to get user, but don't fail if there's no session
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.warn("Supabase auth warning:", {
        message: error.message,
        path: pathname,
      });
    } else {
      user = data?.user;
    }
  } catch (error) {
    console.warn("Failed to fetch user session:", error.message);
  }

  // Only enforce authentication on protected routes
  if (!user && isProtectedRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    url.searchParams.set("error", "authentication_required");
    return NextResponse.redirect(url);
  }

  // Allow access to all other routes (including public routes)
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/wallet/:path*",
    "/api/webhooks/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
