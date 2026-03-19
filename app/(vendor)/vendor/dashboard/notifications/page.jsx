"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/hooks/use-notifications";
import {
  Bell, CheckCircle, AlertCircle, CreditCard, Star, Calendar,
  Wallet, Lock, Package, Shield, Info, X, BadgeCheck, XCircle,
  BellOff,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const TYPE_CONFIG = {
  booking_confirmed:    { icon: CheckCircle,  colour: "text-green-600",  bg: "bg-green-100"  },
  booking_cancelled:    { icon: XCircle,      colour: "text-red-500",    bg: "bg-red-100"    },
  booking_pending:      { icon: Calendar,     colour: "text-amber-500",  bg: "bg-amber-100"  },
  booking_updated:      { icon: Calendar,     colour: "text-blue-500",   bg: "bg-blue-100"   },
  payment_successful:   { icon: CreditCard,   colour: "text-green-600",  bg: "bg-green-100"  },
  payment_failed:       { icon: AlertCircle,  colour: "text-red-500",    bg: "bg-red-100"    },
  wallet_deposit:       { icon: Wallet,       colour: "text-green-600",  bg: "bg-green-100"  },
  password_changed:     { icon: Lock,         colour: "text-amber-600",  bg: "bg-amber-100"  },
  new_booking:          { icon: Calendar,     colour: "text-violet-600", bg: "bg-violet-100" },
  payment_received:     { icon: CreditCard,   colour: "text-green-600",  bg: "bg-green-100"  },
  listing_approved:     { icon: BadgeCheck,   colour: "text-green-600",  bg: "bg-green-100"  },
  listing_rejected:     { icon: XCircle,      colour: "text-red-500",    bg: "bg-red-100"    },
  kyc_approved:         { icon: BadgeCheck,   colour: "text-green-600",  bg: "bg-green-100"  },
  kyc_rejected:         { icon: XCircle,      colour: "text-red-500",    bg: "bg-red-100"    },
  new_review:           { icon: Star,         colour: "text-yellow-500", bg: "bg-yellow-100" },
  payout_processed:     { icon: Wallet,       colour: "text-green-600",  bg: "bg-green-100"  },
  system:               { icon: Info,         colour: "text-blue-500",   bg: "bg-blue-100"   },
};

const FILTERS = [
  { key: "all",      label: "All"       },
  { key: "unread",   label: "Unread"    },
  { key: "bookings", label: "Bookings"  },
  { key: "payments", label: "Payments"  },
];

const BOOKING_TYPES = ["booking_confirmed","booking_cancelled","booking_pending","booking_updated","new_booking"];
const PAYMENT_TYPES = ["payment_successful","payment_failed","payment_received","wallet_deposit","payout_processed"];

export const metadata = {
  title: "Notifications — Vendor Dashboard",
};

export default function VendorNotificationsPage() {
  const router = useRouter();
  const { data: authData } = useAuth();
  const userId = authData?.user?.id;

  const { data: notifications = [], isLoading, unreadCount } = useNotifications(userId);
  const markAsRead    = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotif   = useDeleteNotification();

  const [filter, setFilter] = require("react").useState("all");

  const filtered = notifications.filter((n) => {
    if (filter === "unread")   return !n.read;
    if (filter === "bookings") return BOOKING_TYPES.includes(n.type);
    if (filter === "payments") return PAYMENT_TYPES.includes(n.type);
    return true;
  });

  const handleMarkRead = (id) => {
    markAsRead.mutate({ notificationId: id, userId }, {
      onError: () => toast.error("Failed to mark as read"),
    });
  };

  const handleMarkAll = () => {
    markAllAsRead.mutate(userId, {
      onSuccess: () => toast.success("All notifications marked as read"),
      onError:   () => toast.error("Something went wrong"),
    });
  };

  const handleDelete = (id) => {
    deleteNotif.mutate({ notificationId: id, userId }, {
      onError: () => toast.error("Failed to delete"),
    });
  };

  const handleClick = (n) => {
    if (!n.read) handleMarkRead(n.id);
    if (n.link)  router.push(n.link);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-violet-600" />
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Bookings, payments, and updates for your listings
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="text-sm text-violet-600 font-medium hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              filter === f.key
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600"
            }`}
          >
            {f.label}
            {f.key === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 bg-white/20 text-white text-xs rounded-full px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col items-center gap-4 py-20 text-gray-400">
          <div className="w-8 h-8 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
          <p className="text-sm">Loading notifications…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-gray-400">
          <BellOff className="h-10 w-10 opacity-30" />
          <p className="text-base font-medium">No notifications</p>
          <p className="text-sm text-center max-w-xs">
            {filter !== "all"
              ? "No notifications in this category. Try switching to All."
              : "You're all caught up — nothing here yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const cfg  = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
            const Icon = cfg.icon;
            const isNew = !n.read;

            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all group
                  ${isNew
                    ? "bg-violet-50/60 border-violet-100 hover:bg-violet-50"
                    : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                  }`}
              >
                {/* Unread pip */}
                {isNew && (
                  <span className="absolute top-4 -left-0 h-2 w-2 rounded-full bg-violet-600 -translate-x-1/2" />
                )}

                {/* Icon */}
                <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                  <Icon className={`h-5 w-5 ${cfg.colour}`} strokeWidth={1.8} />
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold leading-snug ${isNew ? "text-gray-900" : "text-gray-700"}`}>
                      {n.title}
                    </p>
                    <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {/* Hover actions */}
                <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                  {isNew && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
