/**
 * POST /api/organizers/[vendorId]/follow
 * Toggles follow/unfollow for the authenticated user.
 * Returns { following: boolean }
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifySystem } from "@/lib/notifications";

export async function POST(request, { params }) {
  const { vendorId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Check existing follow
  const { data: existing } = await admin
    .from("organizer_follows")
    .select("id")
    .eq("user_id", user.id)
    .eq("vendor_id", vendorId)
    .maybeSingle();

  if (existing) {
    // Unfollow
    await admin.from("organizer_follows").delete().eq("id", existing.id);
    return NextResponse.json({ following: false });
  }

  // Follow
  const { error } = await admin
    .from("organizer_follows")
    .insert({ user_id: user.id, vendor_id: vendorId });

  if (error) {
    console.error("[organizer-follow]", error.message);
    return NextResponse.json({ error: "Failed to follow" }, { status: 500 });
  }

  // Notify vendor of new follower
  const { data: vendor } = await admin
    .from("vendors")
    .select("user_id")
    .eq("id", vendorId)
    .maybeSingle();

  if (vendor?.user_id) {
    const { data: follower } = await admin
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    notifySystem(vendor.user_id, {
      title: "New Follower",
      message: `${follower?.full_name || "Someone"} is now following your events.`,
      link: `/vendor/dashboard`,
    }).catch(() => {});
  }

  return NextResponse.json({ following: true });
}
