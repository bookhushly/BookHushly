import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const LOCK_DURATION_MINUTES = 15;

/**
 * GET /api/listings/lock?listing_id=&listing_type=
 * Check whether a listing is currently locked by another user.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const listing_id = searchParams.get("listing_id");
    const listing_type = searchParams.get("listing_type");

    if (!listing_id || !listing_type) {
      return NextResponse.json({ error: "listing_id and listing_type are required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: lock } = await supabase
      .from("booking_locks")
      .select("id, user_id, expires_at")
      .eq("listing_id", listing_id)
      .eq("listing_type", listing_type)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (!lock) {
      return NextResponse.json({ locked: false });
    }

    const isOwnLock = user && lock.user_id === user.id;
    return NextResponse.json({
      locked: true,
      is_own_lock: isOwnLock,
      expires_at: lock.expires_at,
      lock_id: isOwnLock ? lock.id : undefined,
    });
  } catch (error) {
    console.error("Lock check error:", error);
    return NextResponse.json({ error: "Failed to check lock status" }, { status: 500 });
  }
}

/**
 * POST /api/listings/lock
 * Acquire a lock on a listing when the user starts the payment flow.
 * Body: { listing_id, listing_type, booking_id? }
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { listing_id, listing_type, booking_id } = await request.json();

    if (!listing_id || !listing_type) {
      return NextResponse.json({ error: "listing_id and listing_type are required" }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + LOCK_DURATION_MINUTES * 60 * 1000);

    // Clean up any expired locks for this listing first
    await supabase
      .from("booking_locks")
      .delete()
      .eq("listing_id", listing_id)
      .eq("listing_type", listing_type)
      .lt("expires_at", now.toISOString());

    // Remove caller's own existing lock on this listing (refresh)
    await supabase
      .from("booking_locks")
      .delete()
      .eq("listing_id", listing_id)
      .eq("listing_type", listing_type)
      .eq("user_id", user.id);

    // Try to acquire lock
    const { data: lock, error: lockError } = await supabase
      .from("booking_locks")
      .insert({
        listing_id,
        listing_type,
        user_id: user.id,
        booking_id: booking_id || null,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (lockError) {
      // Unique constraint violation — another user locked it first
      if (lockError.code === "23505") {
        const { data: existing } = await supabase
          .from("booking_locks")
          .select("expires_at")
          .eq("listing_id", listing_id)
          .eq("listing_type", listing_type)
          .gt("expires_at", now.toISOString())
          .maybeSingle();

        return NextResponse.json(
          {
            error: "This listing is currently being booked by another user",
            locked_until: existing?.expires_at,
          },
          { status: 409 },
        );
      }
      throw lockError;
    }

    return NextResponse.json({
      success: true,
      lock_id: lock.id,
      expires_at: lock.expires_at,
      duration_minutes: LOCK_DURATION_MINUTES,
    });
  } catch (error) {
    console.error("Lock creation error:", error);
    return NextResponse.json({ error: "Failed to acquire lock" }, { status: 500 });
  }
}

/**
 * DELETE /api/listings/lock
 * Release a lock after payment is confirmed or abandoned.
 * Body: { lock_id } or { listing_id, listing_type }
 */
export async function DELETE(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();

    let query = supabase.from("booking_locks").delete().eq("user_id", user.id);

    if (body.lock_id) {
      query = query.eq("id", body.lock_id);
    } else if (body.listing_id && body.listing_type) {
      query = query.eq("listing_id", body.listing_id).eq("listing_type", body.listing_type);
    } else {
      return NextResponse.json({ error: "lock_id or listing_id + listing_type required" }, { status: 400 });
    }

    await query;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lock release error:", error);
    return NextResponse.json({ error: "Failed to release lock" }, { status: 500 });
  }
}
