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
  Utensils,
  Calendar,
  Truck,
  Shield,
  Building,
  Wifi,
  Car,
  Phone,
  Mail,
  CheckCircle,
  MapIcon,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ExternalLink,
  Home,
  PartyPopper,
  AirVent,
  ParkingCircle,
  Waves,
  Dumbbell,
  Bell,
  WashingMachine,
  ChefHat,
  Package,
  Globe,
  FastForward,
  Fish,
  Leaf,
  HeartPulse,
  CreditCard,
  UserCheck,
  AlertTriangle,
  Radio,
  Video,
  Camera,
  Drone,
  Fuel,
  Settings,
  ArrowUpDown,
  Microwave,
  Refrigerator,
  CookingPot,
  BatteryCharging,
  Store,
  Briefcase,
  Music,
  Palette,
  Lightbulb,
  Speaker,
  Theater,
  Projector,
  Search,
  Footprints,
  Siren,
  Flame,
  IdCard,
  Bus,
  Plane,
  Brush,
  ShoppingCart,
  Wrench,
  Moon,
  Sofa,
  X,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

// Enhanced icon mapping for features
const getFeatureIcon = (feature) => {
  const featureLower = feature.toLowerCase();

  // WiFi and connectivity
  if (featureLower.includes("wifi") || featureLower.includes("internet"))
    return <Wifi className="h-4 w-4 text-blue-600" />;

  // Parking
  if (featureLower.includes("parking"))
    return <ParkingCircle className="h-4 w-4 text-gray-600" />;

  // Air conditioning
  if (
    featureLower.includes("ac") ||
    featureLower.includes("air condition") ||
    featureLower.includes("cooling")
  )
    return <AirVent className="h-4 w-4 text-blue-500" />;

  // Power backup
  if (
    featureLower.includes("power") ||
    featureLower.includes("generator") ||
    featureLower.includes("backup")
  )
    return <BatteryCharging className="h-4 w-4 text-yellow-600" />;

  // Pool/Swimming
  if (featureLower.includes("pool") || featureLower.includes("swimming"))
    return <Waves className="h-4 w-4 text-blue-400" />;

  // Gym/Fitness
  if (featureLower.includes("gym") || featureLower.includes("fitness"))
    return <Dumbbell className="h-4 w-4 text-red-600" />;

  // Restaurant/Food
  if (
    featureLower.includes("restaurant") ||
    featureLower.includes("dining") ||
    featureLower.includes("food")
  )
    return <Utensils className="h-4 w-4 text-orange-600" />;

  // Room service/Concierge
  if (featureLower.includes("service") || featureLower.includes("concierge"))
    return <Bell className="h-4 w-4 text-purple-600" />;

  // Laundry
  if (featureLower.includes("laundry") || featureLower.includes("washing"))
    return <WashingMachine className="h-4 w-4 text-blue-600" />;

  // Security
  if (featureLower.includes("security") || featureLower.includes("guard"))
    return <Shield className="h-4 w-4 text-green-600" />;

  // Kitchen appliances
  if (featureLower.includes("microwave"))
    return <Microwave className="h-4 w-4 text-yellow-600" />;
  if (featureLower.includes("refrigerator") || featureLower.includes("fridge"))
    return <Refrigerator className="h-4 w-4 text-blue-600" />;
  if (featureLower.includes("kitchen") || featureLower.includes("cooking"))
    return <CookingPot className="h-4 w-4 text-orange-600" />;

  // Default
  return <CheckCircle className="h-4 w-4 text-green-600" />;
};

// Category-specific detail renderers with enhanced styling
const CategoryDetailsRenderer = ({ service, categoryData, category }) => {
  switch (category.value) {
    case "hotels":
    case "serviced_apartments":
      return (
        <HotelDetails
          service={service}
          categoryData={categoryData}
          category={category}
        />
      );
    case "food":
      return (
        <RestaurantDetails service={service} categoryData={categoryData} />
      );
    case "events":
      return <EventDetails service={service} categoryData={categoryData} />;
    case "logistics":
      return <LogisticsDetails service={service} categoryData={categoryData} />;
    case "security":
      return <SecurityDetails service={service} categoryData={categoryData} />;
    case "car_rentals":
      return <CarRentalDetails service={service} categoryData={categoryData} />;
    default:
      return <GenericDetails service={service} categoryData={categoryData} />;
  }
};

