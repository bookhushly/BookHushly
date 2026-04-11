"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MapPin, Users, Bed, Maximize, ChevronLeft, ChevronRight,
  Share2, Heart, Check, Info, AlertCircle, Building, Zap,
  ZapOff, Battery, Coffee, UtensilsCrossed, Clock, BadgePercent,
  Star, Loader2, Ban, CalendarCheck, CalendarDays,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import RichContentRenderer from "@/components/common/rich-text-renderer";
import { AMENITY_ICONS } from "@/lib/constants/filters";
import { cn } from "@/lib/utils";
import ImageGallery from "./image-gallery";
import HotelDateRangePicker from "@/components/shared/hotels/HotelDateRangePicker";
import { ReviewSection } from "@/components/shared/reviews/ReviewSection";
import { useSavedListing } from "@/hooks/use-saved-listing";
import { useViewTracker } from "@/hooks/use-view-tracker";
import { createClient } from "@/lib/supabase/client";
import { format, parseISO, differenceInCalendarDays } from "date-fns";

// ─── Availability Badge ───────────────────────────────────────────────────────
function AvailBadge({ status }) {
  if (status === "loading") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-500">
      <Loader2 className="h-3 w-3 animate-spin" /> Checking…
    </span>
  );
  if (status === "available") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">
      <Check className="h-3 w-3" /> Available
    </span>
  );
  if (status === "unavailable") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-red-50 text-red-600 border border-red-200">
      <Ban className="h-3 w-3" /> Fully booked
    </span>
  );
  return null;
}

