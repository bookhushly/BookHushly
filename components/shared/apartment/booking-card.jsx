"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, CalendarCheck, Loader2, ChevronDown } from "lucide-react";
import { NIGERIAN_AIRPORTS, getAirportByCode } from "@/lib/constants/airports";
import { toast } from "sonner";
import { differenceInCalendarDays, parseISO, format } from "date-fns";
import HotelDateRangePicker from "@/components/shared/hotels/HotelDateRangePicker";

// ── Pricing rules ──────────────────────────────────────────────────────────────
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

// ── Date picker trigger button ─────────────────────────────────────────────────
function DateButton({ checkIn, checkOut, nights, onOpen }) {
  if (checkIn && checkOut) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="w-full flex items-center gap-3 p-3.5 bg-violet-50 border border-violet-200 rounded-xl hover:border-violet-400 transition-all"
      >
        <CalendarCheck className="h-4 w-4 text-violet-600 shrink-0" />
        <div className="flex-1 text-left">
          <p className="text-[13px] font-medium text-gray-900">
            {format(parseISO(checkIn), "EEE d MMM")}
            <span className="text-gray-400 mx-2">→</span>
            {format(parseISO(checkOut), "EEE d MMM")}
          </p>
          <p className="text-[11px] text-violet-600 mt-0.5">
            {nights} night{nights !== 1 ? "s" : ""} · tap to change
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-violet-400 shrink-0" />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full flex items-center gap-3 p-3.5 bg-white border-2 border-dashed border-violet-200 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition-all group"
    >
      <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
        <CalendarCheck className="h-4 w-4 text-violet-600" />
      </div>
      <div className="text-left">
        <p className="text-[13px] font-medium text-gray-800">Pick your dates</p>
        <p className="text-[11px] text-gray-400 mt-0.5">Tap to see the calendar</p>
      </div>
      <ChevronDown className="h-4 w-4 text-gray-300 ml-auto" />
    </button>
  );
}

