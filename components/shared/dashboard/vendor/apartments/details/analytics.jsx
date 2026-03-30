"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  CalendarDays,
  DollarSign,
  BarChart3,
  Loader2,
  Moon,
  Users,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, subMonths, differenceInCalendarDays, parseISO, eachMonthOfInterval } from "date-fns";

const MONTHS_BACK = 6;

function StatCard({ icon: Icon, label, value, sub, color = "purple" }) {
  const colors = {
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-start gap-4">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-medium text-gray-900 dark:text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const barColors = {
    purple: "bg-purple-500",
    green: "bg-green-500",
    blue: "bg-blue-400",
  };
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-16 text-gray-500 dark:text-gray-400 shrink-0 text-right">{label}</span>
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all ${barColors[color] || "bg-purple-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-12 font-medium text-gray-700 dark:text-gray-300 text-right">{value}</span>
    </div>
  );
}

export default function AnalyticsTab({ apartmentId, apartment }) {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [views, setViews] = useState(apartment?.views_count ?? null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/vendor/apartments/${apartmentId}/analytics`);
        if (!res.ok) throw new Error();
        const d = await res.json();
        setBookings(d.bookings || []);
        if (d.views_count != null) setViews(d.views_count);
      } catch {
        // fallback to empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [apartmentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading analytics…
      </div>
    );
  }

  // ── Compute metrics ─────────────────────────────────────────────────────────
  const now = new Date();
  const periodStart = startOfMonth(subMonths(now, MONTHS_BACK - 1));
  const periodEnd = endOfMonth(now);
  const totalDaysInPeriod = differenceInCalendarDays(periodEnd, periodStart) + 1;

  const confirmedStatuses = ["confirmed", "checked_in", "checked_out", "completed"];

  // Bookings that overlap the analysis window and are confirmed/paid
  const confirmedBookings = bookings.filter((b) =>
    confirmedStatuses.includes(b.booking_status)
  );

  // Total booked nights in the period (clamped to window)
  let bookedNights = 0;
  let totalRevenue = 0;
  let totalGuests = 0;

  confirmedBookings.forEach((b) => {
    const ci = parseISO(b.check_in_date);
    const co = parseISO(b.check_out_date);
    const start = ci < periodStart ? periodStart : ci;
    const end = co > periodEnd ? periodEnd : co;
    if (end > start) {
      bookedNights += differenceInCalendarDays(end, start);
    }
    totalRevenue += parseFloat(b.total_amount || 0);
    totalGuests += b.number_of_guests || 1;
  });

  const occupancyRate = totalDaysInPeriod > 0
    ? Math.min(100, Math.round((bookedNights / totalDaysInPeriod) * 100))
    : 0;

  const avgNightlyRate = bookedNights > 0
    ? Math.round(totalRevenue / bookedNights)
    : parseFloat(apartment?.price_per_night || 0);

  const avgGuests = confirmedBookings.length > 0
    ? (totalGuests / confirmedBookings.length).toFixed(1)
    : "—";

  // Status breakdown (all bookings, not just confirmed)
  const statusCount = {};
  bookings.forEach((b) => {
    statusCount[b.booking_status] = (statusCount[b.booking_status] || 0) + 1;
  });
  const maxStatus = Math.max(...Object.values(statusCount), 1);

  // Monthly revenue bars
  const months = eachMonthOfInterval({ start: periodStart, end: periodEnd });
  const monthlyRevenue = months.map((m) => {
    const mStart = startOfMonth(m);
    const mEnd = endOfMonth(m);
    const rev = confirmedBookings
      .filter((b) => {
        const ci = parseISO(b.check_in_date);
        return ci >= mStart && ci <= mEnd;
      })
      .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
    return { label: format(m, "MMM"), revenue: rev };
  });
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  // Conversion: views → bookings (rough)
  const conversionPct =
    views && views > 0 && bookings.length > 0
      ? Math.min(100, ((bookings.length / views) * 100).toFixed(1))
      : null;

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Analytics for the last {MONTHS_BACK} months
        ({format(periodStart, "d MMM yyyy")} – {format(periodEnd, "d MMM yyyy")})
      </p>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart3}
          label="Occupancy rate"
          value={`${occupancyRate}%`}
          sub={`${bookedNights} of ${totalDaysInPeriod} nights`}
          color="purple"
        />
        <StatCard
          icon={DollarSign}
          label="Total revenue"
          value={`₦${totalRevenue.toLocaleString()}`}
          sub={`${confirmedBookings.length} booking${confirmedBookings.length !== 1 ? "s" : ""}`}
          color="green"
        />
        <StatCard
          icon={Moon}
          label="Avg. nightly rate"
          value={`₦${avgNightlyRate.toLocaleString()}`}
          sub="from confirmed bookings"
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Avg. guests/stay"
          value={avgGuests}
          sub={views != null ? `${views.toLocaleString()} total views` : undefined}
          color="amber"
        />
      </div>

      {/* Monthly revenue chart */}
      <div className="bg-white rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-purple-500" />
          Monthly revenue
        </h3>
        <div className="space-y-2.5">
          {monthlyRevenue.map(({ label, revenue }) => (
            <MiniBar key={label} label={label} value={`₦${Math.round(revenue / 1000)}k`} max={maxRevenue} color="purple" />
          ))}
        </div>
        {totalRevenue === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">No confirmed revenue in this period</p>
        )}
      </div>

      {/* Booking status breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-blue-500" />
          Booking status breakdown
        </h3>
        {Object.keys(statusCount).length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500">No bookings yet</p>
        ) : (
          <div className="space-y-2.5">
            {Object.entries(statusCount)
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => (
                <MiniBar
                  key={status}
                  label={status.replace(/_/g, " ")}
                  value={count}
                  max={maxStatus}
                  color={confirmedStatuses.includes(status) ? "green" : "blue"}
                />
              ))}
          </div>
        )}
      </div>

      {/* Conversion */}
      {conversionPct !== null && (
        <div className="bg-white rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Eye className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">View-to-booking conversion</p>
            <p className="text-2xl font-medium text-gray-900 dark:text-white">{conversionPct}%</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} from {views?.toLocaleString()} views
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
