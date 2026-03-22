/**
 * POST /api/events/[id]/waitlist/notify
 * Called internally (by the vendor's ticket-count update) to notify all waitlisted users.
 * Secured: only the listing's vendor (via session) or service-role key may call this.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifySystem } from "@/lib/notifications";

export async function POST(request, { params }) {
  const { id } = await params;

  // Verify caller owns this listing
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Confirm vendor owns the listing
  const { data: listing } = await admin
    .from("listings")
    .select("id, title, vendor_id, vendors!inner(user_id)")
    .eq("id", id)
    .maybeSingle();

  if (!listing || listing.vendors?.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch the waitlist (only un-notified entries)
  const { data: waitlist } = await admin
    .from("event_waitlist")
    .select("id, user_id, email, name")
    .eq("listing_id", id)
    .is("notified_at", null);

  if (!waitlist?.length) {
    return NextResponse.json({ notified: 0 });
  }

  const results = await Promise.allSettled(
    waitlist.map(async (entry) => {
      if (entry.user_id) {
        await notifySystem(entry.user_id, {
          title: "Tickets available again!",
          message: `Good news — tickets for "${listing.title}" are available again. Grab yours before they sell out!`,
          link: `/services/${id}`,
        });
      }
      // Mark as notified regardless (even guests get the notification via email in future)
      await admin
        .from("event_waitlist")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", entry.id);
    })
  );

  const notified = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ notified });
}
