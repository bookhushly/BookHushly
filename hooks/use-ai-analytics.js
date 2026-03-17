"use client";

import { useQuery } from "@tanstack/react-query";

export function useAIAnalytics(days = 30) {
  return useQuery({
    queryKey: ["ai-analytics", days],
    queryFn: async () => {
      const res = await fetch(`/api/admin/ai-analytics?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch AI analytics");
      const json = await res.json();
      return json.data;
    },
    staleTime: 60_000, // 1 min
  });
}