// Enhanced Hotels & Serviced Apartments Details
const HotelDetails = ({ service, categoryData, category }) => (
  <div className="space-y-8">
    {/* Property Overview */}
    <Card className="border-purple-100">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
          {category.value === "hotels" ? (
            <Building className="w-6 h-6 mr-3 text-purple-600" />
          ) : (
            <Home className="w-6 h-6 mr-3 text-purple-600" />
          )}
          Property Details
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {service.bedrooms && (
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Bed className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {service.bedrooms}
              </div>
              <div className="text-sm text-gray-600">
                Bedroom{service.bedrooms > 1 ? "s" : ""}
              </div>
            </div>
          )}

          {service.bathrooms && (
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Bath className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {service.bathrooms}
              </div>
              <div className="text-sm text-gray-600">
                Bathroom{service.bathrooms > 1 ? "s" : ""}
              </div>
            </div>
          )}

          {service.capacity && (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {service.capacity}
              </div>
              <div className="text-sm text-gray-600">
                Guest{service.capacity > 1 ? "s" : ""}
              </div>
            </div>
          )}

          {service.minimum_stay && (
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">
                {service.minimum_stay.replace("_", " ")}
              </div>
              <div className="text-sm text-gray-600">Min Stay</div>
            </div>
          )}
        </div>

        {categoryData.room_type && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Home className="w-5 h-5 text-purple-600 mr-2" />
              <span className="font-medium text-gray-900">Room Type: </span>
              <span className="ml-2 capitalize">
                {categoryData.room_type.replace("_", " ")}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Check-in/Check-out */}
    {(service.check_in_time || service.check_out_time) && (
      <Card className="border-green-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
            <Clock className="w-6 h-6 mr-3 text-green-600" />
            Check-in & Check-out Times
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {service.check_in_time && (
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Check-in</div>
                  <div className="text-lg text-green-700">
                    {service.check_in_time}
                  </div>
                </div>
              </div>
            )}
            {service.check_out_time && (
              <div className="flex items-center p-4 bg-red-50 rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Check-out</div>
                  <div className="text-lg text-red-700">
                    {service.check_out_time}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Amenities */}
    {service.features && normalizeFeatures(service.features).length > 0 && (
      <Card className="border-blue-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
            <Wifi className="w-6 h-6 mr-3 text-blue-600" />
            Amenities & Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {normalizeFeatures(service.features).map((amenity, index) => (
              <div
                key={index}
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {getFeatureIcon(amenity)}
                <span className="ml-3 text-gray-700 font-medium">
                  {amenity.trim()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

// Enhanced Restaurant Details
const RestaurantDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    {/* Restaurant Overview */}
    <Card className="border-orange-100">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
          <Utensils className="w-6 h-6 mr-3 text-orange-600" />
          Restaurant Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryData.cuisine_type && (
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <ChefHat className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Cuisine Type</div>
              <div className="text-orange-700 capitalize">
                {categoryData.cuisine_type.replace("_", " ")}
              </div>
            </div>
          )}

          {service.capacity && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">
                Seating Capacity
              </div>
              <div className="text-blue-700">{service.capacity} seats</div>
            </div>
          )}

          {service.operating_hours && (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Operating Hours</div>
              <div className="text-green-700">{service.operating_hours}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Service Types */}
    {categoryData.service_type && (
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
            <Package className="w-6 h-6 mr-3 text-purple-600" />
            Available Services
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(Array.isArray(categoryData.service_type)
              ? categoryData.service_type
              : [categoryData.service_type]
            ).map((type, index) => {
              const getServiceIcon = (serviceType) => {
                if (serviceType.includes("dine"))
                  return <Utensils className="w-5 h-5" />;
                if (serviceType.includes("takeaway"))
                  return <Package className="w-5 h-5" />;
                if (serviceType.includes("delivery"))
                  return <Truck className="w-5 h-5" />;
                if (serviceType.includes("catering"))
                  return <ChefHat className="w-5 h-5" />;
                if (serviceType.includes("buffet"))
                  return <Utensils className="w-5 h-5" />;
                return <Utensils className="w-5 h-5" />;
              };

              return (
                <div
                  key={index}
                  className="text-center p-4 bg-purple-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-600">
                    {getServiceIcon(type)}
                  </div>
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {type.replace("_", " ")}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Special Diets */}
    {categoryData.special_diets && (
      <Card className="border-green-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
            <Leaf className="w-6 h-6 mr-3 text-green-600" />
            Dietary Options
          </h3>
          <div className="flex flex-wrap gap-3">
            {(Array.isArray(categoryData.special_diets)
              ? categoryData.special_diets
              : [categoryData.special_diets]
            ).map((diet, index) => {
              const getDietIcon = (dietType) => {
                if (dietType.includes("halal"))
                  return <Moon className="w-4 h-4" />;
                if (dietType.includes("vegetarian"))
                  return <Leaf className="w-4 h-4" />;
                if (dietType.includes("vegan"))
                  return <Leaf className="w-4 h-4" />;
                if (dietType.includes("gluten"))
                  return <Shield className="w-4 h-4" />;
                if (dietType.includes("diabetic"))
                  return <HeartPulse className="w-4 h-4" />;
                return <CheckCircle className="w-4 h-4" />;
              };

              return (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 px-3 py-2"
                >
                  {getDietIcon(diet)}
                  <span className="ml-2 capitalize">
                    {diet.replace("_", " ")}
                  </span>
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Menu Display */}
    {(categoryData.meals?.length > 0 || categoryData.menu_url) && (
      <Card className="border-yellow-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
            <Utensils className="w-6 h-6 mr-3 text-yellow-600" />
            Menu
          </h3>
          {categoryData.meals?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Dish Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Description
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      Price (₦)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.meals.map((meal, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {meal.name}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {meal.description || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        ₦{Number(meal.price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {categoryData.menu_url && (
            <div className="mt-6">
              <Button
                asChild
                variant="outline"
                className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
              >
                <a
                  href={categoryData.menu_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Menu
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )}
  </div>
);

// Enhanced Event Details
const EventDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    {/* Event Overview */}
    <Card className="border-pink-100">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
          <PartyPopper className="w-6 h-6 mr-3 text-pink-600" />
          Event Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {service.event_type && (
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <Calendar className="w-8 h-8 text-pink-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Event Type</div>
              <div className="text-pink-700 capitalize">
                {service.event_type.replace("_", " ")}
              </div>
            </div>
          )}

          {service.capacity && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Max Capacity</div>
              <div className="text-blue-700">{service.capacity} guests</div>
            </div>
          )}

          {service.remaining_tickets &&
            service.event_type === "event_organizer" && (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-gray-900">
                  Tickets Available
                </div>
                <div className="text-green-700">
                  {service.remaining_tickets}
                </div>
              </div>
            )}
        </div>
      </CardContent>
    </Card>

    {/* Event Types Supported */}
    {categoryData.event_types && (
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-purple-600" />
            Event Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(Array.isArray(categoryData.event_types)
              ? categoryData.event_types
              : [categoryData.event_types]
            ).map((type, index) => {
              const getEventIcon = (eventType) => {
                if (eventType.includes("wedding"))
                  return <PartyPopper className="w-5 h-5" />;
                if (eventType.includes("concert"))
                  return <Music className="w-5 h-5" />;
                if (eventType.includes("conference"))
                  return <Briefcase className="w-5 h-5" />;
                if (eventType.includes("birthday"))
                  return <PartyPopper className="w-5 h-5" />;
                if (eventType.includes("corporate"))
                  return <Building className="w-5 h-5" />;
                return <Calendar className="w-5 h-5" />;
              };

              return (
                <div
                  key={index}
                  className="text-center p-4 bg-purple-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-600">
                    {getEventIcon(type)}
                  </div>
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {type.replace("_", " ")}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Services Included */}
    {categoryData.services_included && (
      <Card className="border-green-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
            <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
            Included Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Array.isArray(categoryData.services_included)
              ? categoryData.services_included
              : [categoryData.services_included]
            ).map((service, index) => {
              const getServiceIcon = (serviceType) => {
                if (serviceType.includes("catering"))
                  return <ChefHat className="w-4 h-4" />;
                if (serviceType.includes("photography"))
                  return <Camera className="w-4 h-4" />;
                if (serviceType.includes("music") || serviceType.includes("dj"))
                  return <Music className="w-4 h-4" />;
                if (serviceType.includes("decoration"))
                  return <Palette className="w-4 h-4" />;
                if (serviceType.includes("security"))
                  return <Shield className="w-4 h-4" />;
                if (serviceType.includes("ushers"))
                  return <UserCheck className="w-4 h-4" />;
                return <CheckCircle className="w-4 h-4" />;
              };

              return (
                <div
                  key={index}
                  className="flex items-center p-3 bg-green-50 rounded-lg"
                >
                  <div className="text-green-600 mr-3">
                    {getServiceIcon(service)}
                  </div>
                  <span className="text-gray-700 font-medium capitalize">
                    {service.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

// Enhanced Logistics Details
const LogisticsDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    {/* Logistics Overview */}
    <Card className="border-blue-100">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
          <Truck className="w-6 h-6 mr-3 text-blue-600" />
          Logistics Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryData.weight_limit && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Weight Limit</div>
              <div className="text-blue-700">{categoryData.weight_limit}</div>
            </div>
          )}

          {categoryData.delivery_time && (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Delivery Time</div>
              <div className="text-green-700">{categoryData.delivery_time}</div>
            </div>
          )}

          {categoryData.tracking_available && (
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <MapIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Tracking</div>
              <div className="text-purple-700 capitalize">
                {categoryData.tracking_available}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Service Types */}
    {categoryData.service_types && (
      <Card className="border-orange-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
            <Package className="w-6 h-6 mr-3 text-orange-600" />
            Available Services
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(Array.isArray(categoryData.service_types)
              ? categoryData.service_types
              : [categoryData.service_types]
            ).map((type, index) => {
              const getLogisticsIcon = (serviceType) => {
                if (serviceType.includes("same_day"))
                  return <FastForward className="w-5 h-5" />;
                if (serviceType.includes("express"))
                  return <FastForward className="w-5 h-5" />;
                if (serviceType.includes("moving"))
                  return <Home className="w-5 h-5" />;
                if (serviceType.includes("freight"))
                  return <Truck className="w-5 h-5" />;
                if (serviceType.includes("warehousing"))
                  return <Package className="w-5 h-5" />;
                return <Truck className="w-5 h-5" />;
              };

              return (
                <div
                  key={index}
                  className="text-center p-4 bg-orange-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2 text-orange-600">
                    {getLogisticsIcon(type)}
                  </div>
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {type.replace("_", " ")}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Vehicle Types */}
    {categoryData.vehicle_types && (
      <Card className="border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
            <Car className="w-6 h-6 mr-3 text-gray-600" />
            Available Vehicles
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Array.isArray(categoryData.vehicle_types)
              ? categoryData.vehicle_types
              : [categoryData.vehicle_types]
            ).map((type, index) => {
              const getVehicleIcon = (vehicleType) => {
                if (vehicleType.includes("motorcycle"))
                  return <Car className="w-5 h-5" />;
                if (vehicleType.includes("car"))
                  return <Car className="w-5 h-5" />;
                if (vehicleType.includes("van"))
                  return <Bus className="w-5 h-5" />;
                if (vehicleType.includes("truck"))
                  return <Truck className="w-5 h-5" />;
                return <Car className="w-5 h-5" />;
              };

              return (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="text-gray-600 mr-3">
                    {getVehicleIcon(type)}
                  </div>
                  <span className="text-gray-700 font-medium capitalize">
                    {type.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Insurance Coverage */}
    {categoryData.insurance_covered && (
      <Card className="border-green-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-3 text-green-600" />
            Insurance Coverage
          </h3>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <div className="font-semibold text-gray-900">Coverage Type</div>
                <div className="text-green-700 capitalize">
                  {categoryData.insurance_covered.replace("_", " ")}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

// Enhanced Security Details
const SecurityDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    {/* Security Overview */}
    <Card className="border-red-100">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
          <Shield className="w-6 h-6 mr-3 text-red-600" />
          Security Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryData.team_size && (
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Users className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Team Size</div>
              <div className="text-red-700">{categoryData.team_size}</div>
            </div>
          )}

          {categoryData.experience_years && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Experience</div>
              <div className="text-blue-700">
                {categoryData.experience_years} years
              </div>
            </div>
          )}

          {categoryData.response_time && (
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Siren className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Response Time</div>
              <div className="text-orange-700">
                {categoryData.response_time}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Security Services */}
    {categoryData.security_types && (
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-3 text-purple-600" />
            Security Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(categoryData.security_types)
              ? categoryData.security_types
              : [categoryData.security_types]
            ).map((type, index) => {
              const getSecurityIcon = (securityType) => {
                if (securityType.includes("event"))
                  return <PartyPopper className="w-4 h-4" />;
                if (securityType.includes("personal"))
                  return <UserCheck className="w-4 h-4" />;
                if (securityType.includes("corporate"))
                  return <Building className="w-4 h-4" />;
                if (securityType.includes("residential"))
                  return <Home className="w-4 h-4" />;
                if (securityType.includes("patrol"))
                  return <Footprints className="w-4 h-4" />;
                if (securityType.includes("investigation"))
                  return <Search className="w-4 h-4" />;
                return <Shield className="w-4 h-4" />;
              };

              return (
                <div
                  key={index}
                  className="flex items-center p-3 bg-purple-50 rounded-lg"
                >
                  <div className="text-purple-600 mr-3">
                    {getSecurityIcon(type)}
                  </div>
                  <span className="text-gray-700 font-medium capitalize">
                    {type.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Certifications */}
    {categoryData.certifications && (
      <Card className="border-green-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
            <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
            Certifications & Licenses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Array.isArray(categoryData.certifications)
              ? categoryData.certifications
              : [categoryData.certifications]
            ).map((cert, index) => {
              const getCertIcon = (certType) => {
                if (certType.includes("first_aid"))
                  return <HeartPulse className="w-4 h-4" />;
                if (certType.includes("fire_safety"))
                  return <Flame className="w-4 h-4" />;
                if (certType.includes("license"))
                  return <IdCard className="w-4 h-4" />;
                return <CheckCircle className="w-4 h-4" />;
              };

              return (
                <div
                  key={index}
                  className="flex items-center p-3 bg-green-50 rounded-lg"
                >
                  <div className="text-green-600 mr-3">{getCertIcon(cert)}</div>
                  <span className="text-gray-700 font-medium uppercase">
                    {cert.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Equipment */}
    {categoryData.equipment && (
      <Card className="border-indigo-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
            <Package className="w-6 h-6 mr-3 text-indigo-600" />
            Equipment & Technology
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(categoryData.equipment)
              ? categoryData.equipment
              : [categoryData.equipment]
            ).map((equip, index) => {
              const getEquipmentIcon = (equipType) => {
                if (equipType.includes("cctv"))
                  return <Video className="w-4 h-4" />;
                if (equipType.includes("metal_detector"))
                  return <AlertTriangle className="w-4 h-4" />;
                if (equipType.includes("walkie_talkie"))
                  return <Radio className="w-4 h-4" />;
                if (equipType.includes("camera"))
                  return <Camera className="w-4 h-4" />;
                if (equipType.includes("drone"))
                  return <Drone className="w-4 h-4" />;
                return <Package className="w-4 h-4" />;
              };

              return (
                <div
                  key={index}
                  className="flex items-center p-3 bg-indigo-50 rounded-lg"
                >
                  <div className="text-indigo-600 mr-3">
                    {getEquipmentIcon(equip)}
                  </div>
                  <span className="text-gray-700 font-medium capitalize">
                    {equip.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

// Enhanced Car Rental Details
const CarRentalDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    {/* Vehicle Overview */}
    <Card className="border-blue-100">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
          <Car className="w-6 h-6 mr-3 text-blue-600" />
          Vehicle Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryData.vehicle_categories && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Car className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">
                Vehicle Category
              </div>
              <div className="text-blue-700 capitalize">
                {categoryData.vehicle_categories[0]?.replace("_", " ")}
              </div>
            </div>
          )}

          {categoryData.driver_service && (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Driver Service</div>
              <div className="text-green-700 capitalize">
                {categoryData.driver_service.replace("_", " ")}
              </div>
            </div>
          )}

          {categoryData.transmission_types && (
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Settings className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Transmission</div>
              <div className="text-purple-700 capitalize">
                {categoryData.transmission_types[0]}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Vehicle Categories */}
    {categoryData.vehicle_categories && (
      <Card className="border-indigo-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
            <Car className="w-6 h-6 mr-3 text-indigo-600" />
            Available Vehicle Types
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categoryData.vehicle_categories.map((category, index) => {
              const getCategoryIcon = (catType) => {
                if (catType.includes("economy"))
                  return <Car className="w-5 h-5" />;
                if (catType.includes("luxury"))
                  return <Star className="w-5 h-5" />;
                if (catType.includes("suv"))
                  return <Truck className="w-5 h-5" />;
                if (catType.includes("minivan"))
                  return <Bus className="w-5 h-5" />;
                return <Car className="w-5 h-5" />;
              };

              return (
                <div
                  key={index}
                  className="text-center p-4 bg-indigo-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2 text-indigo-600">
                    {getCategoryIcon(category)}
                  </div>
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {category.replace("_", " ")}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Rental Terms */}
    <Card className="border-orange-100">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
          <CreditCard className="w-6 h-6 mr-3 text-orange-600" />
          Rental Terms
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {service.minimum_stay && (
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-orange-600 mr-2" />
                <span className="font-semibold text-gray-900">
                  Minimum Rental Period
                </span>
              </div>
              <div className="text-orange-700">{service.minimum_stay}</div>
            </div>
          )}

          {service.security_deposit && (
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center mb-2">
                <CreditCard className="w-5 h-5 text-red-600 mr-2" />
                <span className="font-semibold text-gray-900">
                  Security Deposit
                </span>
              </div>
              <div className="text-red-700">
                ₦{service.security_deposit.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Vehicle Features */}
    {service.features && normalizeFeatures(service.features).length > 0 && (
      <Card className="border-green-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
            <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
            Vehicle Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {normalizeFeatures(service.features).map((feature, index) => (
              <div
                key={index}
                className="flex items-center p-3 bg-green-50 rounded-lg"
              >
                {getFeatureIcon(feature)}
                <span className="ml-3 text-gray-700 font-medium">
                  {feature.trim()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

// Generic details fallback with enhanced styling
const GenericDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    {service.features && normalizeFeatures(service.features).length > 0 && (
      <Card className="border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
            <CheckCircle className="w-6 h-6 mr-3 text-gray-600" />
            Features & Amenities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {normalizeFeatures(service.features).map((feature, index) => (
              <div
                key={index}
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {getFeatureIcon(feature)}
                <span className="ml-3 text-gray-700 font-medium">
                  {feature.trim()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

export default function ServiceDetailClient({ service }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [similarServices, setSimilarServices] = useState([]);
  const [isZoomed, setIsZoomed] = useState(false);

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

  const handlePrev = () => {
    setSelectedImageIndex((prev) =>
      prev > 0 ? prev - 1 : (service.media_urls?.length || 1) - 1
    );
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) =>
      prev < (service.media_urls?.length || 1) - 1 ? prev + 1 : 0
    );
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
      fixed: "fixed price",
    };
    return units[unit] || "fixed price";
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23663399' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='17' cy='27' r='1'/%3E%3Ccircle cx='37' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Enhanced Breadcrumbs */}
        <nav className="mb-8 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Link href="/" className="hover:text-purple-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href="/services"
              className="hover:text-purple-600 transition-colors"
            >
              Services
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href={`/services?category=${category?.value}`}
              className="hover:text-purple-600 transition-colors"
            >
              {category?.label}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{service.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Image Gallery */}
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="relative aspect-[4/3] bg-gray-100">
                <Image
                  src={
                    service.media_urls?.[selectedImageIndex] ||
                    category?.image ||
                    "/placeholder.jpg"
                  }
                  alt={`${service.title} - Image ${selectedImageIndex + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  priority={selectedImageIndex === 0}
                />

                {/* Image Navigation */}
                {service.media_urls?.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Zoom Button */}
                <button
                  onClick={() => setIsZoomed(true)}
                  className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all"
                  aria-label="Zoom image"
                >
                  <ZoomIn className="w-5 h-5 text-gray-700" />
                </button>

                {/* Image Counter */}
                {service.media_urls?.length > 1 && (
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {selectedImageIndex + 1} / {service.media_urls.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {service.media_urls?.length > 1 && (
                <div className="p-4 bg-white">
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {service.media_urls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                          selectedImageIndex === index
                            ? "ring-3 ring-purple-500 shadow-lg"
                            : "hover:ring-2 hover:ring-purple-300"
                        }`}
                      >
                        <Image
                          src={url}
                          alt={`${service.title} thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Zoom Modal */}
            {isZoomed && (
              <div
                className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
                onClick={() => setIsZoomed(false)}
              >
                <div className="relative max-w-[90%] max-h-[90%]">
                  <Image
                    src={
                      service.media_urls?.[selectedImageIndex] ||
                      "/placeholder.jpg"
                    }
                    alt={`${service.title} - Zoomed Image`}
                    className="object-contain"
                    width={1200}
                    height={900}
                  />
                  <button
                    onClick={() => setIsZoomed(false)}
                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}

            {/* Enhanced Service Header */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Service Tags */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-purple-100 text-purple-800 px-3 py-1 text-sm font-semibold">
                      {category?.label}
                    </Badge>
                    {service.active && (
                      <Badge className="bg-green-100 text-green-800 px-3 py-1 text-sm font-semibold flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {service.price > 100000 && (
                      <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1 text-sm font-semibold">
                        Premium
                      </Badge>
                    )}
                  </div>

                  {/* Service Title */}
                  <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                    {service.title}
                  </h1>

                  {/* Service Meta */}
                  <div className="flex flex-wrap items-center gap-6 text-gray-600">
                    {service.location && (
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                        <span className="font-medium">{service.location}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Star className="w-5 h-5 mr-2 text-yellow-500 fill-current" />
                      <span className="font-medium">4.8</span>
                      <span className="text-gray-500 ml-1">(128 reviews)</span>
                    </div>
                    {service.capacity && (
                      <div className="flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        <span className="font-medium">
                          {service.capacity}{" "}
                          {service.category === "events"
                            ? "guests"
                            : "capacity"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {service.description && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="w-6 h-6 mr-3 text-purple-600" />
                    About This Service
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Category-Specific Details */}
            <CategoryDetailsRenderer
              service={service}
              categoryData={categoryData}
              category={category}
            />

            {/* Requirements */}
            {service.requirements &&
              normalizeFeatures(service.requirements).length > 0 && (
                <Card className="border-yellow-100">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
                      <AlertTriangle className="w-6 h-6 mr-3 text-yellow-600" />
                      Requirements & Guidelines
                    </h3>
                    <div className="space-y-3">
                      {normalizeFeatures(service.requirements).map(
                        (requirement, index) => (
                          <div
                            key={index}
                            className="flex items-start p-3 bg-yellow-50 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">
                              {requirement.trim()}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Service Areas */}
            {service.service_areas && (
              <Card className="border-blue-100">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
                    <MapIcon className="w-6 h-6 mr-3 text-blue-600" />
                    Service Coverage Areas
                  </h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      {service.service_areas}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cancellation Policy */}
            {service.cancellation_policy && (
              <Card className="border-red-100">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
                    <Clock className="w-6 h-6 mr-3 text-red-600" />
                    Cancellation Policy
                  </h3>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      {service.cancellation_policy}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Vendor Info */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-purple-600" />
                  Meet Your Service Provider
                </h3>
                <div className="flex items-start space-x-6">
                  <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    {service.vendor_name?.charAt(0) || "V"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-xl font-bold text-gray-900">
                        {service.vendor_name || "Professional Service Provider"}
                      </h4>
                      <Badge className="bg-green-100 text-green-800 px-3 py-1 text-sm font-semibold flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verified Provider
                      </Badge>
                    </div>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-2 text-yellow-500 fill-current" />
                        <span>4.8 average rating • 128 reviews</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        <span>Member since 2022</span>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Services */}
            {similarServices.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-gray-900">
                    You Might Also Like
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {similarServices.map((sim) => (
                      <Link
                        key={sim.id}
                        href={`/services/${sim.id}`}
                        className="group block"
                      >
                        <Card className="border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                          <div className="relative h-48">
                            <Image
                              src={
                                sim.media_urls?.[0] ||
                                category?.image ||
                                "/placeholder.jpg"
                              }
                              alt={sim.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-bold text-gray-900 mb-2 line-clamp-1">
                              {sim.title}
                            </h4>
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="line-clamp-1">
                                {sim.location}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-lg font-bold text-purple-600">
                                ₦{sim.price.toLocaleString()}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                                4.8
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced Booking Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl sticky top-8">
              <CardContent className="p-8">
                {/* Price Header */}
                <div className="mb-8">
                  <div className="flex items-baseline space-x-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ₦{service.price.toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-600">
                      {formatPriceUnit(service.price_unit)}
                    </span>
                  </div>
                  <Badge
                    className={`text-sm font-medium px-3 py-1 ${
                      service.availability === "available"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {service.availability === "available"
                      ? "Available Now"
                      : service.availability === "busy"
                        ? "Currently Busy"
                        : "Unavailable"}
                  </Badge>
                </div>

                {/* Booking Button */}
                <Button
                  asChild={service.availability === "available"}
                  disabled={service.availability !== "available"}
                  className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-200 ${
                    service.availability === "available"
                      ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {service.availability === "available" ? (
                    <Link
                      href={`/book/${service.id}`}
                      className="flex items-center justify-center"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Book This Service
                    </Link>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Currently Unavailable
                    </span>
                  )}
                </Button>

                {/* Quick Info */}
                <div className="mt-6 space-y-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    <span>Instant booking confirmation</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Verified service provider</span>
                  </div>
                  {service.cancellation_policy && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-orange-600" />
                      <span>{service.cancellation_policy.split(".")[0]}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">
                    Price Breakdown
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service fee</span>
                      <span className="font-medium">
                        ₦{service.price.toLocaleString()}
                      </span>
                    </div>
                    {service.security_deposit && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Security deposit</span>
                        <span className="font-medium">
                          ₦{service.security_deposit.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>
                        ₦
                        {(
                          service.price + (service.security_deposit || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Options */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Service Info */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Service Highlights
                </h4>
                <div className="space-y-3 text-sm">
                  {service.capacity && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-3 text-gray-500" />
                      <span>{service.capacity} people capacity</span>
                    </div>
                  )}
                  {service.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-3 text-gray-500" />
                      <span className="line-clamp-1">{service.location}</span>
                    </div>
                  )}
                  {service.operating_hours && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-3 text-gray-500" />
                      <span>{service.operating_hours}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
