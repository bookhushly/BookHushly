// lib/hooks/useBookings.js
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Query keys
export const bookingKeys = {
  all: ["bookings"],
  vendor: (vendorId) => [...bookingKeys.all, "vendor", vendorId],
  customer: (customerId) => [...bookingKeys.all, "customer", customerId],
  detail: (bookingId) => [...bookingKeys.all, "detail", bookingId],
};

// Fetch single booking
async function fetchBooking(bookingId) {
  if (!bookingId) throw new Error("Booking ID is required");

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      listings (
        id,
        title,
        category,
        price,
        media_urls,
        vendor_name,
        location
      )
    `,
    )
    .eq("id", bookingId)
    .single();

  if (error) throw error;
  return data;
}

// Fetch vendor bookings
async function fetchVendorBookings(userId) {
  if (!userId) throw new Error("User ID is required");

  // First get vendor record
  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (vendorError) throw vendorError;

  // Then get bookings through listings
  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select("id")
    .eq("vendor_id", vendor.id);

  if (listingsError) throw listingsError;

  const listingIds = listings.map((l) => l.id);

  if (listingIds.length === 0) return [];

  // Get bookings for these listings
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      listings (
        id,
        title,
        category,
        price,
        media_urls,
        vendor_name,
        location
      )
    `,
    )
    .in("listing_id", listingIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch customer bookings
async function fetchCustomerBookings(userId) {
  if (!userId) throw new Error("User ID is required");

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      listings (
        id,
        title,
        category,
        price,
        media_urls,
        vendor_name,
        location
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Update booking status
async function updateBookingStatus(bookingId, status) {
  if (!bookingId) throw new Error("Booking ID is required");
  if (!status) throw new Error("Status is required");

  const { data, error } = await supabase
    .from("bookings")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Hook: Fetch single booking
export function useBooking(bookingId) {
  return useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => fetchBooking(bookingId),
    enabled: !!bookingId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook: Fetch vendor bookings
export function useVendorBookings(userId) {
  return useQuery({
    queryKey: bookingKeys.vendor(userId),
    queryFn: () => fetchVendorBookings(userId),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds - bookings change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook: Fetch customer bookings
export function useCustomerBookings(userId) {
  return useQuery({
    queryKey: bookingKeys.customer(userId),
    queryFn: () => fetchCustomerBookings(userId),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook: Update booking status mutation
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, status }) =>
      updateBookingStatus(bookingId, status),
    onSuccess: (data) => {
      // Invalidate detail query
      queryClient.invalidateQueries({
        queryKey: bookingKeys.detail(data.id),
      });

      // Invalidate all booking lists
      queryClient.invalidateQueries({
        queryKey: bookingKeys.all,
      });
    },
  });
}
