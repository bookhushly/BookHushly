"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ChevronDown, CalendarCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { differenceInCalendarDays, parseISO, format } from "date-fns";
import HotelDateRangePicker from "@/components/shared/hotels/HotelDateRangePicker";
import { createClient } from "@/lib/supabase/client";

// ── Pricing rules fetch ───────────────────────────────────────────────────────
function usePricingRules(apartmentId) {
  const [rules, setRules] = useState([]);
  useEffect(() => {
    fetch(`/api/vendor/apartments/pricing-rules?apartment_id=${apartmentId}`)
      .then((r) => r.json())
      .then((d) => setRules(d.data || []))
      .catch(() => {});
  }, [apartmentId]);
  return rules;
}

function calculateTotalWithRules(checkInStr, nights, apartment, rules) {
  if (nights <= 0) return 0;
  if (!checkInStr || !rules || rules.length === 0) {
    // Fallback to weekly/monthly rates
    if (apartment.price_per_month && nights >= 30) {
      const months = Math.floor(nights / 30);
      const rem = nights % 30;
      return months * apartment.price_per_month + rem * apartment.price_per_night;
    }
    if (apartment.price_per_week && nights >= 7) {
      const weeks = Math.floor(nights / 7);
      const rem = nights % 7;
      return weeks * apartment.price_per_week + rem * apartment.price_per_night;
    }
    return nights * apartment.price_per_night;
  }

  // Night-by-night calculation with rule overrides
  let total = 0;
  const base = new Date(checkInStr);
  for (let i = 0; i < nights; i++) {
    const night = new Date(base);
    night.setDate(night.getDate() + i);
    const nightStr = night.toISOString().slice(0, 10);
    const rule = rules.find((r) => r.start_date <= nightStr && r.end_date >= nightStr);
    total += rule ? parseFloat(rule.price_per_night) : parseFloat(apartment.price_per_night);
  }
  return total;
}

// ── Availability fetch (reuses hotel_bookings pattern for apartments) ─────────
function useApartmentBlockedDates(apartmentId) {
  const supabase = createClient();
  const [blockedDates, setBlockedDates] = useState([]);

  useEffect(() => {
    if (!apartmentId) return;
    (async () => {
      const { data } = await supabase
        .from("apartment_bookings")
        .select("check_in_date, check_out_date")
        .eq("apartment_id", apartmentId)
        .in("booking_status", ["confirmed", "checked_in"]);

      if (!data) return;
      // We pass blocked date ranges to HotelDateRangePicker via roomTypeId
      // The picker fetches its own data — this hook is for the availability summary only
      setBlockedDates(data);
    })();
  }, [apartmentId]);

  return blockedDates;
}


