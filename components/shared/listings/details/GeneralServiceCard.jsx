// components/shared/services/general-service-card.jsx
import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Star,
  Building,
  Home,
  Utensils,
  Car,
  Truck,
  Shield,
  Users,
  Bed,
  Bath,
  ChefHat,
  Clock,
  Calendar,
  AlignLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { extractCategoryData } from "@/lib/category-forms";

const BUTTON_CONFIG = {
  hotels: { text: "Book Now" },
  serviced_apartments: { text: "Book Now" },
  food: { text: "Order Now" },
  logistics: { text: "Hire Now" },
  security: { text: "Hire Now" },
  car_rentals: { text: "Rent Now" },
  default: { text: "View Details" },
};

const PRICE_LABELS = {
  hotels: "/night",
  serviced_apartments: "/night",
  food: "/person",
  logistics: "/km",
  security: "/hr",
  car_rentals: "/day",
};

const getPublicImageUrl = (path) => {
  if (!path) return "/placeholder.jpg";
  const bucket = path.includes("food-images")
    ? "food-images"
    : "listing-images";
  const filePath = path.split(`${bucket}/`)[1] || path;
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data?.publicUrl || "/placeholder.jpg";
};

const formatPrice = (service) => {
  const price = Number(service.price);
  const unit = service.price_unit || "fixed";
  if (isNaN(price)) return "—";
  if (unit === "negotiable") return "Negotiable";
  const unitMap = {
    per_hour: "/hr",
    per_day: "/day",
    per_night: "/night",
    per_person: "/person",
    per_km: "/km",
    per_week: "/week",
    per_month: "/month",
  };
  return `₦${price.toLocaleString()}${unitMap[unit] || ""}`;
};

const getKeyFeatures = (service) => {
  const features = [];
  switch (service.category) {
    case "hotels":
      if (service.bedrooms)
        features.push({
          icon: <Bed className="h-3.5 w-3.5" />,
          label: `${service.bedrooms} Bed`,
        });
      if (service.bathrooms)
        features.push({
          icon: <Bath className="h-3.5 w-3.5" />,
          label: `${service.bathrooms} Bath`,
        });
      if (service.capacity)
        features.push({
          icon: <Users className="h-3.5 w-3.5" />,
          label: `${service.capacity} Guests`,
        });
      break;
    case "serviced_apartments":
      if (service.bedrooms)
        features.push({
          icon: <Bed className="h-3.5 w-3.5" />,
          label: `${service.bedrooms} Bed`,
        });
      if (service.minimum_stay)
        features.push({
          icon: <Calendar className="h-3.5 w-3.5" />,
          label: `Min ${service.minimum_stay}`,
        });
      if (service.capacity)
        features.push({
          icon: <Users className="h-3.5 w-3.5" />,
          label: `${service.capacity} Guests`,
        });
      break;
    case "food": {
      const d = extractCategoryData(service);
      if (d.cuisine_type)
        features.push({
          icon: <ChefHat className="h-3.5 w-3.5" />,
          label: d.cuisine_type,
        });
      if (d.service_type?.includes("delivery"))
        features.push({
          icon: <Truck className="h-3.5 w-3.5" />,
          label: "Delivery",
        });
      if (service.capacity)
        features.push({
          icon: <Users className="h-3.5 w-3.5" />,
          label: `${service.capacity} Seats`,
        });
      break;
    }
    case "car_rentals": {
      const d = extractCategoryData(service);
      if (d.vehicle_categories)
        features.push({
          icon: <Car className="h-3.5 w-3.5" />,
          label: d.vehicle_categories[0],
        });
      if (d.driver_service)
        features.push({
          icon: <Users className="h-3.5 w-3.5" />,
          label: d.driver_service === "both" ? "Self/Driver" : d.driver_service,
        });
      break;
    }
    case "logistics": {
      const d = extractCategoryData(service);
      if (d.service_types)
        features.push({
          icon: <Truck className="h-3.5 w-3.5" />,
          label: d.service_types[0],
        });
      if (d.delivery_time)
        features.push({
          icon: <Clock className="h-3.5 w-3.5" />,
          label: d.delivery_time[0],
        });
      break;
    }
    case "security": {
      const d = extractCategoryData(service);
      if (d.security_types)
        features.push({
          icon: <Shield className="h-3.5 w-3.5" />,
          label: d.security_types[0],
        });
      if (d.response_time)
        features.push({
          icon: <Clock className="h-3.5 w-3.5" />,
          label: d.response_time[0],
        });
      break;
    }
    default:
      if (service.capacity)
        features.push({
          icon: <Users className="h-3.5 w-3.5" />,
          label: `${service.capacity} Cap`,
        });
  }
  return features.slice(0, 3);
};

