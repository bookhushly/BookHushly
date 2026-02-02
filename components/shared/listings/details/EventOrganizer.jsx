// components/shared/listings/details/EventOrganizer.jsx
"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  MapPin,
  Share2,
  Heart,
  Shield,
  Ticket,
  X,
  Camera,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ImageOff,
} from "lucide-react";
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
        className={`${className} ${!isLoaded ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
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

  const images = useMemo(() => {
    const urls = service.media_urls || [];
    // Preload first 3 images
    if (typeof window !== "undefined" && urls.length > 0) {
      urls.slice(0, 3).forEach((url, index) => {
        const img = document.createElement("img");
        img.src = url;
        img.onload = () => {
          setImagesLoaded((prev) => new Set([...prev, index]));
        };
      });
    }
    return urls;
  }, [service.media_urls]);

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
              <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
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
              {/* Main Image */}
              <OptimizedImage
                src={images[currentImageIndex]}
                alt={`${service.title} - Image ${currentImageIndex + 1}`}
                fill
                className="object-cover"
                priority={currentImageIndex === 0}
                sizes="100vw"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

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
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                {service.description ||
                  "Join us for an amazing event experience! Get ready for an unforgettable time with great music, food, and entertainment."}
              </p>
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
              </div>
            </section>

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
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 sticky top-24">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6">
                Event Tickets
              </h3>

              <div className="mb-6">
                <div className="text-center mb-2">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(service.price, service.price_unit)}
                  </div>
                </div>

                {service.total_tickets && (
                  <div className="text-center text-sm text-gray-600">
                    {service.remaining_tickets || service.total_tickets} tickets
                    available
                  </div>
                )}
              </div>

              <Button
                asChild={service.availability === "available"}
                disabled={service.availability !== "available"}
                size="lg"
                className="w-full h-12 text-base font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl mb-4"
              >
                {service.availability === "available" ? (
                  <Link
                    href={`/book/${service.id}`}
                    className="flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-5 h-5" />
                    Get Tickets Now
                  </Link>
                ) : (
                  <span>Event Unavailable</span>
                )}
              </Button>

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
