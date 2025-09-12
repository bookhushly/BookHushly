"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  PartyPopper,
  Calendar,
  Clock,
  CheckCircle,
  MapPin,
  Share2,
  Heart,
  Shield,
  Music,
  Car,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Star,
  Building,
} from "lucide-react";
import Link from "next/link";

const EventCenterDetail = ({ service, categoryData }) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Image */}
      <div className="relative">
        {images && images.length > 0 ? (
          <div className="relative h-[60vh] overflow-hidden">
            <Image
              src={images[0]}
              alt={service.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/40" />

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

            {/* Hero Content */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent">
              <div className="max-w-7xl mx-auto px-6 pb-12 pt-20">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                  <div className="text-white">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-purple-600 text-white border-purple-600">
                        Event Venue
                      </Badge>
                      {service.active && (
                        <Badge className="bg-green-600 text-white border-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                      {service.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-lg">
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        {service.location}
                      </div>
                      {service.capacity && (
                        <div className="flex items-center">
                          <Users className="w-5 h-5 mr-2" />
                          Up to {service.capacity.toLocaleString()} guests
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price Card */}
                  <div className="lg:w-80 bg-white rounded-2xl p-6 shadow-xl">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        ₦{service.price.toLocaleString()}
                      </div>
                      <div className="text-gray-600">per event</div>
                      <div className="flex items-center justify-center mt-2">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">
                          4.8 (120+ events)
                        </span>
                      </div>
                    </div>

                    <Button
                      asChild={service.availability === "available"}
                      disabled={service.availability !== "available"}
                      className="w-full h-12 text-base font-semibold bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {service.availability === "available" ? (
                        <Link
                          href={`/book/${service.id}`}
                          className="flex items-center justify-center gap-2"
                        >
                          <Building className="w-5 h-5" />
                          Book This Venue
                        </Link>
                      ) : (
                        <span>Unavailable</span>
                      )}
                    </Button>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
                        <Shield className="w-4 h-4" />
                        Licensed & Insured
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // No images fallback
          <div className="bg-purple-600 text-white py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  Event Venue
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
              <div className="flex flex-wrap items-center gap-6 text-lg">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  {service.location}
                </div>
                {service.capacity && (
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Up to {service.capacity.toLocaleString()} guests
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* About */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                About This Venue
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {service.description ||
                  "A premium event venue perfect for your special occasions. Contact us to learn more about hosting your event here."}
              </p>
            </div>

            {/* Features */}
            {service.amenities && service.amenities.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  What's Included
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {service.amenities.slice(0, 8).map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100"
                    >
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        {amenity.icon === "music" ||
                        amenity.value === "sound_system" ? (
                          <Music className="w-5 h-5 text-white" />
                        ) : amenity.icon === "parking" ||
                          amenity.value === "parking" ? (
                          <Car className="w-5 h-5 text-white" />
                        ) : amenity.icon === "stage" ||
                          amenity.value === "stage" ? (
                          <PartyPopper className="w-5 h-5 text-white" />
                        ) : (
                          <Shield className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">
                        {amenity.label || amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Images */}
            {images && images.length > 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  More Photos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.slice(1, 7).map((image, index) => (
                    <div
                      key={index + 1}
                      className="aspect-video relative cursor-pointer group overflow-hidden rounded-xl"
                      onClick={() => openFullscreen(index + 1)}
                    >
                      <Image
                        src={image}
                        alt={`${service.title} ${index + 2}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ))}
                </div>
                {images.length > 7 && (
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
          <div className="space-y-8">
            {/* Quick Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Venue Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">Capacity</div>
                    <div className="text-sm text-gray-600">
                      {service.capacity
                        ? `Up to ${service.capacity} guests`
                        : "Contact for details"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">Location</div>
                    <div className="text-sm text-gray-600">
                      {service.location}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  Verified & Licensed Venue
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

export default EventCenterDetail;
