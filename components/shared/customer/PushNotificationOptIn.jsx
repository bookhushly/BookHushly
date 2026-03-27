"use client";

import { useState } from "react";
import {
  Bell,
  BellOff,
  X,
  Mail,
  AlertCircle,
  BellDot,
} from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

const BANNER_DISMISSED_KEY = "bh_push_banner_dismissed";

export function PushNotificationOptIn({ userId }) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    optedOut,
    subscribe,
    unsubscribe,
  } = usePushNotifications(userId);

  const [dismissed, setDismissed] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem(BANNER_DISMISSED_KEY) === "true",
  );

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(BANNER_DISMISSED_KEY, "true");
  };

  // Don't render if: unsupported, already granted+subscribed, denied, or user dismissed banner
  if (
    !isSupported ||
    dismissed ||
    permission === "denied" ||
    (permission === "granted" && isSubscribed)
  )
    return null;

  // Already opted out manually — show a minimal re-enable prompt
  if (optedOut) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <BellOff className="h-4 w-4 shrink-0" />
          <span>Push notifications are off.</span>
        </div>
        <button
          onClick={subscribe}
          disabled={isLoading}
          className="shrink-0 text-violet-600 font-medium hover:text-violet-700 disabled:opacity-60 transition-colors"
        >
          {isLoading ? "Enabling…" : "Enable"}
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-purple-50 p-3 sm:p-4">
      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-3 pr-7">
        {/* Icon */}
        <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm shadow-violet-600/20">
          <Bell
            className="h-4 w-4 sm:h-5 sm:w-5 text-white"
            strokeWidth={1.5}
          />
        </div>

        {/* Copy */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-sm font-medium text-gray-900">
              Stay in the loop
            </p>
            <BellDot className="h-3.5 w-3.5 text-violet-500 shrink-0" />
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            Get instant notifications for booking confirmations, payments, and
            more — even when the app is closed.
          </p>

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
            <button
              onClick={subscribe}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 h-8 px-4 rounded-xl bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 transition-colors disabled:opacity-60 active:scale-95"
            >
              <Bell className="h-3.5 w-3.5 shrink-0" />
              {isLoading ? "Enabling…" : "Enable notifications"}
            </button>
            <button
              onClick={handleDismiss}
              className="h-8 px-3 rounded-xl text-gray-500 text-xs font-medium hover:bg-gray-100 transition-colors text-center"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