const GeneralServiceCard = React.memo(({ service, lastListingRef }) => {
  const image = useMemo(
    () =>
      service.media_urls?.[0]
        ? getPublicImageUrl(service.media_urls[0])
        : "/placeholder.jpg",
    [service.media_urls],
  );
  const price = useMemo(() => formatPrice(service), [service]);
  const priceLabel = PRICE_LABELS[service.category] || "";
  const btnText = (BUTTON_CONFIG[service.category] || BUTTON_CONFIG.default)
    .text;
  const features = useMemo(() => getKeyFeatures(service), [service]);

  return (
    <div
      ref={lastListingRef}
      className="transform transition-opacity duration-300 h-full"
    >
      <Link href={`/services/${service.id}`} className="block group h-full">
        <div className="h-full flex flex-row sm:flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
          {/* Image */}
          <div className="relative w-[110px] shrink-0 self-stretch sm:self-auto sm:w-auto sm:h-52 overflow-hidden bg-gray-100">
            <Image
              src={image}
              alt={service.title || "Service"}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 110px, (max-width: 1024px) 50vw, 33vw"
              priority={service.index < 4}
              loading={service.index < 4 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          </div>

          {/* Content */}
          <div className="p-2.5 sm:p-4 flex-1 flex flex-col min-w-0">
            {/* Title */}
            <h3 className="font-medium text-gray-900 text-[13px] sm:text-base leading-snug line-clamp-2 mb-1 group-hover:text-violet-700 transition-colors">
              {service.title || "Untitled Service"}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-1 mb-2">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 shrink-0" />
              <span className="text-[11px] sm:text-xs font-medium text-gray-700 truncate">
                {service.location?.split(",")[0] || "Location TBD"}
              </span>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                {features.slice(0, 2).map((f, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-500 bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg"
                  >
                    {f.icon} {f.label}
                  </span>
                ))}
                {features.slice(2).map((f, i) => (
                  <span
                    key={`extra-${i}`}
                    className="hidden sm:flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-1 rounded-lg"
                  >
                    {f.icon} {f.label}
                  </span>
                ))}
              </div>
            )}

            {/* Description — sm+ only */}
            {service.description && (
              <p className="hidden sm:block text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                {service.description}
              </p>
            )}

            {/* Price + CTA */}
            <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-100">
              {/* Mobile: price left, action right */}
              <div className="flex items-end justify-between sm:hidden">
                <div>
                  <span className="text-sm font-medium text-gray-900">{price}</span>
                  {priceLabel && (
                    <span className="text-[10px] text-gray-400 ml-0.5">{priceLabel}</span>
                  )}
                </div>
                <span className="h-7 px-3 inline-flex items-center text-[11px] font-medium bg-violet-600 text-white rounded-lg shrink-0">
                  {btnText}
                </span>
              </div>
              {/* sm+: stacked */}
              <div className="hidden sm:flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-xl font-medium text-gray-900">{price}</span>
                  {priceLabel && (
                    <span className="text-xs text-gray-400 ml-0.5">{priceLabel}</span>
                  )}
                </div>
                <span className="h-9 w-full sm:w-auto px-4 inline-flex items-center justify-center text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors duration-150">
                  {btnText}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
});

GeneralServiceCard.displayName = "GeneralServiceCard";
export default GeneralServiceCard;
