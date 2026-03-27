// components/shared/services/event-service-card.jsx
import React, { memo, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Users,
  Calendar,
  Clock,
  Ticket,
  ImageOff,
  Timer,
  Repeat2,
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

  const allImages = useMemo(() => {
    const imgs = (service.media_urls || []).filter(Boolean);
    return [...imgs, ...FALLBACK_IMAGES];
  }, [service.media_urls]);

  const handleImgError = () => {
    if (imgIdx < allImages.length - 1) setImgIdx((i) => i + 1);
    else setImgError(true);
  };

  const price = useMemo(() => formatPrice(service), [service]);

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

  const plainDescription = useMemo(
    () => (service.description || "").replace(/<[^>]*>/g, ""),
    [service.description],
  );

  const [countdown, setCountdown] = useState(null);
  const [isPast, setIsPast] = useState(false);
  useEffect(() => {
    const src = service.event_time || service.event_date;
    if (!src) return;
    const target = new Date(src);
    if (isNaN(target.getTime())) return;
    const calc = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setCountdown(null);
        setIsPast(true);
        return;
      }
      setIsPast(false);
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff / 3600000) % 24);
      const minutes = Math.floor((diff / 60000) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown({ days, hours, minutes, seconds, urgent: diff < 86400000 });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [service.event_date, service.event_time]);

  return (
    <div
      ref={lastListingRef}
      className="transform transition-opacity duration-300 h-full"
    >
      <Link href={`/services/${service.id}`} className="block group h-full">
        <div className={`h-full flex flex-col bg-white rounded-2xl overflow-hidden border transition-all duration-300 ${
          isPast
            ? "border-gray-200 opacity-60 grayscale"
            : "border-gray-100 hover:border-violet-200 hover:shadow-[0_8px_30px_rgba(124,58,237,0.1)]"
        }`}>
          {/* Image — taller on mobile now that it's full-width */}
          <div className="relative h-44 sm:h-52 overflow-hidden bg-gray-100">
            {imgError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <ImageOff className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-xs text-gray-400">Image unavailable</p>
              </div>
            ) : (
              <Image
                src={allImages[imgIdx]}
                alt={service.title || "Event"}
                fill
                className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={handleImgError}
                priority={service.index < 4}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              {isPast ? (
                <span className="text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-sm bg-gray-600/80 text-white">
                  Ended
                </span>
              ) : (
                <span className="text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-sm bg-violet-600/90 text-white">
                  Event
                </span>
              )}
              {service.category_data?.recurrence?.enabled && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-sm bg-indigo-600/90 text-white">
                  <Repeat2 className="h-2.5 w-2.5" />
                  {service.category_data.recurrence.type}
                </span>
              )}
              {service.category_data?.age_restriction && (
                <span className="text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-sm bg-red-600/90 text-white">
                  {service.category_data.age_restriction}+
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 flex-1 flex flex-col">
            {/* Title */}
            <h3 className={`font-medium text-sm sm:text-base leading-snug line-clamp-2 mb-1.5 transition-colors ${
              isPast ? "text-gray-400" : "text-gray-900 group-hover:text-violet-700"
            }`}>
              {service.title || "Event"}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="text-xs font-medium text-gray-700 line-clamp-1">
                {service.location?.split(",")[0] || "Venue TBD"}
              </span>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
              {service.capacity && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users className="h-3.5 w-3.5" />
                  {service.capacity.toLocaleString()} capacity
                </span>
              )}
              {eventDate && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  {eventDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
              {eventTime && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="h-3.5 w-3.5" /> {eventTime}
                </span>
              )}
            </div>

            {/* Description */}
            {plainDescription && (
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                {plainDescription}
              </p>
            )}

            {/* Countdown */}
            {countdown && (
              <div className="rounded-xl overflow-hidden border border-brand-100 mb-3">
                <div className={`px-2.5 py-1 flex items-center gap-1.5 ${
                  countdown.urgent ? "bg-red-500" : "bg-brand-600"
                }`}>
                  <Timer className="h-2.5 w-2.5 text-white/80" />
                  <span className="text-[9px] font-medium uppercase tracking-widest text-white/80">
                    Starts in
                  </span>
                </div>
                <div className={`px-2.5 py-2 flex items-start justify-center gap-0.5 ${
                  countdown.urgent ? "bg-red-50" : "bg-brand-50"
                }`}>
                  {[
                    { label: "Days", val: countdown.days },
                    { label: "Hrs",  val: countdown.hours },
                    { label: "Min",  val: countdown.minutes },
                    { label: "Sec",  val: countdown.seconds },
                  ].map(({ label, val }, i) => (
                    <div key={label} className="flex items-start gap-0.5">
                      <div className="flex flex-col items-center min-w-[2rem]">
                        <div className={`w-full rounded-lg py-1 text-center bg-white border ${
                          countdown.urgent ? "border-red-100" : "border-brand-100"
                        }`}>
                          <span className={`text-sm font-medium tabular-nums leading-none tracking-tight ${
                            countdown.urgent ? "text-red-600" : "text-brand-700"
                          }`}>
                            {String(val).padStart(2, "0")}
                          </span>
                        </div>
                        <span className={`text-[8px] uppercase tracking-widest mt-1 font-medium ${
                          countdown.urgent ? "text-red-400" : "text-brand-400"
                        }`}>
                          {label}
                        </span>
                      </div>
                      {i < 3 && (
                        <span className={`text-sm font-medium leading-none mt-0.5 select-none ${
                          countdown.urgent ? "text-red-400" : "text-brand-500"
                        }`}>
                          :
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price + CTA */}
            <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-100">
              <div>
                <span className="text-base sm:text-xl font-medium text-gray-900">
                  {isPast ? "—" : price}
                </span>
                {!isPast && <span className="text-xs text-gray-400 ml-1">per ticket</span>}
              </div>
              {isPast ? (
                <span className="h-9 w-full sm:w-auto px-4 inline-flex items-center justify-center gap-1.5 text-sm font-medium bg-gray-100 text-gray-400 rounded-xl cursor-default">
                  Event Ended
                </span>
              ) : (
                <span className="h-9 w-full sm:w-auto px-4 inline-flex items-center justify-center gap-1.5 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors duration-150">
                  <Ticket className="h-3.5 w-3.5" />
                  Get Tickets
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
});

EventServiceCard.displayName = "EventServiceCard";
export default EventServiceCard;
