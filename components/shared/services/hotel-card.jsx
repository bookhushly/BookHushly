"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import * as LucideIcons from "lucide-react";

const AMENITY_CONFIG = {
  wifi: { label: "WiFi", icon: "Wifi" },
  "air-vent": { label: "Air Conditioning", icon: "AirVent" },
  tv: { label: "TV", icon: "Tv" },
  coffee: { label: "Coffee Maker", icon: "Coffee" },
  bath: { label: "Bathtub", icon: "Bath" },
  refrigerator: { label: "Mini Fridge", icon: "Refrigerator" },
  utensils: { label: "Room Service", icon: "Utensils" },
  dumbbell: { label: "Gym Access", icon: "Dumbbell" },
  waves: { label: "Pool Access", icon: "Waves" },
  car: { label: "Parking", icon: "Car" },
  shirt: { label: "Laundry", icon: "Shirt" },
  briefcase: { label: "Work Desk", icon: "Briefcase" },
  "shield-check": { label: "Safe", icon: "ShieldCheck" },
  phone: { label: "Phone", icon: "Phone" },
  wind: { label: "Balcony", icon: "Wind" },
  droplet: { label: "Hot Water", icon: "Droplet" },
};

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

  const amenitiesList =
    service.amenities?.items?.filter((item) => AMENITY_CONFIG[item]) || [];
  const displayAmenities = amenitiesList.slice(0, 4);

  return (
    <Link href={`/services/hotels/${service.id}`}>
      <Card className="group overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 bg-white">
        <div className="relative h-56 overflow-hidden">
          <Image
            src={images[currentImageIndex]}
            alt={service.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

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
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
              {service.title}
            </h3>
          </div>

          <div className="flex items-start gap-1.5 text-sm text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
            <span className="line-clamp-1">{service.location}</span>
          </div>

          {displayAmenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {displayAmenities.map((amenityKey) => {
                const amenity = AMENITY_CONFIG[amenityKey];
                const Icon = LucideIcons[amenity.icon];
                return (
                  <div
                    key={amenityKey}
                    className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded"
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    <span>{amenity.label}</span>
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

          <div className="pt-3 border-t border-gray-100 flex items-end gap-3 justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Starting from</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  ₦{service.price?.toLocaleString()}
                </span>
                <span className="text-sm text-gray-600">/night</span>
              </div>
              {service.max_price > service.price && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Up to ₦{service.max_price?.toLocaleString()}/night
                </p>
              )}
            </div>
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              See Availability
            </Button>
          </div>

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
