"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    // Full-screen fixed overlay — no Radix, no portal issues, always on top
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-[17px] font-semibold text-gray-900">
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
        <div className="p-6 space-y-4">
          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ["checkIn", "Check-in"],
              ["checkOut", "Check-out"],
            ].map(([field, label]) => (
              <div key={field} className="space-y-1.5">
                <Label className="text-[12px] font-medium text-gray-600">
                  {label}
                </Label>
                <Input
                  type="date"
                  min={
                    field === "checkIn"
                      ? new Date().toISOString().split("T")[0]
                      : bookingData.checkIn ||
                        new Date().toISOString().split("T")[0]
                  }
                  value={bookingData[field]}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, [field]: e.target.value })
                  }
                  className="h-9 text-sm focus-visible:ring-violet-500"
                />
              </div>
            ))}
          </div>

          {/* Guests */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ["adults", "Adults", 1, roomType.max_occupancy || 4],
              ["children", "Children", 0, 10],
            ].map(([field, label, min, max]) => (
              <div key={field} className="space-y-1.5">
                <Label className="text-[12px] font-medium text-gray-600">
                  {label}
                </Label>
                <Input
                  type="number"
                  min={min}
                  max={max}
                  value={bookingData[field]}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      [field]: parseInt(e.target.value) || min,
                    })
                  }
                  className="h-9 text-sm focus-visible:ring-violet-500"
                />
              </div>
            ))}
          </div>

          {/* Price summary */}
          {nights > 0 && (
            <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 space-y-2">
              <div className="flex justify-between text-[13px] text-gray-600">
                <span>Duration</span>
                <span className="font-semibold text-gray-900">
                  {nights} night{nights !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-600">Estimated total</span>
                <span className="font-bold text-violet-700">
                  ₦{Number(estimatedTotal).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <Button
            className="w-full h-11 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm font-semibold"
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
