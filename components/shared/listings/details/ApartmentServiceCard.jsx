// components/shared/listings/details/ApartmentServiceCard.jsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Bath, Users, Zap, Wifi, ShieldCheck, Tag, Star } from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────

function discountPct(base, discounted) {
  if (!base || !discounted || discounted >= base) return 0;
  return Math.round(((base - discounted) / base) * 100);
}

function detectFreeCancellation(policy) {
  if (!policy || typeof policy !== "string") return false;
  const lower = policy.toLowerCase();
  return (
    lower.includes("free cancellation") ||
    lower.includes("full refund") ||
    lower.includes("100% refund") ||
    (lower.includes("refund") && lower.includes("48") ) ||
    (lower.includes("refund") && lower.includes("24"))
  );
}

// ── component ────────────────────────────────────────────────────────────────

const ApartmentCard = React.memo(({ service: apt, lastListingRef }) => {
  const imageUrl = apt.media_urls?.[0] || "/placeholder-apartment.jpg";
  const typeLabel = apt.apartment_type?.replace(/_/g, " ") || "Apartment";

  const weeklyNightlyTotal = apt.price * 7;
  const monthlyNightlyTotal = apt.price * 30;
  const weeklyPct = discountPct(weeklyNightlyTotal, apt.price_per_week);
  const monthlyPct = discountPct(monthlyNightlyTotal, apt.price_per_month);
  const bestPct = Math.max(weeklyPct, monthlyPct);

  const hasFreeCancellation = detectFreeCancellation(apt.cancellation_policy);

  return (
    <Link
      href={`/services/serviced-apartments/${apt.id}`}
      ref={lastListingRef}
      className="block group h-full"
    >
      <div className="h-full flex flex-row sm:flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
        {/* Image */}
        <div className="relative w-[110px] shrink-0 self-stretch sm:self-auto sm:w-auto sm:h-52 overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={apt.title}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 110px, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Type label */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
            <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider bg-gray-950/70 text-white backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg">
              {typeLabel}
            </span>
          </div>

          {/* Discount badge */}
          {bestPct >= 5 && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-green-500 text-white text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-lg">
              Save {bestPct}%
            </div>
          )}

          {/* Price badge — sm+ only (shown in content on mobile) */}
          <div className="hidden sm:block absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
            <p className="text-[10px] text-gray-400">From</p>
            <p className="text-base font-medium text-gray-900">
              ₦{apt.price?.toLocaleString()}
              <span className="text-xs font-normal text-gray-400">/night</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-4 flex-1 flex flex-col min-w-0">
          {/* Title + verified badge */}
          <div className="flex items-start gap-1.5 mb-1">
            <h3 className="font-medium text-gray-900 text-[13px] sm:text-base leading-snug line-clamp-2 group-hover:text-violet-700 transition-colors">
              {apt.title}
            </h3>
            {apt.is_verified && (
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 shrink-0 mt-0.5" title="Verified property" />
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 mb-2">
            <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium text-gray-700 truncate">
              {apt.area ? `${apt.area}, ` : ""}{apt.location}
            </span>
          </div>

          {/* Rating */}
          {apt.avg_rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400 fill-amber-400 shrink-0" />
              <span className="text-[11px] sm:text-xs font-medium text-gray-700">
                {apt.avg_rating.toFixed(1)}
              </span>
              <span className="text-[11px] sm:text-xs text-gray-400">
                ({apt.review_count} review{apt.review_count !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          {/* Stats — compact inline on mobile, grid on sm+ */}
          <div className="flex items-center gap-3 mb-2 sm:hidden">
            <span className="flex items-center gap-1 text-[11px] text-gray-600">
              <Bed className="h-3 w-3 text-violet-500" /> {apt.bedrooms || 0}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-600">
              <Bath className="h-3 w-3 text-violet-500" /> {apt.bathrooms || 0}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-600">
              <Users className="h-3 w-3 text-violet-500" /> {apt.max_guests || 0}
            </span>
          </div>
          <div className="hidden sm:grid grid-cols-3 gap-2 mb-4 py-3 border-y border-gray-100">
            <div className="flex flex-col items-center gap-1">
              <Bed className="h-4 w-4 text-violet-500" />
              <span className="text-xs font-medium text-gray-700">{apt.bedrooms || 0} Bed</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Bath className="h-4 w-4 text-violet-500" />
              <span className="text-xs font-medium text-gray-700">{apt.bathrooms || 0} Bath</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Users className="h-4 w-4 text-violet-500" />
              <span className="text-xs font-medium text-gray-700">{apt.max_guests || 0} Guests</span>
            </div>
          </div>

          {/* Feature tags */}
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3">
            {apt.generator_available && (
              <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-700 bg-amber-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-medium">
                <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Generator
              </span>
            )}
            {apt.internet_included && (
              <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-blue-700 bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-medium">
                <Wifi className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> WiFi
              </span>
            )}
            {apt.furnished && (
              <span className="text-[10px] sm:text-[11px] text-violet-700 bg-violet-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-medium">
                Furnished
              </span>
            )}
            {hasFreeCancellation && (
              <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-green-700 bg-green-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-medium">
                <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Free cancel
              </span>
            )}
          </div>

          {/* Weekly/monthly pricing — sm+ only */}
          {(apt.price_per_week || apt.price_per_month) && (
            <div className="hidden sm:flex gap-3 mb-3 text-[11px] text-gray-400">
              {apt.price_per_week && (
                <span>
                  Weekly: <b className="text-gray-600">₦{apt.price_per_week.toLocaleString()}</b>
                  {weeklyPct >= 5 && <span className="text-green-600 ml-1">(-{weeklyPct}%)</span>}
                </span>
              )}
              {apt.price_per_month && (
                <span>
                  Monthly: <b className="text-gray-600">₦{apt.price_per_month.toLocaleString()}</b>
                  {monthlyPct >= 5 && <span className="text-green-600 ml-1">(-{monthlyPct}%)</span>}
                </span>
              )}
            </div>
          )}

          {/* Price + CTA */}
          <div className="mt-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
            {/* Mobile: price left, book button right */}
            <div className="flex items-end justify-between sm:hidden">
              <div>
                <p className="text-[10px] text-gray-400">From</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-sm font-medium text-gray-900">
                    ₦{apt.price?.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-400">/night</span>
                </div>
              </div>
              <span className="h-7 px-3 inline-flex items-center text-[11px] font-medium bg-violet-600 text-white rounded-lg shrink-0">
                Book
              </span>
            </div>
            {/* sm+: full-width button */}
            <div className="hidden sm:flex w-full h-10 items-center justify-center bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors duration-150 cursor-pointer">
              View details
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

ApartmentCard.displayName = "ApartmentCard";
export default ApartmentCard;
