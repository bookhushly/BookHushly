// components/shared/listings/details/EventOrganizer.jsx
"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import RichContentRenderer from "@/components/common/rich-text-renderer";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  MapPin,
  Share2,
  Heart,
  Shield,
  ShieldAlert,
  Ticket,
  X,
  Camera,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ImageOff,
  Timer,
  Tag,
  Repeat2,
  Bell,
} from "lucide-react";

// Compute next N occurrence dates for a recurring event
function getUpcomingDates(eventDate, recurrence, maxDates = 5) {
  if (!eventDate || !recurrence?.enabled) return [];
  const base = new Date(eventDate);
  if (isNaN(base.getTime())) return [];
  const endDate = recurrence.end_date ? new Date(recurrence.end_date) : null;
  const now = new Date();
  const dates = [];
  let cursor = new Date(base);
  // advance cursor past today if base is in the past
  while (cursor <= now) {
    if (recurrence.type === "weekly") cursor.setDate(cursor.getDate() + 7);
    else cursor.setMonth(cursor.getMonth() + 1);
  }
  while (dates.length < maxDates) {
    if (endDate && cursor > endDate) break;
    dates.push(new Date(cursor));
    if (recurrence.type === "weekly") cursor.setDate(cursor.getDate() + 7);
    else cursor.setMonth(cursor.getMonth() + 1);
  }
  return dates;
}
import Link from "next/link";

// Optimized Image Component with blur placeholder
const OptimizedImage = ({
  src,
  alt,
  fill,
  className,
  sizes,
  priority,
  onLoad,
  onError,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    setImageError(true);
    if (onError) onError();
  };

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  if (imageError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-800 ${className}`}
      >
        <ImageOff className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  return (
    <>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={`${className} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        sizes={sizes}
        quality={priority ? 90 : 75}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        onError={handleError}
        onLoad={handleLoad}
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
      />
    </>
  );
};

