// lib/hooks/use-event-dashboard.js
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ─── Query Keys ──────────────────────────────────────────────────────────────
export const eventDashboardKeys = {
  all: ["event-dashboard"],
  listing: (listingId) => [...eventDashboardKeys.all, "listing", listingId],
  bookings: (listingId) => [...eventDashboardKeys.all, "bookings", listingId],
};

// ─── Fetch Functions ─────────────────────────────────────────────────────────
async function fetchEventListing(listingId) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();

  if (error) throw error;
  return data;
}

async function fetchEventBookings(listingId) {
  const { data, error } = await supabase
    .from("event_bookings")
    .select(
      `
      *,
      users:customer_id (
        id,
        name,
        email
      )
    `,
    )
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// ─── Mutation Function ───────────────────────────────────────────────────────
async function updateRemainingTickets(listingId, remainingTickets) {
  const { data, error } = await supabase
    .from("listings")
    .update({ remaining_tickets: remainingTickets })
    .eq("id", listingId)
    .select()
    .single();

  // Supabase doesn't always throw on RLS failures — it just returns null data.
  // Catch that here so the mutation actually rejects.
  if (error) throw error;
  if (!data)
    throw new Error(
      "Update failed — row not returned. Check RLS policies on listings.",
    );

  return data;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────
export function useEventListing(listingId) {
  return useQuery({
    queryKey: eventDashboardKeys.listing(listingId),
    queryFn: () => fetchEventListing(listingId),
    enabled: !!listingId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useEventBookings(listingId) {
  return useQuery({
    queryKey: eventDashboardKeys.bookings(listingId),
    queryFn: () => fetchEventBookings(listingId),
    enabled: !!listingId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUpdateTicketCount(listingId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (remainingTickets) =>
      updateRemainingTickets(listingId, remainingTickets),
    onSuccess: (updatedListing) => {
      // Write the fresh row directly into the listing cache — no refetch needed.
      queryClient.setQueryData(
        eventDashboardKeys.listing(listingId),
        updatedListing,
      );
    },
    // Retry once on network flake, but not on RLS/validation errors
    retry: (failureCount, error) => {
      if (error?.message?.includes("RLS")) return false;
      return failureCount < 1;
    },
  });
}
