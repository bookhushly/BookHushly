"use client";

import { useQuery } from "@tanstack/react-query";

// Lightweight hook used by user-facing components to check if an AI feature is on
// e.g. const enabled = useAIFeature("listing_generator")
export function useAIFeature(featureKey) {
  const { data } = useQuery({
    queryKey: ["ai-features"],
    queryFn: async () => {
      const res = await fetch("/api/ai-settings");
      if (!res.ok) return {};
      const json = await res.json();
      return json.data ?? {};
    },
    staleTime: 30_000, // 30 s — matches server cache
  });

  // Fail open: if data hasn't loaded yet, assume enabled
  return data ? (data[featureKey] ?? true) : true;
}

// Returns the full feature map — useful when a component needs multiple checks
export function useAIFeatures() {
  const { data, isLoading } = useQuery({
    queryKey: ["ai-features"],
    queryFn: async () => {
      const res = await fetch("/api/ai-settings");
      if (!res.ok) return {};
      const json = await res.json();
      return json.data ?? {};
    },
    staleTime: 30_000,
  });

  return { features: data ?? {}, loading: isLoading };
}
