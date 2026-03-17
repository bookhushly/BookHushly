"use client";

import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Users,
  Bed,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Check,
  Info,
  AlertCircle,
  Building,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import RichContentRenderer from "@/components/common/rich-text-renderer";
import { AMENITY_ICONS } from "@/lib/constants/filters";
import { cn } from "@/lib/utils";
import ImageGallery from "./image-gallery";
import BookingModal from "./booking-modal";
import { ReviewSection } from "@/components/shared/reviews/ReviewSection";
import { useSavedListing } from "@/hooks/use-saved-listing";

// ─── Room Type Card ───────────────────────────────────────────────────────────
const RoomTypeCard = React.memo(({ roomType, onBookNow }) => {
  const [imgIdx, setImgIdx] = useState(0);

  const images = useMemo(
    () =>
      roomType.image_urls?.length > 0
        ? roomType.image_urls
        : ["/placeholder-room.jpg"],
    [roomType.image_urls],
  );

  const amenities = useMemo(() => {
    if (!roomType.amenities?.items || !Array.isArray(roomType.amenities.items))
      return [];
    return roomType.amenities.items
      .map((key) => {
        const cfg = AMENITY_ICONS.find((a) => a.value === key);
        if (!cfg) return null;
        return { key, label: cfg.label, Icon: LucideIcons[cfg.icon] || Check };
      })
      .filter(Boolean);
  }, [roomType.amenities]);

  const isHtml = (c) => c && /<[a-z][\s\S]*>/i.test(c);

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border border-gray-100
                    hover:border-violet-200 hover:shadow-[0_8px_30px_rgba(124,58,237,0.08)]
                    transition-all duration-200 group"
    >
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
        <div className="relative h-56 md:h-full overflow-hidden">
          <Image
            src={images[imgIdx]}
            alt={roomType.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="280px"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setImgIdx((p) => (p === 0 ? images.length - 1 : p - 1));
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full
                           bg-white/90 hover:bg-white flex items-center justify-center shadow-md"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setImgIdx((p) => (p + 1) % images.length);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full
                           bg-white/90 hover:bg-white flex items-center justify-center shadow-md"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-all",
                      i === imgIdx ? "w-4 bg-white" : "w-1 bg-white/50",
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col p-6">
          <div className="flex-1">
            <h3 className="text-[17px] font-semibold text-gray-900 mb-2">
              {roomType.name}
            </h3>

            {roomType.description && (
              <div className="mb-4 text-[13px] text-gray-500 leading-relaxed line-clamp-2">
                {isHtml(roomType.description) ? (
                  <RichContentRenderer content={roomType.description} />
                ) : (
                  roomType.description
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-4 mb-4">
              {roomType.max_occupancy && (
                <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                  <Users className="h-3.5 w-3.5 text-violet-500" />
                  <span>{roomType.max_occupancy} guests</span>
                </div>
              )}
              {roomType.size_sqm && (
                <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                  <Maximize className="h-3.5 w-3.5 text-violet-500" />
                  <span>{roomType.size_sqm} m²</span>
                </div>
              )}
              {roomType.available_rooms && (
                <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                  <Bed className="h-3.5 w-3.5 text-violet-500" />
                  <span>{roomType.available_rooms} available</span>
                </div>
              )}
            </div>

            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {amenities.slice(0, 5).map((a) => (
                  <span
                    key={a.key}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                               text-[11px] font-medium bg-violet-50 text-violet-700 border border-violet-100"
                  >
                    <a.Icon className="h-3 w-3" />
                    {a.label}
                  </span>
                ))}
                {amenities.length > 5 && (
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-50 text-gray-500 border border-gray-100">
                    +{amenities.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-end justify-between pt-5 mt-5 border-t border-gray-100">
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-[0.1em] mb-0.5">
                From
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  ₦{parseFloat(roomType.base_price).toLocaleString()}
                </span>
                <span className="text-sm text-gray-400">/night</span>
              </div>
            </div>
            <Button
              onClick={() => onBookNow(roomType)}
              className="h-10 px-5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold"
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
RoomTypeCard.displayName = "RoomTypeCard";

// ─── Main Component ───────────────────────────────────────────────────────────
const HotelDetails = ({ hotel, roomTypes }) => {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const { saved: isSaved, toggle: toggleSave } = useSavedListing(
    hotel.id, "hotel",
    { title: hotel.name, image: hotel.image_urls?.[0], location: hotel.city || hotel.state }
  );
  const [sidebarDates, setSidebarDates] = useState({
    checkIn: "",
    checkOut: "",
  });

  const allImages = useMemo(
    () =>
      hotel.image_urls?.length > 0
        ? hotel.image_urls
        : ["/placeholder-hotel.jpg"],
    [hotel.image_urls],
  );

  const hotelAmenities = useMemo(() => {
    if (!hotel.amenities?.items || !Array.isArray(hotel.amenities.items))
      return [];
    return hotel.amenities.items
      .map((key) => {
        const cfg = AMENITY_ICONS.find((a) => a.value === key);
        if (!cfg) return null;
        return { key, label: cfg.label, Icon: LucideIcons[cfg.icon] || Check };
      })
      .filter(Boolean);
  }, [hotel.amenities]);

  const location = useMemo(
    () => [hotel.address, hotel.city, hotel.state].filter(Boolean).join(", "),
    [hotel.address, hotel.city, hotel.state],
  );

  const sidebarNights = useMemo(() => {
    if (!sidebarDates.checkIn || !sidebarDates.checkOut) return 0;
    return Math.ceil(
      Math.abs(
        new Date(sidebarDates.checkOut) - new Date(sidebarDates.checkIn),
      ) / 864e5,
    );
  }, [sidebarDates.checkIn, sidebarDates.checkOut]);

  const isHtml = (c) => c && /<[a-z][\s\S]*>/i.test(c);

  const handleBookNow = useCallback((roomType) => {
    setSelectedRoomType(roomType);
    setBookingModalOpen(true);
  }, []);

  const lowestPrice = useMemo(
    () =>
      roomTypes.length > 0
        ? Math.min(...roomTypes.map((r) => parseFloat(r.base_price || 0)))
        : null,
    [roomTypes],
  );

  return (
    <>
      <div className="min-h-screen pt-16" style={{ background: "#faf9f7" }}>
        {/* Sticky top nav */}
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 flex items-center justify-between px-5 sm:px-8">
          <Link
            href="/services?category=hotels"
            className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to search
          </Link>
          <div className="flex items-center gap-1">
            <button className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={toggleSave}
              className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Heart className={`h-4 w-4 transition-colors ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ImageGallery images={allImages} altPrefix={hotel.name} />

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
            {/* Left */}
            <div>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                  <span className="text-[13px] text-gray-500">{location}</span>
                </div>
                <h1
                  className="font-fraunces text-[2.2rem] sm:text-[2.8rem] font-semibold text-gray-900 leading-tight tracking-tight"
                >
                  {hotel.name}
                </h1>
              </div>

              {hotel.description && (
                <div className="mb-10 prose prose-sm max-w-none text-gray-600 leading-relaxed">
                  {isHtml(hotel.description) ? (
                    <RichContentRenderer content={hotel.description} />
                  ) : (
                    <p className="whitespace-pre-line">{hotel.description}</p>
                  )}
                </div>
              )}

              {hotelAmenities.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-[18px] font-semibold text-gray-900 mb-5">
                    What's included
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {hotelAmenities.map((a) => (
                      <div
                        key={a.key}
                        className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100 hover:border-violet-200 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                          <a.Icon className="h-4 w-4 text-violet-600" />
                        </div>
                        <span className="text-[13px] font-medium text-gray-700">
                          {a.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {(hotel.checkout_policy || hotel.policies) && (
                <section className="mb-10">
                  <h2 className="text-[18px] font-semibold text-gray-900 mb-5">
                    Things to know
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {hotel.checkout_policy && (
                      <div className="flex gap-3 p-4 bg-white rounded-xl border border-gray-100">
                        <Info className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[13px] font-semibold text-gray-800 mb-1">
                            Check-out policy
                          </p>
                          <p className="text-[13px] text-gray-500">
                            {hotel.checkout_policy === "fixed_time"
                              ? "Fixed time checkout at 12:00 PM"
                              : "24-hour checkout from check-in time"}
                          </p>
                        </div>
                      </div>
                    )}
                    {hotel.policies && (
                      <div className="flex gap-3 p-4 bg-white rounded-xl border border-gray-100">
                        <AlertCircle className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[13px] font-semibold text-gray-800 mb-1">
                            House rules
                          </p>
                          {isHtml(hotel.policies) ? (
                            <RichContentRenderer
                              content={hotel.policies}
                              className="text-[13px] text-gray-500"
                            />
                          ) : (
                            <p className="text-[13px] text-gray-500 whitespace-pre-line">
                              {hotel.policies}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-[18px] font-semibold text-gray-900 mb-5">
                  Choose your room
                </h2>
                {roomTypes.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                      <Building className="h-6 w-6 text-gray-300" />
                    </div>
                    <p className="text-[15px] font-medium text-gray-700">
                      No rooms available right now
                    </p>
                    <p className="text-[13px] text-gray-400 mt-1">
                      Please check back soon or contact the property directly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {roomTypes.map((rt) => (
                      <RoomTypeCard
                        key={rt.id}
                        roomType={rt}
                        onBookNow={handleBookNow}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Reviews */}
              <section className="mt-10">
                <h2 className="text-[18px] font-semibold text-gray-900 mb-5">
                  Guest Reviews
                </h2>
                <ReviewSection listingId={hotel.id} listingType="hotel" listingTitle={hotel.name} />
              </section>
            </div>

            {/* Right — sticky price card */}
            <div className="hidden lg:block">
              <div className="sticky top-20 bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6">
                {lowestPrice !== null && (
                  <div className="mb-5">
                    <p className="text-[11px] text-gray-400 uppercase tracking-[0.12em] mb-1">
                      Rooms from
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">
                        ₦{lowestPrice.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400">/night</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-5">
                  {[
                    ["checkIn", "Check-in"],
                    ["checkOut", "Check-out"],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <Label className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.1em]">
                        {label}
                      </Label>
                      <Input
                        type="date"
                        value={sidebarDates[field]}
                        min={
                          field === "checkIn"
                            ? new Date().toISOString().split("T")[0]
                            : sidebarDates.checkIn ||
                              new Date().toISOString().split("T")[0]
                        }
                        onChange={(e) =>
                          setSidebarDates({
                            ...sidebarDates,
                            [field]: e.target.value,
                          })
                        }
                        className="mt-1 h-10 text-sm focus-visible:ring-violet-500"
                      />
                    </div>
                  ))}
                </div>

                {sidebarNights > 0 && (
                  <div className="mb-5 p-3.5 bg-violet-50 rounded-xl border border-violet-100 text-[13px]">
                    <div className="flex justify-between text-gray-600 mb-1">
                      <span>
                        {sidebarNights} night{sidebarNights !== 1 ? "s" : ""}
                      </span>
                      <span className="font-semibold text-gray-900">
                        ₦{(sidebarNights * (lowestPrice || 0)).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-violet-600">
                      Based on lowest rate
                    </p>
                  </div>
                )}

                <Button
                  className="w-full h-11 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm font-semibold"
                  onClick={() => {
                    if (roomTypes.length > 0) handleBookNow(roomTypes[0]);
                  }}
                  disabled={roomTypes.length === 0}
                >
                  {roomTypes.length === 0
                    ? "No rooms available"
                    : "Reserve a room"}
                </Button>

                <p className="text-center text-[11px] text-gray-400 mt-3">
                  You won't be charged yet
                </p>

                <div className="mt-5 pt-5 border-t border-gray-100 space-y-2.5">
                  {[
                    { icon: Check, text: "Free cancellation on most rooms" },
                    { icon: Info, text: "Instant confirmation" },
                  ].map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-2.5 text-[12px] text-gray-500"
                    >
                      <div className="h-5 w-5 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                        <Icon className="h-3 w-3 text-green-600" />
                      </div>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky CTA */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3 flex items-center justify-between z-30">
          {lowestPrice !== null && (
            <div>
              <p className="text-[11px] text-gray-400">From</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-gray-900">
                  ₦{lowestPrice.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400">/night</span>
              </div>
            </div>
          )}
          <Button
            onClick={() => {
              if (roomTypes.length > 0) handleBookNow(roomTypes[0]);
            }}
            disabled={roomTypes.length === 0}
            className="h-11 px-8 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm font-semibold"
          >
            Reserve
          </Button>
        </div>
      </div>

      {/* Modal rendered outside page tree — no stacking context interference */}
      <BookingModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        roomType={selectedRoomType}
      />
    </>
  );
};

export default HotelDetails;
