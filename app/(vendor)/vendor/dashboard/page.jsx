import { redirect } from "next/navigation";
import VendorDashboardClient from "./client-dashboard";
import { createClient } from "@/lib/supabase/server";

async function getVendorDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Fetch vendor profile
  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  let stats = {
    totalListings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    pendingRequests: 0,
  };

  if (vendor?.approved) {
    // Determine booking table based on vendor business category
    const isEventVendor = vendor.business_category === "events";

    // Fetch listings - corrected field names
    const { data: listingsData } = await supabase
      .from("listings")
      .select("id, title, price, created_at, active, media_urls")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false });

    const listings = listingsData || [];

    // Only fetch bookings if there are listings
    let bookings = [];
    if (listings.length > 0) {
      const listingIds = listings.map((l) => l.id);

      // Fetch bookings based on vendor type - corrected field names
      if (isEventVendor) {
        const { data: eventBookingsData } = await supabase
          .from("event_bookings")
          .select(
            "id, total_amount, booking_date, status, created_at, listing_id"
          )
          .in("listing_id", listingIds)
          .order("created_at", { ascending: false });

        bookings = eventBookingsData || [];
      } else {
        const { data: regularBookingsData } = await supabase
          .from("bookings")
          .select(
            "id, total_amount, booking_date, status, created_at, listing_id"
          )
          .in("listing_id", listingIds)
          .order("created_at", { ascending: false });

        bookings = regularBookingsData || [];
      }

      // Calculate revenue from payments table (only completed payments)
      if (bookings.length > 0) {
        const bookingIds = bookings.map((b) => b.id);

        const { data: paymentsData } = await supabase
          .from("payments")
          .select("amount, vendor_amount, status")
          .eq("status", "completed")
          .or(
            isEventVendor
              ? `event_booking_id.in.(${bookingIds.join(",")})`
              : `booking_id.in.(${bookingIds.join(",")})`
          );

        // Sum up vendor_amount if available, otherwise fall back to full amount
        const revenue = (paymentsData || []).reduce((sum, payment) => {
          return sum + Number(payment.vendor_amount || payment.amount || 0);
        }, 0);

        stats.totalRevenue = revenue;
      }
    }

    // Calculate other stats
    stats.totalListings = listings.length;
    stats.activeBookings = bookings.filter(
      (b) => b.status === "confirmed"
    ).length;
    stats.pendingRequests = bookings.filter(
      (b) => b.status === "pending"
    ).length;
  }

  console.log("Vendor Dashboard Data:", {
    user: user.id,
    vendor: vendor?.id,
    vendorCategory: vendor?.business_category,
    isEventVendor: vendor?.business_category === "events",
    stats,
  });

  return {
    user,
    vendor,
    stats,
  };
}

export default async function VendorDashboardPage() {
  const data = await getVendorDashboardData();

  return <VendorDashboardClient {...data} />;
}
