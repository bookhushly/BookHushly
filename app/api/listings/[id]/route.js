import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();

    // Get session from cookies (server client)
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Error fetching session in API route:", sessionError);
      return NextResponse.json(
        { error: "Failed to verify session" },
        { status: 500 }
      );
    }

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch vendor record for this user
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (vendorError) {
      console.error("Error fetching vendor in API route:", vendorError);
      return NextResponse.json(
        { error: "Failed to fetch vendor" },
        { status: 500 }
      );
    }

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor profile not found" },
        { status: 403 }
      );
    }

    const listingId = params.id;

    // Ensure the listing belongs to the vendor
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, vendor_id")
      .eq("id", listingId)
      .maybeSingle();

    if (listingError) {
      console.error("Error fetching listing in API route:", listingError);
      return NextResponse.json(
        { error: "Failed to fetch listing" },
        { status: 500 }
      );
    }

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.vendor_id !== vendor.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Perform the delete
    const { data: deletedData, error: deleteError } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId)
      .select();

    if (deleteError) {
      console.error("Error deleting listing in API route:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete listing" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: deletedData }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error in listings DELETE route:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
