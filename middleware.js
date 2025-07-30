import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();

  try {
    const supabase = createMiddlewareClient({ req, res });
    await supabase.auth.getSession();
  } catch (error) {
    res.cookies.set("sb-auth-token", "", {
      path: "/",
      expires: new Date(0),
    });
  }

  return res;
}

export const config = {
  matcher: [
    "/app/:path*", // All paths starting with /app/
    "/((?!api|_next/static|_next/image|favicon.ico).*)", // Explicitly exclude API routes
  ],
};
