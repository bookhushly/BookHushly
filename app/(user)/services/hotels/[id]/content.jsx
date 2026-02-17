"use client";

import React, { useState, useMemo, useCallback } from "react";
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
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import RichContentRenderer from "@/components/common/rich-text-renderer";
import { AMENITY_ICONS } from "@/lib/constants/filters";

const HotelDetails = ({ hotel, roomTypes }) => {
  const router = useRouter();

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
  });

  const allImages = useMemo(() => {
    return hotel.image_urls?.length > 0
      ? hotel.image_urls
      : ["/placeholder-hotel.jpg"];
  }, [hotel.image_urls]);

  // Parse and display amenities from the AMENITY_ICONS constant
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

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header Navigation */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/services?category=hotels"
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Back to search</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Image Gallery */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ImageGallery
          images={allImages}
          altPrefix={hotel.name}
          propertyType="hotel"
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hotel Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {hotel.name}
          </h1>
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-5 h-5 text-purple-600" />
            <span>{location}</span>
          </div>
        </div>

        {/* Description */}
        {hotel.description && (
          <div className="mb-8">
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
        )}

        {/* Amenities */}
        {hotelAmenities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What this place offers
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {hotelAmenities.map((amenity) => (
                <div
                  key={amenity.key}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <amenity.Icon className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">
                    {amenity.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-8" />

        {/* Policies */}
        {(hotel.checkout_policy || hotel.policies) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
          </div>
        )}

        <Separator className="my-8" />

        {/* Room Types */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Choose your room
          </h2>

          {roomTypes.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                No rooms available at the moment
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Please check back later or contact us for more information
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
        </div>
      </div>

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

export default HotelDetails;
