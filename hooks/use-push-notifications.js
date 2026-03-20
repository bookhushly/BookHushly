"use client";

import { useState, useEffect, useCallback } from "react";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

const OPTED_OUT_KEY = "bh_push_opted_out";

/**
 * Hook for managing Web Push notification subscriptions.
 *
 * @param {string|null} userId — Supabase auth user UUID
 * @returns {{
 *   isSupported: boolean,
 *   permission: NotificationPermission,
 *   isSubscribed: boolean,
 *   isLoading: boolean,
 *   optedOut: boolean,
 *   subscribe: () => Promise<void>,
 *   unsubscribe: () => Promise<void>,
 * }}
 */
export function usePushNotifications(userId) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission]   = useState("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [optedOut, setOptedOut]       = useState(false);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setIsSupported(supported);
    if (!supported) return;

    setPermission(Notification.permission);
    setOptedOut(localStorage.getItem(OPTED_OUT_KEY) === "true");

    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => setIsSubscribed(!!sub)),
    );
  }, []);

  const subscribe = useCallback(async () => {
    if (!userId || !isSupported) return;
    setIsLoading(true);

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        ),
      });

      const res = await fetch("/api/push/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(sub.toJSON()),
      });

      if (res.ok) {
        setIsSubscribed(true);
        localStorage.removeItem(OPTED_OUT_KEY);
        setOptedOut(false);
      }
    } catch (err) {
      console.error("[push] Subscribe error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return;
    setIsLoading(true);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        await sub.unsubscribe();
        await fetch("/api/push/subscribe", {
          method:  "DELETE",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ endpoint: sub.endpoint }),
        });
      }

      setIsSubscribed(false);
      localStorage.setItem(OPTED_OUT_KEY, "true");
      setOptedOut(true);
    } catch (err) {
      console.error("[push] Unsubscribe error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  return { isSupported, permission, isSubscribed, isLoading, optedOut, subscribe, unsubscribe };
}
