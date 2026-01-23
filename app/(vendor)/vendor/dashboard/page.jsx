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
    // Determine vendor type
    const isEventVendor = vendor.business_category === "events";
    const isHotelVendor = vendor.business_category === "hotels";
    const isApartmentVendor =
      vendor.business_category === "serviced_apartments";

    let listings = [];
    let bookings = [];

    // HOTELS LOGIC
    if (isHotelVendor) {
      const { data: hotelsData } = await supabase
        .from("hotels")
        .select("id, name, city, state, image_urls, created_at")
        .eq("vendor_id", user?.id)
        .order("created_at", { ascending: false });

      listings = hotelsData || [];

      // Fetch hotel bookings (if you have a hotel_bookings table)
      // For now, we'll skip bookings for hotels as they're handled differently
    }
    // SERVICED APARTMENTS LOGIC
    else if (isApartmentVendor) {
      const { data: apartmentsData } = await supabase
        .from("serviced_apartments")
        .select(
          "id, name, city, state, area, image_urls, price_per_night, created_at, status"
        )
        .eq("vendor_id", user?.id)
        .order("created_at", { ascending: false });

      listings = apartmentsData || [];

      // Fetch apartment bookings
      if (listings.length > 0) {
        const apartmentIds = listings.map((a) => a.id);

        const { data: apartmentBookingsData } = await supabase
          .from("apartment_bookings")
          .select(
            "id, total_amount, check_in_date, booking_status, payment_status, created_at, apartment_id"
          )
          .in("apartment_id", apartmentIds)
          .order("created_at", { ascending: false });

        bookings = apartmentBookingsData || [];

        // Calculate revenue from apartment bookings
        const revenue = bookings
          .filter((b) => b.payment_status === "paid")
          .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

        stats.totalRevenue = revenue;
        stats.activeBookings = bookings.filter(
          (b) =>
            b.booking_status === "confirmed" ||
            b.booking_status === "checked_in"
        ).length;
        stats.pendingRequests = bookings.filter(
          (b) => b.booking_status === "pending"
        ).length;
      }
    }
    // REGULAR LISTINGS LOGIC (Events, Logistics, Security, etc)
    else {
      const { data: listingsData } = await supabase
        .from("listings")
        .select("id, title, price, created_at, active, media_urls")
        .eq("vendor_id", vendor.id)
        .order("created_at", { ascending: false });

      listings = listingsData || [];

      // Fetch bookings based on vendor type
      if (listings.length > 0) {
        const listingIds = listings.map((l) => l.id);

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

        // Calculate revenue from payments table
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

          const revenue = (paymentsData || []).reduce((sum, payment) => {
            return sum + Number(payment.vendor_amount || payment.amount || 0);
          }, 0);

          stats.totalRevenue = revenue;
        }

        stats.activeBookings = bookings.filter(
          (b) => b.status === "confirmed"
        ).length;
        stats.pendingRequests = bookings.filter(
          (b) => b.status === "pending"
        ).length;
      }
    }

    // Set total listings count
    stats.totalListings = listings.length;
  }

  console.log("Vendor Dashboard Data:", {
    user: user?.id,
    vendor: vendor?.id,
    vendorCategory: vendor?.business_category,
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
