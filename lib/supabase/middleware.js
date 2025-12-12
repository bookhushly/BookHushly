const { createServerClient } = require("@supabase/ssr");
const { NextResponse } = require("next/server");

const PROTECTED_ROUTES = ["/dashboard", "/profile", "/settings", "/vendor"];
const PUBLIC_ROUTES = ["/login", "/signup", "/auth"];

async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Check for session cookies BEFORE calling getUser()
  const cookies = request.cookies.getAll();
  const hasSessionCookie = cookies.some(
    (cookie) =>
      cookie.name.startsWith("sb-") && cookie.name.includes("auth-token")
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = PUBLIC_ROUTES.some((route) => path.startsWith(route));

  // KEY CHANGE: Only redirect if there's NO session cookie AND no user
  // If session cookie exists but user is null, let the page load (it's still initializing)
  if (!user && !hasSessionCookie && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // If there's an error and no session cookie, the session is truly invalid
  if (error && !hasSessionCookie && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  if (user && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

module.exports = { updateSession };
