// components/shared/services/apartment-card.jsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Bath, Users, Zap, Wifi } from "lucide-react";

const ApartmentCard = React.memo(({ service: apt, lastListingRef }) => {
  const imageUrl = apt.media_urls?.[0] || "/placeholder-apartment.jpg";
  const typeLabel = apt.apartment_type?.replace(/_/g, " ") || "Apartment";

  return (
    <Link
      href={`/services/serviced-apartments/${apt.id}`}
      ref={lastListingRef}
      className="block group h-full"
    >
      <div className="h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
        {/* Image */}
        <div className="relative h-36 sm:h-52 overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={apt.title}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Type label */}
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-950/70 text-white backdrop-blur-sm px-2.5 py-1 rounded-lg">
              {typeLabel}
            </span>
          </div>

          {/* Price badge */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
            <p className="text-[10px] text-gray-400">From</p>
            <p className="text-base font-bold text-gray-900">
              ₦{apt.price?.toLocaleString()}
              <span className="text-xs font-normal text-gray-400">/night</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          {/* Location */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 line-clamp-1">
              {apt.area ? `${apt.area}, ` : ""}
              {apt.location}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 mb-3 group-hover:text-violet-700 transition-colors">
            {apt.title}
          </h3>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-gray-100">
            <div className="flex flex-col items-center gap-1">
              <Bed className="h-4 w-4 text-violet-500" />
              <span className="text-xs font-medium text-gray-700">
                {apt.bedrooms || 0} Bed
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Bath className="h-4 w-4 text-violet-500" />
              <span className="text-xs font-medium text-gray-700">
                {apt.bathrooms || 0} Bath
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Users className="h-4 w-4 text-violet-500" />
              <span className="text-xs font-medium text-gray-700">
                {apt.max_guests || 0} Guests
              </span>
            </div>
          </div>

          {/* Feature tags */}
          {(apt.generator_available ||
            apt.internet_included ||
            apt.furnished) && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {apt.generator_available && (
                <span className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg font-medium">
                  <Zap className="h-3 w-3" /> Generator
                </span>
              )}
              {apt.internet_included && (
                <span className="flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2 py-1 rounded-lg font-medium">
                  <Wifi className="h-3 w-3" /> WiFi
                </span>
              )}
              {apt.furnished && (
                <span className="text-[11px] text-violet-700 bg-violet-50 px-2 py-1 rounded-lg font-medium">
                  Furnished
                </span>
              )}
            </div>
          )}

          {/* Weekly/monthly pricing */}
          {(apt.price_per_week || apt.price_per_month) && (
            <div className="flex gap-3 mb-3 text-[11px] text-gray-400">
              {apt.price_per_week && (
                <span>
                  Weekly:{" "}
                  <b className="text-gray-600">
                    ₦{apt.price_per_week.toLocaleString()}
                  </b>
                </span>
              )}
              {apt.price_per_month && (
                <span>
                  Monthly:{" "}
                  <b className="text-gray-600">
                    ₦{apt.price_per_month.toLocaleString()}
                  </b>
                </span>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="mt-auto w-full h-10 flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors duration-150 cursor-pointer">
            View details
          </div>
        </div>
      </div>
    </Link>
  );
});

ApartmentCard.displayName = "ApartmentCard";
export default ApartmentCard;