// ─── Room Type Card — self-contained with its own per-suite calendar ──────────
const RoomTypeCard = React.memo(({ roomType }) => {
  const router = useRouter();
  const supabase = createClient();
  const [imgIdx, setImgIdx] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [localDates, setLocalDates] = useState({ checkIn: "", checkOut: "" });
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  // 'idle' | 'loading' | 'available' | 'unavailable'
  const [availStatus, setAvailStatus] = useState("idle");

  // Check availability whenever dates change
  useEffect(() => {
    if (!localDates.checkIn || !localDates.checkOut) {
      setAvailStatus("idle");
      return;
    }
    setAvailStatus("loading");
    (async () => {
      const { data, error } = await supabase
        .from("hotel_bookings")
        .select("id")
        .eq("room_type_id", roomType.id)
        .in("booking_status", ["confirmed", "checked_in"])
        .neq("payment_status", "failed")
        .lt("check_in_date", localDates.checkOut)
        .gt("check_out_date", localDates.checkIn);
      if (error) { setAvailStatus("available"); return; }
      const booked = data?.length ?? 0;
      const total = roomType.available_rooms || 1;
      setAvailStatus(booked < total ? "available" : "unavailable");
    })();
  }, [localDates.checkIn, localDates.checkOut]);

  const handleDatesChange = ({ checkIn, checkOut }) => {
    setLocalDates({ checkIn, checkOut });
    if (checkIn && checkOut) setCalendarOpen(false);
  };

  const nights = useMemo(() => {
    if (!localDates.checkIn || !localDates.checkOut) return 0;
    return differenceInCalendarDays(parseISO(localDates.checkOut), parseISO(localDates.checkIn));
  }, [localDates.checkIn, localDates.checkOut]);

  const images = useMemo(
    () => roomType.image_urls?.length > 0 ? roomType.image_urls : ["/placeholder-room.jpg"],
    [roomType.image_urls],
  );

  const amenities = useMemo(() => {
    if (!roomType.amenities?.items || !Array.isArray(roomType.amenities.items)) return [];
    return roomType.amenities.items
      .map((key) => {
        const cfg = AMENITY_ICONS.find((a) => a.value === key);
        if (!cfg) return null;
        return { key, label: cfg.label, Icon: LucideIcons[cfg.icon] || Check };
      })
      .filter(Boolean);
  }, [roomType.amenities]);

  const isHtml = (c) => c && /<[a-z][\s\S]*>/i.test(c);
  const datesSet = !!(localDates.checkIn && localDates.checkOut);
  const unavailable = availStatus === "unavailable";

  const handleReserve = () => {
    if (!datesSet) { setCalendarOpen(true); return; }
    if (unavailable) return;
    const params = new URLSearchParams({
      checkIn: localDates.checkIn,
      checkOut: localDates.checkOut,
      adults: "1",
      children: "0",
    });
    router.push(`/book/hotel/${roomType.id}?${params}`);
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl overflow-hidden border transition-all duration-200",
      unavailable
        ? "border-gray-100 opacity-60 grayscale-[30%]"
        : "border-gray-100 hover:border-violet-200 hover:shadow-[0_8px_30px_rgba(124,58,237,0.08)] group",
    )}>
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
        {/* Image */}
        <div className="relative h-52 md:h-full overflow-hidden">
          {unavailable && (
            <div className="absolute inset-0 z-10 bg-black/30 flex items-center justify-center">
              <span className="bg-white/90 text-red-600 font-medium text-[13px] px-3 py-1.5 rounded-xl shadow">
                Fully booked for these dates
              </span>
            </div>
          )}
          <Image
            src={images[imgIdx]}
            alt={roomType.name}
            fill
            className={cn("object-cover transition-transform duration-500", !unavailable && "group-hover:scale-[1.03]")}
            sizes="280px"
          />
          {images.length > 1 && !unavailable && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); setImgIdx((p) => (p === 0 ? images.length - 1 : p - 1)); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); setImgIdx((p) => (p + 1) % images.length); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col p-6">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-[17px] font-medium text-gray-900">{roomType.name}</h3>
              <AvailBadge status={datesSet ? availStatus : null} />
            </div>

            {roomType.description && (
              <div className="mb-4 text-[13px] text-gray-500 leading-relaxed line-clamp-2">
                {isHtml(roomType.description)
                  ? <RichContentRenderer content={roomType.description} />
                  : roomType.description}
              </div>
            )}

            <div className="flex flex-wrap gap-4 mb-4">
              {roomType.max_occupancy && (
                <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                  <Users className="h-3.5 w-3.5 text-violet-500" />
                  <span>Up to {roomType.max_occupancy} guests</span>
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
                  <span>{roomType.available_rooms} room{roomType.available_rooms !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>

            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(showAllAmenities ? amenities : amenities.slice(0, 5)).map((a) => (
                  <span key={a.key} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-violet-50 text-violet-700 border border-violet-100">
                    <a.Icon className="h-3 w-3" />
                    {a.label}
                  </span>
                ))}
                {amenities.length > 5 && (
                  <button
                    onClick={() => setShowAllAmenities((v) => !v)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  >
                    {showAllAmenities ? "Show less" : `+${amenities.length - 5} more`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Per-suite date picker ─────────────────────────────────────── */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            {/* Date summary bar or open trigger */}
            {datesSet && !calendarOpen ? (
              <div className="flex items-center gap-3 p-3 bg-violet-50 border border-violet-100 rounded-xl mb-4">
                <CalendarCheck className="h-4 w-4 text-violet-600 shrink-0" />
                <div className="flex-1 min-w-0 text-[13px]">
                  <span className="font-medium text-gray-900">
                    {format(parseISO(localDates.checkIn), "d MMM")}
                    <span className="text-gray-400 mx-1.5">→</span>
                    {format(parseISO(localDates.checkOut), "d MMM")}
                  </span>
                  <span className="text-violet-600 ml-1.5">· {nights} night{nights !== 1 ? "s" : ""}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCalendarOpen(true)}
                  className="text-[11px] font-medium text-violet-600 hover:text-violet-700 shrink-0"
                >
                  Change
                </button>
              </div>
            ) : !calendarOpen ? (
              <button
                type="button"
                onClick={() => setCalendarOpen(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-violet-200 hover:border-violet-400 hover:bg-violet-50 transition-all mb-4 group/cal"
              >
                <CalendarDays className="h-4 w-4 text-violet-400 group-hover/cal:text-violet-600 shrink-0" />
                <span className="text-[13px] font-medium text-gray-500 group-hover/cal:text-violet-700">
                  Select dates to check availability
                </span>
              </button>
            ) : null}

            {/* Inline calendar */}
            {calendarOpen && (
              <div className="mb-4 bg-gray-50 rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] font-medium text-gray-700 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-violet-500" />
                    {roomType.name} availability
                  </p>
                  <button
                    type="button"
                    onClick={() => setCalendarOpen(false)}
                    className="text-[11px] text-gray-400 hover:text-gray-600"
                  >
                    Close
                  </button>
                </div>
                <HotelDateRangePicker
                  roomTypeId={roomType.id}
                  checkIn={localDates.checkIn}
                  checkOut={localDates.checkOut}
                  onChange={handleDatesChange}
                />
              </div>
            )}

            {/* Price + CTA */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-[0.1em] mb-0.5">
                  {nights > 0 ? `${nights} night${nights !== 1 ? "s" : ""} total` : "Per night"}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-medium text-gray-900">
                    ₦{nights > 0
                      ? (parseFloat(roomType.base_price) * nights).toLocaleString()
                      : parseFloat(roomType.base_price).toLocaleString()}
                  </span>
                  {nights === 0 && <span className="text-sm text-gray-400">/night</span>}
                </div>
                {nights > 0 && (
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    ₦{parseFloat(roomType.base_price).toLocaleString()} × {nights} nights
                  </p>
                )}
              </div>

              <Button
                onClick={handleReserve}
                disabled={unavailable}
                className={cn(
                  "h-10 px-5 rounded-xl text-sm font-medium shrink-0",
                  unavailable
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : datesSet && availStatus === "available"
                    ? "bg-violet-600 hover:bg-violet-700 text-white"
                    : datesSet && availStatus === "loading"
                    ? "bg-violet-400 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-white",
                )}
              >
                {unavailable
                  ? "Not available"
                  : datesSet && availStatus === "available"
                  ? "Reserve →"
                  : datesSet && availStatus === "loading"
                  ? "Checking…"
                  : datesSet
                  ? "Reserve →"
                  : "Select dates →"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
RoomTypeCard.displayName = "RoomTypeCard";

// ─── Main Component ───────────────────────────────────────────────────────────
const SECTION_TABS = [
  { id: "overview",   label: "Overview" },
  { id: "amenities",  label: "Amenities" },
  { id: "rooms",      label: "Rooms & Suites" },
  { id: "location",   label: "Location" },
  { id: "reviews",    label: "Reviews" },
];

const HotelDetails = ({ hotel, roomTypes, avgRating, reviewCount }) => {
  useViewTracker(hotel.id, "hotel", hotel.vendor_id);

  const overviewRef  = useRef(null);
  const amenitiesRef = useRef(null);
  const roomsRef     = useRef(null);
  const locationRef  = useRef(null);
  const reviewsRef   = useRef(null);

  const sectionRefs = useMemo(() => ({
    overview: overviewRef,
    amenities: amenitiesRef,
    rooms: roomsRef,
    location: locationRef,
    reviews: reviewsRef,
  }), []);

  const [activeSection, setActiveSection]     = useState("overview");
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const { saved: isSaved, toggle: toggleSave } = useSavedListing(
    hotel.id, "hotel",
    { title: hotel.name, image: hotel.image_urls?.[0], location: hotel.city || hotel.state },
  );

  // Track active section as user scrolls
  useEffect(() => {
    const refs = Object.entries(sectionRefs);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.dataset.section;
          if (id) setActiveSection(id);
        }
      },
      { rootMargin: "-20% 0px -75% 0px" },
    );
    refs.forEach(([, ref]) => { if (ref.current) observer.observe(ref.current); });
    return () => observer.disconnect();
  }, [sectionRefs]);

  const scrollTo = useCallback((id) => {
    sectionRefs[id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [sectionRefs]);

  const scrollToRooms = useCallback(() => scrollTo("rooms"), [scrollTo]);

  const allImages = useMemo(
    () => hotel.image_urls?.length > 0 ? hotel.image_urls : ["/placeholder-hotel.jpg"],
    [hotel.image_urls],
  );

  const hotelAmenities = useMemo(() => {
    if (!hotel.amenities?.items || !Array.isArray(hotel.amenities.items)) return [];
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

  const lowestPrice = useMemo(
    () => roomTypes.length > 0 ? Math.min(...roomTypes.map((r) => parseFloat(r.base_price || 0))) : null,
    [roomTypes],
  );

  const isHtml = (c) => c && /<[a-z][\s\S]*>/i.test(c);

  const handleShare = useCallback(async () => {
    const shareData = { title: hotel.name, text: `Check out ${hotel.name} in ${hotel.city || hotel.state}`, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* dismissed */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  }, [hotel.name, hotel.city, hotel.state]);

  return (
    <div className="min-h-screen pt-16" style={{ background: "#faf9f7" }}>
      {/* Back nav */}
      <header className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 flex items-center justify-between px-5 sm:px-8">
        <Link
          href="/services?category=hotels"
          className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to search
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={handleShare} className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
          <button onClick={toggleSave} className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
            <Heart className={cn("h-4 w-4 transition-colors", isSaved && "fill-red-500 text-red-500")} />
          </button>
        </div>
      </header>

      {/* ── Section tab nav (Radisson-style) ──────────────────────────────────── */}
      <div className="sticky top-14 z-20 bg-white border-b border-gray-100 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {SECTION_TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setActiveSection(id); scrollTo(id); }}
                className={cn(
                  "px-5 py-4 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors shrink-0",
                  activeSection === id
                    ? "border-violet-600 text-violet-700"
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300",
                )}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Gallery ─────────────────────────────────────────────────────────── */}
        <ImageGallery images={allImages} altPrefix={hotel.name} />

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          {/* ── Left column ──────────────────────────────────────────────────── */}
          <div>
            {/* Hotel header */}
            <div ref={overviewRef} data-section="overview" className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                <span className="text-[13px] text-gray-500">{location}</span>
              </div>
              <h1 className="font-fraunces text-[2.2rem] sm:text-[2.8rem] font-medium text-gray-900 leading-tight tracking-tight">
                {hotel.name}
              </h1>

              {hotel.nihotour_certified && (
                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-xl">
                  <span className="text-base leading-none"></span>
                  <span className="text-[13px] font-medium text-amber-800">NIHOTOUR Certified</span>
                  {hotel.nihotour_number && (
                    <span className="text-[11px] text-amber-600">· {hotel.nihotour_number}</span>
                  )}
                </div>
              )}

              {avgRating !== null && reviewCount > 0 && (
                <div className="flex items-center gap-3 mt-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-[15px] font-medium text-gray-900">{avgRating}</span>
                    <span className="text-[13px] text-gray-500">
                      {avgRating >= 4.8 ? "Exceptional" : avgRating >= 4.5 ? "Excellent" : avgRating >= 4.0 ? "Very Good" : avgRating >= 3.5 ? "Good" : "Okay"}
                    </span>
                  </div>
                  <button
                    onClick={() => { setActiveSection("reviews"); scrollTo("reviews"); }}
                    className="text-[13px] text-violet-600 hover:underline"
                  >
                    {reviewCount} review{reviewCount !== 1 ? "s" : ""}
                  </button>
                </div>
              )}

              {/* ── Key facts strip (Radisson-style) ────────────────────────── */}
              {(hotel.check_in_time || hotel.check_out_time || hotel.breakfast_offered !== "none" || hotel.generator_available || hotel.inverter_available) && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {hotel.check_in_time && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-[12px] text-gray-600">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      Check-in from {hotel.check_in_time}
                    </div>
                  )}
                  {hotel.check_out_time && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-[12px] text-gray-600">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      Check-out by {hotel.check_out_time}
                    </div>
                  )}
                  {hotel.breakfast_offered && hotel.breakfast_offered !== "none" && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-100 text-[12px] text-orange-700">
                      <Coffee className="h-3.5 w-3.5" />
                      Breakfast included
                    </div>
                  )}
                  {hotel.generator_available && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100 text-[12px] text-amber-700">
                      <Zap className="h-3.5 w-3.5" />
                      {hotel.generator_available === "24hrs" ? "24hr generator" : "Generator available"}
                    </div>
                  )}
                  {hotel.inverter_available && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg border border-green-100 text-[12px] text-green-700">
                      <Battery className="h-3.5 w-3.5" />
                      Inverter / Solar
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {hotel.description && (
              <div className="mb-10 prose prose-sm max-w-none text-gray-600 leading-relaxed">
                {isHtml(hotel.description)
                  ? <RichContentRenderer content={hotel.description} />
                  : <p className="whitespace-pre-line">{hotel.description}</p>}
              </div>
            )}

            {/* Amenities */}
            {hotelAmenities.length > 0 && (
              <section ref={amenitiesRef} data-section="amenities" className="mb-10">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[18px] font-medium text-gray-900">What's included</h2>
                  {hotelAmenities.length > 6 && (
                    <button onClick={() => setShowAllAmenities((v) => !v)} className="text-[13px] font-medium text-violet-600 hover:text-violet-700">
                      {showAllAmenities ? "Show less" : `Show all ${hotelAmenities.length}`}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(showAllAmenities ? hotelAmenities : hotelAmenities.slice(0, 6)).map((a) => (
                    <div key={a.key} className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100 hover:border-violet-200 transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                        <a.Icon className="h-4 w-4 text-violet-600" />
                      </div>
                      <span className="text-[13px] font-medium text-gray-700">{a.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Hotel Essentials */}
            {(hotel.generator_available || hotel.inverter_available ||
              hotel.breakfast_offered !== "none" || hotel.check_in_time ||
              hotel.check_out_time || hotel.vat_inclusive || hotel.whatsapp_number) && (
              <section className="mb-10">
                <h2 className="text-[18px] font-medium text-gray-900 mb-5">Hotel essentials</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hotel.generator_available && (
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                      <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Zap className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-gray-800">Generator</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">
                          {hotel.generator_available === "24hrs" ? "24-hour generator" : hotel.generator_available === "partial" ? `Available ${hotel.generator_hours || "select hours"}` : "Generator available"}
                        </p>
                      </div>
                    </div>
                  )}
                  {!hotel.generator_available && !hotel.inverter_available && (
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                      <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                        <ZapOff className="h-4 w-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-gray-800">NEPA supply only</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">No backup power listed</p>
                      </div>
                    </div>
                  )}
                  {hotel.inverter_available && (
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                      <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                        <Battery className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-gray-800">Inverter / Solar</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">Backup power available</p>
                      </div>
                    </div>
                  )}
                  {hotel.breakfast_offered && hotel.breakfast_offered !== "none" && (
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                      <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                        <Coffee className="h-4 w-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-gray-800">Breakfast included</p>
                        <p className="text-[12px] text-gray-500 mt-0.5 capitalize">{hotel.breakfast_type || hotel.breakfast_offered}</p>
                      </div>
                    </div>
                  )}
                  {hotel.breakfast_offered === "none" && (
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                      <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                        <UtensilsCrossed className="h-4 w-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-gray-800">No breakfast</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">Room-only rate</p>
                      </div>
                    </div>
                  )}
                  {(hotel.check_in_time || hotel.check_out_time) && (
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                      <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                        <Clock className="h-4 w-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-gray-800">Check-in / Check-out</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">
                          {hotel.check_in_time && `From ${hotel.check_in_time}`}
                          {hotel.check_in_time && hotel.check_out_time && " · "}
                          {hotel.check_out_time && `Out by ${hotel.check_out_time}`}
                        </p>
                      </div>
                    </div>
                  )}
                  {hotel.vat_inclusive && (
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <BadgePercent className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-gray-800">VAT inclusive</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">Prices shown include 7.5% VAT</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Things to know */}
            {(hotel.checkout_policy || hotel.policies) && (
              <section className="mb-10">
                <h2 className="text-[18px] font-medium text-gray-900 mb-5">Things to know</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hotel.checkout_policy && (
                    <div className="flex gap-3 p-4 bg-white rounded-xl border border-gray-100">
                      <Info className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[13px] font-medium text-gray-800 mb-1">Check-out policy</p>
                        <p className="text-[13px] text-gray-500">
                          {hotel.checkout_policy === "fixed_time" ? "Fixed time checkout at 12:00 PM" : "24-hour checkout from check-in time"}
                        </p>
                      </div>
                    </div>
                  )}
                  {hotel.policies && (
                    <div className="flex gap-3 p-4 bg-white rounded-xl border border-gray-100">
                      <AlertCircle className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[13px] font-medium text-gray-800 mb-1">House rules</p>
                        {isHtml(hotel.policies)
                          ? <RichContentRenderer content={hotel.policies} className="text-[13px] text-gray-500" />
                          : <p className="text-[13px] text-gray-500 whitespace-pre-line">{hotel.policies}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── ROOM TYPES ───────────────────────────────────────────────── */}
            <section ref={roomsRef} data-section="rooms">
              <h2 className="text-[18px] font-medium text-gray-900 mb-5">Choose your room</h2>

              {roomTypes.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                    <Building className="h-6 w-6 text-gray-300" />
                  </div>
                  <p className="text-[15px] font-medium text-gray-700">No rooms available right now</p>
                  <p className="text-[13px] text-gray-400 mt-1">Please check back soon or contact the property directly.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {roomTypes.map((rt) => (
                    <RoomTypeCard key={rt.id} roomType={rt} />
                  ))}
                </div>
              )}
            </section>

            {/* ── LOCATION ─────────────────────────────────────────────────── */}
            <section ref={locationRef} data-section="location" className="mt-10 mb-10">
              <h2 className="text-[18px] font-medium text-gray-900 mb-5">Location</h2>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Address card */}
                <div className="flex items-start gap-4 p-6">
                  <div className="h-11 w-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-gray-900">{hotel.name}</p>
                    {location && <p className="text-[13px] text-gray-500 mt-0.5">{location}</p>}
                  </div>
                  {(hotel.city || hotel.state) && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent([hotel.name, hotel.address, hotel.city, hotel.state].filter(Boolean).join(", "))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-[12px] font-medium text-violet-600 hover:text-violet-700 underline underline-offset-2"
                    >
                      Open in Maps
                    </a>
                  )}
                </div>
                {/* Map placeholder */}
                <div className="h-52 bg-gray-50 border-t border-gray-100 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: "repeating-linear-gradient(0deg,#6d28d9 0,#6d28d9 1px,transparent 0,transparent 50%),repeating-linear-gradient(90deg,#6d28d9 0,#6d28d9 1px,transparent 0,transparent 50%)",
                    backgroundSize: "40px 40px",
                  }} />
                  <div className="h-10 w-10 rounded-full bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
                    <MapPin className="h-5 w-5 text-white fill-white" />
                  </div>
                  <p className="text-[13px] text-gray-500 font-medium z-10">
                    {[hotel.city, hotel.state].filter(Boolean).join(", ")}
                  </p>
                  {(hotel.city || hotel.state) && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent([hotel.name, hotel.address, hotel.city, hotel.state].filter(Boolean).join(", "))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 px-4 py-1.5 bg-white rounded-lg border border-gray-200 text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm z-10"
                    >
                      View on Google Maps →
                    </a>
                  )}
                </div>
              </div>
            </section>

            {/* Reviews */}
            <section ref={reviewsRef} data-section="reviews" className="mt-10">
              <h2 className="text-[18px] font-medium text-gray-900 mb-5">
                Guest Reviews
                {avgRating !== null && reviewCount > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[14px] font-normal text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {avgRating} · {reviewCount} review{reviewCount !== 1 ? "s" : ""}
                  </span>
                )}
              </h2>
              <ReviewSection listingId={hotel.id} listingType="hotel" listingTitle={hotel.name} />
            </section>
          </div>

          {/* ── Right sidebar ───────────────────────────────────────────────── */}
          <div className="hidden lg:block">
            <div className="sticky top-20 bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6">
              {lowestPrice !== null && (
                <div className="mb-5">
                  <p className="text-[11px] text-gray-400 uppercase tracking-[0.12em] mb-1">Rooms from</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-medium text-gray-900">₦{lowestPrice.toLocaleString()}</span>
                    <span className="text-sm text-gray-400">/night</span>
                  </div>
                </div>
              )}

              <Button
                className="w-full h-11 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm font-medium mb-5"
                onClick={scrollToRooms}
                disabled={roomTypes.length === 0}
              >
                {roomTypes.length === 0 ? "No rooms available" : "See available rooms ↓"}
              </Button>

              <p className="text-center text-[11px] text-gray-400 mt-3">You won't be charged yet</p>

              <div className="mt-5 pt-5 border-t border-gray-100 space-y-2.5">
                {[
                  { icon: Check, text: "Free cancellation on most rooms" },
                  { icon: Info, text: "Instant confirmation" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-[12px] text-gray-500">
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

      {/* ── Mobile sticky CTA ─────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3 flex items-center justify-between z-30">
        {lowestPrice !== null && (
          <div>
            <p className="text-[11px] text-gray-400">From</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-medium text-gray-900">₦{lowestPrice.toLocaleString()}</span>
              <span className="text-xs text-gray-400">/night</span>
            </div>
          </div>
        )}
        <Button
          onClick={scrollToRooms}
          disabled={roomTypes.length === 0}
          className="h-11 px-8 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm font-medium"
        >
          {roomTypes.length === 0 ? "No rooms available" : "View rooms ↓"}
        </Button>
      </div>
    </div>
  );
};

export default HotelDetails;
