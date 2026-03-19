// hooks/useListingsData.js
"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { vendorDashboardKeys } from "./use-vendor-dashboard";
import { useInView } from "react-intersection-observer";
import { useEffect, useMemo } from "react";

const supabase = createClient();

const PREFETCH_THRESHOLD = 0.8;

// ── Query keys ────────────────────────────────────────────────────────────────

export const listingKeys = {
  all: ["listings"],
  detail: (id) => [...listingKeys.all, "detail", id],
  category: (category) => [...listingKeys.all, "category", category],
  filtered: (category, searchQuery, filters, sort) => [
    ...listingKeys.category(category),
    "filtered",
    searchQuery,
    sort,
    JSON.stringify(filters),
  ],
};

// ── API call helper ───────────────────────────────────────────────────────────
// Converts the flat filters object → URLSearchParams and calls /api/listings.
// Arrays are serialized as comma-separated strings.
// Tri-state booleans (null = any, true = yes, false = no) are only emitted
// when not null, using "true"/"false" strings.

function filtersToSearchParams(sp, filters) {
  if (!filters) return;
  for (const [k, v] of Object.entries(filters)) {
    if (v === null || v === undefined) continue;
    if (k === "nearMe") continue; // handled by the near-me fetch path
    if (Array.isArray(v)) {
      if (v.length > 0) sp.set(k, v.join(","));
    } else if (typeof v === "boolean") {
      // Only emit truthy flags (false = "don't filter") EXCEPT tri-state booleans
      if (v) sp.set(k, "true");
    } else {
      sp.set(k, String(v));
    }
  }
  // Tri-state booleans: explicitly emit false when set (null means any)
  const TRISTATE = ["furnished", "utilities_included", "internet_included"];
  for (const key of TRISTATE) {
    if (filters[key] === false) sp.set(key, "false");
  }
}

async function fetchListingsAPI({ category, page, searchQuery, filters, sort }) {
  const sp = new URLSearchParams({ category, page: String(page || 0) });
  if (searchQuery?.trim()) sp.set("search", searchQuery.trim());
  if (sort && sort !== "newest") sp.set("sort", sort);
  filtersToSearchParams(sp, filters);

  const res = await fetch(`/api/listings?${sp.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Listings fetch failed (${res.status})`);
  }
  return res.json(); // { items, nextPage, totalCount }
}

// ── Near-me: 3-tier parallel fetch, each leg benefits from Redis cache ───────

async function fetchNearMePage({ category, searchQuery, filters, sort }) {
  const base = { ...filters, nearMe: false };
  const cityFilters = { ...base, state: undefined };
  const stateFilters = { ...base, city: undefined };
  const nationalFilters = { ...base, city: undefined, state: undefined };

  const [cityRes, stateRes, nationalRes] = await Promise.all([
    filters.city
      ? fetchListingsAPI({ category, page: 0, searchQuery, filters: cityFilters, sort })
      : Promise.resolve({ items: [] }),
    filters.state
      ? fetchListingsAPI({ category, page: 0, searchQuery, filters: stateFilters, sort })
      : Promise.resolve({ items: [] }),
    fetchListingsAPI({ category, page: 0, searchQuery, filters: nationalFilters, sort }),
  ]);

  // Deduplicate and merge city → state → national
  const seen = new Set();
  const merged = [];
  const addTier = (rows, proximity) => {
    for (const row of rows || []) {
      if (!seen.has(row.id)) {
        seen.add(row.id);
        merged.push({ ...row, proximity });
      }
    }
  };
  addTier(cityRes.items, "city");
  addTier(stateRes.items, "state");
  addTier(nationalRes.items, "national");

  return { items: merged, nextPage: undefined, totalCount: merged.length };
}

// ── Page fetcher ──────────────────────────────────────────────────────────────

async function fetchListingsPage({ pageParam = 0, category, searchQuery, filters, sort }) {
  if (filters?.nearMe) {
    return fetchNearMePage({ category, searchQuery, filters, sort });
  }
  return fetchListingsAPI({ category, page: pageParam, searchQuery, filters, sort });
}

// ── Single listing fetch (still direct Supabase — not a hot read path) ───────

async function fetchListing(listingId, businessCategory) {
  if (!listingId) throw new Error("Listing ID is required");

  if (businessCategory === "hotels") {
    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .eq("id", listingId)
      .single();
    if (error) throw error;
    return data;
  }

  if (businessCategory === "serviced_apartments") {
    const { data, error } = await supabase
      .from("serviced_apartments")
      .select("*")
      .eq("id", listingId)
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();
  if (error) throw error;
  return data;
}

// ── Listing update (still routes through existing /api/listings/[id]) ────────

async function updateListingData(listingId, updateData, businessCategory) {
  if (!listingId) throw new Error("Listing ID is required");

  if (businessCategory === "hotels") {
    const { data, error } = await supabase
      .from("hotels")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("id", listingId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  if (businessCategory === "serviced_apartments") {
    const { data, error } = await supabase
      .from("serviced_apartments")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("id", listingId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const response = await fetch(`/api/listings/${listingId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Failed to update listing");
  }

  const { data } = await response.json();
  return data;
}

// ── Exported hooks ────────────────────────────────────────────────────────────

export function useListing(listingId, businessCategory) {
  return useQuery({
    queryKey: listingKeys.detail(listingId),
    queryFn: () => fetchListing(listingId, businessCategory),
    enabled: !!listingId && !!businessCategory,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
}

export function useListingsData(category, searchQuery = "", filters = {}, sort = "newest") {
  const queryClient = useQueryClient();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: listingKeys.filtered(category, searchQuery, filters, sort),
    queryFn: ({ pageParam = 0 }) =>
      fetchListingsPage({ pageParam, category, searchQuery, filters, sort }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!category,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const listings = useMemo(
    () => data?.pages.flatMap((page) => page.items) || [],
    [data],
  );

  const { ref: lastListingRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "500px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Prefetch next page when user is 80% through current results
  useEffect(() => {
    if (!data || !hasNextPage || isFetchingNextPage) return;
    const totalLoaded = listings.length;
    if (totalLoaded >= Math.floor(totalLoaded * PREFETCH_THRESHOLD)) {
      const currentPage = data.pages.length;
      queryClient.prefetchInfiniteQuery({
        queryKey: listingKeys.filtered(category, searchQuery, filters, sort),
        queryFn: ({ pageParam = currentPage }) =>
          fetchListingsPage({ pageParam, category, searchQuery, filters, sort }),
      });
    }
  }, [
    listings.length,
    data,
    hasNextPage,
    isFetchingNextPage,
    category,
    searchQuery,
    filters,
    sort,
    queryClient,
  ]);

  return {
    listings,
    loading: isLoading,
    fetchError: error,
    isLoadingMore: isFetchingNextPage,
    hasMore: hasNextPage,
    lastListingRef,
    totalCount: data?.pages[0]?.totalCount || 0,
  };
}

export function useUpdateListing(businessCategory) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, updateData }) =>
      updateListingData(listingId, updateData, businessCategory),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: listingKeys.detail(variables.listingId),
      });
      queryClient.invalidateQueries({ queryKey: vendorDashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
}
