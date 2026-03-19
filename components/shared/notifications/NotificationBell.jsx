"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { NotificationCenter } from "./notification-center";
import { useNotifications } from "@/hooks/use-notifications";

/**
 * Reusable bell button + popover for any dashboard header.
 * Props:
 *   userId  — auth user UUID
 *   align   — "left" | "right" (default "right") — which side to align the dropdown
 */
export function NotificationBell({ userId, align = "right" }) {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotifications(userId);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const displayCount = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <div ref={containerRef} className="relative">
      {/* Bell trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
        className={`relative h-8 w-8 flex items-center justify-center rounded-lg text-gray-500
          hover:bg-gray-100 transition-colors ${open ? "bg-gray-100 text-gray-700" : ""}`}
      >
        <Bell className="h-4 w-4" strokeWidth={2} />

        {unreadCount > 0 && (
          <span
            className={`absolute flex items-center justify-center rounded-full bg-violet-600 text-white font-bold leading-none
              ${displayCount === "99+"
                ? "text-[8px] h-4 w-5 -top-0.5 -right-1"
                : unreadCount > 9
                ? "text-[9px] h-4 w-4 -top-0.5 -right-0.5"
                : "text-[9px] h-3.5 w-3.5 top-0.5 right-0.5"
              }`}
          >
            {displayCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 sm:hidden"
            onClick={() => setOpen(false)}
          />

          <div
            className={`
              absolute z-50 mt-2 w-[360px] max-w-[calc(100vw-2rem)]
              bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100
              overflow-hidden
              animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150
              ${align === "right" ? "right-0" : "left-0"}
            `}
          >
            {/* Accent bar */}
            <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-purple-400 to-pink-400" />

            <NotificationCenter
              userId={userId}
              onClose={() => setOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}
