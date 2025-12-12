"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  Bed,
  Maximize,
  Star,
  Wifi,
  Coffee,
  Tv,
  Wind,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const HotelCard = ({ service }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = service.media_urls?.length
    ? service.media_urls
    : ["/placeholder-hotel.jpg"];

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

  // Parse beds data
  const totalBeds = service.beds
    ? Object.values(service.beds).reduce(
        (sum, count) => sum + (parseInt(count) || 0),
        0
      )
    : 0;

  // Parse amenities
  const amenitiesList = Array.isArray(service.amenities)
    ? service.amenities
    : typeof service.amenities === "object"
      ? Object.keys(service.amenities)
      : [];

  const iconMap = {
    wifi: Wifi,
    coffee: Coffee,
    tv: Tv,
    "air conditioning": Wind,
  };

  const displayAmenities = amenitiesList.slice(0, 4);

  return (
    <Link href={`/listings/hotels/${service.id}`}>
      <Card className="group overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 bg-white">
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden">
          <Image
            src={images[currentImageIndex]}
            alt={service.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>

              {/* Image Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
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

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-500 hover:bg-green-600 text-white border-none shadow-md">
              Available
            </Badge>
          </div>

          {/* Genius Badge (optional - can be based on ratings/reviews) */}
          <div className="absolute top-3 left-3 bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            <span>Featured</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Hotel Name & Room Type */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
              {service.hotel_name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-1">
              {service.room_type_name}
            </p>
          </div>

          {/* Location */}
          <div className="flex items-start gap-1.5 text-sm text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
            <span className="line-clamp-1">{service.location}</span>
          </div>

          {/* Room Details */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
            {service.max_occupancy && (
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-500" />
                <span>{service.max_occupancy} guests</span>
              </div>
            )}
            {totalBeds > 0 && (
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-gray-500" />
                <span>
                  {totalBeds} {totalBeds === 1 ? "bed" : "beds"}
                </span>
              </div>
            )}
            {service.size_sqm && (
              <div className="flex items-center gap-1.5">
                <Maximize className="w-4 h-4 text-gray-500" />
                <span>{service.size_sqm} m²</span>
              </div>
            )}
          </div>

          {/* Amenities */}
          {displayAmenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {displayAmenities.map((amenity, index) => {
                const Icon = iconMap[amenity.toLowerCase()] || Wifi;
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
              {amenitiesList.length > 4 && (
                <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                  +{amenitiesList.length - 4} more
                </div>
              )}
            </div>
          )}

          {/* Floor Info */}
          {service.floor && (
            <p className="text-xs text-gray-500">
              Floor {service.floor} • Room {service.room_number}
            </p>
          )}

          {/* Price Section */}
          <div className="pt-3 border-t border-gray-100 flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Price per night</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  ₦{service.price?.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">+ taxes & fees</p>
            </div>
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              View Details
            </Button>
          </div>

          {/* Free Cancellation Badge */}
          {service.checkout_policy && (
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Free cancellation available</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default HotelCard;