const EventOrganizerDetail = ({ service }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(new Set());
  const [descExpanded, setDescExpanded] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // Waitlist state
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistJoined, setWaitlistJoined] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  // Countdown to event
  // event_time is stored as full ISO timestamptz; event_date is the date-only fallback
  useEffect(() => {
    const src = service.event_time || service.event_date;
    if (!src) return;
    const target = new Date(src);
    if (isNaN(target.getTime())) return;
    const calc = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setCountdown(null); return; }
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [service.event_time, service.event_date]);

  // Normalise ticket packages with early-bird logic
  const ticketPackages = useMemo(() => {
    if (!Array.isArray(service.ticket_packages) || service.ticket_packages.length === 0) return null;
    const now = Date.now();
    return service.ticket_packages.map((pkg) => {
      const ebEnd = pkg.early_bird_end ? new Date(pkg.early_bird_end) : null;
      const ebActive = ebEnd && ebEnd > now && pkg.early_bird_price;
      const ebExpired = ebEnd && ebEnd <= now && pkg.early_bird_price;
      return {
        ...pkg,
        regularPrice: parseFloat(pkg.price) || 0,
        effectivePrice: ebActive ? parseFloat(pkg.early_bird_price) : parseFloat(pkg.price) || 0,
        earlyBirdActive: !!ebActive,
        earlyBirdExpired: !!ebExpired,
        earlyBirdPrice: parseFloat(pkg.early_bird_price) || null,
        earlyBirdEnd: ebEnd,
      };
    });
  }, [service.ticket_packages]);

  const descriptionText = useMemo(
    () => (service.description || "").replace(/<[^>]*>/g, ""),
    [service.description]
  );
  const descriptionIsLong = descriptionText.length > 500;

  const handleShare = useCallback(async () => {
    const shareData = {
      title: service.title,
      text: `Check out ${service.title}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* dismissed */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  }, [service.title]);

  const images = useMemo(() => service.media_urls || [], [service.media_urls]);

  // Preload first 3 images after mount
  useEffect(() => {
    if (images.length === 0) return;
    images.slice(0, 3).forEach((url, index) => {
      const img = document.createElement("img");
      img.src = url;
      img.onload = () => {
        setImagesLoaded((prev) => new Set([...prev, index]));
      };
    });
  }, [images]);

  const hasMultipleImages = images.length > 1;

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay || !hasMultipleImages || isFullscreen) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, hasMultipleImages, images.length, isFullscreen]);

  const navigateImage = useCallback(
    (direction) => {
      setAutoPlay(false);

      if (direction === "next") {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      } else {
        setCurrentImageIndex(
          (prev) => (prev - 1 + images.length) % images.length,
        );
      }

      setTimeout(() => setAutoPlay(true), 10000);
    },
    [images.length],
  );

  const openFullscreen = useCallback((index) => {
    setCurrentImageIndex(index);
    setIsFullscreen(true);
    setAutoPlay(false);
    document.body.style.overflow = "hidden";
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
    setAutoPlay(true);
    document.body.style.overflow = "auto";
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isFullscreen) return;

      switch (e.key) {
        case "Escape":
          closeFullscreen();
          break;
        case "ArrowLeft":
          navigateImage("prev");
          break;
        case "ArrowRight":
          navigateImage("next");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, navigateImage, closeFullscreen]);

  const formatEventDate = (dateString) => {
    if (!dateString) return "Date TBD";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatEventTime = (timeString) => {
    if (!timeString) return "Time TBD";
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatPrice = (price, priceUnit) => {
    if (!price) return "Contact for pricing";
    const formatted = `₦${Number(price).toLocaleString()}`;
    const unit = priceUnit === "per_person" ? "per person" : "per ticket";
    return `${formatted} ${unit}`;
  };

  // Prefetch adjacent images
  useEffect(() => {
    if (images.length <= 1) return;

    const prefetchImage = (index) => {
      if (typeof window === "undefined" || imagesLoaded.has(index)) return;

      const img = document.createElement("img");
      img.src = images[index];
      img.onload = () => {
        setImagesLoaded((prev) => new Set([...prev, index]));
      };
    };

    // Prefetch next and previous images
    const nextIndex = (currentImageIndex + 1) % images.length;
    const prevIndex = (currentImageIndex - 1 + images.length) % images.length;

    prefetchImage(nextIndex);
    prefetchImage(prevIndex);
  }, [currentImageIndex, images, imagesLoaded]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/services?category=events"
              className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">
                Back to events
              </span>
              <span className="font-medium sm:hidden">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${
                  isLiked
                    ? "text-red-500 bg-red-50"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </button>
              <button onClick={handleShare} className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image Carousel */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="relative h-[60vh] md:h-[75vh] overflow-hidden">
          {images.length > 0 ? (
            <>
              {/* All images stacked — switch via opacity, zero reload lag */}
              {images.map((src, i) => (
                <div
                  key={src}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    i === currentImageIndex ? "opacity-100 z-[1]" : "opacity-0 z-0"
                  }`}
                >
                  <OptimizedImage
                    src={src}
                    alt={`${service.title} - Image ${i + 1}`}
                    fill
                    className="object-cover"
                    priority={i === 0}
                    sizes="100vw"
                  />
                </div>
              ))}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-[2]" />

              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={() => navigateImage("prev")}
                    className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={() => navigateImage("next")}
                    className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-2 z-10">
                {hasMultipleImages && (
                  <button
                    onClick={() => openFullscreen(currentImageIndex)}
                    className="bg-white/90 hover:bg-white text-gray-900 px-3 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                    <span>
                      {currentImageIndex + 1} / {images.length}
                    </span>
                  </button>
                )}
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap gap-2 z-10 max-w-[50%]">
                <Badge className="bg-purple-600 text-white border-purple-600 rounded-full px-3 py-1.5 font-medium">
                  Live Event
                </Badge>
                {service.active && (
                  <Badge className="bg-green-600 text-white border-green-600 rounded-full px-3 py-1.5 font-medium">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              {/* Image Dots */}
              {hasMultipleImages && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentImageIndex(index);
                          setAutoPlay(false);
                          setTimeout(() => setAutoPlay(true), 10000);
                        }}
                        className={`h-2 rounded-full transition-all ${
                          currentImageIndex === index
                            ? "bg-white w-8"
                            : "bg-white/50 hover:bg-white/70 w-2"
                        }`}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Event Title */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="max-w-7xl mx-auto">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                    {service.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-white">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm sm:text-base">
                        {service.location}
                      </span>
                    </div>
                    {service.capacity && (
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm sm:text-base">
                          Up to {service.capacity} attendees
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-800">
              <div className="text-center text-white">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No images available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid lg:grid-cols-12 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* About Event */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                About This Event
              </h2>
              {service.description ? (
                <div>
                  <div className={`relative overflow-hidden transition-all duration-300 ${descExpanded || !descriptionIsLong ? "" : "max-h-48"}`}>
                    <RichContentRenderer
                      content={service.description}
                      className="text-gray-700 text-base md:text-lg leading-relaxed"
                    />
                    {!descExpanded && descriptionIsLong && (
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    )}
                  </div>
                  {descriptionIsLong && (
                    <button
                      onClick={() => setDescExpanded((p) => !p)}
                      className="mt-3 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      {descExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                  Join us for an amazing event experience! Get ready for an unforgettable time with great music, food, and entertainment.
                </p>
              )}
            </section>

            {/* Event Details */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                Event Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Date</div>
                    <div className="text-gray-600 text-sm md:text-base">
                      {formatEventDate(service.event_date)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Time</div>
                    <div className="text-gray-600 text-sm md:text-base">
                      {formatEventTime(
                        service.event_time || service.created_at,
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">
                      Location
                    </div>
                    <div className="text-gray-600 text-sm md:text-base">
                      {service.location}
                    </div>
                  </div>
                </div>

                {service.capacity && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">
                        Capacity
                      </div>
                      <div className="text-gray-600 text-sm md:text-base">
                        Up to {service.capacity} attendees
                      </div>
                    </div>
                  </div>
                )}

                {service.category_data?.age_restriction && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Age Restriction</div>
                      <div className="text-gray-600 text-sm md:text-base">
                        {service.category_data.age_restriction}+ only — valid ID required at entry
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {service.category_data?.age_restriction && (
                <div className="mt-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-sm text-red-700">
                    <span className="font-semibold">Age restricted event ({service.category_data.age_restriction}+).</span>{" "}
                    Attendees must be at least {service.category_data.age_restriction} years old and carry valid ID. Tickets purchased by underage attendees will not be refunded.
                  </p>
                </div>
              )}
            </section>

            {/* Recurring Dates */}
            {(() => {
              const recurrence = service.category_data?.recurrence;
              const upcomingDates = getUpcomingDates(service.event_date, recurrence);
              if (!upcomingDates.length) return null;
              return (
                <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Repeat2 className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Upcoming Dates</h2>
                    <span className="ml-1 text-xs font-semibold uppercase tracking-wide bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full capitalize">
                      {recurrence.type}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {upcomingDates.map((d, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-purple-700">{d.getDate()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {recurrence.end_date && (
                    <p className="text-xs text-gray-400 mt-3">
                      Recurs until {new Date(recurrence.end_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </section>
              );
            })()}

            {/* Photo Gallery */}
            {images.length > 1 && (
              <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                  Event Gallery
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {images.slice(0, 6).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => openFullscreen(index)}
                      className="relative aspect-video rounded-lg overflow-hidden group bg-gray-200"
                    >
                      <OptimizedImage
                        src={image}
                        alt={`${service.title} - Image ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, 33vw"
                        priority={index < 3}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
                {images.length > 6 && (
                  <div className="text-center mt-6">
                    <Button
                      onClick={() => openFullscreen(0)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      View All {images.length} Photos
                    </Button>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 sticky top-24 space-y-5">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Event Tickets
              </h3>

              {/* Countdown */}
              {countdown && (
                <div className="rounded-2xl overflow-hidden border border-brand-100">
                  <div className="bg-brand-600 px-4 py-2 flex items-center gap-2">
                    <Timer className="w-3.5 h-3.5 text-white/80" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-white/80">
                      Event starts in
                    </span>
                  </div>
                  <div className="bg-brand-50 px-4 py-4 flex items-start justify-center gap-1">
                    {[
                      { label: "Days", val: countdown.days },
                      { label: "Hrs",  val: countdown.hours },
                      { label: "Min",  val: countdown.minutes },
                      { label: "Sec",  val: countdown.seconds },
                    ].map(({ label, val }, i) => (
                      <div key={label} className="flex items-start gap-1">
                        <div className="flex flex-col items-center min-w-[3rem]">
                          <div className="w-full bg-white border border-brand-100 rounded-xl py-2.5 text-center shadow-sm">
                            <span className="text-2xl font-bold tabular-nums leading-none text-brand-700 tracking-tight">
                              {String(val).padStart(2, "0")}
                            </span>
                          </div>
                          <span className="text-[9px] text-brand-400 uppercase tracking-widest mt-1.5 font-medium">
                            {label}
                          </span>
                        </div>
                        {i < 3 && (
                          <span className="text-xl font-bold text-brand-300 leading-none mt-2 select-none">
                            :
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ticket packages */}
              {ticketPackages ? (
                <div className="space-y-3">
                  {ticketPackages.map((pkg, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{pkg.name}</span>
                        {pkg.earlyBirdActive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                            <Tag className="w-2.5 h-2.5" /> Early Bird
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-purple-600">
                          ₦{pkg.effectivePrice.toLocaleString()}
                        </span>
                        {pkg.earlyBirdActive && (
                          <span className="text-sm text-gray-400 line-through">
                            ₦{pkg.regularPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {pkg.earlyBirdActive && pkg.earlyBirdEnd && (
                        <p className="text-xs text-amber-600 mt-1">
                          Early bird ends {pkg.earlyBirdEnd.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                      {pkg.earlyBirdExpired && (
                        <p className="text-xs text-gray-400 mt-1">
                          Early bird was ₦{pkg.earlyBirdPrice?.toLocaleString()} — offer ended
                        </p>
                      )}
                      {(() => {
                        const threshold = parseInt(service.category_data?.low_stock_threshold) || 50;
                        if (pkg.remaining === 0) return <p className="text-xs text-red-500 mt-1 font-medium">Sold out</p>;
                        if (pkg.remaining <= Math.ceil(threshold * 0.3)) return <p className="text-xs text-red-600 mt-1 font-medium">Almost Sold Out!</p>;
                        if (pkg.remaining <= threshold) return <p className="text-xs text-amber-600 mt-1 font-medium">Few Tickets Left</p>;
                        return <p className="text-xs text-green-600 mt-1">Available</p>;
                      })()}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(service.price, service.price_unit)}
                  </div>
                  {service.total_tickets && (
                    <div className="text-sm text-gray-600 mt-1">
                      {(() => {
                        const rem = parseInt(service.remaining_tickets) || parseInt(service.total_tickets) || 0;
                        const threshold = parseInt(service.category_data?.low_stock_threshold) || 50;
                        if (rem === 0) return "Sold out";
                        if (rem <= Math.ceil(threshold * 0.3)) return "Almost Sold Out!";
                        if (rem <= threshold) return "Few Tickets Left";
                        return "Tickets available";
                      })()}
                    </div>
                  )}
                </div>
              )}

              {(() => {
                const hasPkgs = Array.isArray(ticketPackages) && ticketPackages.length > 0;
                const isSoldOut = hasPkgs
                  ? ticketPackages.every((p) => (parseInt(p.remaining) || 0) === 0)
                  : (parseInt(service.remaining_tickets) || 0) === 0 && service.total_tickets > 0;

                if (isSoldOut && service.availability === "available") {
                  return waitlistJoined ? (
                    <div className="flex items-center gap-2 justify-center p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
                      <Bell className="w-4 h-4" />
                      You're on the waitlist — we'll notify you if tickets open up.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-red-600 text-center">All tickets sold out</p>
                      <p className="text-xs text-gray-500 text-center">Join the waitlist to be notified if spots open up.</p>
                      <Input
                        type="text"
                        placeholder="Your name"
                        value={waitlistName}
                        onChange={(e) => setWaitlistName(e.target.value)}
                        className="h-9 text-sm"
                      />
                      <Input
                        type="email"
                        placeholder="Your email address"
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        className="h-9 text-sm"
                      />
                      <Button
                        size="lg"
                        className="w-full h-12 text-base font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                        disabled={waitlistLoading || !waitlistEmail}
                        onClick={async () => {
                          if (!waitlistEmail || !/^\S+@\S+\.\S+$/.test(waitlistEmail)) return;
                          setWaitlistLoading(true);
                          try {
                            const res = await fetch(`/api/events/${service.id}/waitlist`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ email: waitlistEmail, name: waitlistName }),
                            });
                            if (res.ok) setWaitlistJoined(true);
                          } finally {
                            setWaitlistLoading(false);
                          }
                        }}
                      >
                        <Bell className="w-5 h-5 mr-2" />
                        {waitlistLoading ? "Joining..." : "Join Waitlist"}
                      </Button>
                    </div>
                  );
                }

                return (
                  <Button
                    asChild={service.availability === "available"}
                    disabled={service.availability !== "available"}
                    size="lg"
                    className="w-full h-12 text-base font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                  >
                    {service.availability === "available" ? (
                      <Link href={`/book/${service.id}`} className="flex items-center justify-center gap-2">
                        <Ticket className="w-5 h-5" />
                        Get Tickets Now
                      </Link>
                    ) : (
                      <span>Event Unavailable</span>
                    )}
                  </Button>
                );
              })()}

              <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
                <Shield className="w-4 h-4" />
                Secure & Verified Ticketing
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {isFullscreen && images.length > 0 && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium z-10">
            {currentImageIndex + 1} / {images.length}
          </div>

          {hasMultipleImages && (
            <>
              <button
                onClick={() => navigateImage("prev")}
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={() => navigateImage("next")}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          <div className="relative w-full h-full p-4 sm:p-8">
            <OptimizedImage
              src={images[currentImageIndex]}
              alt={`${service.title} - Image ${currentImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {hasMultipleImages && (
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 max-w-full overflow-x-auto px-4">
              <div className="flex gap-2 bg-black/50 backdrop-blur-sm p-2 sm:p-3 rounded-xl">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all relative bg-gray-700 ${
                      currentImageIndex === index
                        ? "border-white scale-110"
                        : "border-transparent hover:border-white/50"
                    }`}
                  >
                    <OptimizedImage
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventOrganizerDetail;
