"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Users,
  Calendar,
  Clock,
  Star,
  Shield,
  Camera,
  Heart,
  Share2,
  Grid3X3,
  Maximize2,
  CheckCircle,
  Music,
  Car,
  Wifi,
  Coffee,
  Utensils,
  Mic,
  Building,
  ArrowLeft,
  ZoomIn,
  Download,
  CalendarCheck,
  DollarSign,
} from "lucide-react";

// Utility function to parse cancellation policy
const parseCancellationPolicy = (policy) => {
  if (!policy) return ["Contact venue for cancellation policy"];

  return policy
    .split(".")
    .filter((p) => p.trim())
    .map((p) => p.trim());
};

// Utility function to get amenity icon
const getAmenityIcon = (iconType) => {
  const iconMap = {
    music: Music,
    sound: Music,
    audio: Music,
    car: Car,
    parking: Car,
    valet: Car,
    wifi: Wifi,
    internet: Wifi,
    kitchen: Utensils,
    catering: Utensils,
    food: Utensils,
    bridal: Heart,
    suite: Heart,
    av: Mic,
    microphone: Mic,
    lighting: Mic,
    climate: Building,
    hvac: Building,
    coordination: Users,
    planning: Users,
    management: Users,
    security: Shield,
    coffee: Coffee,
    bar: Coffee,
  };

  const normalizedType = iconType?.toLowerCase() || "";
  const IconComponent = iconMap[normalizedType] || Shield;
  return <IconComponent className="w-6 h-6 text-purple-600" />;
};

