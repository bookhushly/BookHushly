"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Users,
  Bed,
  Maximize,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Heart,
  Check,
  Info,
  AlertCircle,
  Building,
  Grid3X3,
  CheckCircle,
  Shield,
  Star,
  ZoomIn,
  ArrowLeft,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import RichContentRenderer from "@/components/common/rich-text-renderer";
import { AMENITY_ICONS } from "@/lib/constants/filters";

const HotelDetails = ({ hotel, roomTypes }) => {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
  });

  const autoPlayRef = useRef(null);

  const allImages = useMemo(() => {
    return hotel.image_urls?.length > 0
      ? hotel.image_urls
      : ["/placeholder-hotel.jpg"];
  }, [hotel.image_urls]);

  // Auto-play slideshow
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      if (!showAllImages && allImages.length > 1) {
        setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
      }
    }, 5000);
  }, [showAllImages, allImages.length]);

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

  // Scroll detection
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

  // Parse and display amenities
  const hotelAmenities = useMemo(() => {
    if (!hotel.amenities?.items || !Array.isArray(hotel.amenities.items)) {
      return [];
    }

    return hotel.amenities.items
      .map((amenityKey) => {
        const amenityConfig = AMENITY_ICONS.find((a) => a.value === amenityKey);
        if (!amenityConfig) return null;

        const Icon = LucideIcons[amenityConfig.icon];
        return {
          key: amenityKey,
          label: amenityConfig.label,
          Icon: Icon || Check,
        };
      })
      .filter(Boolean);
  }, [hotel.amenities]);

  const nextImage = useCallback(() => {
    stopAutoPlay();
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
    setTimeout(startAutoPlay, 3000);
  }, [allImages.length, stopAutoPlay, startAutoPlay]);

  const prevImage = useCallback(() => {
    stopAutoPlay();
    setSelectedImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1,
    );
    setTimeout(startAutoPlay, 3000);
  }, [allImages.length, stopAutoPlay, startAutoPlay]);

  const handleBookNow = useCallback((roomType) => {
    setSelectedRoomType(roomType);
    setBookingModalOpen(true);
  }, []);

  const handleProceedToBooking = useCallback(() => {
    if (!bookingData.checkIn || !bookingData.checkOut || !selectedRoomType) {
      return;
    }

    const params = new URLSearchParams({
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      adults: bookingData.adults.toString(),
      children: bookingData.children.toString(),
    });

    router.push(`/book/hotel/${selectedRoomType.id}?${params.toString()}`);
  }, [bookingData, selectedRoomType, router]);

  const calculateNights = useCallback(() => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [bookingData.checkIn, bookingData.checkOut]);

  const location = useMemo(
    () =>
      `${hotel.address || ""}${hotel.address && hotel.city ? ", " : ""}${hotel.city || ""}${hotel.city && hotel.state ? ", " : ""}${hotel.state || ""}`.trim(),
    [hotel.address, hotel.city, hotel.state],
  );

  const nights = calculateNights();
  const estimatedTotal = nights * (selectedRoomType?.base_price || 0);

  const isHtmlContent = useCallback((content) => {
    if (!content) return false;
    return /<[a-z][\s\S]*>/i.test(content);
  }, []);

  const openLightbox = useCallback(
    (index) => {
      setSelectedImageIndex(index);
      setShowAllImages(true);
      document.body.style.overflow = "hidden";
      stopAutoPlay();
    },
    [stopAutoPlay],
  );

  const closeLightbox = useCallback(() => {
    setShowAllImages(false);
    document.body.style.overflow = "auto";
    startAutoPlay();
  }, [startAutoPlay]);

  return (
    <div className="min-h-screen bg-white pt-20">
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
              href="/services?category=hotels"
              className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">
                Back to search
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
      <section className="relative h-[65vh]">
        {allImages.length > 0 ? (
          <>
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={allImages[selectedImageIndex]}
                alt={`${hotel.name} - View ${selectedImageIndex + 1}`}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority={selectedImageIndex === 0}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            </div>

            {/* Image Counter & Gallery Button */}
            <div className="absolute top-20 right-4 sm:right-6 z-30">
              <button
                onClick={() => openLightbox(0)}
                className="flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-full transition-all text-sm"
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="font-medium">{allImages.length} Photos</span>
              </button>
            </div>

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}

            {/* Bottom Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-20">
              <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 sm:pt-20 pb-6 sm:pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div className="text-white flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                        <span className="bg-purple-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                          Hotel
                        </span>
                        <span className="flex items-center gap-1 bg-green-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-xs sm:text-sm font-medium">
                            4.8 (127)
                          </span>
                        </div>
                      </div>

                      <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
                        {hotel.name}
                      </h1>

                      <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm sm:text-lg">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                          <span>{location}</span>
                        </div>
                        {roomTypes.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                            <span>{roomTypes.length} room types available</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Booking Card */}
                    {roomTypes.length > 0 && (
                      <div className="w-full lg:w-80 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
                        <div className="text-center mb-4 sm:mb-6">
                          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                            From ₦
                            {Math.min(
                              ...roomTypes.map((rt) =>
                                parseFloat(rt.base_price),
                              ),
                            ).toLocaleString()}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            per night
                          </div>
                        </div>

                        <div className="space-y-3">
                          <button
                            onClick={() => handleBookNow(roomTypes[0])}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors"
                          >
                            Check Availability
                          </button>

                          <button className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors">
                            Request Quote
                          </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-green-600 text-xs sm:text-sm font-medium mt-3 sm:mt-4">
                          <Shield className="w-4 h-4" />
                          <span>Licensed & Verified</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Image Dots Indicator */}
            {allImages.length > 1 && (
              <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-30">
                <div className="flex gap-1 sm:gap-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedImageIndex(index);
                        stopAutoPlay();
                        setTimeout(startAutoPlay, 3000);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        selectedImageIndex === index
                          ? "bg-white scale-125"
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No images available</p>
            </div>
          </div>
        )}
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            {hotel.description && (
              <section>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  About This Hotel
                </h2>
                <div className="prose prose-gray prose-lg max-w-none">
                  {isHtmlContent(hotel.description) ? (
                    <RichContentRenderer
                      content={hotel.description}
                      className="text-gray-700 leading-relaxed"
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {hotel.description}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Compact Amenities */}
            {hotelAmenities.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    What this place offers
                  </h2>
                  {hotelAmenities.length > 8 && (
                    <button
                      onClick={() => setShowAmenitiesModal(true)}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm sm:text-base"
                    >
                      Show all {hotelAmenities.length}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {hotelAmenities.slice(0, 8).map((amenity) => (
                    <div
                      key={amenity.key}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <amenity.Icon className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {amenity.label}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <Separator />

            {/* Policies */}
            {(hotel.checkout_policy || hotel.policies) && (
              <section>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  Things to know
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hotel.checkout_policy && (
                    <div className="flex gap-3">
                      <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">
                          Check-out policy
                        </p>
                        <p className="text-gray-700 text-sm">
                          {hotel.checkout_policy === "fixed_time"
                            ? "Fixed time checkout at 12:00 PM"
                            : "24-hour checkout from check-in time"}
                        </p>
                      </div>
                    </div>
                  )}
                  {hotel.policies && (
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">
                          House rules
                        </p>
                        {isHtmlContent(hotel.policies) ? (
                          <RichContentRenderer
                            content={hotel.policies}
                            className="text-gray-700 text-sm"
                          />
                        ) : (
                          <p className="text-gray-700 text-sm whitespace-pre-line">
                            {hotel.policies}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            <Separator />

            {/* Room Types */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Choose your room
              </h2>

              {roomTypes.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    No rooms available at the moment
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {roomTypes.map((roomType) => (
                    <RoomTypeCard
                      key={roomType.id}
                      roomType={roomType}
                      onBookNow={handleBookNow}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Hotel Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900">Location</div>
                    <div className="text-sm text-gray-600">{location}</div>
                  </div>
                </div>

                {roomTypes.length > 0 && (
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900">
                        Room Types
                      </div>
                      <div className="text-sm text-gray-600">
                        {roomTypes.length} options available
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900">Status</div>
                    <div className="text-sm text-gray-600">
                      Verified & Licensed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Amenities Modal */}
      <Dialog open={showAmenitiesModal} onOpenChange={setShowAmenitiesModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Amenities</DialogTitle>
            <DialogDescription>
              Everything this hotel has to offer
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {hotelAmenities.map((amenity) => (
              <div
                key={amenity.key}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <amenity.Icon className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-900">
                  {amenity.label}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Modal */}
      <BookingModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        roomType={selectedRoomType}
        bookingData={bookingData}
        setBookingData={setBookingData}
        nights={nights}
        estimatedTotal={estimatedTotal}
        onProceed={handleProceedToBooking}
      />

      {/* Image Lightbox */}
      <ImageLightbox
        show={showAllImages}
        images={allImages}
        selectedIndex={selectedImageIndex}
        hotelName={hotel.name}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrev={prevImage}
        onSelectImage={setSelectedImageIndex}
      />
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================

const RoomTypeCard = React.memo(({ roomType, onBookNow }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = useMemo(
    () =>
      roomType.image_urls?.length > 0
        ? roomType.image_urls
        : ["/placeholder-room.jpg"],
    [roomType.image_urls],
  );

  const nextImage = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    },
    [images.length],
  );

  const prevImage = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1,
      );
    },
    [images.length],
  );

  const amenities = useMemo(() => {
    if (
      !roomType.amenities?.items ||
      !Array.isArray(roomType.amenities.items)
    ) {
      return [];
    }

    return roomType.amenities.items
      .map((amenityKey) => {
        const amenityConfig = AMENITY_ICONS.find((a) => a.value === amenityKey);
        if (!amenityConfig) return null;

        const Icon = LucideIcons[amenityConfig.icon];
        return {
          key: amenityKey,
          label: amenityConfig.label,
          Icon: Icon || Check,
        };
      })
      .filter(Boolean);
  }, [roomType.amenities]);

  const isHtmlContent = useCallback((content) => {
    if (!content) return false;
    return /<[a-z][\s\S]*>/i.test(content);
  }, []);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div className="relative h-64 md:h-full rounded-lg overflow-hidden">
          <Image
            src={images[currentImageIndex]}
            alt={roomType.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="md:col-span-2 flex flex-col">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {roomType.name}
            </h3>

            {roomType.description && (
              <div className="mb-4">
                {isHtmlContent(roomType.description) ? (
                  <RichContentRenderer
                    content={roomType.description}
                    className="text-gray-700 text-sm line-clamp-2"
                  />
                ) : (
                  <p className="text-gray-700 text-sm line-clamp-2">
                    {roomType.description}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-4 mb-4">
              {roomType.max_occupancy && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>{roomType.max_occupancy} guests</span>
                </div>
              )}
              {roomType.size_sqm && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Maximize className="w-4 h-4 text-purple-600" />
                  <span>{roomType.size_sqm} m²</span>
                </div>
              )}
              {roomType.available_rooms && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Bed className="w-4 h-4 text-purple-600" />
                  <span>{roomType.available_rooms} available</span>
                </div>
              )}
            </div>

            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {amenities.slice(0, 5).map((amenity) => (
                  <div
                    key={amenity.key}
                    className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg"
                  >
                    <amenity.Icon className="w-3.5 h-3.5 text-purple-600" />
                    <span className="font-medium">{amenity.label}</span>
                  </div>
                ))}
                {amenities.length > 5 && (
                  <div className="text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg font-medium">
                    +{amenities.length - 5} more
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-end justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-600 mb-1">From</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  ₦{parseFloat(roomType.base_price).toLocaleString()}
                </span>
                <span className="text-sm text-gray-600">/night</span>
              </div>
            </div>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => onBookNow(roomType)}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
});

RoomTypeCard.displayName = "RoomTypeCard";

const BookingModal = React.memo(
  ({
    open,
    onOpenChange,
    roomType,
    bookingData,
    setBookingData,
    nights,
    estimatedTotal,
    onProceed,
  }) => {
    if (!roomType) return null;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book {roomType.name}</DialogTitle>
            <DialogDescription>
              Select your dates and number of guests
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">Check-in</Label>
                <Input
                  id="checkIn"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={bookingData.checkIn}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, checkIn: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-out</Label>
                <Input
                  id="checkOut"
                  type="date"
                  min={
                    bookingData.checkIn ||
                    new Date().toISOString().split("T")[0]
                  }
                  value={bookingData.checkOut}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, checkOut: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adults">Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  max={roomType.max_occupancy || 4}
                  value={bookingData.adults}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      adults: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="children">Children</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={bookingData.children}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      children: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            {nights > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Duration:</span>
                  <span className="font-semibold">
                    {nights} night{nights !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Estimated total:</span>
                  <span className="font-bold text-purple-600">
                    ₦{estimatedTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={onProceed}
              disabled={!bookingData.checkIn || !bookingData.checkOut}
            >
              Continue to Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);

BookingModal.displayName = "BookingModal";

const ImageLightbox = React.memo(
  ({
    show,
    images,
    selectedIndex,
    hotelName,
    onClose,
    onNext,
    onPrev,
    onSelectImage,
  }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black">
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="fixed top-4 left-4 z-50 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
          {selectedIndex + 1} / {images.length}
        </div>

        <div className="h-full flex items-center justify-center p-4 sm:p-12">
          <div className="relative w-full h-full max-w-7xl">
            <Image
              src={images[selectedIndex]}
              alt={`${hotelName} - View ${selectedIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={onPrev}
                className="fixed left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={onNext}
                className="fixed right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => onSelectImage(index)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                    index === selectedIndex
                      ? "ring-2 ring-white scale-105"
                      : "opacity-50 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

ImageLightbox.displayName = "ImageLightbox";

export default HotelDetails;
