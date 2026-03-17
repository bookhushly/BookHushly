"use client";

import { useQuery } from "@tanstack/react-query";

export function useVendorViews() {
  return useQuery({
    queryKey: ["vendor-views"],
    queryFn: async () => {
      const res = await fetch("/api/vendor/views");
      if (!res.ok) throw new Error("Failed to fetch view stats");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
