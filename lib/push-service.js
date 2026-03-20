/**
 * lib/push-service.js
 * Server-side Web Push sender using VAPID.
 * Only runs in Node (API routes / server actions). Never import client-side.
 *
 * Required env vars:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY
 *   VAPID_PRIVATE_KEY
 *   VAPID_SUBJECT   (e.g. "mailto:hello@bookhushly.com")
 *
 * Generate VAPID keys once:
 *   npx web-push generate-vapid-keys
 */

import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:hello@bookhushly.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || "",
);

/**
 * Send a push notification to all active subscriptions for a user.
 * Expired / invalid subscriptions (410/404) are automatically cleaned up.
 *
 * @param {string} userId
 * @param {{ title: string, body: string, url?: string, tag?: string, icon?: string }} payload
 */
export async function sendPushToUser(userId, payload) {
  if (!userId || !process.env.VAPID_PRIVATE_KEY) return;

  const supabase = createAdminClient();
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subs?.length) return;

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
        { TTL: 60 * 60 * 24 }, // 24h TTL
      ),
    ),
  );

  // Remove subscriptions that are gone (410 Gone / 404 Not Found)
  const expiredIds = results
    .map((r, i) => {
      if (r.status === "rejected") {
        const code = r.reason?.statusCode;
        if (code === 404 || code === 410) return subs[i].id;
      }
      return null;
    })
    .filter(Boolean);

  if (expiredIds.length) {
    await supabase.from("push_subscriptions").delete().in("id", expiredIds);
  }
}
