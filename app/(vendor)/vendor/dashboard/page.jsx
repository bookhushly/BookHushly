import { redirect } from "next/navigation";
import VendorDashboardClient from "./client-dashboard";
import { createClient } from "@/lib/supabase/server";

// Fetch vendor dashboard data WITHOUT caching (since we need cookies for auth)
async function fetchVendorDashboardData(supabase, vendorId, businessCategory) {
  let stats = {
    totalListings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    pendingRequests: 0,
  };

  let listings = [];
  let bookings = [];

  const isEventVendor = businessCategory === "events";
  const isHotelVendor = businessCategory === "hotels";
  const isApartmentVendor = businessCategory === "serviced_apartments";

  // HOTELS LOGIC
  if (isHotelVendor) {
    const { data: hotelsData } = await supabase
      .from("hotels")
      .select("id, name, city, state, image_urls, created_at")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(10);

    listings = hotelsData || [];
    stats.totalListings = listings.length;

    // TODO: Hotel bookings
  }
  // SERVICED APARTMENTS LOGIC
  else if (isApartmentVendor) {
    const { data: apartmentsData } = await supabase
      .from("serviced_apartments")
      .select(
        "id, name, city, state, area, image_urls, price_per_night, created_at, status, bedrooms",
      )
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(10);

    listings = apartmentsData || [];
    stats.totalListings = listings.length;

    // Fetch apartment bookings
    if (listings.length > 0) {
      const apartmentIds = listings.map((a) => a.id);

      const { data: apartmentBookingsData } = await supabase
        .from("apartment_bookings")
        .select(
          "id, total_amount, check_in_date, booking_status, payment_status, created_at, apartment_id, serviced_apartments(name, image_urls)",
        )
        .in("apartment_id", apartmentIds)
        .order("created_at", { ascending: false })
        .limit(10);

      // Normalize to match the shape other booking types use
      bookings = (apartmentBookingsData || []).map((b) => ({
        ...b,
        status: b.booking_status,
        booking_date: b.check_in_date,
        listings: b.serviced_apartments
          ? {
              title: b.serviced_apartments.name,
              media_urls: b.serviced_apartments.image_urls,
            }
          : null,
      }));

      // Calculate revenue
      const revenue = bookings
        .filter((b) => b.payment_status === "completed")
        .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

      stats.totalRevenue = revenue;
      stats.activeBookings = bookings.filter(
        (b) =>
          b.booking_status === "confirmed" || b.booking_status === "checked_in",
      ).length;
      stats.pendingRequests = bookings.filter(
        (b) => b.booking_status === "pending",
      ).length;
    }
  }
  // REGULAR LISTINGS LOGIC
  else {
    const { data: listingsData } = await supabase
      .from("listings")
      .select("id, title, price, created_at, active, media_urls, vendor_id")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(10);

    listings = listingsData || [];
    stats.totalListings = listings.length;

    // Fetch bookings
    if (listings.length > 0) {
      const listingIds = listings.map((l) => l.id);

      if (isEventVendor) {
        const { data: eventBookingsData } = await supabase
          .from("event_bookings")
          .select(
            "id, total_amount, booking_date, status, created_at, listing_id, listings(title, media_urls)",
          )
          .in("listing_id", listingIds)
          .order("created_at", { ascending: false })
          .limit(10);

        bookings = eventBookingsData || [];
      } else {
        const { data: regularBookingsData } = await supabase
          .from("bookings")
          .select(
            "id, total_amount, booking_date, status, created_at, listing_id, listings(title, media_urls)",
          )
          .in("listing_id", listingIds)
          .order("created_at", { ascending: false })
          .limit(10);

        bookings = regularBookingsData || [];
      }

      // Calculate revenue
      if (bookings.length > 0) {
        const bookingIds = bookings.map((b) => b.id);

        const { data: paymentsData } = await supabase
          .from("payments")
          .select("amount, vendor_amount, status")
          .eq("status", "completed")
          .or(
            isEventVendor
              ? `event_booking_id.in.(${bookingIds.join(",")})`
              : `booking_id.in.(${bookingIds.join(",")})`,
          );

        const revenue = (paymentsData || []).reduce((sum, payment) => {
          return sum + Number(payment.vendor_amount || payment.amount || 0);
        }, 0);

        stats.totalRevenue = revenue;
      }

      stats.activeBookings = bookings.filter(
        (b) => b.status === "confirmed",
      ).length;
      stats.pendingRequests = bookings.filter(
        (b) => b.status === "pending",
      ).length;
    }
  }

  return { stats, listings, bookings };
}

async function getVendorDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch vendor profile
  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  // Fetch dashboard data if vendor is approved
  let stats = {
    totalListings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    pendingRequests: 0,
  };
  let listings = [];
  let bookings = [];

  if (vendor?.approved) {
    const dashboardData = await fetchVendorDashboardData(
      supabase,
      vendor.id,
      vendor.business_category,
    );
    stats = dashboardData.stats;
    listings = dashboardData.listings;
    bookings = dashboardData.bookings;
  }

  return {
    user,
    vendor,
    stats,
    listings,
    bookings,
  };
}

// CRITICAL: Must be dynamic for authenticated pages
export const dynamic = "force-dynamic";

export default async function VendorDashboardPage() {
  const data = await getVendorDashboardData();
  return <VendorDashboardClient {...data} />;
}
