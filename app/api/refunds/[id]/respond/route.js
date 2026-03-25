/**
 * POST /api/refunds/[id]/respond
 * Vendor approves or denies a refund request.
 *
 * Body: { action: "approve" | "deny", vendor_note?: string }
 *
 * On approve:
 * - Sets booking.status = "cancelled", payment_status = "refunded"
 * - Sets refund_request.status = "approved"
 * - Notifies customer
 *
 * On deny:
 * - Sets refund_request.status = "denied"
 * - Notifies customer with vendor note
 *
 * NOTE: Actual payment reversal (Paystack/NOWPayments refund API) must be
 * initiated manually by the vendor / admin for now — payment gateway refunds
 * are handled out-of-band. This endpoint marks the intent only.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifySystem } from "@/lib/notifications";

export async function POST(request, { params }) {
  const { id: refundRequestId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { action, vendor_note } = body;

  if (!["approve", "deny"].includes(action)) {
    return NextResponse.json({ error: "action must be 'approve' or 'deny'" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch refund request with associated listing for vendor auth check
  const { data: refund } = await admin
    .from("refund_requests")
    .select(
      "id, booking_id, listing_id, customer_id, contact_email, status, listings:listing_id(title, vendors!inner(user_id))",
    )
    .eq("id", refundRequestId)
    .maybeSingle();

  if (!refund) return NextResponse.json({ error: "Refund request not found" }, { status: 404 });
  if (refund.status !== "pending") {
    return NextResponse.json({ error: "This request has already been resolved" }, { status: 409 });
  }

  // Must be the event vendor
  if (refund.listings?.vendors?.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date().toISOString();
  const newStatus = action === "approve" ? "approved" : "denied";

  // Update refund request
  const { error: refundErr } = await admin
    .from("refund_requests")
    .update({ status: newStatus, vendor_note: vendor_note?.trim() || null, resolved_at: now })
    .eq("id", refundRequestId);

  if (refundErr) {
    console.error("[refund-respond]", refundErr.message);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // On approve: cancel the booking
  if (action === "approve") {
    await admin
      .from("event_bookings")
      .update({ status: "cancelled", payment_status: "refunded" })
      .eq("id", refund.booking_id)
      .catch(() => {});
  }

  // Notify customer
  const eventTitle = refund.listings?.title ?? "your event";
  const notifPayload =
    action === "approve"
      ? {
          title: "Refund Approved",
          message: `Your refund request for "${eventTitle}" has been approved. The refund will be processed within 3–5 business days.`,
          link: "/dashboard/customer/events",
        }
      : {
          title: "Refund Request Denied",
          message: `Your refund request for "${eventTitle}" was not approved${vendor_note ? `: ${vendor_note.trim()}` : "."}`,
          link: "/dashboard/customer/events",
        };

  if (refund.customer_id) {
    notifySystem(refund.customer_id, notifPayload).catch(() => {});
  }

  return NextResponse.json({ status: newStatus });
}
