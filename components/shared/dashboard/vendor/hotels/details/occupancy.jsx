"use client";

/**
 * HotelOccupancyTab
 * Shows:
 *  - Occupancy rate % (last 30 days)
 *  - Monthly revenue bar chart (last 6 months)
 *  - Room utilisation per room type
 *  - 3-month calendar heatmap of booked nights
 */

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  TrendingUp, TrendingDown, BedDouble, CalendarDays, Banknote, PercentIcon,
} from "lucide-react";
import {
  addDays, format, startOfMonth, endOfMonth, eachDayOfInterval,
  eachMonthOfInterval, subMonths, startOfDay, isSameMonth,
} from "date-fns";

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, trend }) {
  const up = trend > 0;
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center">
            <Icon className="h-5 w-5 text-purple-600" />
          </div>
          {trend !== undefined && (
            <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? "text-green-600" : "text-red-500"}`}>
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-medium text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ── Calendar heatmap ──────────────────────────────────────────────────────────
const INTENSITY = [
  "bg-gray-100",
  "bg-purple-100",
  "bg-purple-300",
  "bg-purple-500",
  "bg-purple-700",
];

function CalendarHeatmap({ bookedDates }) {
  const booked = useMemo(() => new Set(bookedDates), [bookedDates]);

  // Show current month + 2 upcoming months
  const months = useMemo(() => {
    const now = new Date();
    return [0, 1, 2].map((offset) => {
      const d = addDays(startOfMonth(now), offset * 32);
      return startOfMonth(d);
    });
  }, []);

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {months.map((monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
        const startOffset = monthStart.getDay(); // 0=Sun

        return (
          <div key={monthStart.toISOString()}>
            <p className="text-sm font-medium text-gray-700 mb-2">
              {format(monthStart, "MMMM yyyy")}
            </p>
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {weekDays.map((d) => (
                <div key={d} className="text-[10px] text-gray-400 pb-1">{d}</div>
              ))}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const isBooked = booked.has(key);
                const isPast = day < startOfDay(new Date());
                return (
                  <div
                    key={key}
                    title={`${key}${isBooked ? " — booked" : ""}`}
                    className={`
                      aspect-square rounded text-[10px] flex items-center justify-center
                      ${isBooked ? "bg-purple-500 text-white font-medium" : "bg-gray-100 text-gray-400"}
                      ${isPast && !isBooked ? "opacity-40" : ""}
                    `}
                  >
                    {format(day, "d")}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function HotelOccupancyTab({ hotelId }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadOccupancyData();
  }, [hotelId]);

  const loadOccupancyData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const thirtyDaysAgo = format(subMonths(now, 1), "yyyy-MM-dd");
      const sixMonthsAgo = format(subMonths(now, 6), "yyyy-MM-dd");
      const threeMonthsOut = format(addDays(now, 90), "yyyy-MM-dd");
      const today = format(now, "yyyy-MM-dd");

      // 1. Total rooms
      const { data: rooms } = await supabase
        .from("hotel_rooms")
        .select("id, room_type_id, status")
        .eq("hotel_id", hotelId);

      const totalRooms = rooms?.length || 0;

      // 2. Recent bookings (6 months) for revenue + occupancy
      const { data: bookings } = await supabase
        .from("hotel_bookings")
        .select("id, room_id, check_in_date, check_out_date, total_price, booking_status, payment_status")
        .eq("hotel_id", hotelId)
        .gte("check_in_date", sixMonthsAgo)
        .in("booking_status", ["confirmed", "checked_in", "completed", "pay_at_hotel"]);

      // 3. Room types for utilisation
      const { data: roomTypes } = await supabase
        .from("hotel_room_types")
        .select("id, name")
        .eq("hotel_id", hotelId);

      // ── Occupancy rate (last 30 days) ──────────────────────────────────────
      const last30Bookings = (bookings || []).filter(
        (b) => b.check_in_date >= thirtyDaysAgo && b.check_in_date <= today
      );
      const occupiedNights = last30Bookings.reduce((sum, b) => {
        const checkIn = new Date(b.check_in_date);
        const checkOut = new Date(b.check_out_date);
        return sum + Math.max(0, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
      }, 0);
      const possibleNights = totalRooms * 30;
      const occupancyRate = possibleNights > 0
        ? Math.round((occupiedNights / possibleNights) * 100)
        : 0;

      // ── Monthly revenue (last 6 months) ───────────────────────────────────
      const months = eachMonthOfInterval({ start: new Date(sixMonthsAgo), end: now });
      const revenueByMonth = months.map((monthStart) => {
        const label = format(monthStart, "MMM");
        const monthEnd = endOfMonth(monthStart);
        const revenue = (bookings || [])
          .filter((b) => {
            const d = new Date(b.check_in_date);
            return d >= monthStart && d <= monthEnd &&
              (b.payment_status === "completed" || b.booking_status === "pay_at_hotel");
          })
          .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
        return { label, revenue: Math.round(revenue) };
      });

      const totalRevenue = revenueByMonth.reduce((s, m) => s + m.revenue, 0);
      const totalBookings = (bookings || []).length;

      // ── Room type utilisation ──────────────────────────────────────────────
      const rtMap = {};
      for (const rt of roomTypes || []) rtMap[rt.id] = { name: rt.name, booked: 0, total: 0 };
      for (const room of rooms || []) {
        if (rtMap[room.room_type_id]) rtMap[room.room_type_id].total++;
      }
      for (const b of last30Bookings) {
        const room = (rooms || []).find((r) => r.id === b.room_id);
        if (room && rtMap[room.room_type_id]) rtMap[room.room_type_id].booked++;
      }
      const utilisation = Object.values(rtMap).map((rt) => ({
        name: rt.name,
        rate: rt.total > 0 ? Math.round((rt.booked / rt.total) * 100) : 0,
        booked: rt.booked,
        total: rt.total,
      }));

      // ── Calendar booked dates (current + 2 upcoming months) ──────────────
      const calBookings = (bookings || []).filter(
        (b) => b.check_in_date <= threeMonthsOut && b.check_out_date >= today
      );
      const bookedDates = new Set();
      for (const b of calBookings) {
        const days = eachDayOfInterval({
          start: new Date(b.check_in_date),
          end: addDays(new Date(b.check_out_date), -1),
        });
        for (const d of days) bookedDates.add(format(d, "yyyy-MM-dd"));
      }

      setData({
        totalRooms,
        occupancyRate,
        totalRevenue,
        totalBookings,
        revenueByMonth,
        utilisation,
        bookedDates: Array.from(bookedDates),
      });
    } catch (err) {
      console.error("[HotelOccupancyTab]", err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={PercentIcon}
          label="Occupancy rate"
          value={`${data.occupancyRate}%`}
          sub="Last 30 days"
        />
        <StatCard
          icon={Banknote}
          label="Total revenue"
          value={fmt(data.totalRevenue)}
          sub="Last 6 months"
        />
        <StatCard
          icon={CalendarDays}
          label="Bookings"
          value={data.totalBookings}
          sub="Last 6 months"
        />
        <StatCard
          icon={BedDouble}
          label="Total rooms"
          value={data.totalRooms}
          sub="Across all types"
        />
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Revenue</CardTitle>
          <CardDescription>Last 6 months — confirmed & paid bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.revenueByMonth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                formatter={(v) => [fmt(v), "Revenue"]}
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {data.revenueByMonth.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={i === data.revenueByMonth.length - 1 ? "#7c3aed" : "#c4b5fd"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Room type utilisation */}
      {data.utilisation.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Room Type Utilisation</CardTitle>
            <CardDescription>Bookings per room type in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.utilisation.map((rt) => (
              <div key={rt.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{rt.name}</span>
                  <span className="text-gray-500">
                    {rt.booked}/{rt.total} rooms · {rt.rate}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${rt.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Calendar heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking Calendar</CardTitle>
          <CardDescription>Purple dates have at least one confirmed booking</CardDescription>
        </CardHeader>
        <CardContent>
          <CalendarHeatmap bookedDates={data.bookedDates} />
        </CardContent>
      </Card>
    </div>
  );
}
