// components/shared/services/event-service-card.jsx
import React, { memo, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Users,
  Calendar,
  Clock,
  Ticket,
  Building2,
  ImageOff,
} from "lucide-react";

const FALLBACK_IMAGES = [
  "/service-images/events/1.jpg",
  "/service-images/events/2.jpg",
  "/placeholder.jpg",
];

const formatPrice = (service) => {
  const price = Number(service.price);
  if (isNaN(price)) return "—";
  if (service.price_unit === "negotiable") return "Negotiable";
  return `₦${price.toLocaleString()}`;
};

const EventServiceCard = memo(({ service, lastListingRef }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [imgError, setImgError] = useState(false);

  const isEventCenter = service.event_type === "event_center";

  const allImages = useMemo(() => {
    const imgs = (service.media_urls || []).filter(Boolean);
    return [...imgs, ...FALLBACK_IMAGES];
  }, [service.media_urls]);

  const handleImgError = () => {
    if (imgIdx < allImages.length - 1) setImgIdx((i) => i + 1);
    else setImgError(true);
  };

  const price = useMemo(() => formatPrice(service), [service]);
  const priceLabel = isEventCenter ? "per event" : "per ticket";
  const btnText = isEventCenter ? "Book Venue" : "Get Tickets";
  const BtnIcon = isEventCenter ? Building2 : Ticket;

  const eventDate = service.event_date ? new Date(service.event_date) : null;
  const eventTime = useMemo(() => {
    const src = service.event_time || service.event_date;
    if (!src) return null;
    return new Date(src).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, [service.event_time, service.event_date]);

  return (
    <div
      ref={lastListingRef}
      className="transform transition-opacity duration-300"
    >
      <Link href={`/services/${service.id}`} className="block group">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-violet-200 hover:shadow-[0_8px_30px_rgba(124,58,237,0.1)] transition-all duration-300">
          {/* Image */}
          <div className="relative h-52 overflow-hidden bg-gray-100">
            {imgError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <ImageOff className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-xs text-gray-400">Image unavailable</p>
              </div>
            ) : (
              <Image
                src={allImages[imgIdx]}
                alt={service.title || (isEventCenter ? "Event Venue" : "Event")}
                fill
                className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={handleImgError}
                priority={service.index < 4}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

            {/* Event type badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-sm ${
                  isEventCenter
                    ? "bg-gray-950/70 text-white"
                    : "bg-violet-600/90 text-white"
                }`}
              >
                {isEventCenter ? "Venue" : "Event"}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Location */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-500 line-clamp-1">
                {service.location?.split(",")[0] ||
                  (isEventCenter ? "Location TBD" : "Venue TBD")}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 mb-3 group-hover:text-violet-700 transition-colors">
              {service.title || (isEventCenter ? "Event Venue" : "Event")}
            </h3>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
              {service.capacity && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users className="h-3.5 w-3.5" />{" "}
                  {service.capacity.toLocaleString()} capacity
                </span>
              )}
              {!isEventCenter && eventDate && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  {eventDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
              {!isEventCenter && eventTime && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="h-3.5 w-3.5" /> {eventTime}
                </span>
              )}
            </div>

            {/* Description */}
            {service.description && (
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                {service.description}
              </p>
            )}

            {/* Price + CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <span className="text-xl font-bold text-gray-900">{price}</span>
                <span className="text-xs text-gray-400 ml-1">{priceLabel}</span>
              </div>
              <span className="h-9 px-4 inline-flex items-center gap-1.5 text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors duration-150">
                <BtnIcon className="h-3.5 w-3.5" />
                {btnText}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
});

EventServiceCard.displayName = "EventServiceCard";
export default EventServiceCard;
