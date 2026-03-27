"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import HotelDateRangePicker from "@/components/shared/hotels/HotelDateRangePicker";

export default function BookingModal({
  open,
  onOpenChange,
  roomType,
  hotelId,
}) {
  const router = useRouter();
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
  });

  const nights = useMemo(() => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    return Math.ceil(
      Math.abs(new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) /
        864e5,
    );
  }, [bookingData.checkIn, bookingData.checkOut]);

  const estimatedTotal = nights * (roomType?.base_price || 0);
  const maxOccupancy = roomType?.max_occupancy || 4;

  const adjustGuests = (field, delta) => {
    setBookingData((prev) => {
      const min = field === "adults" ? 1 : 0;
      const max = field === "adults" ? maxOccupancy : 10;
      const next = Math.min(max, Math.max(min, prev[field] + delta));
      return { ...prev, [field]: next };
    });
  };

  const handleProceed = () => {
    if (!bookingData.checkIn || !bookingData.checkOut || !roomType) return;
    const params = new URLSearchParams({
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      adults: String(bookingData.adults),
      children: String(bookingData.children),
    });
    router.push(`/book/hotel/${roomType.id}?${params}`);
  };

  if (!open || !roomType) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-[17px] font-medium text-gray-900">
              Book {roomType.name}
            </h2>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Select your dates and number of guests
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400
                       hover:text-gray-600 hover:bg-gray-100 transition-colors ml-4 shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Visual date-range picker with blocked dates */}
          <HotelDateRangePicker
            roomTypeId={roomType?.id}
            checkIn={bookingData.checkIn}
            checkOut={bookingData.checkOut}
            onChange={({ checkIn, checkOut }) =>
              setBookingData((prev) => ({ ...prev, checkIn, checkOut }))
            }
          />

          {/* Guests — stepper pattern, no number inputs */}
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            {[
              ["adults", "Adults", `Up to ${maxOccupancy}`, 1, maxOccupancy],
              ["children", "Children", "Ages 0–12", 0, 10],
            ].map(([field, label, hint, min, max], idx, arr) => (
              <div
                key={field}
                className={`flex items-center justify-between px-4 py-3.5 ${
                  idx < arr.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div>
                  <p className="text-[14px] font-medium text-gray-900">
                    {label}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5">{hint}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => adjustGuests(field, -1)}
                    disabled={bookingData[field] <= min}
                    className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center
                               text-gray-600 hover:border-violet-400 hover:text-violet-600
                               disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-[15px] font-medium text-gray-900 tabular-nums select-none">
                    {bookingData[field]}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustGuests(field, 1)}
                    disabled={bookingData[field] >= max}
                    className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center
                               text-gray-600 hover:border-violet-400 hover:text-violet-600
                               disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Price summary */}
          {nights > 0 && (
            <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 space-y-2">
              <div className="flex justify-between text-[13px] text-gray-600">
                <span>Duration</span>
                <span className="font-medium text-gray-900">
                  {nights} night{nights !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-600">Estimated total</span>
                <span className="font-medium text-violet-700">
                  ₦{Number(estimatedTotal).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <Button
            className="w-full h-11 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm font-medium"
            onClick={handleProceed}
            disabled={!bookingData.checkIn || !bookingData.checkOut}
          >
            Continue to Booking
          </Button>
        </div>
      </div>
    </div>
  );
}
