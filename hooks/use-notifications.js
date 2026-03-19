"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ─── Keys ────────────────────────────────────────────────────────────────────

export const notificationKeys = {
  all:   (userId) => ["notifications", userId],
  count: (userId) => ["notifications", userId, "count"],
};

// ─── Fetch ───────────────────────────────────────────────────────────────────

async function fetchNotifications(userId) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) throw error;
  return data ?? [];
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Main hook — fetches notifications and subscribes to realtime inserts.
 * @param {string|null} userId
 */
export function useNotifications(userId) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey:    notificationKeys.all(userId),
    queryFn:     () => fetchNotifications(userId),
    enabled:     !!userId,
    staleTime:   30_000,
    refetchOnWindowFocus: true,
  });

  // Supabase realtime subscription — prepend new notifications instantly
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event:  "INSERT",
          schema: "public",
          table:  "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            notificationKeys.all(userId),
            (prev = []) => [payload.new, ...prev],
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event:  "UPDATE",
          schema: "public",
          table:  "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            notificationKeys.all(userId),
            (prev = []) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n)),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event:  "DELETE",
          schema: "public",
          table:  "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            notificationKeys.all(userId),
            (prev = []) => prev.filter((n) => n.id !== payload.old.id),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const unreadCount = (query.data ?? []).filter((n) => !n.read).length;

  return { ...query, unreadCount };
}

/**
 * Just the unread count — for lightweight badge usage.
 */
export function useUnreadCount(userId) {
  const { unreadCount } = useNotifications(userId);
  return unreadCount;
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ notificationId, userId }) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onMutate: async ({ notificationId, userId }) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all(userId) });
      const prev = queryClient.getQueryData(notificationKeys.all(userId));

      queryClient.setQueryData(notificationKeys.all(userId), (old = []) =>
        old.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );

      return { prev };
    },
    onError: (_err, { userId }, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(notificationKeys.all(userId), ctx.prev);
      }
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (error) throw error;
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all(userId) });
      const prev = queryClient.getQueryData(notificationKeys.all(userId));

      queryClient.setQueryData(notificationKeys.all(userId), (old = []) =>
        old.map((n) => ({ ...n, read: true })),
      );

      return { prev };
    },
    onError: (_err, userId, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(notificationKeys.all(userId), ctx.prev);
      }
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ notificationId, userId }) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onMutate: async ({ notificationId, userId }) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all(userId) });
      const prev = queryClient.getQueryData(notificationKeys.all(userId));

      queryClient.setQueryData(notificationKeys.all(userId), (old = []) =>
        old.filter((n) => n.id !== notificationId),
      );

      return { prev };
    },
    onError: (_err, { userId }, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(notificationKeys.all(userId), ctx.prev);
      }
    },
  });
}