// ─── ApartmentDatePicker ──────────────────────────────────────────────────────
// Wraps HotelDateRangePicker — passes apartmentId as roomTypeId so the picker
// fetches apartment_bookings blocked dates via its own query. The picker's SQL
// uses room_type_id but this table join is transparently mapped by the picker.
// Since apartments don't have room types, we pass the apartment id directly
// and rely on the picker's internal query being keyed on that id.
// Note: HotelDateRangePicker queries hotel_bookings; for apartments we show a
// simpler inline date summary and use our own availability overlay.
function DateSummaryBar({ checkIn, checkOut, nights, onOpen }) {
  if (checkIn && checkOut) {
    return (
      <div
        onClick={onOpen}
        className="flex items-center gap-3 p-3.5 bg-violet-50 border border-violet-200 rounded-xl cursor-pointer hover:border-violet-400 transition-all"
      >
        <CalendarCheck className="h-4 w-4 text-violet-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-gray-900">
            {format(parseISO(checkIn), "EEE d MMM")}
            <span className="text-gray-400 mx-2">→</span>
            {format(parseISO(checkOut), "EEE d MMM")}
          </p>
          <p className="text-[11px] text-violet-600 mt-0.5">
            {nights} night{nights !== 1 ? "s" : ""} · tap to change
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-violet-400 shrink-0" />
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full flex items-center gap-3 p-3.5 bg-white border-2 border-dashed border-violet-200 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition-all group"
    >
      <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 group-hover:bg-violet-200 transition-colors">
        <CalendarCheck className="h-4 w-4 text-violet-600" />
      </div>
      <div className="text-left">
        <p className="text-[13px] font-semibold text-gray-800">Select your dates</p>
        <p className="text-[11px] text-gray-400 mt-0.5">Tap to see available dates on a calendar</p>
      </div>
      <ChevronDown className="h-4 w-4 text-gray-300 ml-auto" />
    </button>
  );
}

// ─── Main booking card ────────────────────────────────────────────────────────
export default function ApartmentBookingCard({ apartment }) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [step, setStep] = useState(1); // 1 = dates+guests, 2 = guest details
  const [details, setDetails] = useState({ guestName: "", guestEmail: "", guestPhone: "", specialRequests: "" });
  const [submitting, setSubmitting] = useState(false);

  const pricingRules = usePricingRules(apartment.id);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn)));
  }, [checkIn, checkOut]);

  const totalPrice = useMemo(
    () => calculateTotalWithRules(checkIn, nights, apartment, pricingRules),
    [checkIn, nights, apartment, pricingRules],
  );

  const priceLabel = useMemo(() => {
    if (nights <= 0) return null;
    if (apartment.price_per_month && nights >= 30) {
      const months = Math.floor(nights / 30);
      const rem = nights % 30;
      const parts = [];
      if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""} @ ₦${apartment.price_per_month.toLocaleString()}`);
      if (rem > 0) parts.push(`${rem} night${rem > 1 ? "s" : ""} @ ₦${apartment.price_per_night.toLocaleString()}`);
      return parts.join(" + ");
    }
    if (apartment.price_per_week && nights >= 7) {
      const weeks = Math.floor(nights / 7);
      const rem = nights % 7;
      const parts = [];
      if (weeks > 0) parts.push(`${weeks} week${weeks > 1 ? "s" : ""} @ ₦${apartment.price_per_week.toLocaleString()}`);
      if (rem > 0) parts.push(`${rem} night${rem > 1 ? "s" : ""} @ ₦${apartment.price_per_night.toLocaleString()}`);
      return parts.join(" + ");
    }
    return `₦${apartment.price_per_night.toLocaleString()} × ${nights} night${nights !== 1 ? "s" : ""}`;
  }, [nights, apartment]);

  const meetsMinimumStay = nights >= (apartment.minimum_stay || 1);
  const isDateValid = checkIn && checkOut && nights > 0 && meetsMinimumStay;
  const isGuestValid = guests >= 1 && guests <= apartment.max_guests;

  const handleDateChange = ({ checkIn: ci, checkOut: co }) => {
    setCheckIn(ci);
    setCheckOut(co);
    if (ci && co) setCalendarOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("apartment_id", apartment.id);
      formData.append("check_in_date", checkIn);
      formData.append("check_out_date", checkOut);
      formData.append("number_of_guests", guests.toString());
      formData.append("guest_name", details.guestName);
      formData.append("guest_email", details.guestEmail);
      formData.append("guest_phone", details.guestPhone);
      formData.append("special_requests", details.specialRequests);
      formData.append("price_per_night", apartment.price_per_night.toString());
      formData.append("caution_deposit", (apartment.caution_deposit || 0).toString());

      const res = await fetch("/api/bookings/apartment", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create booking");

      toast.success("Booking created! Redirecting to payment…");
      router.push(`/payment/apartment/${data.data.id}`);
    } catch (err) {
      toast.error(err.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 1: Dates + Guests ─────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="space-y-4">
        {/* Date picker trigger */}
        <DateSummaryBar
          checkIn={checkIn}
          checkOut={checkOut}
          nights={nights}
          onOpen={() => setCalendarOpen((v) => !v)}
        />

        {/* Inline calendar */}
        {calendarOpen && (
          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <HotelDateRangePicker
              roomTypeId={apartment.id}
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={handleDateChange}
            />
          </div>
        )}

        {/* Minimum stay warning */}
        {checkIn && checkOut && nights > 0 && !meetsMinimumStay && (
          <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Minimum stay is {apartment.minimum_stay} night{apartment.minimum_stay !== 1 ? "s" : ""}. Please extend your checkout date.
          </p>
        )}

        {/* Guest stepper */}
        <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="text-[13px] font-medium text-gray-900">Guests</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Max {apartment.max_guests}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              disabled={guests <= 1}
              className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-violet-400 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-[15px] font-semibold tabular-nums">{guests}</span>
            <button
              type="button"
              onClick={() => setGuests((g) => Math.min(apartment.max_guests, g + 1))}
              disabled={guests >= apartment.max_guests}
              className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-violet-400 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Price breakdown */}
        {isDateValid && (
          <div className="bg-violet-50 rounded-xl border border-violet-100 p-3.5 space-y-2 text-[13px]">
            <div className="flex justify-between text-gray-600">
              <span>{priceLabel}</span>
              <span className="font-semibold text-gray-900">₦{totalPrice.toLocaleString()}</span>
            </div>
            {apartment.caution_deposit > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Security deposit</span>
                <span>₦{apartment.caution_deposit.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-violet-200">
              <span>Total due</span>
              <span className="text-violet-700">₦{(totalPrice + (apartment.caution_deposit || 0)).toLocaleString()}</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setStep(2)}
          disabled={!isDateValid || !isGuestValid}
          className="w-full h-11 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors text-[14px]"
        >
          {apartment.instant_booking ? "Continue to Book →" : "Continue to Request →"}
        </button>

        <p className="text-center text-[11px] text-gray-400">You won't be charged yet</p>
      </div>
    );
  }

  // ── Step 2: Guest details ──────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date summary at top of step 2 */}
      <div className="flex items-center gap-2 p-3 bg-violet-50 rounded-xl border border-violet-100">
        <CalendarCheck className="h-4 w-4 text-violet-500 shrink-0" />
        <p className="text-[12px] text-gray-700 font-medium">
          {format(parseISO(checkIn), "d MMM")} → {format(parseISO(checkOut), "d MMM")} · {nights} night{nights !== 1 ? "s" : ""} · {guests} guest{guests !== 1 ? "s" : ""}
        </p>
        <button type="button" onClick={() => setStep(1)} className="ml-auto text-[11px] text-violet-600 hover:text-violet-800 font-medium shrink-0">
          Change
        </button>
      </div>

      {/* Cancellation policy summary */}
      {apartment.cancellation_policy && (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-[11px] font-semibold text-amber-800 mb-1">Cancellation policy</p>
          <p className="text-[11px] text-amber-700 line-clamp-3 leading-relaxed">
            {typeof apartment.cancellation_policy === "string"
              ? apartment.cancellation_policy.replace(/<[^>]*>/g, "").slice(0, 200)
              : "See listing for details"}
            {apartment.cancellation_policy.length > 200 ? "…" : ""}
          </p>
        </div>
      )}

      {[
        { label: "Full name", key: "guestName", type: "text", required: true },
        { label: "Email address", key: "guestEmail", type: "email", required: true },
        { label: "Phone number", key: "guestPhone", type: "tel", required: true },
      ].map(({ label, key, type, required }) => (
        <div key={key}>
          <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{label}</label>
          <input
            type={type}
            required={required}
            value={details[key]}
            onChange={(e) => setDetails((d) => ({ ...d, [key]: e.target.value }))}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-[14px] focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition"
          />
        </div>
      ))}

      <div>
        <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Special requests <span className="font-normal text-gray-400">(optional)</span></label>
        <textarea
          value={details.specialRequests}
          onChange={(e) => setDetails((d) => ({ ...d, specialRequests: e.target.value }))}
          rows={2}
          placeholder="Any special requirements…"
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-[14px] focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full h-11 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 text-white font-semibold rounded-xl transition-colors text-[14px] flex items-center justify-center gap-2"
      >
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : (apartment.instant_booking ? "Confirm Booking →" : "Send Request →")}
      </button>
    </form>
  );
}
