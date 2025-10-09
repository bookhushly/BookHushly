import { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/app/:path*",
    "/dashboard/:path*",
    "/api/wallet/:path*", // Include wallet API routes
    "/api/webhooks/:path*", // Include webhook routes
    "/((?!_next/static|_next/image|favicon.ico).*)", // Exclude static files
  ],
};
