"use client";

import { useState, useEffect, useMemo } from "react";
import { SCATEGORIES } from "@/lib/constants";
import { extractCategoryData } from "@/lib/category-forms";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Star,
  Users,
  Clock,
  Bed,
  Bath,
  Calendar,
  Truck,
  Shield,
  Building,
  Car,
  Phone,
  Mail,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Home,
  PartyPopper,
  ChefHat,
  Package,
  X,
  Heart,
  Share,
  Maximize2,
  Play,
} from "lucide-react";

import CancellationPolicyDisplay from "@/components/listings/details/CancellationPolicyDisplay";
import { createClient } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFeatureIcon } from "@/lib/featureIcons";

// Enhanced category finder with fallback
const getCategory = (categoryValue) =>
  SCATEGORIES.find((cat) => cat.value === categoryValue) || {
    label: categoryValue || "Unknown",
    icon: <Building className="h-5 w-5" />,
    value: categoryValue,
  };

// Utility to normalize features to an array
const normalizeFeatures = (features) => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === "string")
    return features
      .split(/[\n,]/)
      .map((f) => f.trim())
      .filter((f) => f);
  return [];
};

const ImageGallery = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) return null;

  const navigateImage = (direction) => {
    if (direction === "next") {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const openFullscreen = (index) => {
    setCurrentIndex(index);
    setIsFullscreen(true);
  };

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden">
      {/* Hero image */}
      <div
        className="relative w-full h-full cursor-pointer group"
        onClick={() => openFullscreen(0)}
      >
        <Image
          src={images[0] || "/placeholder.jpg"}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          priority
          sizes="100vw"
        />

        {/* Overlay button */}
        <div className="absolute bottom-4 right-4">
          <button
            className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg shadow-md text-sm font-medium hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              openFullscreen(0);
            }}
          >
            View all {images.length} photos
          </button>
        </div>
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 bg-black/60 text-white rounded-full p-2 hover:bg-black/80"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-6 left-6 text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => navigateImage("prev")}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-3 hover:bg-black/80"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => navigateImage("next")}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-3 hover:bg-black/80"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Fullscreen image */}
          <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
            <Image
              src={images[currentIndex] || "/placeholder.jpg"}
              alt={`${title} ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
};
// Booking.com style popular facilities
const PopularFacilities = ({ amenities, features }) => {
  // Process amenities data
  let processedAmenities = [];

  if (amenities && Array.isArray(amenities) && amenities.length > 0) {
    processedAmenities = amenities
      .map((amenity) => {
        if (typeof amenity === "string") {
          return {
            value: amenity,
            label: amenity
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            icon: amenity,
          };
        } else if (amenity && typeof amenity === "object") {
          return {
            value: amenity.value || "",
            label:
              amenity.label ||
              amenity.value
                ?.replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()) ||
              "",
            icon: amenity.icon || amenity.value || "",
          };
        }
        return null;
      })
      .filter(Boolean);
  } else if (features && Array.isArray(features) && features.length > 0) {
    processedAmenities = features.map((feature) => ({
      value: feature,
      label: feature
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      icon: feature,
    }));
  }

  if (processedAmenities.length === 0) return null;

  // Show top 6 most important amenities
  const topAmenities = processedAmenities.slice(0, 6);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Most popular facilities
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {topAmenities.map((amenity, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-5 h-5 text-green-600 flex-shrink-0">
              {getFeatureIcon(amenity.icon, amenity.value)}
            </div>
            <span className="text-sm text-gray-700">{amenity.label}</span>
          </div>
        ))}
      </div>
      {processedAmenities.length > 6 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-blue-600 cursor-pointer hover:underline">
            Show all {processedAmenities.length} facilities
          </span>
        </div>
      )}
    </div>
  );
};

// Category-specific info display
const CategoryInfo = ({ service, categoryData, category }) => {
  const renderHotelInfo = () => (
    <div className="flex flex-wrap gap-6 text-sm text-gray-600">
      {service.bedrooms && (
        <div className="flex items-center">
          <Bed className="h-4 w-4 mr-2" />
          <span>
            {service.bedrooms} bedroom{service.bedrooms > 1 ? "s" : ""}
          </span>
        </div>
      )}
      {service.bathrooms && (
        <div className="flex items-center">
          <Bath className="h-4 w-4 mr-2" />
          <span>
            {service.bathrooms} bathroom{service.bathrooms > 1 ? "s" : ""}
          </span>
        </div>
      )}
      {service.capacity && (
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-2" />
          <span>{service.capacity} guests</span>
        </div>
      )}
      {service.minimum_stay && (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{service.minimum_stay.replace("_", " ")} min stay</span>
        </div>
      )}
    </div>
  );

  const renderRestaurantInfo = () => (
    <div className="flex flex-wrap gap-6 text-sm text-gray-600">
      {categoryData.cuisine_type && (
        <div className="flex items-center">
          <ChefHat className="h-4 w-4 mr-2" />
          <span className="capitalize">
            {categoryData.cuisine_type.replace("_", " ")}
          </span>
        </div>
      )}
      {service.capacity && (
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-2" />
          <span>{service.capacity} seats</span>
        </div>
      )}
      {service.operating_hours && (
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          <span>{service.operating_hours}</span>
        </div>
      )}
    </div>
  );

  const renderEventInfo = () => (
    <div className="flex flex-wrap gap-6 text-sm text-gray-600">
      {service.event_type && (
        <div className="flex items-center">
          <PartyPopper className="h-4 w-4 mr-2" />
          <span className="capitalize">
            {service.event_type.replace("_", " ")}
          </span>
        </div>
      )}
      {service.capacity && (
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-2" />
          <span>{service.capacity} capacity</span>
        </div>
      )}
      {service.remaining_tickets && (
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 mr-2" />
          <span>{service.remaining_tickets} tickets left</span>
        </div>
      )}
    </div>
  );

  const renderLogisticsInfo = () => (
    <div className="flex flex-wrap gap-6 text-sm text-gray-600">
      {service.vehicle_type && (
        <div className="flex items-center">
          <Truck className="h-4 w-4 mr-2" />
          <span className="capitalize">
            {service.vehicle_type.replace("_", " ")}
          </span>
        </div>
      )}
      {categoryData.weight_limit && (
        <div className="flex items-center">
          <Package className="h-4 w-4 mr-2" />
          <span>{categoryData.weight_limit} weight limit</span>
        </div>
      )}
      {categoryData.delivery_time && (
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          <span>{categoryData.delivery_time}</span>
        </div>
      )}
    </div>
  );

  const renderSecurityInfo = () => (
    <div className="flex flex-wrap gap-6 text-sm text-gray-600">
      {categoryData.team_size && (
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-2" />
          <span>{categoryData.team_size} team size</span>
        </div>
      )}
      {categoryData.experience_years && (
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          <span>{categoryData.experience_years} years exp</span>
        </div>
      )}
      {categoryData.response_time && (
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          <span>{categoryData.response_time}</span>
        </div>
      )}
    </div>
  );

  const renderCarRentalInfo = () => (
    <div className="flex flex-wrap gap-6 text-sm text-gray-600">
      {service.vehicle_type && (
        <div className="flex items-center">
          <Car className="h-4 w-4 mr-2" />
          <span className="capitalize">
            {service.vehicle_type.replace("_", " ")}
          </span>
        </div>
      )}
      {service.minimum_stay && (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{service.minimum_stay} min rental</span>
        </div>
      )}
      {service.security_deposit && (
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          <span>₦{service.security_deposit.toLocaleString()} deposit</span>
        </div>
      )}
    </div>
  );

  switch (category.value) {
    case "hotels":
    case "serviced_apartments":
      return renderHotelInfo();
    case "food":
      return renderRestaurantInfo();
    case "events":
      return renderEventInfo();
    case "logistics":
      return renderLogisticsInfo();
    case "security":
      return renderSecurityInfo();
    case "car_rentals":
      return renderCarRentalInfo();
    default:
      return null;
  }
};

export default function ServiceDetailClient({ service }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [similarServices, setSimilarServices] = useState([]);
  const [isZoomed, setIsZoomed] = useState(false);
  console.log("Service data:", service);

  const category = useMemo(
    () => getCategory(service.category),
    [service.category]
  );
  const categoryData = useMemo(() => extractCategoryData(service), [service]);

  // Fetch similar services
  useEffect(() => {
    const fetchSimilar = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("category", service.category)
        .neq("id", service.id)
        .eq("active", true)
        .limit(4)
        .order("price", { ascending: true });
      setSimilarServices(data || []);
    };
    fetchSimilar();
  }, [service.category, service.id]);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setIsZoomed(true);
  };

  const formatPriceUnit = (unit) => {
    const units = {
      per_hour: "per hour",
      per_day: "per day",
      per_night: "per night",
      per_person: "per person",
      per_km: "per km",
      per_event: "per event",
      per_week: "per week",
      per_month: "per month",
      negotiable: "negotiable",
      fixed: "",
    };
    return units[unit] || "";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <span>/</span>
            <Link href="/services" className="hover:text-blue-600">
              Services
            </Link>
            <span>/</span>
            <Link
              href={`/services?category=${category?.value}`}
              className="hover:text-blue-600"
            >
              {category?.label}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{service.title}</span>
          </div>
        </nav>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Header Section */}
          <div className="p-6 pb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className="text-blue-600 border-blue-200 bg-blue-50"
                  >
                    {category?.label}
                  </Badge>
                  {service.active && (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200 bg-green-50"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {service.title}
                </h1>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {service.location}
                </div>
                <CategoryInfo
                  service={service}
                  categoryData={categoryData}
                  category={category}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="px-6 pb-6">
            <ImageGallery
              images={service.media_urls}
              title={service.title}
              onImageClick={handleImageClick}
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                About this property
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {service.description}
              </p>
            </div>

            {/* Popular Facilities */}
            <PopularFacilities
              amenities={service.amenities}
              features={service.features}
            />

            {/* Menu Items for Food Category */}
            {service.category === "food" && service.category_data?.meals && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Menu Items
                </h2>
                <div className="grid gap-4">
                  {service.category_data.meals.map((meal, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {meal.image_url && (
                        <div className="flex-shrink-0">
                          <img
                            src={meal.image_url}
                            alt={meal.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {meal.name}
                        </h4>
                        <p className="text-lg font-bold text-blue-600">
                          ₦{meal.price?.toLocaleString()}
                        </p>
                        {meal.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {meal.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ticket Packages for Events */}
            {service.category === "events" &&
              service.ticket_packages &&
              service.ticket_packages.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Available Ticket Packages
                  </h2>
                  <div className="grid gap-4">
                    {service.ticket_packages.map((ticket, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {ticket.name}
                            </h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-lg font-bold text-blue-600">
                                ₦{ticket.price?.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-600">
                                {ticket.remaining} of {ticket.total} available
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant={
                              ticket.remaining > 0 ? "default" : "secondary"
                            }
                            className={`text-xs ${ticket.remaining > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {ticket.remaining > 0 ? "Available" : "Sold Out"}
                          </Badge>
                        </div>
                        {ticket.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {ticket.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Additional Information */}
            {(service.requirements ||
              service.service_areas ||
              service.operating_hours ||
              service.cancellation_policy) && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Additional Information
                </h2>
                <div className="space-y-6">
                  {/* Requirements */}
                  {service.requirements &&
                    normalizeFeatures(service.requirements).length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Requirements
                        </h3>
                        <div className="space-y-2">
                          {normalizeFeatures(service.requirements).map(
                            (req, index) => (
                              <div
                                key={index}
                                className="flex items-start space-x-3"
                              >
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                </div>
                                <span className="text-sm text-gray-700">
                                  {req}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Service Areas */}
                  {service.service_areas && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Service Coverage
                      </h3>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          {service.service_areas}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Operating Hours */}
                  {service.operating_hours && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Operating Hours
                      </h3>
                      <div className="flex items-start space-x-2">
                        <Clock className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          {service.operating_hours}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Cancellation Policy */}
                  {service.cancellation_policy && (
                    <CancellationPolicyDisplay
                      cancellationPolicy={service.cancellation_policy}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Vendor Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Service Provider
              </h2>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  {service.vendor_name?.charAt(0) || "S"}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {service.vendor_name || "Service Provider"}
                  </h4>
                  {service.vendor_phone && (
                    <p className="text-sm text-gray-600">
                      {service.vendor_phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <div className="mb-6">
                <div className="flex items-baseline mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₦{service.price.toLocaleString()}
                  </span>
                  {formatPriceUnit(service.price_unit) && (
                    <span className="text-sm text-gray-600 ml-2">
                      {formatPriceUnit(service.price_unit)}
                    </span>
                  )}
                </div>
                {service.availability !== "available" && (
                  <Badge
                    variant="outline"
                    className="text-red-600 border-red-200"
                  >
                    {service.availability}
                  </Badge>
                )}
              </div>

              <Button
                asChild={service.availability === "available"}
                disabled={service.availability !== "available"}
                className={`w-full mb-4 h-12 text-base font-semibold ${
                  service.availability === "available"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {service.availability === "available" ? (
                  <Link
                    href={`/book/${service.id}`}
                    className="flex items-center justify-center"
                  >
                    Reserve now
                  </Link>
                ) : (
                  <span>Unavailable</span>
                )}
              </Button>

              {service.security_deposit && (
                <div className="border-t border-gray-200 pt-4 mt-4 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Security deposit</span>
                    <span>₦{service.security_deposit.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="w-4 h-4 mr-1" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Zoom Modal */}
        {isZoomed && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <Image
              src={
                service.media_urls?.[selectedImageIndex] || "/placeholder.jpg"
              }
              alt={service.title}
              className="max-w-full max-h-full object-contain"
              width={1200}
              height={800}
            />
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 text-white p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
