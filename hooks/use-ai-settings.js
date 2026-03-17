"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Admin hook — fetches full settings list and exposes toggle mutation
export function useAISettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["ai-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/ai-settings");
      if (!res.ok) throw new Error("Failed to fetch AI settings");
      const json = await res.json();
      return json.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ feature_key, enabled }) => {
      const res = await fetch("/api/admin/ai-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature_key, enabled }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update setting");
      }
      return res.json();
    },
    onMutate: async ({ feature_key, enabled }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["ai-settings"] });
      const previous = queryClient.getQueryData(["ai-settings"]);
      queryClient.setQueryData(["ai-settings"], (old) =>
        old?.map((s) =>
          s.feature_key === feature_key
            ? { ...s, enabled, updated_at: new Date().toISOString() }
            : s
        )
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      queryClient.setQueryData(["ai-settings"], context.previous);
      toast.error(err.message);
    },
    onSuccess: (_data, { enabled, feature_key }) => {
      // Also invalidate the public ai-settings cache
      queryClient.invalidateQueries({ queryKey: ["ai-features"] });
      const settings = queryClient.getQueryData(["ai-settings"]);
      const name = settings?.find((s) => s.feature_key === feature_key)?.feature_name ?? feature_key;
      toast.success(`${name} ${enabled ? "enabled" : "disabled"} successfully`);
    },
  });

  return {
    settings: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    toggle: (feature_key, enabled) => mutation.mutate({ feature_key, enabled }),
    isToggling: mutation.isPending,
  };
}
