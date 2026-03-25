/**
 * GET /api/organizers/[vendorId]/followers
 * Returns the follower count for an organizer. Public endpoint.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request, { params }) {
  const { vendorId } = await params;
  const admin = createAdminClient();

  const { count, error } = await admin
    .from("organizer_follows")
    .select("*", { count: "exact", head: true })
    .eq("vendor_id", vendorId);

  if (error) return NextResponse.json({ count: 0 });
  return NextResponse.json({ count: count || 0 });
}
