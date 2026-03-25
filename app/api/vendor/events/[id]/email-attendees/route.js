/**
 * POST /api/vendor/events/[id]/email-attendees
 * Sends a custom email to all confirmed attendees of an event.
 * Only the listing's vendor may call this.
 *
 * Scale notes:
 * - Resend batch API: up to 100 emails per request
 * - We chunk into batches of 50 for safety margin
 * - Max 5 email blasts per event per 24 h (stored in listing category_data)
 * - Guest bookings (no customer_id) are reached via contact_email
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "events@bookhushly.com";
const BATCH_SIZE = 50;
const MAX_BLASTS_PER_DAY = 5;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function buildEmailHtml(subject, message, eventTitle, vendorName) {
  const safeMessage = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px 40px">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">${eventTitle}</h1>
      <p style="color:#e9d5ff;margin:8px 0 0;font-size:14px">Message from ${vendorName}</p>
    </div>
    <div style="padding:32px 40px">
      <h2 style="color:#111827;font-size:18px;margin:0 0 16px;font-weight:600">${subject}</h2>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px">${safeMessage}</p>
      <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0">
      <p style="color:#9ca3af;font-size:12px;margin:0">
        You received this because you hold a ticket for <strong>${eventTitle}</strong>.<br>
        Powered by <a href="https://bookhushly.com" style="color:#7c3aed;text-decoration:none">BookHushly</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request, { params }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { subject, message } = body;

  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Subject and message are required" },
      { status: 400 },
    );
  }
  if (subject.length > 150)
    return NextResponse.json({ error: "Subject must be ≤ 150 characters" }, { status: 400 });
  if (message.length > 2000)
    return NextResponse.json({ error: "Message must be ≤ 2000 characters" }, { status: 400 });

  const admin = createAdminClient();

  // Verify vendor owns the listing
  const { data: listing } = await admin
    .from("listings")
    .select("id, title, vendor_id, vendors!inner(user_id, business_name)")
    .eq("id", id)
    .maybeSingle();

  if (!listing || listing.vendors?.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Rate-limit: max MAX_BLASTS_PER_DAY email blasts per event per 24 hours
  // Stored as a simple counter in listing category_data to avoid extra tables
  const blastKey = `email_blasts_${new Date().toISOString().slice(0, 10)}`; // "2026-01-15"
  const categoryData = listing.category_data || {};
  const todayBlasts = categoryData[blastKey] || 0;
  if (todayBlasts >= MAX_BLASTS_PER_DAY) {
    return NextResponse.json(
      { error: `You can send at most ${MAX_BLASTS_PER_DAY} email blasts per event per day` },
      { status: 429 },
    );
  }

  // Fetch confirmed attendees — include guest bookings via contact_email
  const { data: bookings, error: bookingErr } = await admin
    .from("event_bookings")
    .select("customer_id, contact_email, users:customer_id(email)")
    .eq("listing_id", id)
    .in("status", ["confirmed", "completed"]);

  if (bookingErr) {
    console.error("[email-attendees]", bookingErr.message);
    return NextResponse.json({ error: "Failed to fetch attendees" }, { status: 500 });
  }

  if (!bookings?.length) {
    return NextResponse.json({ sent: 0, message: "No confirmed attendees to email." });
  }

  // Collect unique emails (prefer auth user email; fall back to contact_email)
  const emailSet = new Set();
  for (const b of bookings) {
    const addr = b.users?.email || b.contact_email;
    if (addr && /^\S+@\S+\.\S+$/.test(addr)) emailSet.add(addr.toLowerCase());
  }
  const allEmails = [...emailSet];

  if (!allEmails.length) {
    return NextResponse.json({ sent: 0, message: "No valid email addresses found." });
  }

  const html = buildEmailHtml(
    subject.trim(),
    message.trim(),
    listing.title,
    listing.vendors?.business_name || "The Organizer",
  );

  // Send in batches
  let sent = 0;
  let failed = 0;
  const batches = chunk(allEmails, BATCH_SIZE);

  for (const batch of batches) {
    try {
      const batchPayload = batch.map((to) => ({
        from: FROM_EMAIL,
        to,
        subject: `[${listing.title}] ${subject.trim()}`,
        html,
      }));
      const result = await resend.batch.send(batchPayload);
      sent += result?.data?.length ?? batch.length;
    } catch (err) {
      console.error("[email-attendees] batch error:", err.message);
      failed += batch.length;
    }
  }

  // Persist blast count (fire-and-forget, non-critical)
  admin
    .from("listings")
    .update({
      category_data: { ...categoryData, [blastKey]: todayBlasts + 1 },
    })
    .eq("id", id)
    .then(() => {})
    .catch(() => {});

  return NextResponse.json({
    sent,
    failed,
    total: allEmails.length,
    remaining_today: MAX_BLASTS_PER_DAY - todayBlasts - 1,
  });
}
