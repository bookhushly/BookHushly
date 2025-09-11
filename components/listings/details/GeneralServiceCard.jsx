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
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { extractCategoryData } from "@/lib/category-forms";

// Constants
const BUTTON_CONFIG = {
  hotels: { icon: Building, text: "Book Now" },
  serviced_apartments: { icon: Home, text: "Book Now" },
  food: { icon: Utensils, text: "Order Now" },
  logistics: { icon: Truck, text: "Hire Now" },
  security: { icon: Shield, text: "Hire Now" },
  car_rentals: { icon: Car, text: "Rent Now" },
  default: { icon: Star, text: "View Details" },
};

const CATEGORY_ICONS = {
  hotels: <Building className="h-4 w-4" />,
  serviced_apartments: <Home className="h-4 w-4" />,
  food: <Utensils className="h-4 w-4" />,
  logistics: <Truck className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  car_rentals: <Car className="h-4 w-4" />,
  default: <Star className="h-4 w-4" />,
};

const PRICE_LABELS = {
  hotels: "per night",
  serviced_apartments: "per night",
  food: "per person",
  logistics: "per km",
  security: "per hour",
  car_rentals: "per day",
  default: "starting from",
};

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

const formatPrice = (service) => {
  const price = Number(service.price);
  const price_unit = service.price_unit || "fixed";

  if (isNaN(price)) return "Price not available";
  if (price_unit === "fixed") return `₦${price.toLocaleString()}`;
  if (price_unit === "negotiable") return "Negotiable";

  const unitLabel =
    {
      per_hour: "/hr",
      per_day: "/day",
      per_night: "/night",
      per_person: "/person",
      per_km: "/km",
      per_week: "/week",
      per_month: "/month",
    }[price_unit] || "";

  return `₦${price.toLocaleString()}${unitLabel}`;
};

const getCategoryKeyFeatures = (service, isMobile) => {
  const maxFeatures = isMobile ? 2 : 3;
  const features = [];

  switch (service.category) {
    case "hotels":
      if (service.bedrooms)
        features.push({
          icon: <Bed className="h-3 w-3" />,
          label: `${service.bedrooms} Bed`,
        });
      if (service.bathrooms)
        features.push({
          icon: <Bath className="h-3 w-3" />,
          label: `${service.bathrooms} Bath`,
        });
      if (service.capacity)
        features.push({
          icon: <Users className="h-3 w-3" />,
          label: `${service.capacity} Guests`,
        });
      break;

    case "serviced_apartments":
      if (service.bedrooms)
        features.push({
          icon: <Bed className="h-3 w-3" />,
          label: `${service.bedrooms} Bed`,
        });
      if (service.minimum_stay)
        features.push({
          icon: <Calendar className="h-3 w-3" />,
          label: `Min ${service.minimum_stay}`,
        });
      if (service.capacity)
        features.push({
          icon: <Users className="h-3 w-3" />,
          label: `${service.capacity} Guests`,
        });
      break;

    case "food":
      const categoryData = extractCategoryData(service);
      if (categoryData.cuisine_type)
        features.push({
          icon: <ChefHat className="h-3 w-3" />,
          label: categoryData.cuisine_type,
        });
      if (
        categoryData.service_type &&
        categoryData.service_type.includes("delivery")
      ) {
        features.push({
          icon: <Truck className="h-3 w-3" />,
          label: "Delivery",
        });
      }
      if (service.capacity)
        features.push({
          icon: <Users className="h-3 w-3" />,
          label: `${service.capacity} Seats`,
        });
      break;

    case "car_rentals":
      const carData = extractCategoryData(service);
      if (carData.vehicle_categories)
        features.push({
          icon: <Car className="h-3 w-3" />,
          label: carData.vehicle_categories[0],
        });
      if (carData.driver_service)
        features.push({
          icon: <Users className="h-3 w-3" />,
          label:
            carData.driver_service === "both"
              ? "Self/Driver"
              : carData.driver_service,
        });
      break;

    case "logistics":
      const logisticsData = extractCategoryData(service);
      if (logisticsData.service_types)
        features.push({
          icon: <Truck className="h-3 w-3" />,
          label: logisticsData.service_types[0],
        });
      if (logisticsData.delivery_time)
        features.push({
          icon: <Clock className="h-3 w-3" />,
          label: logisticsData.delivery_time[0],
        });
      break;

    case "security":
      const securityData = extractCategoryData(service);
      if (securityData.security_types)
        features.push({
          icon: <Shield className="h-3 w-3" />,
          label: securityData.security_types[0],
        });
      if (securityData.response_time)
        features.push({
          icon: <Clock className="h-3 w-3" />,
          label: securityData.response_time[0],
        });
      break;

    default:
      if (service.capacity)
        features.push({
          icon: <Users className="h-3 w-3" />,
          label: `${service.capacity} Cap`,
        });
  }

  return features.slice(0, maxFeatures);
};

