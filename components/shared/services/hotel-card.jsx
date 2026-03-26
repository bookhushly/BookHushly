// components/shared/services/hotel-card.jsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  Wifi,
  AirVent,
  Waves,
  Car,
  Star,
} from "lucide-react";
import * as LucideIcons from "lucide-react";

const AMENITY_CONFIG = {
  wifi: { label: "WiFi", icon: "Wifi" },
  "air-vent": { label: "A/C", icon: "AirVent" },
  tv: { label: "TV", icon: "Tv" },
  coffee: { label: "Coffee", icon: "Coffee" },
  bath: { label: "Bathtub", icon: "Bath" },
  refrigerator: { label: "Fridge", icon: "Refrigerator" },
  utensils: { label: "Room Service", icon: "Utensils" },
  dumbbell: { label: "Gym", icon: "Dumbbell" },
  waves: { label: "Pool", icon: "Waves" },
  car: { label: "Parking", icon: "Car" },
  shirt: { label: "Laundry", icon: "Shirt" },
  briefcase: { label: "Work Desk", icon: "Briefcase" },
  "shield-check": { label: "Safe", icon: "ShieldCheck" },
  droplet: { label: "Hot Water", icon: "Droplet" },
};

const HotelCard = ({ service }) => {
  const [idx, setIdx] = useState(0);
  const images = service.media_urls?.length
    ? service.media_urls
    : ["/placeholder-hotel.jpg"];

  const prev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const next = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i + 1) % images.length);
  };

  const amenities = (service.amenities?.items || [])
    .filter((k) => AMENITY_CONFIG[k])
    .slice(0, 4);

  return (
    <Link href={`/services/hotels/${service.id}`} className="block group h-full">
      <div className="h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-violet-200 hover:shadow-[0_8px_30px_rgba(124,58,237,0.1)] transition-all duration-300">
        {/* Image */}
        <div className="relative h-44 sm:h-52 overflow-hidden bg-gray-100">
          <Image
            src={images[idx]}
            alt={service.title}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Image nav */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
              >
                <ChevronLeft className="h-4 w-4 text-gray-700" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
              >
                <ChevronRight className="h-4 w-4 text-gray-700" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-200 ${i === idx ? "w-5 bg-white" : "w-1 bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges — top left stack */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
            {service.checkout_policy && (
              <span className="text-[10px] font-semibold bg-green-500 text-white px-2 py-1 rounded-lg">
                Free cancellation
              </span>
            )}
            {service.nihotour_certified && (
              <span className="text-[10px] font-semibold bg-amber-500 text-white px-2 py-1 rounded-lg flex items-center gap-0.5">
                🏅 NIHOTOUR
              </span>
            )}
          </div>

          {/* Rating badge */}
          {service.avg_rating && (
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/95 text-gray-900 px-2 py-1 rounded-lg shadow-sm">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {service.avg_rating}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          {/* Location */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 line-clamp-1">
              {service.location}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 mb-3 group-hover:text-violet-700 transition-colors">
            {service.title}
          </h3>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {amenities.map((key) => {
                const a = AMENITY_CONFIG[key];
                const Icon = LucideIcons[a.icon];
                return (
                  <span
                    key={key}
                    className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-1 rounded-lg"
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    {a.label}
                  </span>
                );
              })}
              {(service.amenities?.items || []).length > 4 && (
                <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                  +{service.amenities.items.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Price + CTA */}
          <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between pt-3 border-t border-gray-100">
            {service.price ? (
              <div>
                <p className="text-[11px] text-gray-400 mb-0.5">Starting from</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-base sm:text-xl font-bold text-gray-900">
                    ₦{service.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">/night</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">View details for pricing</p>
            )}
            <span className="h-9 w-full sm:w-auto px-4 inline-flex items-center justify-center text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors duration-150">
              See rooms
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
