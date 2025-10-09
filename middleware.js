// middleware.js
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Validate environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase environment variables:", {
    url: SUPABASE_URL,
    key: SUPABASE_KEY,
  });
  throw new Error("Supabase configuration is incomplete");
}

export async function middleware(request) {
  try {
    const supabaseResponse = await updateSession(request);
    return supabaseResponse;
  } catch (error) {
    console.error("Middleware error:", {
      message: error.message,
      path: request.nextUrl.pathname,
      method: request.method,
    });
    const url = request.nextUrl.clone();
    url.pathname = "/error";
    url.searchParams.set("message", "An unexpected error occurred");
    return NextResponse.redirect(url);
  }
}

async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        const cookies = request.cookies.getAll();
        console.log("Cookies retrieved:", cookies);
        return cookies;
      },
      setAll(cookiesToSet) {
        console.log("Cookies to set:", cookiesToSet);
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

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Supabase auth error:", {
      message: error.message,
      path: request.nextUrl.pathname,
    });
    throw new Error("Failed to fetch user session");
  }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/error")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

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
