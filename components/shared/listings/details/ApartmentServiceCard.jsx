"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Bed, Bath, Zap, Wifi, Home } from "lucide-react";

const ApartmentCard = React.memo(({ service, lastListingRef, isMobile }) => {
  const apartment = service;

  // Get first image or fallback
  const imageUrl = apartment.media_urls?.[0] || "/placeholder-apartment.jpg";
  const apartmentType =
    apartment.apartment_type?.replace("_", " ").toUpperCase() || "APARTMENT";

  return (
    <Link
      href={`/services/serviced-apartments/${apartment.id}`}
      ref={lastListingRef}
    >
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full border-gray-200 hover:border-purple-300">
        {/* Image Section */}
        <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={apartment.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={false}
          />

          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-purple-600 text-white font-semibold px-3 py-1">
              <Home className="h-3 w-3 mr-1" />
              {apartmentType}
            </Badge>
          </div>

          {/* Status Badge */}
          {apartment.status === "active" && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-600 text-white font-semibold px-2 py-1">
                Available
              </Badge>
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <p className="text-xs text-gray-600">From</p>
            <p className="text-lg font-bold text-purple-600">
              ₦{apartment.price?.toLocaleString()}
              <span className="text-xs font-normal text-gray-600">/night</span>
            </p>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 group-hover:text-purple-600 transition-colors">
            {apartment.title}
          </h3>

          {/* Location */}
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-purple-600" />
            <p className="line-clamp-1">
              {apartment.area && `${apartment.area}, `}
              {apartment.location}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Bed className="h-4 w-4 text-purple-600" />
              <span>{apartment.bedrooms || 0} Bed</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Bath className="h-4 w-4 text-purple-600" />
              <span>{apartment.bathrooms || 0} Bath</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="h-4 w-4 text-purple-600" />
              <span>{apartment.max_guests || 0} Guests</span>
            </div>

            {apartment.square_meters && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Home className="h-4 w-4 text-purple-600" />
                <span>{apartment.square_meters}m²</span>
              </div>
            )}
          </div>

          {/* Amenities Highlights */}
          {(apartment.generator_available ||
            apartment.internet_included ||
            apartment.furnished) && (
            <div className="flex flex-wrap gap-2 pt-2">
              {apartment.generator_available && (
                <Badge
                  variant="outline"
                  className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Generator
                </Badge>
              )}
              {apartment.internet_included && (
                <Badge
                  variant="outline"
                  className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                >
                  <Wifi className="h-3 w-3 mr-1" />
                  WiFi
                </Badge>
              )}
              {apartment.furnished && (
                <Badge
                  variant="outline"
                  className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                >
                  Furnished
                </Badge>
              )}
            </div>
          )}

          {/* Weekly/Monthly Pricing */}
          {(apartment.price_per_week || apartment.price_per_month) && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-600">
                {apartment.price_per_week && (
                  <span className="mr-3">
                    Weekly: ₦{apartment.price_per_week.toLocaleString()}
                  </span>
                )}
                {apartment.price_per_month && (
                  <span>
                    Monthly: ₦{apartment.price_per_month.toLocaleString()}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* View Details Button */}
          <div className="pt-3">
            <div className="w-full bg-purple-600 group-hover:bg-purple-700 text-white text-center py-2 rounded-lg font-medium transition-colors text-sm">
              View Details
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

ApartmentCard.displayName = "ApartmentCard";

export default ApartmentCard;
