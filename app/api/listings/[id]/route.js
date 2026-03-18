import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ─── Shared ownership check ──────────────────────────────────────────────────
async function getAuthorizedVendorAndListing(supabase, listingId) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    return { error: "Unauthorized", status: 401 };
  }

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (vendorError) return { error: "Failed to fetch vendor", status: 500 };
  if (!vendor) return { error: "Vendor profile not found", status: 403 };

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, vendor_id")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) return { error: "Failed to fetch listing", status: 500 };
  if (!listing) return { error: "Listing not found", status: 404 };
  if (listing.vendor_id !== vendor.id) return { error: "Forbidden", status: 403 };

  return { vendor, listing };
}

export async function PUT(request, { params }) {
  try {
    const supabase = await createClient();
    const { id: listingId } = await params;

    const auth = await getAuthorizedVendorAndListing(supabase, listingId);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    // Strip fields that should not be overwritten by vendor
    const { id, vendor_id, created_at, ...updateData } = body;

    const { data, error } = await supabase
      .from("listings")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("id", listingId)
      .select()
      .single();

    if (error) {
      console.error("Error updating listing:", error);
      return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error in listings PUT route:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { id: listingId } = await params;

    const auth = await getAuthorizedVendorAndListing(supabase, listingId);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { data: deletedData, error: deleteError } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId)
      .select();

    if (deleteError) {
      console.error("Error deleting listing:", deleteError);
      return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
    }

    return NextResponse.json({ data: deletedData }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error in listings DELETE route:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
