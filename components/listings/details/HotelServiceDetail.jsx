"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Bed,
  Bath,
  Calendar,
  Clock,
  CheckCircle,
  MapPin,
  Share2,
  Heart,
  Shield,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Dumbbell,
  Phone,
  Mail,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Building,
  Tv,
  Wind,
  Waves,
  Zap,
  FileText,
  Award,
  CreditCard,
  Globe,
  ShieldCheck,
  AlertCircle,
  Info,
} from "lucide-react";
import Link from "next/link";

const HotelServiceDetail = ({ service, categoryData }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const images = service.media_urls || [];

  const navigateImage = (direction) => {
    if (direction === "next") {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    } else {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

  const openFullscreen = (index) => {
    setCurrentImageIndex(index);
    setIsFullscreen(true);
  };

  const formatPriceUnit = (unit) => {
    const unitMap = {
      per_night: "per night",
      per_day: "per day",
      per_week: "per week",
      per_month: "per month",
      negotiable: "negotiable",
      fixed: "total",
    };
    return unitMap[unit] || unit;
  };

  const formatCheckTime = (timeString) => {
    if (!timeString) return null;
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get amenities from the actual data structure
  const getAmenityIcon = (amenity) => {
    const amenityName =
      typeof amenity === "string"
        ? amenity.toLowerCase()
        : amenity?.name?.toLowerCase() || amenity?.value?.toLowerCase() || "";

    if (amenityName.includes("wifi") || amenityName.includes("internet"))
      return <Wifi className="h-5 w-5" />;
    if (amenityName.includes("parking")) return <Car className="h-5 w-5" />;
    if (amenityName.includes("breakfast") || amenityName.includes("coffee"))
      return <Coffee className="h-5 w-5" />;
    if (amenityName.includes("restaurant") || amenityName.includes("dining"))
      return <Utensils className="h-5 w-5" />;
    if (amenityName.includes("gym") || amenityName.includes("fitness"))
      return <Dumbbell className="h-5 w-5" />;
    if (amenityName.includes("desk") || amenityName.includes("reception"))
      return <Clock className="h-5 w-5" />;
    if (amenityName.includes("pool") || amenityName.includes("swimming"))
      return <Waves className="h-5 w-5" />;
    if (amenityName.includes("ac") || amenityName.includes("air"))
      return <Wind className="h-5 w-5" />;
    if (amenityName.includes("tv") || amenityName.includes("television"))
      return <Tv className="h-5 w-5" />;
    if (amenityName.includes("security"))
      return <ShieldCheck className="h-5 w-5" />;
    return <Shield className="h-5 w-5" />;
  };

  const getAmenityLabel = (amenity) => {
    if (typeof amenity === "string") return amenity;
    return amenity?.name || amenity?.label || amenity?.value || "Amenity";
  };

  const hotelAmenities = service.amenities || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Images */}
      <div className="relative">
        {images && images.length > 0 ? (
          <div className="relative h-[70vh] overflow-hidden">
            {/* Image Gallery Grid - Booking.com Style */}
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-full p-4">
              {/* Main large image */}
              <div
                className="col-span-2 row-span-2 relative cursor-pointer group overflow-hidden rounded-lg"
                onClick={() => openFullscreen(0)}
              >
                <Image
                  src={images[0]}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300" />
              </div>

              {/* Smaller images */}
              {images.slice(1, 5).map((image, index) => (
                <div
                  key={index + 1}
                  className="relative cursor-pointer group overflow-hidden rounded-lg"
                  onClick={() => openFullscreen(index + 1)}
                >
                  <Image
                    src={image}
                    alt={`${service.title} ${index + 2}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="25vw"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300" />
                  {index === 3 && images.length > 5 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        +{images.length - 5} more
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Floating Action Buttons */}
            <div className="absolute top-6 right-6 flex gap-3">
              <Button
                onClick={() => openFullscreen(0)}
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                {images.length} Photos
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white"
              >
                <Heart className="w-4 h-4" />
              </Button>
            </div>

            {/* Hotel Badge and Status */}
            <div className="absolute bottom-6 left-6">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600 text-white border-blue-600">
                  <Building className="w-3 h-3 mr-1" />
                  Hotel
                </Badge>
                {service.active && (
                  <Badge className="bg-green-600 text-white border-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {service.availability !== "available" && (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {service.availability}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
          // No images fallback
          <div className="bg-blue-600 text-white py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  <Building className="w-3 h-3 mr-1" />
                  Hotel
                </Badge>
                {service.active && (
                  <Badge className="bg-green-600 text-white border-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                {service.title}
              </h1>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {service.location}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Info */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {service.title}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-gray-300" />
                  <span className="text-sm font-medium ml-1">
                    4.2 (150+ reviews)
                  </span>
                </div>
              </div>
              <div className="flex items-center text-blue-600 mb-6">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">{service.location}</span>
              </div>
            </div>

            {/* Price Card */}
            <div className="lg:w-96 bg-white rounded-2xl border-2 border-blue-100 p-6 shadow-lg sticky top-6">
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₦{service.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600 ml-2 text-sm">
                    {formatPriceUnit(service.price_unit)}
                  </span>
                </div>
                <div className="text-sm text-green-600 font-medium">
                  Free cancellation available
                </div>
              </div>

              {/* Check-in/Check-out Times */}
              {(service.check_in_time || service.check_out_time) && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Check-in & Check-out
                  </h4>
                  <div className="space-y-2 text-sm">
                    {service.check_in_time && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-medium">
                          {formatCheckTime(service.check_in_time)}
                        </span>
                      </div>
                    )}
                    {service.check_out_time && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="font-medium">
                          {formatCheckTime(service.check_out_time)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button
                asChild={service.availability === "available"}
                disabled={service.availability !== "available"}
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white mb-4"
              >
                {service.availability === "available" ? (
                  <Link
                    href={`/book/${service.id}`}
                    className="flex items-center justify-center gap-2"
                  >
                    <Building className="w-5 h-5" />
                    Reserve Room
                  </Link>
                ) : (
                  <span>Currently Unavailable</span>
                )}
              </Button>

              {service.security_deposit && (
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Security deposit:</span>
                    <span className="font-medium">
                      ₦{service.security_deposit.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="w-4 h-4 mr-1" />
                  Message
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  Verified Hotel Partner
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Room Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Room Information
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {service.bedrooms && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bed className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {service.bedrooms}
                      </div>
                      <div className="text-sm text-gray-600">
                        Bedroom{service.bedrooms > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                )}
                {service.bathrooms && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bath className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {service.bathrooms}
                      </div>
                      <div className="text-sm text-gray-600">
                        Bathroom{service.bathrooms > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                )}
                {(service.capacity || service.maximum_capacity) && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {service.maximum_capacity || service.capacity}
                      </div>
                      <div className="text-sm text-gray-600">Max Guests</div>
                    </div>
                  </div>
                )}
                {service.minimum_stay && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {service.minimum_stay.replace("_", " ")}
                      </div>
                      <div className="text-sm text-gray-600">Min Stay</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                About This Hotel
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Amenities */}
            {hotelAmenities && hotelAmenities.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Hotel Amenities
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {hotelAmenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100"
                    >
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        {getAmenityIcon(amenity)}
                      </div>
                      <span className="font-medium text-gray-900">
                        {getAmenityLabel(amenity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Policies */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Hotel Policies
              </h2>
              <div className="space-y-4">
                {service.cancellation_policy && (
                  <div className="flex gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Cancellation Policy
                      </h3>
                      <p className="text-gray-700 text-sm">
                        {service.cancellation_policy}
                      </p>
                    </div>
                  </div>
                )}
                {service.requirements && (
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Requirements
                      </h3>
                      <p className="text-gray-700 text-sm">
                        {service.requirements}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Payment
                    </h3>
                    <p className="text-gray-700 text-sm">
                      We accept all major credit cards and bank transfers.
                      {service.security_deposit &&
                        ` Security deposit of ₦${service.security_deposit.toLocaleString()} required.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Images */}
            {images && images.length > 5 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  More Photos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.slice(5, 11).map((image, index) => (
                    <div
                      key={index + 5}
                      className="aspect-video relative cursor-pointer group overflow-hidden rounded-lg"
                      onClick={() => openFullscreen(index + 5)}
                    >
                      <Image
                        src={image}
                        alt={`${service.title} ${index + 6}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ))}
                </div>
                {images.length > 11 && (
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
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vendor Information */}
            {(service.vendor_name || service.vendor_phone) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Hotel Contact
                </h3>
                <div className="space-y-3">
                  {service.vendor_name && (
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{service.vendor_name}</span>
                    </div>
                  )}
                  {service.vendor_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span>{service.vendor_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Operating Hours */}
            {(service.operating_hours || service.is_24_7) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Operating Hours
                </h3>
                {service.is_24_7 ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">24/7 Available</span>
                  </div>
                ) : service.operating_hours ? (
                  <div className="text-gray-700">{service.operating_hours}</div>
                ) : null}
              </div>
            )}

            {/* Trust & Safety */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Trust & Safety
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-green-600">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-sm font-medium">Verified Hotel</span>
                </div>
                <div className="flex items-center gap-3 text-green-600">
                  <Award className="w-5 h-5" />
                  <span className="text-sm font-medium">Licensed Property</span>
                </div>
                <div className="flex items-center gap-3 text-green-600">
                  <Globe className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    24/7 Customer Support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && images && images.length > 0 && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-all duration-200 z-10"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="absolute top-6 left-6 text-white text-lg font-medium z-10">
            {currentImageIndex + 1} / {images.length}
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={() => navigateImage("prev")}
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all duration-200 z-10"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={() => navigateImage("next")}
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all duration-200 z-10"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-6">
            <Image
              src={images[currentImageIndex]}
              alt={`${service.title} ${currentImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelServiceDetail;
