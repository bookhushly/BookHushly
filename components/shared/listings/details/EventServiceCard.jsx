import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  ShieldCheck,
  PartyPopper,
  Users,
  Calendar,
  Clock,
  Ticket,
  Heart,
  FileText,
  Info,
  Building2Icon,
  Building2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { extractCategoryData } from "@/lib/category-forms";

const getPublicImageUrl = (path) => {
  if (!path) return "/placeholder.jpg";
  const bucket = path.includes("food-images")
    ? "food-images"
    : "listing-images";
  const pathParts = path.split(`${bucket}/`);
  const filePath = pathParts.length > 1 ? pathParts[1] : path;
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data?.publicUrl || "/placeholder.jpg";
};

const formatEventPrice = (service) => {
  const price = Number(service.price);
  const priceUnit = service.price_unit || "fixed";

  if (isNaN(price)) return "Price not available";
  if (priceUnit === "negotiable") return "Negotiable";

  return `₦${price.toLocaleString()}`;
};

const EventServiceCard = React.memo(({ service, lastListingRef, isMobile }) => {
  console.log(service);
  const isEventCenter = service.event_type === "event_center";
  const isPremium = useMemo(
    () => Number(service.price) > 1000000,
    [service.price]
  );

  const serviceImage = useMemo(
    () =>
      service.media_urls &&
      Array.isArray(service.media_urls) &&
      service.media_urls.length > 0
        ? getPublicImageUrl(service.media_urls[0])
        : "/service-images/events/1.jpg",
    [service.media_urls]
  );

  const formattedPrice = useMemo(() => formatEventPrice(service), [service]);
  const categoryData = extractCategoryData(service);

  // Event organizer specific data
  const eventDate = service.event_date
    ? new Date(service.event_date)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const eventTime = useMemo(() => {
    const timeSource = service.event_date || service.created_at;
    if (!timeSource) return "TBD";

    const date = new Date(timeSource);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, [service.event_date, service.created_at]);

  const buttonText = isEventCenter ? "Book Venue" : "Get Tickets";
  const ButtonIcon = isEventCenter ? Building2 : Ticket;
  const priceLabel = isEventCenter ? "per event" : "per ticket";

  return (
    <div
      ref={lastListingRef}
      className="transform transition-opacity duration-300 "
    >
      <Link href={`/services/${service.id}`}>
        <Card className="group bg-white transition-all duration-300 border-0 rounded-2xl overflow-hidden flex flex-col shadow-md hover:shadow-xl h-[520px] w-full max-w-sm mx-auto">
          {/* Image Container */}
          <div className="relative h-56 overflow-hidden">
            <Image
              src={serviceImage || "/service-images/events/1.jpg"}
              alt={service.title || (isEventCenter ? "Event Venue" : "Event")}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out "
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={service.index < 4}
              loading={service.index < 4 ? "eager" : "lazy"}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Top badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {isPremium && (
                <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium px-3 py-1.5 text-xs rounded-full shadow-lg">
                  {isEventCenter ? "Premium" : "Featured"}
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 leading-6 text-xl">
              {service.title ||
                (isEventCenter ? "Untitled Event Venue" : "Untitled Event")}
            </h3>
            <div className="flex items-center mb-3">
              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600 line-clamp-1">
                {service.location?.split(",")[0] ||
                  (isEventCenter ? "Location TBD" : "Venue TBD")}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {service.capacity && (
                <div className="flex items-center text-sm text-gray-700">
                  <Users className="h-4 w-4 text-gray-400 mr-3" />
                  <span>{service.capacity.toLocaleString()} capacity</span>
                </div>
              )}

              {!isEventCenter && (
                <div className="flex items-center text-sm text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                  <span>
                    {eventDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}

              {!isEventCenter && (
                <div className="flex items-center text-sm text-gray-700">
                  <Clock className="h-4 w-4 text-gray-400 mr-3" />
                  <span>{eventTime}</span>
                </div>
              )}
            </div>

            {service.description && (
              <div className="flex items-start text-sm text-gray-700 mb-4">
                <Info className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600 ">{service.description}</p>
              </div>
            )}

            <div className="mt-auto pt-2 border-t border-gray-100 space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-gray-900">
                    {formattedPrice}
                  </span>
                  <span className="text-sm text-gray-500">{priceLabel}</span>
                </div>
              </div>

              <Button
                size="lg"
                className={` bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-3 font-semibold text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 w-full`}
                aria-label={buttonText}
              >
                <ButtonIcon className="h-4 w-4" />
                {buttonText}
              </Button>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
});

EventServiceCard.displayName = "EventServiceCard";

export default EventServiceCard;
