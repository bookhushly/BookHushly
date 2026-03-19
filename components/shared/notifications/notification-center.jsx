"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, CheckCircle, AlertCircle, CreditCard, Star, Calendar,
  Wallet, Lock, Package, Shield, Info, X, BadgeCheck, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/hooks/use-notifications";

// ─── Type → icon/colour map ─────────────────────────────────────────────────

const TYPE_CONFIG = {
  booking_confirmed:    { icon: CheckCircle,  colour: "text-green-600",  bg: "bg-green-50"  },
  booking_cancelled:    { icon: XCircle,      colour: "text-red-500",    bg: "bg-red-50"    },
  booking_pending:      { icon: Calendar,     colour: "text-amber-500",  bg: "bg-amber-50"  },
  booking_updated:      { icon: Calendar,     colour: "text-blue-500",   bg: "bg-blue-50"   },
  payment_successful:   { icon: CreditCard,   colour: "text-green-600",  bg: "bg-green-50"  },
  payment_failed:       { icon: AlertCircle,  colour: "text-red-500",    bg: "bg-red-50"    },
  wallet_deposit:       { icon: Wallet,       colour: "text-green-600",  bg: "bg-green-50"  },
  wallet_withdrawal:    { icon: Wallet,       colour: "text-gray-500",   bg: "bg-gray-50"   },
  password_changed:     { icon: Lock,         colour: "text-amber-600",  bg: "bg-amber-50"  },
  review_request:       { icon: Star,         colour: "text-yellow-500", bg: "bg-yellow-50" },
  new_booking:          { icon: Calendar,     colour: "text-violet-600", bg: "bg-violet-50" },
  payment_received:     { icon: CreditCard,   colour: "text-green-600",  bg: "bg-green-50"  },
  listing_approved:     { icon: BadgeCheck,   colour: "text-green-600",  bg: "bg-green-50"  },
  listing_rejected:     { icon: XCircle,      colour: "text-red-500",    bg: "bg-red-50"    },
  kyc_approved:         { icon: BadgeCheck,   colour: "text-green-600",  bg: "bg-green-50"  },
  kyc_rejected:         { icon: XCircle,      colour: "text-red-500",    bg: "bg-red-50"    },
  new_review:           { icon: Star,         colour: "text-yellow-500", bg: "bg-yellow-50" },
  payout_processed:     { icon: Wallet,       colour: "text-green-600",  bg: "bg-green-50"  },
  new_vendor:           { icon: Package,      colour: "text-violet-600", bg: "bg-violet-50" },
  kyc_submitted:        { icon: Package,      colour: "text-blue-500",   bg: "bg-blue-50"   },
  payment_issue:        { icon: AlertCircle,  colour: "text-red-500",    bg: "bg-red-50"    },
  new_logistics_request:{ icon: Package,      colour: "text-blue-500",   bg: "bg-blue-50"   },
  new_security_request: { icon: Shield,       colour: "text-red-500",    bg: "bg-red-50"    },
  system:               { icon: Info,         colour: "text-blue-500",   bg: "bg-blue-50"   },
};

const FILTER_TABS = [
  { key: "all",      label: "All"      },
  { key: "unread",   label: "Unread"   },
  { key: "bookings", label: "Bookings" },
  { key: "payments", label: "Payments" },
];

const BOOKING_TYPES  = ["booking_confirmed","booking_cancelled","booking_pending","booking_updated","new_booking"];
const PAYMENT_TYPES  = ["payment_successful","payment_failed","payment_received","payment_issue","wallet_deposit","wallet_withdrawal","payout_processed"];

// ─── Component ───────────────────────────────────────────────────────────────

export function NotificationCenter({ userId, onClose }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const { data: notifications = [], isLoading, unreadCount } = useNotifications(userId);
  const markAsRead    = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotif   = useDeleteNotification();

  const filtered = notifications.filter((n) => {
    if (filter === "unread")   return !n.read;
    if (filter === "bookings") return BOOKING_TYPES.includes(n.type);
    if (filter === "payments") return PAYMENT_TYPES.includes(n.type);
    return true;
  });

  const handleMarkRead = (notificationId) => {
    markAsRead.mutate({ notificationId, userId }, {
      onError: () => toast.error("Failed to mark as read"),
    });
  };

  const handleMarkAll = () => {
    markAllAsRead.mutate(userId, {
      onSuccess: () => toast.success("All notifications marked as read"),
      onError:   () => toast.error("Failed to mark all as read"),
    });
  };

  const handleDelete = (notificationId) => {
    deleteNotif.mutate({ notificationId, userId }, {
      onError: () => toast.error("Failed to delete notification"),
    });
  };

  const handleClick = (notification) => {
    if (!notification.read) handleMarkRead(notification.id);
    if (notification.link) {
      router.push(notification.link);
      onClose?.();
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-gray-700" />
          <span className="font-semibold text-[14px] text-gray-900">Notifications</span>
          {unreadCount > 0 && (
            <Badge className="h-5 px-1.5 text-[11px] bg-violet-600 hover:bg-violet-600">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="text-[11px] text-violet-600 hover:text-violet-800 font-medium px-2 py-1 rounded hover:bg-violet-50 transition-colors"
            >
              Mark all read
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0.5 px-4 pb-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab.key
                ? "bg-violet-100 text-violet-700"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.key === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 text-[10px] bg-violet-600 text-white rounded-full px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <Separator />

      {/* List */}
      <ScrollArea className="h-[360px]">
        {isLoading ? (
          <div className="p-6 flex flex-col items-center gap-3 text-gray-400">
            <div className="w-8 h-8 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
            <p className="text-xs">Loading…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 flex flex-col items-center gap-3 text-gray-400">
            <Bell className="h-9 w-9 opacity-30" />
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs text-center">
              {filter !== "all" ? "Try switching to All" : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((n, i) => {
              const cfg   = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
              const Icon  = cfg.icon;
              const isNew = !n.read;

              return (
                <div key={n.id}>
                  <div
                    onClick={() => handleClick(n)}
                    className={`relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors group
                      ${isNew ? "bg-violet-50/60 hover:bg-violet-50" : "hover:bg-gray-50/80"}`}
                  >
                    {/* Unread pip */}
                    {isNew && (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-violet-600" />
                    )}

                    {/* Icon */}
                    <div className={`mt-0.5 shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                      <Icon className={`h-4 w-4 ${cfg.colour}`} strokeWidth={2} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-semibold leading-tight ${isNew ? "text-gray-900" : "text-gray-700"}`}>
                        {n.title}
                      </p>
                      <p className="text-[12px] text-gray-500 mt-0.5 leading-snug line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1.5">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Actions — visible on hover */}
                    <div className="shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isNew && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                          className="h-6 w-6 flex items-center justify-center rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                        className="h-6 w-6 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {i < filtered.length - 1 && <Separator className="opacity-50" />}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