const getCategorySpecificInfo = (service) => {
  const category = service.category || "unknown";

  return {
    icon: CATEGORY_ICONS[category] || CATEGORY_ICONS.default,
    priceLabel: PRICE_LABELS[category] || PRICE_LABELS.default,
  };
};

const getButtonConfig = (category) =>
  BUTTON_CONFIG[category] || BUTTON_CONFIG.default;

const GeneralServiceCard = React.memo(
  ({ service, lastListingRef, isMobile }) => {
    const category = useMemo(() => {
      const categories = {
        hotels: { label: "Hotels", icon: <Building className="h-4 w-4" /> },
        serviced_apartments: {
          label: "Apartments",
          icon: <Home className="h-4 w-4" />,
        },
        food: { label: "Food", icon: <Utensils className="h-4 w-4" /> },
        logistics: { label: "Logistics", icon: <Truck className="h-4 w-4" /> },
        security: { label: "Security", icon: <Shield className="h-4 w-4" /> },
        car_rentals: {
          label: "Car Rentals",
          icon: <Car className="h-4 w-4" />,
        },
      };
      return (
        categories[service.category] || {
          label: service.category || "Unknown",
          icon: <Star className="h-4 w-4" />,
        }
      );
    }, [service.category]);

    const isPremium = useMemo(
      () => Number(service.price) > 100000,
      [service.price]
    );

    const serviceImage = useMemo(
      () =>
        service.media_urls &&
        Array.isArray(service.media_urls) &&
        service.media_urls.length > 0
          ? getPublicImageUrl(service.media_urls[0])
          : "/placeholder.jpg",
      [service.media_urls]
    );

    const categoryInfo = useMemo(
      () => getCategorySpecificInfo(service),
      [service]
    );
    const formattedPrice = useMemo(() => formatPrice(service), [service]);
    const buttonConfig = useMemo(
      () => getButtonConfig(service.category),
      [service.category]
    );
    const keyFeatures = useMemo(
      () => getCategoryKeyFeatures(service, isMobile),
      [service, isMobile]
    );

    const ButtonIcon = buttonConfig.icon;

    return (
      <div
        ref={lastListingRef}
        className="transform transition-opacity duration-300 opacity-0 group-[.is-visible]:opacity-100"
      >
        <Link href={`/services/${service.id}`}>
          <Card className="group bg-white transition-all duration-300 border-0 rounded-lg overflow-hidden flex flex-col h-full shadow-sm hover:shadow-xl">
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden">
              <Image
                src={serviceImage}
                alt={service.title || "Service"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={service.index < 4}
                loading={service.index < 4 ? "eager" : "lazy"}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Top badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {isPremium && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium px-2.5 py-1 text-xs rounded-md shadow-sm">
                    Premium
                  </Badge>
                )}
              </div>

              {/* Rating badge */}
              <div className="absolute top-3 right-3">
                <div className="bg-white/95 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium text-gray-800 flex items-center shadow-sm">
                  <Star className="h-3 w-3 text-orange-400 mr-1 fill-current" />
                  4.8
                </div>
              </div>

              {/* Heart icon for favorites */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-sm">
                  <svg
                    className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              {/* Category and Location */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {category.icon}
                  <span className="ml-1.5">{category.label}</span>
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="line-clamp-1 max-w-20">
                    {service.location?.split(",")[0] || "Unknown"}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-5 text-base">
                {service.title || "Untitled Service"}
              </h3>

              {/* Key Features */}
              <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
                {keyFeatures.slice(0, 2).map((feature, index) => (
                  <div key={index} className="flex items-center">
                    {feature.icon}
                    <span className="ml-1">{feature.label}</span>
                  </div>
                ))}
              </div>

              {/* Description (if available) */}
              {service.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                  {service.description}
                </p>
              )}

              {/* Pricing and CTA */}
              <div className="flex items-center justify-between mt-auto pt-2">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-900">
                    {formattedPrice}
                  </span>
                  <span className="text-xs text-gray-500">
                    {categoryInfo.priceLabel}
                  </span>
                </div>

                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-md px-4 py-2 font-medium text-sm transition-colors shadow-sm hover:shadow-md"
                  aria-label={buttonConfig.text}
                >
                  {buttonConfig.text}
                </Button>
              </div>

              {/* Verification badge */}
              <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center text-xs text-green-600 font-medium">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Verified Provider
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    );
  }
);

GeneralServiceCard.displayName = "GeneralServiceCard";

export default GeneralServiceCard;