// Main component
const EventCenterDetail = ({ listing, categoryData = {} }) => {
  // State management
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredAmenity, setHoveredAmenity] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const [isLiked, setIsLiked] = useState(false);

  // Refs
  const heroRef = useRef(null);
  const galleryRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Extract data from listing
  const images = listing?.media_urls || [];
  const validImages = images.filter((_, index) => !imageLoadErrors.has(index));
  const amenities = listing?.amenities || [];

  // Auto-play slideshow with cleanup
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);

    autoPlayRef.current = setInterval(() => {
      if (!lightboxOpen && validImages.length > 1) {
        setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
      }
    }, 5000);
  }, [lightboxOpen, validImages.length]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  // Scroll detection with throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 100);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxOpen) {
        switch (e.key) {
          case "Escape":
            closeLightbox();
            break;
          case "ArrowLeft":
            navigateLightbox("prev");
            break;
          case "ArrowRight":
            navigateLightbox("next");
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen]);

  // Navigation functions
  const navigateHero = useCallback(
    (direction) => {
      stopAutoPlay();
      if (direction === "next") {
        setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
      } else {
        setCurrentImageIndex(
          (prev) => (prev - 1 + validImages.length) % validImages.length
        );
      }
      setTimeout(startAutoPlay, 3000); // Resume after 3 seconds
    },
    [validImages.length, stopAutoPlay, startAutoPlay]
  );

  const navigateLightbox = useCallback(
    (direction) => {
      if (direction === "next") {
        setLightboxIndex((prev) => (prev + 1) % validImages.length);
      } else {
        setLightboxIndex(
          (prev) => (prev - 1 + validImages.length) % validImages.length
        );
      }
    },
    [validImages.length]
  );

  const openLightbox = useCallback(
    (index) => {
      setLightboxIndex(index);
      setLightboxOpen(true);
      document.body.style.overflow = "hidden";
      stopAutoPlay();
    },
    [stopAutoPlay]
  );

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = "auto";
    startAutoPlay();
  }, [startAutoPlay]);

  const scrollToGallery = useCallback(() => {
    galleryRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleImageError = useCallback((index) => {
    setImageLoadErrors((prev) => new Set(prev).add(index));
  }, []);

  const formatPrice = (price, priceUnit) => {
    if (!price) return "Contact for pricing";

    const formattedPrice = `₦${Number(price).toLocaleString()}`;
    const unitMap = {
      per_hour: "per hour",
      per_day: "per day",
      per_night: "per night",
      per_event: "per event",
      per_week: "per week",
      per_month: "per month",
      per_person: "per person",
      fixed: "",
      negotiable: "(Negotiable)",
    };

    const unit = unitMap[priceUnit] || priceUnit || "";
    return `${formattedPrice} ${unit}`.trim();
  };

  const formatEventDate = (eventDate) => {
    if (!eventDate) return null;

    return new Date(eventDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Early return if no listing
  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Venue Not Found
          </h2>
          <p className="text-gray-500">
            The venue you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/venues"
            className="inline-flex items-center gap-2 mt-4 text-purple-600 hover:text-purple-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Other Venues
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Navigation */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-sm shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/venues"
              className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">
                Back to venues
              </span>
              <span className="font-medium sm:hidden">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 transition-colors ${
                  isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </button>
              <button className="p-2 text-gray-600 hover:text-purple-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[65vh]" ref={heroRef}>
        {validImages.length > 0 ? (
          <>
            {/* Main Image */}
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={validImages[currentImageIndex]}
                alt={`${listing.title} - View ${currentImageIndex + 1}`}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority={currentImageIndex === 0}
                sizes="100vw"
                onError={() => handleImageError(currentImageIndex)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            </div>

            {/* Image Counter & Gallery Button */}
            <div className="absolute top-20 right-4 sm:right-6 z-30">
              <button
                onClick={scrollToGallery}
                className="flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-full transition-all text-sm"
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="font-medium">{validImages.length} Photos</span>
              </button>
            </div>

            {/* Navigation Arrows */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={() => navigateHero("prev")}
                  className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={() => navigateHero("next")}
                  className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}

            {/* Bottom Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-20">
              <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 sm:pt-20 pb-6 sm:pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-8">
                    {/* Venue Info */}
                    <div className="text-white flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                        <span className="bg-purple-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                          {listing.event_type === "event_center"
                            ? "Event Center"
                            : "Event Services"}
                        </span>
                        {listing.active && (
                          <span className="flex items-center gap-1 bg-green-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-xs sm:text-sm font-medium">
                            4.8 (127)
                          </span>
                        </div>
                      </div>

                      <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
                        {listing.title}
                      </h1>

                      <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm sm:text-lg">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                          <span>{listing.location}</span>
                        </div>
                        {(listing.capacity || listing.maximum_capacity) && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                            <span>
                              Up to{" "}
                              {listing.capacity || listing.maximum_capacity}{" "}
                              guests
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Booking Card */}
                    <div className="w-full lg:w-80 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
                      <div className="text-center mb-4 sm:mb-6">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                          {formatPrice(listing.price, listing.price_unit)}
                        </div>
                        {listing.security_deposit && (
                          <div className="text-xs sm:text-sm text-gray-600">
                            + ₦
                            {Number(listing.security_deposit).toLocaleString()}{" "}
                            security deposit
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Link
                          href={`/book/${listing.id}`}
                          className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors text-center"
                        >
                          {listing.availability === "available"
                            ? "Book Now"
                            : "Check Availability"}
                        </Link>

                        <button className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors">
                          Request Quote
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-green-600 text-xs sm:text-sm font-medium mt-3 sm:mt-4">
                        <Shield className="w-4 h-4" />
                        <span>Licensed & Insured</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Dots Indicator */}
            {validImages.length > 1 && (
              <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-30">
                <div className="flex gap-1 sm:gap-2">
                  {validImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentImageIndex(index);
                        stopAutoPlay();
                        setTimeout(startAutoPlay, 3000);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentImageIndex === index
                          ? "bg-white scale-125"
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No images available</p>
            </div>
          </div>
        )}
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12 sm:space-y-16">
            {/* Description */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                About This Venue
              </h2>
              <div className="prose prose-gray prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {listing.description}
                </p>
                {listing.features && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Key Features
                    </h3>
                    <p className="text-gray-700">{listing.features}</p>
                  </div>
                )}
                {listing.requirements && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Requirements
                    </h3>
                    <p className="text-gray-700">{listing.requirements}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Amenities */}
            {amenities.length > 0 && (
              <section className="py-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  Amenities & Features
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="relative group bg-white rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-md hover:bg-purple-50/50"
                      onMouseEnter={() => setHoveredAmenity(index)}
                      onMouseLeave={() => setHoveredAmenity(null)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 group-hover:bg-purple-200 rounded-md flex items-center justify-center transition-colors flex-shrink-0">
                          {getAmenityIcon(amenity.icon || amenity.type)}
                        </div>
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {amenity.name || amenity.label || amenity.title}
                        </h3>
                      </div>
                      {amenity.description && hoveredAmenity === index && (
                        <div className="absolute z-10 top-full left-0 mt-2 bg-white rounded-md shadow-lg p-3 border border-gray-100 max-w-xs w-max sm:w-[200px]">
                          <p className="text-xs text-gray-600">
                            {amenity.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Professional Gallery */}
            {validImages.length > 0 && (
              <section ref={galleryRef}>
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Photo Gallery
                  </h2>
                  <button
                    onClick={() => openLightbox(0)}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm sm:text-base"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      View All {validImages.length} Photos
                    </span>
                    <span className="sm:hidden">View All</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                  {/* Featured large image */}
                  <div className="col-span-2 row-span-2">
                    <button
                      onClick={() => openLightbox(0)}
                      className="group relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden"
                    >
                      <Image
                        src={validImages[0]}
                        alt={`${listing.title} - Main view`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        onError={() => handleImageError(0)}
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                    </button>
                  </div>

                  {/* Grid of smaller images */}
                  {validImages.slice(1, 7).map((image, index) => (
                    <button
                      key={index + 1}
                      onClick={() => openLightbox(index + 1)}
                      className="group relative aspect-square rounded-lg sm:rounded-xl overflow-hidden"
                    >
                      <Image
                        src={image}
                        alt={`${listing.title} - View ${index + 2}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 25vw, (max-width: 1024px) 16vw, 12vw"
                        onError={() => handleImageError(index + 1)}
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                      </div>
                      {index === 5 && validImages.length > 7 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-sm sm:text-lg font-semibold">
                            +{validImages.length - 7}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 sm:space-y-8 lg:sticky lg:top-24 lg:h-fit">
            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <Link
                  href={`/book/${listing.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 sm:py-3 px-4 rounded-xl transition-colors text-sm sm:text-base"
                >
                  <CalendarCheck className="w-4 h-4" />
                  {listing.availability === "available"
                    ? "Book Now"
                    : "Check Availability"}
                </Link>
              </div>
            </div>

            {/* Quick Details */}
            <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Venue Details
              </h3>

              <div className="space-y-4">
                {(listing.capacity || listing.maximum_capacity) && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 text-sm sm:text-base">
                        Capacity
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        Up to {listing.capacity || listing.maximum_capacity}{" "}
                        guests
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 text-sm sm:text-base">
                      Location
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {listing.location}
                    </div>
                  </div>
                </div>

                {listing.duration && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 text-sm sm:text-base">
                        Duration
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {listing.duration}
                      </div>
                    </div>
                  </div>
                )}

                {listing.event_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 text-sm sm:text-base">
                        Event Date
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {formatEventDate(listing.event_date)}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 text-sm sm:text-base">
                      Status
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 capitalize">
                      {listing.availability || "Available"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Policies & Information */}
            <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Booking Information
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-gray-600">
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Secure online booking available</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Instant booking confirmation</span>
                </div>
                {listing.security_deposit && (
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Security deposit: ₦
                      {Number(listing.security_deposit).toLocaleString()}
                    </span>
                  </div>
                )}
                {parseCancellationPolicy(listing.cancellation_policy).map(
                  (policy, index) => (
                    <div key={index} className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{policy}</span>
                    </div>
                  )
                )}
                <div className="flex gap-2">
                  <Shield className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Licensed and verified venue</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && validImages.length > 0 && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
            aria-label="Close gallery"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10 bg-black/50 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
            {lightboxIndex + 1} / {validImages.length}
          </div>

          {/* Download Button */}
          <button className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Navigation */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={() => navigateLightbox("prev")}
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={() => navigateLightbox("next")}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
            <Image
              src={validImages[lightboxIndex]}
              alt={`${listing.title} - View ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
              onError={() => handleImageError(lightboxIndex)}
            />
          </div>

          {/* Thumbnail Strip */}
          {validImages.length > 1 && (
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10">
              <div className="flex gap-1 sm:gap-2 bg-black/50 backdrop-blur-sm p-2 sm:p-3 rounded-xl sm:rounded-2xl max-w-xs sm:max-w-md overflow-x-auto">
                {validImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setLightboxIndex(index)}
                    className={`flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      lightboxIndex === index
                        ? "border-white scale-110"
                        : "border-transparent hover:border-white/50"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      sizes="48px"
                      onError={() => handleImageError(index)}
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

export default EventCenterDetail;
