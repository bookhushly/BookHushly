"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Status Badge ──────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  checked_in: {
    label: "Checked In",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: CheckCircle2,
  },
  checked_out: {
    label: "Checked Out",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: TrendingUp,
  },
  quoted: {
    label: "Quoted",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: FileText,
  },
  paid: {
    label: "Paid",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  no_show: {
    label: "No Show",
    color: "bg-gray-50 text-gray-600 border-gray-200",
    icon: AlertCircle,
  },
};

export function StatusBadge({ status, className }) {
  const config = STATUS_CONFIG[status] || {
    label: status || "Unknown",
    color: "bg-gray-50 text-gray-600 border-gray-200",
    icon: AlertCircle,
  };
  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium text-xs capitalize",
        config.color,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-purple-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Button
          asChild
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Link href={actionHref}>
            {actionLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────

export function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Stats Card ───────────────────────────────────────────────────────────────

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}) {
  const variants = {
    default: "bg-white border-purple-100",
    purple: "bg-purple-600 text-white",
    soft: "bg-purple-50 border-purple-100",
  };

  const isPurple = variant === "purple";

  return (
    <div
      className={cn(
        "border rounded-2xl p-5 transition-shadow hover:shadow-md",
        variants[variant],
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <p
          className={cn(
            "text-sm font-medium",
            isPurple ? "text-purple-100" : "text-gray-500",
          )}
        >
          {title}
        </p>
        <div
          className={cn(
            "p-2 rounded-lg",
            isPurple ? "bg-white/15" : "bg-purple-50",
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4",
              isPurple ? "text-white" : "text-purple-600",
            )}
          />
        </div>
      </div>
      <p
        className={cn(
          "text-3xl font-bold tracking-tight",
          isPurple ? "text-white" : "text-gray-900",
        )}
      >
        {value}
      </p>
      {subtitle && (
        <p
          className={cn(
            "text-xs mt-1",
            isPurple ? "text-purple-200" : "text-gray-400",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-purple-100 rounded-2xl p-6 animate-pulse"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-32" />
            </div>
            <div className="h-6 bg-gray-100 rounded-lg w-20" />
          </div>
          <div className="flex gap-4">
            <div className="h-3 bg-gray-100 rounded w-24" />
            <div className="h-3 bg-gray-100 rounded w-24" />
            <div className="h-3 bg-gray-100 rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section Card ────────────────────────────────────────────────────────────

export function SectionCard({
  title,
  description,
  children,
  action,
  className,
}) {
  return (
    <div
      className={cn("bg-white border border-purple-100 rounded-2xl", className)}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-50">
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Amount Display ───────────────────────────────────────────────────────────

export function Amount({ value, className, size = "md" }) {
  const formatted = value
    ? `₦${parseFloat(value).toLocaleString("en-NG", { minimumFractionDigits: 0 })}`
    : "—";

  const sizes = {
    sm: "text-sm font-medium",
    md: "text-base font-semibold",
    lg: "text-xl font-bold",
  };

  return (
    <span className={cn(sizes[size], "text-gray-900", className)}>
      {formatted}
    </span>
  );
}
