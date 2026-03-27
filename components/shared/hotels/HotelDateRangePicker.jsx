"use client";

/**
 * HotelDateRangePicker
 *
 * A visual date-range picker that:
 *  - Fetches already-booked date windows for a given roomTypeId and blocks them.
 *  - Disables past dates.
 *  - Shows a guided step-by-step UI for first-time and older users.
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
import { format, parseISO, eachDayOfInterval, startOfDay } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { Loader2, RotateCcw } from "lucide-react";
import "react-day-picker/dist/style.css";


// Derive which step the user is on
function getStep(checkIn, checkOut) {
  if (!checkIn) return 1;
  if (!checkOut) return 2;
  return 3;
}

const STEP_CONFIG = {
  1: {
    label: "Step 1 of 2",
    instruction: "Tap the day you plan to arrive",
    icon: "arrival",
    color: "bg-amber-50 border-amber-200 text-amber-800",
    dot: "bg-amber-400",
  },
  2: {
    label: "Step 2 of 2",
    instruction: "Now tap the day you plan to leave",
    icon: "departure",
    color: "bg-violet-50 border-violet-200 text-violet-800",
    dot: "bg-violet-500",
  },
  3: {
    label: "Dates confirmed",
    instruction: "Your dates are set. You can change them by tapping any date.",
    icon: "done",
    color: "bg-green-50 border-green-200 text-green-800",
    dot: "bg-green-500",
  },
};

export default function HotelDateRangePicker({
  roomTypeId,
  checkIn,
  checkOut,
  onChange,
  className = "",
}) {
  const supabase = createClient();
  const [bookedDates, setBookedDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);

  const step = getStep(checkIn, checkOut);
  const stepCfg = STEP_CONFIG[step];

  // ── Fetch blocked date windows ───────────────────────────────────────────
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

      const blocked = [];
      for (const b of data) {
        try {
          blocked.push(
            ...eachDayOfInterval({
              start: parseISO(b.check_in_date),
              end: parseISO(b.check_out_date),
            })
          );
        } catch {
          // malformed date — skip
        }
      }
      setBookedDates(blocked);
    })();

    return () => { cancelled = true; };
  }, [roomTypeId]);

  // ── DayPicker selected range ─────────────────────────────────────────────
  const selected = useMemo(() => ({
    from: checkIn  ? parseISO(checkIn)  : undefined,
    to:   checkOut ? parseISO(checkOut) : undefined,
  }), [checkIn, checkOut]);

  const disabledDays = useMemo(() => [
    { before: startOfDay(new Date()) },
    ...bookedDates,
  ], [bookedDates]);

  // ── Range selection handler ──────────────────────────────────────────────
  const handleSelect = (range) => {
    if (!range) { onChange({ checkIn: "", checkOut: "" }); return; }
    const ci = range.from ? format(range.from, "yyyy-MM-dd") : "";
    const co = range.to   ? format(range.to,   "yyyy-MM-dd") : "";
    if (ci && co && ci === co) { onChange({ checkIn: ci, checkOut: "" }); return; }
    onChange({ checkIn: ci, checkOut: co });
  };

  const handleClear = () => onChange({ checkIn: "", checkOut: "" });

  return (
    <div className={`relative ${className}`}>

      {/* ── Step guidance banner ─────────────────────────────────────────── */}
      <div className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 mb-3 ${stepCfg.color}`}>
        <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${stepCfg.dot} mt-1.5`} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-widest opacity-70 mb-0.5">
            {stepCfg.label}
          </p>
          <p className="text-[13px] sm:text-[14px] font-medium leading-snug">
            {stepCfg.instruction}
          </p>
        </div>
        {loadingDates && (
          <Loader2 className="h-4 w-4 animate-spin shrink-0 opacity-60 mt-0.5" />
        )}
      </div>

      {/* ── Always-visible date chips ────────────────────────────────────── */}
      <div className="flex gap-2 mb-3">
        {/* Arrival chip */}
        <div className={`flex-1 rounded-xl border-2 px-3 py-2.5 transition-all ${
          checkIn
            ? "border-violet-400 bg-violet-50"
            : step === 1
            ? "border-amber-300 bg-amber-50 animate-pulse"
            : "border-gray-200 bg-gray-50"
        }`}>
          <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-0.5 flex items-center gap-1">
            <span className="inline-flex h-3.5 w-3.5 rounded-full bg-violet-600 text-white text-[8px] items-center justify-center font-medium shrink-0">1</span>
            Arrival
          </p>
          <p className={`text-[12px] sm:text-[14px] font-medium leading-tight ${checkIn ? "text-gray-900" : "text-gray-400"}`}>
            {checkIn ? format(parseISO(checkIn), "EEE, d MMM") : "Not set yet"}
          </p>
        </div>

        {/* Arrow divider */}
        <div className="flex items-center text-gray-300 text-lg font-normal select-none shrink-0">→</div>

        {/* Departure chip */}
        <div className={`flex-1 rounded-xl border-2 px-3 py-2.5 transition-all ${
          checkOut
            ? "border-violet-400 bg-violet-50"
            : step === 2
            ? "border-violet-300 bg-violet-50 animate-pulse"
            : "border-gray-200 bg-gray-50"
        }`}>
          <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-0.5 flex items-center gap-1">
            <span className="inline-flex h-3.5 w-3.5 rounded-full bg-violet-600 text-white text-[8px] items-center justify-center font-medium shrink-0">2</span>
            Departure
          </p>
          <p className={`text-[12px] sm:text-[14px] font-medium leading-tight ${checkOut ? "text-gray-900" : "text-gray-400"}`}>
            {checkOut ? format(parseISO(checkOut), "EEE, d MMM") : "Not set yet"}
          </p>
        </div>
      </div>

      {/* ── Calendar ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-100 bg-white p-2 sm:p-3">
        <DayPicker
          mode="range"
          numberOfMonths={1}
          selected={selected}
          onSelect={handleSelect}
          disabled={disabledDays}
          fromDate={new Date()}
          showOutsideDays={false}
          classNames={{
            months:              "flex flex-col sm:flex-row gap-4",
            month:               "space-y-2 sm:space-y-3 w-full",
            caption:             "flex justify-center pt-1 relative items-center mb-1",
            caption_label:       "text-[13px] sm:text-[14px] font-medium text-gray-800",
            nav:                 "space-x-1 flex items-center",
            nav_button:          "h-7 w-7 sm:h-8 sm:w-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors",
            nav_button_previous: "absolute left-1",
            nav_button_next:     "absolute right-1",
            table:               "w-full border-collapse",
            head_row:            "flex",
            head_cell:           "text-gray-500 rounded-md flex-1 font-medium text-[10px] sm:text-[11px] text-center py-1",
            row:                 "flex w-full mt-0.5 sm:mt-1",
            cell: [
              "flex-1 h-9 sm:h-10 text-center p-0 relative",
              "[&:has([aria-selected].day-range-end)]:rounded-r-md",
              "[&:has([aria-selected].day-outside)]:bg-violet-50",
              "[&:has([aria-selected])]:bg-violet-50",
              "first:[&:has([aria-selected])]:rounded-l-md",
              "last:[&:has([aria-selected])]:rounded-r-md",
            ].join(" "),
            day:              "w-full h-9 sm:h-10 p-0 font-medium text-[12px] sm:text-[13px] rounded-lg hover:bg-violet-100 hover:text-violet-800 transition-colors aria-selected:opacity-100",
            day_range_start:  "bg-violet-600 text-white hover:bg-violet-700 hover:text-white rounded-l-lg font-medium",
            day_range_end:    "day-range-end bg-violet-600 text-white hover:bg-violet-700 hover:text-white rounded-r-lg font-medium",
            day_selected:     "bg-violet-600 text-white hover:bg-violet-700 hover:text-white font-medium",
            day_today:        "ring-2 ring-violet-300 ring-inset font-medium text-violet-700",
            day_outside:      "text-gray-300 opacity-50",
            day_disabled:     "text-gray-300 opacity-30 cursor-not-allowed line-through",
            day_range_middle: "aria-selected:bg-violet-100 aria-selected:text-violet-800 rounded-none",
            day_hidden:       "invisible",
          }}
        />
      </div>

      {/* ── Legend ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 px-0.5">
        <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <span className="h-3 w-3 rounded-sm bg-violet-600 shrink-0" />
          Your selected dates
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <span className="h-3 w-3 rounded-sm bg-violet-100 shrink-0" />
          Your stay range
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <span className="h-3 w-3 rounded-sm bg-gray-100 line-through text-gray-300 text-[9px] flex items-center justify-center shrink-0">✕</span>
          Not available
        </span>
      </div>

      {/* ── Clear button ─────────────────────────────────────────────────── */}
      {(checkIn || checkOut) && (
        <button
          type="button"
          onClick={handleClear}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear dates and start over
        </button>
      )}
    </div>
  );
}
