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
  waitlist: (listingId) => [...eventDashboardKeys.all, "waitlist", listingId],
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

// ─── Waitlist hook (customer-facing) ─────────────────────────────────────────
export function useWaitlistStatus(listingId, email) {
  return useQuery({
    queryKey: eventDashboardKeys.waitlist(listingId),
    queryFn: async () => {
      const url = new URL(`/api/events/${listingId}/waitlist`, window.location.origin);
      if (email) url.searchParams.set("email", email);
      const res = await fetch(url);
      if (!res.ok) return { onWaitlist: false };
      return res.json();
    },
    enabled: !!listingId,
    staleTime: 60 * 1000,
  });
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
    onSuccess: (updatedListing, remainingTickets) => {
      // Write the fresh row directly into the listing cache — no refetch needed.
      queryClient.setQueryData(
        eventDashboardKeys.listing(listingId),
        updatedListing,
      );
      // Revalidate the public detail page cache so fresh ticket counts show immediately
      fetch(`/api/events/${listingId}/revalidate`, { method: "POST" }).catch(() => {});
      // If tickets went above 0, notify waitlist users in the background
      if (remainingTickets > 0) {
        fetch(`/api/events/${listingId}/waitlist/notify`, { method: "POST" }).catch(() => {});
      }
    },
    // Retry once on network flake, but not on RLS/validation errors
    retry: (failureCount, error) => {
      if (error?.message?.includes("RLS")) return false;
      return failureCount < 1;
    },
  });
}
