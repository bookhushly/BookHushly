"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, CheckCircle, AlertCircle, CreditCard, Star, Calendar,
  Wallet, Lock, Package, Shield, Info, X, BadgeCheck, XCircle,
  BellOff, Users, Truck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/hooks/use-notifications";

const TYPE_CONFIG = {
  booking_confirmed:      { icon: CheckCircle,  colour: "text-green-600",  bg: "bg-green-100",  label: "Booking"    },
  booking_cancelled:      { icon: XCircle,      colour: "text-red-500",    bg: "bg-red-100",    label: "Booking"    },
  payment_successful:     { icon: CreditCard,   colour: "text-green-600",  bg: "bg-green-100",  label: "Payment"    },
  payment_failed:         { icon: AlertCircle,  colour: "text-red-500",    bg: "bg-red-100",    label: "Payment"    },
  payment_issue:          { icon: AlertCircle,  colour: "text-red-500",    bg: "bg-red-100",    label: "Payment"    },
  wallet_deposit:         { icon: Wallet,       colour: "text-green-600",  bg: "bg-green-100",  label: "Wallet"     },
  password_changed:       { icon: Lock,         colour: "text-amber-600",  bg: "bg-amber-100",  label: "Security"   },
  new_vendor:             { icon: Users,        colour: "text-violet-600", bg: "bg-violet-100", label: "Vendor"     },
  kyc_submitted:          { icon: Package,      colour: "text-blue-500",   bg: "bg-blue-100",   label: "KYC"        },
  kyc_approved:           { icon: BadgeCheck,   colour: "text-green-600",  bg: "bg-green-100",  label: "KYC"        },
  kyc_rejected:           { icon: XCircle,      colour: "text-red-500",    bg: "bg-red-100",    label: "KYC"        },
  new_logistics_request:  { icon: Truck,        colour: "text-blue-500",   bg: "bg-blue-100",   label: "Logistics"  },
  new_security_request:   { icon: Shield,       colour: "text-red-500",    bg: "bg-red-100",    label: "Security"   },
  new_review:             { icon: Star,         colour: "text-yellow-500", bg: "bg-yellow-100", label: "Review"     },
  payout_processed:       { icon: Wallet,       colour: "text-green-600",  bg: "bg-green-100",  label: "Payout"     },
  system:                 { icon: Info,         colour: "text-blue-500",   bg: "bg-blue-100",   label: "System"     },
};

const FILTERS = [
  { key: "all",      label: "All"      },
  { key: "unread",   label: "Unread"   },
  { key: "vendors",  label: "Vendors"  },
  { key: "payments", label: "Payments" },
  { key: "requests", label: "Requests" },
];

const VENDOR_TYPES   = ["new_vendor","kyc_submitted","kyc_approved","kyc_rejected"];
const PAYMENT_TYPES  = ["payment_successful","payment_failed","payment_issue","payout_processed","wallet_deposit"];
const REQUEST_TYPES  = ["new_logistics_request","new_security_request"];

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { data: authData } = useAuth();
  const userId = authData?.user?.id;

  const { data: notifications = [], isLoading, unreadCount } = useNotifications(userId);
  const markAsRead    = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotif   = useDeleteNotification();

  const [filter, setFilter] = useState("all");

  const filtered = notifications.filter((n) => {
    if (filter === "unread")   return !n.read;
    if (filter === "vendors")  return VENDOR_TYPES.includes(n.type);
    if (filter === "payments") return PAYMENT_TYPES.includes(n.type);
    if (filter === "requests") return REQUEST_TYPES.includes(n.type);
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

  // Group by priority — unread alerts (payment_issue, new_security) go first
  const PRIORITY_TYPES = ["payment_issue", "new_security_request"];
  const alerts  = filtered.filter((n) => !n.read && PRIORITY_TYPES.includes(n.type));
  const rest     = filtered.filter((n) => !alerts.includes(n));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-violet-600" />
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Vendor applications, payment alerts, and platform operations
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="text-sm text-violet-600 font-medium hover:underline shrink-0 mt-1"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Stats */}
      {!isLoading && notifications.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: "Total",    value: notifications.length },
            { label: "Unread",   value: unreadCount,             highlight: unreadCount > 0 },
            { label: "Vendors",  value: notifications.filter(n => VENDOR_TYPES.includes(n.type)).length  },
            { label: "Requests", value: notifications.filter(n => REQUEST_TYPES.includes(n.type)).length },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-3 py-3 text-center">
              <p className={`text-lg font-bold ${s.highlight ? "text-violet-600" : "text-gray-900"}`}>
                {s.value}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              filter === f.key
                ? "bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-600/20"
                : "bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600"
            }`}
          >
            {f.label}
            {f.key === "unread" && unreadCount > 0 && (
              <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${
                filter === f.key ? "bg-white/20" : "bg-violet-100 text-violet-700"
              }`}>
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
          <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center">
            <BellOff className="h-7 w-7 text-violet-300" />
          </div>
          <p className="text-base font-semibold text-gray-600">No notifications</p>
          <p className="text-sm text-center text-gray-400">
            {filter !== "all" ? "Nothing in this category yet." : "All quiet — nothing to action right now."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Priority alerts at top */}
          {alerts.length > 0 && (
            <>
              <p className="text-[11px] font-bold uppercase tracking-widest text-red-500 px-1 mb-2">
                Requires Attention
              </p>
              {alerts.map((n) => <NotifRow key={n.id} n={n} onMarkRead={handleMarkRead} onDelete={handleDelete} onClick={handleClick} priority />)}
              {rest.length > 0 && (
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 px-1 pt-2 mb-1">
                  Earlier
                </p>
              )}
            </>
          )}
          {rest.map((n) => (
            <NotifRow key={n.id} n={n} onMarkRead={handleMarkRead} onDelete={handleDelete} onClick={handleClick} />
          ))}
        </div>
      )}
    </div>
  );
}

function NotifRow({ n, onMarkRead, onDelete, onClick, priority }) {
  const cfg   = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
  const Icon  = cfg.icon;
  const isNew = !n.read;

  return (
    <div
      onClick={() => onClick(n)}
      className={`relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer
        transition-all duration-150 group
        ${priority && isNew
          ? "bg-red-50/60 border-red-100 hover:bg-red-50 hover:border-red-200"
          : isNew
          ? "bg-violet-50/70 border-violet-100 hover:bg-violet-50 hover:border-violet-200"
          : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
        }`}
    >
      {isNew && (
        <span className={`absolute top-5 -left-0 h-2 w-2 rounded-full -translate-x-[5px] ${priority ? "bg-red-500" : "bg-violet-500"}`} />
      )}

      <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${cfg.bg}`}>
        <Icon className={`h-5 w-5 ${cfg.colour}`} strokeWidth={1.8} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-semibold leading-snug ${isNew ? "text-gray-900" : "text-gray-700"}`}>
              {n.title}
            </p>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
              {cfg.label}
            </span>
          </div>
          <span className="text-[11px] text-gray-400 shrink-0 mt-0.5 whitespace-nowrap">
            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">{n.message}</p>
        {n.link && (
          <span className="text-[11px] text-violet-500 font-medium mt-1.5 inline-block">
            View details →
          </span>
        )}
      </div>

      <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-start mt-0.5">
        {isNew && (
          <button
            onClick={(e) => { e.stopPropagation(); onMarkRead(n.id); }}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
            title="Mark as read"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
