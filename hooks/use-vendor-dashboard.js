// lib/hooks/useVendorDashboard.js
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const supabase = createClient();

// Query keys
export const vendorDashboardKeys = {
  all: ["vendor-dashboard"],
  listings: (vendorId, category) => [
    ...vendorDashboardKeys.all,
    "listings",
    vendorId,
    category,
  ],
  bookings: (vendorId, category) => [
    ...vendorDashboardKeys.all,
    "bookings",
    vendorId,
    category,
  ],
  stats: (vendorId) => [...vendorDashboardKeys.all, "stats", vendorId],
};

// Fetch listings based on vendor category
async function fetchListings(vendorId, category) {
  if (!vendorId || !category) return [];
  console.log("id", vendorId);

  if (category === "hotels") {
    const { data, error } = await supabase
      .from("hotels")
      .select(
        "id, name, description, address, city, state, image_urls, amenities, created_at",
      )
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((hotel) => ({
      id: hotel.id,
      title: hotel.name,
      city: hotel.city,
      price: null,
      created_at: hotel.created_at,
      active: hotel.status === "active",
      media_urls: hotel.image_urls,
      category: "hotels",
      description: hotel.description,
      location: `${hotel.city}, ${hotel.state}`,
    }));
  }

  if (category === "serviced_apartments") {
    const { data, error } = await supabase
      .from("serviced_apartments")
      .select(
        "id, name, city, state, area, bedrooms, bathrooms, max_guests, price_per_night, price_per_month, image_urls, status, created_at",
      )
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((apt) => ({
      id: apt.id,
      title: apt.name,
      city: apt.city,
      area: apt.area,
      price: apt.price_per_night,
      price_monthly: apt.price_per_month,
      bedrooms: apt.bedrooms,
      bathrooms: apt.bathrooms,
      max_guests: apt.max_guests,
      created_at: apt.created_at,
      active: apt.status === "active",
      media_urls: apt.image_urls,
      category: "serviced_apartments",
      location: `${apt.area ? apt.area + ", " : ""}${apt.city}, ${apt.state}`,
    }));
  }

  // For other categories (events, logistics, security, etc.)
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, title, price, created_at, active, media_urls, category, description, location",
    )
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

// Fetch bookings based on vendor category
async function fetchBookings(vendorId, category, listingIds) {
  if (!vendorId || !category || listingIds.length === 0) return [];

  if (category === "events") {
    const { data, error } = await supabase
      .from("event_bookings")
      .select(
        `
        id, 
        total_amount, 
        booking_date, 
        status, 
        created_at, 
        listing_id,
        listings(title, media_urls)
      `,
      )
      .in("listing_id", listingIds)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  if (category === "serviced_apartments") {
    const { data, error } = await supabase
      .from("apartment_bookings")
      .select(
        `
        id,
        total_amount,
        check_in_date,
        booking_status,
        created_at,
        apartment_id,
        serviced_apartments(name, image_urls)
      `,
      )
      .in("apartment_id", listingIds)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((booking) => ({
      id: booking.id,
      total_amount: booking.total_amount,
      booking_date: booking.check_in_date,
      status: booking.booking_status,
      created_at: booking.created_at,
      listing_id: booking.apartment_id,
      listings: {
        title: booking.serviced_apartments?.name,
        media_urls: booking.serviced_apartments?.image_urls,
      },
    }));
  }

  // Regular bookings
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id, 
      total_amount, 
      booking_date, 
      status, 
      created_at, 
      listing_id,
      listings(title, media_urls)
    `,
    )
    .in("listing_id", listingIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Calculate stats from listings and bookings
function calculateStats(listings, bookings) {
  const totalListings = listings.length;
  const activeBookings = bookings.filter(
    (b) => b.status === "confirmed",
  ).length;
  const pendingRequests = bookings.filter((b) => b.status === "pending").length;
  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  return {
    totalListings,
    activeBookings,
    pendingRequests,
    totalRevenue,
  };
}

// Hook: Fetch vendor listings
export function useVendorListings(vendorId, category) {
  return useQuery({
    queryKey: vendorDashboardKeys.listings(vendorId, category),
    queryFn: () => fetchListings(vendorId, category),
    enabled: !!vendorId && !!category,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook: Fetch vendor bookings
export function useVendorBookings(vendorId, category, listingIds) {
  return useQuery({
    queryKey: vendorDashboardKeys.bookings(vendorId, category),
    queryFn: () => fetchBookings(vendorId, category, listingIds),
    enabled: !!vendorId && !!category && listingIds.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook: Calculated stats
export function useVendorStats(listings = [], bookings = []) {
  return useQuery({
    queryKey: [...vendorDashboardKeys.all, "calculated-stats"],
    queryFn: () => calculateStats(listings, bookings),
    enabled: true,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook: Delete listing mutation
export function useDeleteListing(category) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId) => {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.error || "Failed to delete listing");
      }

      if (!payload?.data || payload.data.length === 0) {
        throw new Error(
          "Failed to delete listing. The database policy may be blocking this action.",
        );
      }

      return payload.data;
    },
    onSuccess: (_, listingId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: vendorDashboardKeys.all,
      });

      toast.success("Listing deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete listing");
    },
  });
}

// Hook: Complete dashboard data
export function useVendorDashboard(vendorId, category) {
  const {
    data: listings = [],
    isLoading: listingsLoading,
    error: listingsError,
  } = useVendorListings(vendorId, category);

  const listingIds = listings.map((l) => l.id);

  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useVendorBookings(vendorId, category, listingIds);

  const stats = calculateStats(listings, bookings);

  return {
    listings,
    bookings,
    stats,
    isLoading: listingsLoading || bookingsLoading,
    error: listingsError || bookingsError,
    recentListings: listings.slice(0, 5),
    recentBookings: bookings.slice(0, 5),
  };
}