// ── Main booking card ──────────────────────────────────────────────────────────
export default function ApartmentBookingCard({ apartment }) {
  const router = useRouter();
  const [checkIn, setCheckIn]       = useState("");
  const [checkOut, setCheckOut]     = useState("");
  const [guests, setGuests]         = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [phone, setPhone]           = useState("");
  const [requests, setRequests]     = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [airportTransfer, setAirportTransfer]           = useState(false);
  const [airportTransferType, setAirportTransferType]   = useState("pickup");
  const [airportTransferNotes, setAirportTransferNotes] = useState("");
  const [selectedAirport, setSelectedAirport]           = useState("");

  const pricingRules = usePricingRules(apartment.id);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn)));
  }, [checkIn, checkOut]);

  const basePrice = useMemo(
    () => calculateTotalWithRules(checkIn, nights, apartment, pricingRules),
    [checkIn, nights, apartment, pricingRules],
  );

  const airportFee = useMemo(() => {
    if (!airportTransfer || !selectedAirport) return 0;
    const perTrip = apartment.airport_prices?.[selectedAirport] || 0;
    return airportTransferType === "both" ? perTrip * 2 : perTrip;
  }, [airportTransfer, selectedAirport, airportTransferType, apartment.airport_prices]);

  const totalPrice = useMemo(() => basePrice + airportFee, [basePrice, airportFee]);

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

  const handleDateChange = ({ checkIn: ci, checkOut: co }) => {
    setCheckIn(ci);
    setCheckOut(co);
    if (ci && co) setCalendarOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDateValid) {
      toast.error("Please select valid check-in and check-out dates.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("apartment_id", apartment.id);
      formData.append("check_in_date", checkIn);
      formData.append("check_out_date", checkOut);
      formData.append("number_of_guests", guests.toString());
      formData.append("guest_name", name);
      formData.append("guest_email", email);
      formData.append("guest_phone", phone);
      formData.append("special_requests", requests);
      formData.append("price_per_night", apartment.price_per_night.toString());
      formData.append("caution_deposit", (apartment.caution_deposit || 0).toString());
      formData.append("airport_transfer", airportTransfer ? "true" : "false");
      formData.append("airport_transfer_type", airportTransfer ? airportTransferType : "");
      formData.append("airport_transfer_notes", airportTransfer ? airportTransferNotes : "");
      formData.append("airport_code", airportTransfer && selectedAirport ? selectedAirport : "");
      formData.append("airport_fee", airportFee.toString());

      const res = await fetch("/api/bookings/apartment", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create booking");

      toast.success("Booking created! Taking you to payment…");
      router.push(`/payment/apartment/${data.data.id}`);
    } catch (err) {
      toast.error(err.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Step A: Dates ── */}
      <div>
        <p className="text-[12px] font-medium text-gray-700 mb-2">When are you staying?</p>
        <DateButton
          checkIn={checkIn}
          checkOut={checkOut}
          nights={nights}
          onOpen={() => setCalendarOpen((v) => !v)}
        />
        {calendarOpen && (
          <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <HotelDateRangePicker
              roomTypeId={apartment.id}
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={handleDateChange}
            />
          </div>
        )}
        {checkIn && checkOut && nights > 0 && !meetsMinimumStay && (
          <p className="mt-2 text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Minimum stay is {apartment.minimum_stay} night{apartment.minimum_stay !== 1 ? "s" : ""}. Please extend your checkout date.
          </p>
        )}
      </div>

      {/* ── Step B: Guests ── */}
      <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
        <div>
          <p className="text-[13px] font-medium text-gray-900">How many guests?</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Up to {apartment.max_guests} allowed</p>
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
          <span className="w-6 text-center text-[15px] font-medium tabular-nums">{guests}</span>
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

      {/* ── Step C: Your details ── */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <p className="text-[12px] font-medium text-gray-700">Your details</p>

        <div>
          <label className="block text-[12px] text-gray-600 mb-1">Full name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Amara Okafor"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-[14px] bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label className="block text-[12px] text-gray-600 mb-1">Email address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-[14px] bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label className="block text-[12px] text-gray-600 mb-1">Phone number</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 800 000 0000"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-[14px] bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label className="block text-[12px] text-gray-600 mb-1">
            Any special requests? <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            value={requests}
            onChange={(e) => setRequests(e.target.value)}
            rows={2}
            placeholder="Early check-in, dietary needs, etc."
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-[14px] bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition resize-none"
          />
        </div>
      </div>

      {/* ── Airport transfer add-on ── */}
      {apartment.airport_transfer_enabled && (
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div
            className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-violet-300 transition-colors"
            onClick={() => setAirportTransfer((v) => !v)}
          >
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-violet-600 cursor-pointer"
              checked={airportTransfer}
              onChange={(e) => setAirportTransfer(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1">
              <p className="text-[13px] font-medium text-gray-900">✈️ Add Airport Transfer</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {apartment.airport_prices && Object.keys(apartment.airport_prices).length > 0
                  ? `From ₦${Math.min(...Object.values(apartment.airport_prices)).toLocaleString("en-NG")} per trip`
                  : "Fee varies by airport"}
                {" · "}Select your airport below
              </p>
            </div>
          </div>

          {airportTransfer && (
            <div className="space-y-3 pl-1">
              {/* Airport selector */}
              {apartment.airport_prices && Object.keys(apartment.airport_prices).length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-[12px] text-gray-600">Select airport *</label>
                  <select
                    value={selectedAirport}
                    onChange={(e) => setSelectedAirport(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                  >
                    <option value="">— Choose your airport —</option>
                    {NIGERIAN_AIRPORTS
                      .filter((a) => apartment.airport_prices[a.code] > 0)
                      .map((airport) => (
                        <option key={airport.code} value={airport.code}>
                          {airport.city} ({airport.code}) — ₦{Number(apartment.airport_prices[airport.code]).toLocaleString("en-NG")} per trip
                        </option>
                      ))}
                  </select>
                  {selectedAirport && (
                    <p className="text-[11px] text-violet-600 font-medium">
                      {getAirportByCode(selectedAirport)?.name}
                    </p>
                  )}
                </div>
              )}

              {/* Transfer type */}
              <div className="space-y-1.5">
                <label className="block text-[12px] text-gray-600">Transfer type</label>
                <div className="flex gap-2">
                  {["pickup", "dropoff", "both"].map((t) => {
                    const perTrip = selectedAirport && apartment.airport_prices?.[selectedAirport]
                      ? apartment.airport_prices[selectedAirport]
                      : 0;
                    const fee = perTrip > 0
                      ? ` · ₦${(t === "both" ? perTrip * 2 : perTrip).toLocaleString("en-NG")}`
                      : "";
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAirportTransferType(t)}
                        className={`flex-1 py-2 rounded-xl border text-[11px] font-medium transition-all ${
                          airportTransferType === t
                            ? "border-violet-500 bg-violet-50 text-violet-700"
                            : "border-gray-200 text-gray-600 hover:border-violet-300"
                        }`}
                      >
                        {t === "pickup" ? "Airport → Apt" : t === "dropoff" ? "Apt → Airport" : "Both ways"}
                        <span className="block text-[10px] opacity-70">{fee}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Flight details */}
              <div className="space-y-1.5">
                <label className="block text-[12px] text-gray-600">
                  Flight details <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Arik Air W3 200, Terminal 1, arrives 14:30"
                  value={airportTransferNotes}
                  onChange={(e) => setAirportTransferNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-[13px] bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Price breakdown (shows once dates are picked) ── */}
      {isDateValid && (
        <div className="bg-violet-50 rounded-xl border border-violet-100 p-3.5 space-y-2 text-[13px]">
          <div className="flex justify-between text-gray-600">
            <span>{priceLabel}</span>
            <span className="font-medium text-gray-900">₦{basePrice.toLocaleString()}</span>
          </div>
          {airportFee > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>✈️ Airport transfer ({airportTransferType === "both" ? "both ways" : airportTransferType})</span>
              <span className="font-medium text-gray-900">₦{airportFee.toLocaleString()}</span>
            </div>
          )}
          {apartment.caution_deposit > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Security deposit (refundable)</span>
              <span>₦{apartment.caution_deposit.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-medium text-gray-900 pt-2 border-t border-violet-200">
            <span>Total due</span>
            <span className="text-violet-700">₦{(totalPrice + (apartment.caution_deposit || 0)).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full h-12 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-xl transition-colors text-[14px] flex items-center justify-center gap-2"
      >
        {submitting
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
          : apartment.instant_booking ? "Reserve Now" : "Send Booking Request"}
      </button>

      <p className="text-center text-[11px] text-gray-400">You won't be charged until payment is complete</p>
    </form>
  );
}
