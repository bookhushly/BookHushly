"use client";

/**
 * HotelDateRangePicker
 *
 * A visual date-range picker that:
 *  - Fetches already-booked date windows for a given roomTypeId and blocks them.
 *  - Disables past dates.
 *  - Shows a 2-month calendar in range-selection mode.
 *  - Calls onChange({ checkIn: "YYYY-MM-DD", checkOut: "YYYY-MM-DD" }) when
 *    both dates are selected.
 *
 * Props
 *  roomTypeId  – UUID of the room type to check availability against.
 *  checkIn     – Controlled value ("YYYY-MM-DD" | "").
 *  checkOut    – Controlled value ("YYYY-MM-DD" | "").
 *  onChange    – ({ checkIn, checkOut }) => void
 *  className   – optional wrapper class
 */

import { useEffect, useState, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { format, parseISO, eachDayOfInterval, isBefore, startOfDay } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import "react-day-picker/dist/style.css";

export default function HotelDateRangePicker({
  roomTypeId,
  checkIn,
  checkOut,
  onChange,
  className = "",
}) {
  const supabase = createClient();
  const [bookedDates, setBookedDates] = useState([]); // flat array of JS Date objects
  const [loadingDates, setLoadingDates] = useState(false);

  // ── Fetch blocked date windows from existing confirmed bookings ──────────
  useEffect(() => {
    if (!roomTypeId) return;

    let cancelled = false;
    setLoadingDates(true);

    (async () => {
      const { data, error } = await supabase
        .from("hotel_bookings")
        .select("check_in_date, check_out_date")
        .eq("room_type_id", roomTypeId)
        .in("booking_status", ["confirmed", "checked_in"])
        .neq("payment_status", "failed");

      if (cancelled) return;
      setLoadingDates(false);

      if (error || !data) return;

      // Expand each booking into individual blocked dates
      const blocked = [];
      for (const b of data) {
        try {
          const days = eachDayOfInterval({
            start: parseISO(b.check_in_date),
            end:   parseISO(b.check_out_date),
          });
          blocked.push(...days);
        } catch {
          // malformed date — skip
        }
      }
      setBookedDates(blocked);
    })();

    return () => { cancelled = true; };
  }, [roomTypeId]);

  // ── Derive the DayPicker `selected` range from controlled props ──────────
  const selected = useMemo(() => {
    const from = checkIn  ? parseISO(checkIn)  : undefined;
    const to   = checkOut ? parseISO(checkOut) : undefined;
    return { from, to };
  }, [checkIn, checkOut]);

  // ── Disabled days: past + already booked ────────────────────────────────
  const disabledDays = useMemo(() => [
    { before: startOfDay(new Date()) },
    ...bookedDates,
  ], [bookedDates]);

  // ── Handle range selection ───────────────────────────────────────────────
  const handleSelect = (range) => {
    if (!range) {
      onChange({ checkIn: "", checkOut: "" });
      return;
    }
    const ci = range.from ? format(range.from, "yyyy-MM-dd") : "";
    const co = range.to   ? format(range.to,   "yyyy-MM-dd") : "";

    // If from === to (same day click) treat as only check-in selected
    if (ci && co && ci === co) {
      onChange({ checkIn: ci, checkOut: "" });
      return;
    }
    onChange({ checkIn: ci, checkOut: co });
  };

  return (
    <div className={`relative ${className}`}>
      {loadingDates && (
        <div className="absolute top-2 right-2 z-10">
          <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
        </div>
      )}

      <DayPicker
        mode="range"
        numberOfMonths={2}
        selected={selected}
        onSelect={handleSelect}
        disabled={disabledDays}
        fromDate={new Date()}
        showOutsideDays={false}
        classNames={{
          months:            "flex flex-col sm:flex-row gap-4",
          month:             "space-y-3",
          caption:           "flex justify-center pt-1 relative items-center",
          caption_label:     "text-[13px] font-semibold text-gray-800",
          nav:               "space-x-1 flex items-center",
          nav_button:        "h-7 w-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors",
          nav_button_previous: "absolute left-1",
          nav_button_next:   "absolute right-1",
          table:             "w-full border-collapse",
          head_row:          "flex",
          head_cell:         "text-gray-400 rounded-md w-9 font-normal text-[11px] text-center",
          row:               "flex w-full mt-1",
          cell: [
            "h-9 w-9 text-center text-sm p-0 relative",
            "[&:has([aria-selected].day-range-end)]:rounded-r-md",
            "[&:has([aria-selected].day-outside)]:bg-violet-50",
            "[&:has([aria-selected])]:bg-violet-50",
            "first:[&:has([aria-selected])]:rounded-l-md",
            "last:[&:has([aria-selected])]:rounded-r-md",
          ].join(" "),
          day: "h-9 w-9 p-0 font-normal text-[13px] rounded-lg hover:bg-violet-100 hover:text-violet-800 transition-colors aria-selected:opacity-100",
          day_range_start: "bg-violet-600 text-white hover:bg-violet-700 hover:text-white rounded-l-lg",
          day_range_end:   "day-range-end bg-violet-600 text-white hover:bg-violet-700 hover:text-white rounded-r-lg",
          day_selected:    "bg-violet-600 text-white hover:bg-violet-700 hover:text-white",
          day_today:       "bg-gray-100 font-semibold text-gray-900",
          day_outside:     "text-gray-300 opacity-50",
          day_disabled:    "text-gray-300 opacity-40 cursor-not-allowed line-through",
          day_range_middle: "aria-selected:bg-violet-50 aria-selected:text-violet-800 rounded-none",
          day_hidden:      "invisible",
        }}
      />

      {/* Summary chips */}
      {(checkIn || checkOut) && (
        <div className="flex gap-3 mt-3 px-1">
          <div className="flex-1 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2">
            <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider mb-0.5">Check-in</p>
            <p className="text-[13px] font-semibold text-gray-900">
              {checkIn ? format(parseISO(checkIn), "EEE, MMM d") : "—"}
            </p>
          </div>
          <div className="flex-1 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2">
            <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider mb-0.5">Check-out</p>
            <p className="text-[13px] font-semibold text-gray-900">
              {checkOut ? format(parseISO(checkOut), "EEE, MMM d") : "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
