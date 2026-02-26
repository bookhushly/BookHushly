// lib/hooks/useVendorDashboard.js
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const supabase = createClient();

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
};

// Map category → table name
const LISTING_TABLE = {
  hotels: "hotels",
  serviced_apartments: "serviced_apartments",
  events: "listings",
  logistics: "listings",
  security: "listings",
};

async function fetchListings(vendorId, category) {
  if (!vendorId || !category) return [];

  if (category === "hotels") {
    const { data, error } = await supabase
      .from("hotels")
      .select(
        "id, name, description, address, city, state, image_urls, amenities, status, created_at",
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

  // events, logistics, security, etc.
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, title, price, created_at, active, media_urls, category, description, location",
    )
    .eq("vendor_id", vendorId)
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

async function fetchBookings(vendorId, category, listingIds) {
  if (!vendorId || !category || listingIds.length === 0) return [];

  if (category === "events") {
    const { data, error } = await supabase
      .from("event_bookings")
      .select(
        "id, total_amount, booking_date, status, created_at, listing_id, listings(title, media_urls)",
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
        "id, total_amount, check_in_date, booking_status, created_at, apartment_id, serviced_apartments(name, image_urls)",
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

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, total_amount, booking_date, status, created_at, listing_id, listings(title, media_urls)",
    )
    .in("listing_id", listingIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

function calculateStats(listings, bookings) {
  return {
    totalListings: listings.length,
    activeBookings: bookings.filter((b) => b.status === "confirmed").length,
    pendingRequests: bookings.filter((b) => b.status === "pending").length,
    totalRevenue: bookings
      .filter((b) => b.status === "confirmed")
      .reduce((sum, b) => sum + (b.total_amount || 0), 0),
  };
}

export function useVendorListings(vendorId, category) {
  return useQuery({
    queryKey: vendorDashboardKeys.listings(vendorId, category),
    queryFn: () => fetchListings(vendorId, category),
    enabled: !!vendorId && !!category,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useVendorBookings(vendorId, category, listingIds) {
  return useQuery({
    queryKey: vendorDashboardKeys.bookings(vendorId, category),
    queryFn: () => fetchBookings(vendorId, category, listingIds),
    enabled: !!vendorId && !!category && listingIds.length > 0,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useDeleteListing(category) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId) => {
      const table = LISTING_TABLE[category] ?? "listings";

      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq("id", listingId)
        .select();

      if (error) throw new Error(error.message);
      if (!data || data.length === 0)
        throw new Error("Delete failed — RLS may be blocking this action.");

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorDashboardKeys.all });
      toast.success("Listing deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete listing");
    },
  });
}

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

  return {
    listings,
    bookings,
    stats: calculateStats(listings, bookings),
    isLoading: listingsLoading || bookingsLoading,
    error: listingsError || bookingsError,
    recentListings: listings.slice(0, 5),
    recentBookings: bookings.slice(0, 5),
  };
}
