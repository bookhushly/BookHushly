"use client";

import React, { useState, useMemo } from "react";
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
  Calendar,
  Wifi,
  ParkingSquare,
  Waves,
  Dumbbell,
  UtensilsCrossed,
  Wine,
  Sparkles,
  Shirt,
  ConciergeBell,
  Presentation,
  Bus,
  PawPrint,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import RichContentRenderer from "@/components/common/rich-text-renderer";

const HotelDetails = ({ hotel, roomTypes }) => {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
  });

  const allImages = useMemo(() => {
    return hotel.image_urls?.length
      ? hotel.image_urls
      : ["/placeholder-hotel.jpg"];
  }, [hotel.image_urls]);

  // Amenity labels for display
  const amenityLabels = {
    wifi: "WiFi",
    parking: "Parking",
    pool: "Swimming Pool",
    gym: "Gym/Fitness Center",
    restaurant: "Restaurant",
    bar: "Bar/Lounge",
    spa: "Spa",
    laundry: "Laundry Service",
    room_service: "Room Service",
    conference_room: "Conference Room",
    airport_shuttle: "Airport Shuttle",
    pet_friendly: "Pet Friendly",
  };

  // Icon mapping for amenities
  const amenityIcons = {
    wifi: Wifi,
    parking: ParkingSquare,
    pool: Waves,
    gym: Dumbbell,
    restaurant: UtensilsCrossed,
    bar: Wine,
    spa: Sparkles,
    laundry: Shirt,
    room_service: ConciergeBell,
    conference_room: Presentation,
    airport_shuttle: Bus,
    pet_friendly: PawPrint,
  };

  const parseAmenities = (amenitiesData) => {
    if (!amenitiesData) return [];

    // If it's an object with true/false values (from database)
    if (typeof amenitiesData === "object" && !Array.isArray(amenitiesData)) {
      return Object.keys(amenitiesData).filter(
        (key) => amenitiesData[key] === true
      );
    }

    // If it's already an array
    if (Array.isArray(amenitiesData)) return amenitiesData;

    return [];
  };

  const hotelAmenities = useMemo(() => {
    const amenitiesList = parseAmenities(hotel.amenities);
    return amenitiesList.map((amenity) => {
      const Icon = amenityIcons[amenity] || Check;
      const label = amenityLabels[amenity] || amenity.replace(/_/g, " ");
      return {
        name: label,
        Icon,
        key: amenity,
      };
    });
  }, [hotel.amenities]);

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleBookNow = (roomType) => {
    setSelectedRoomType(roomType);
    setBookingModalOpen(true);
  };

  const handleProceedToBooking = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) {
      return;
    }

    const params = new URLSearchParams({
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      adults: bookingData.adults.toString(),
      children: bookingData.children.toString(),
    });

    router.push(`/book/hotel/${selectedRoomType.id}?${params.toString()}`);
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const location =
    `${hotel.address || ""}${hotel.address && hotel.city ? ", " : ""}${hotel.city || ""}${hotel.city && hotel.state ? ", " : ""}${hotel.state || ""}`.trim();

  const nights = calculateNights();
  const estimatedTotal = nights * (selectedRoomType?.base_price || 0);

  // Check if content is HTML (from rich text editor) or plain text
  const isHtmlContent = (content) => {
    if (!content) return false;
    return /<[a-z][\s\S]*>/i.test(content);
  };

  return (
    <div className="min-h-screen bg-white">
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

      {/* Image Gallery Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {allImages.length === 1 ? (
          <div
            className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden cursor-pointer"
            onClick={() => setShowAllImages(true)}
          >
            <Image
              src={allImages[0]}
              alt={hotel.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
        ) : allImages.length === 2 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-[400px] sm:h-[500px] lg:h-[600px]">
            {allImages.slice(0, 2).map((image, index) => (
              <div
                key={index}
                className="relative rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => {
                  setSelectedImageIndex(index);
                  setShowAllImages(true);
                }}
              >
                <Image
                  src={image}
                  alt={`${hotel.name} - ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        ) : allImages.length === 3 ? (
          <div className="grid grid-cols-2 gap-3 h-[400px] sm:h-[500px] lg:h-[600px]">
            <div
              className="relative row-span-2 rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => setShowAllImages(true)}
            >
              <Image
                src={allImages[0]}
                alt={hotel.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="50vw"
                priority
              />
            </div>
            {allImages.slice(1, 3).map((image, index) => (
              <div
                key={index}
                className="relative rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => {
                  setSelectedImageIndex(index + 1);
                  setShowAllImages(true);
                }}
              >
                <Image
                  src={image}
                  alt={`${hotel.name} - ${index + 2}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="50vw"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 h-[400px] sm:h-[500px] lg:h-[600px]">
            <div
              className="col-span-4 sm:col-span-2 row-span-2 relative rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => setShowAllImages(true)}
            >
              <Image
                src={allImages[0]}
                alt={hotel.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, 50vw"
                priority
              />
            </div>
            {allImages.slice(1, 5).map((image, index) => (
              <div
                key={index}
                className="relative rounded-2xl overflow-hidden cursor-pointer group col-span-2 sm:col-span-1"
                onClick={() => {
                  setSelectedImageIndex(index + 1);
                  setShowAllImages(true);
                }}
              >
                <Image
                  src={image}
                  alt={`${hotel.name} - ${index + 2}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                {index === 3 && allImages.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      +{allImages.length - 5} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {allImages.length > 1 && (
          <button
            onClick={() => setShowAllImages(true)}
            className="mt-4 px-6 py-2.5 border-2 border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
          >
            <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
              <div className="bg-gray-900 rounded-sm" />
              <div className="bg-gray-900 rounded-sm" />
              <div className="bg-gray-900 rounded-sm" />
              <div className="bg-gray-900 rounded-sm" />
            </div>
            Show all {allImages.length} photos
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-12">
          <div className="space-y-4 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {hotel.name}
            </h1>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span>{location}</span>
            </div>
          </div>

          {/* Description - Supports both HTML and plain text */}
          {hotel.description && (
            <div className="mb-8">
              {isHtmlContent(hotel.description) ? (
                <RichContentRenderer
                  content={hotel.description}
                  className="text-gray-700 leading-relaxed"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                  {hotel.description}
                </p>
              )}
            </div>
          )}

          {hotelAmenities.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Hotel amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {hotelAmenities.map((amenity) => (
                  <div key={amenity.key} className="flex items-center gap-2">
                    <amenity.Icon className="w-5 h-5 text-gray-700" />
                    <span className="text-sm text-gray-900">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Policies - Supports both HTML and plain text */}
          {(hotel.checkout_policy || hotel.policies) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Policies
              </h2>
              <div className="space-y-3">
                {hotel.checkout_policy && (
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">
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
                    <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-2">
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

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Choose your room
            </h2>

            {roomTypes.length === 0 ? (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
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
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book {selectedRoomType?.name}</DialogTitle>
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
                  max={selectedRoomType?.max_occupancy || 4}
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
              onClick={handleProceedToBooking}
              disabled={!bookingData.checkIn || !bookingData.checkOut}
            >
              Continue to Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      {showAllImages && (
        <div className="fixed inset-0 z-50 bg-black">
          <button
            onClick={() => setShowAllImages(false)}
            className="fixed top-4 right-4 z-50 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="fixed top-4 left-4 z-50 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            {selectedImageIndex + 1} / {allImages.length}
          </div>

          <div className="h-full flex items-center justify-center p-4 sm:p-12">
            <div className="relative w-full h-full max-w-7xl">
              <Image
                src={allImages[selectedImageIndex]}
                alt={`View ${selectedImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="fixed left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="fixed right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/10">
            <div className="container mx-auto px-4 py-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                      index === selectedImageIndex
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
      )}
    </div>
  );
};

const RoomTypeCard = ({ roomType, onBookNow }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = roomType.image_urls?.length
    ? roomType.image_urls
    : ["/placeholder-room.jpg"];

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const parseAmenities = (amenitiesData) => {
    if (!amenitiesData) return [];
    if (Array.isArray(amenitiesData)) return amenitiesData;
    if (typeof amenitiesData === "object") return Object.keys(amenitiesData);
    return [];
  };

  const amenities = parseAmenities(roomType.amenities);

  // Check if content is HTML or plain text
  const isHtmlContent = (content) => {
    if (!content) return false;
    return /<[a-z][\s\S]*>/i.test(content);
  };

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
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {roomType.name}
            </h3>

            {/* Room Description - Supports both HTML and plain text */}
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
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>{roomType.max_occupancy} guests</span>
                </div>
              )}
              {roomType.size_sqm && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Maximize className="w-4 h-4 text-gray-500" />
                  <span>{roomType.size_sqm} m²</span>
                </div>
              )}
            </div>

            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {amenities.slice(0, 4).map((amenity, index) => {
                  const iconName = amenity.replace(/\s+/g, "");
                  const Icon = LucideIcons[iconName] || Check;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded"
                    >
                      <Icon className="w-3 h-3" />
                      <span className="capitalize">{amenity}</span>
                    </div>
                  );
                })}
                {amenities.length > 4 && (
                  <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    +{amenities.length - 4} more
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
};

export default HotelDetails;
