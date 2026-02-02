// lib/hooks/useCategories.js
"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Query keys
export const categoryKeys = {
  all: ["categories"],
  byVendor: (vendorCategory) => [...categoryKeys.all, "vendor", vendorCategory],
};

// Fetch categories by vendor category
async function fetchCategories(vendorCategory) {
  if (!vendorCategory) return [];
  console.log("Fetching categories for vendor category:", vendorCategory);
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("value", vendorCategory)
    .order("label", { ascending: true });

  if (error) throw error;

  return data || [];
}

// Hook: Get categories for vendor
export function useVendorCategories(vendorCategory) {
  return useQuery({
    queryKey: categoryKeys.byVendor(vendorCategory),
    queryFn: () => fetchCategories(vendorCategory),
    enabled: !!vendorCategory,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes
    placeholderData: [], // Return empty array while loading
  });
}
