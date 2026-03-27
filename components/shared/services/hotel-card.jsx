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
      <div className="h-full flex flex-row sm:flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-violet-200 hover:shadow-[0_8px_30px_rgba(124,58,237,0.1)] transition-all duration-300">
        {/* Image */}
        <div className="relative w-[110px] shrink-0 self-stretch sm:self-auto sm:w-auto sm:h-52 overflow-hidden bg-gray-100">
          <Image
            src={images[idx]}
            alt={service.title}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 110px, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Image nav — sm+ only */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/90 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
              >
                <ChevronLeft className="h-4 w-4 text-gray-700" />
              </button>
              <button
                onClick={next}
                className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/90 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
              >
                <ChevronRight className="h-4 w-4 text-gray-700" />
              </button>
              <div className="hidden sm:flex absolute bottom-3 left-1/2 -translate-x-1/2 gap-1 z-10">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-200 ${i === idx ? "w-5 bg-white" : "w-1 bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges — sm+ only */}
          <div className="hidden sm:flex absolute top-3 left-3 z-10 flex-col gap-1">
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

          {/* Rating badge — sm+ only */}
          {service.avg_rating && (
            <div className="hidden sm:block absolute top-3 right-3 z-10">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/95 text-gray-900 px-2 py-1 rounded-lg shadow-sm">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {service.avg_rating}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-4 flex-1 flex flex-col min-w-0">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-[13px] sm:text-base leading-snug line-clamp-2 mb-1 group-hover:text-violet-700 transition-colors">
            {service.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 mb-2">
            <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium text-gray-700 truncate">
              {service.location}
            </span>
          </div>

          {/* Mobile-only: rating + free cancel inline */}
          <div className="flex sm:hidden items-center gap-2 mb-2 flex-wrap">
            {service.avg_rating && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-gray-700">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {service.avg_rating}
              </span>
            )}
            {service.checkout_policy && (
              <span className="text-[10px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-md">
                Free cancel
              </span>
            )}
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-4">
              {amenities.slice(0, 2).map((key) => {
                const a = AMENITY_CONFIG[key];
                const Icon = LucideIcons[a.icon];
                return (
                  <span
                    key={key}
                    className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-500 bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg"
                  >
                    {Icon && <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                    {a.label}
                  </span>
                );
              })}
              {amenities.slice(2).map((key) => {
                const a = AMENITY_CONFIG[key];
                const Icon = LucideIcons[a.icon];
                return (
                  <span
                    key={key}
                    className="hidden sm:flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-1 rounded-lg"
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    {a.label}
                  </span>
                );
              })}
              {(service.amenities?.items || []).length > 4 && (
                <span className="hidden sm:inline text-[11px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                  +{service.amenities.items.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Price + CTA */}
          <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-100">
            {service.price ? (
              <>
                {/* Mobile: price left, small book button right */}
                <div className="flex items-end justify-between sm:hidden">
                  <div>
                    <p className="text-[10px] text-gray-400">From</p>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-sm font-bold text-gray-900">
                        ₦{service.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400">/night</span>
                    </div>
                  </div>
                  <span className="h-7 px-3 inline-flex items-center text-[11px] font-semibold bg-violet-600 text-white rounded-lg shrink-0">
                    Book
                  </span>
                </div>
                {/* sm+: stacked price + full button */}
                <div className="hidden sm:flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] text-gray-400 mb-0.5">Starting from</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-gray-900">
                        ₦{service.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400">/night</span>
                    </div>
                  </div>
                  <span className="h-9 px-4 inline-flex items-center justify-center text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors duration-150">
                    See rooms
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400 italic">View details for pricing</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
