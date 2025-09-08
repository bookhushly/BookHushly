"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useDeferredValue,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster, toast } from "react-hot-toast";
import {
  MapPin,
  Search,
  Star,
  ShieldCheck,
  Building,
  Home,
  Utensils,
  PartyPopper,
  Car,
  Truck,
  Shield,
  Users,
  Bed,
  Bath,
  Wifi,
  ParkingCircle,
  AirVent,
  ChefHat,
  Clock,
  Calendar,
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { debounce } from "lodash";
import {
  extractCategoryData,
  getCategoryFormConfig,
} from "@/lib/category-forms";
import { getFeatureIcon } from "@/lib/featureIcons";
import { supabase } from "@/lib/supabase";
import { SCATEGORIES } from "@/lib/constants";

// Constants
const BUTTON_CONFIG = {
  hotels: { icon: Building, text: "Book Now" },
  serviced_apartments: { icon: Home, text: "Book Now" },
  events: { icon: PartyPopper, text: "Book Event" },
  food: { icon: Utensils, text: "Order Now" },
  logistics: { icon: Truck, text: "Hire Now" },
  security: { icon: Shield, text: "Hire Now" },
  car_rentals: { icon: Car, text: "Rent Now" },
  default: { icon: Star, text: "View Details" },
};

const CATEGORY_ICONS = {
  hotels: <Building className="h-4 w-4" />,
  serviced_apartments: <Home className="h-4 w-4" />,
  events: <PartyPopper className="h-4 w-4" />,
  food: <Utensils className="h-4 w-4" />,
  logistics: <Truck className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  car_rentals: <Car className="h-4 w-4" />,
  default: <Star className="h-4 w-4" />,
};

const PRICE_LABELS = {
  hotels: "per night",
  serviced_apartments: "per night",
  events: (event_type) =>
    event_type === "event_center" ? "per event" : "per ticket",
  food: "per person",
  logistics: "per km",
  security: "per hour",
  car_rentals: "per day",
  default: "starting from",
};

// Filter configurations for each category
const FILTER_CONFIGS = {
  hotels: {
    priceRange: { min: 5000, max: 500000, step: 5000 },
    filters: [
      {
        key: "bedrooms",
        label: "Bedrooms",
        type: "range",
        min: 1,
        max: 10,
        step: 1,
      },
      {
        key: "bathrooms",
        label: "Bathrooms",
        type: "range",
        min: 1,
        max: 6,
        step: 1,
      },
      {
        key: "capacity",
        label: "Guest Capacity",
        type: "range",
        min: 1,
        max: 20,
        step: 1,
      },
      {
        key: "amenities",
        label: "Amenities",
        type: "multiselect",
        options: [
          { value: "wifi", label: "Free WiFi" },
          { value: "ac", label: "Air Conditioning" },
          { value: "power_backup", label: "24/7 Power" },
          { value: "swimming_pool", label: "Swimming Pool" },
          { value: "gym", label: "Gym" },
          { value: "restaurant", label: "Restaurant" },
          { value: "parking", label: "Free Parking" },
          { value: "room_service", label: "Room Service" },
          { value: "security", label: "24/7 Security" },
        ],
      },
    ],
  },
  serviced_apartments: {
    priceRange: { min: 10000, max: 1000000, step: 10000 },
    filters: [
      {
        key: "bedrooms",
        label: "Bedrooms",
        type: "range",
        min: 1,
        max: 10,
        step: 1,
      },
      {
        key: "bathrooms",
        label: "Bathrooms",
        type: "range",
        min: 1,
        max: 6,
        step: 1,
      },
      {
        key: "minimum_stay",
        label: "Minimum Stay",
        type: "select",
        options: [
          { value: "1_night", label: "1 night" },
          { value: "3_nights", label: "3 nights" },
          { value: "1_week", label: "1 week" },
          { value: "2_weeks", label: "2 weeks" },
          { value: "1_month", label: "1 month" },
        ],
      },
      {
        key: "apartment_types",
        label: "Apartment Type",
        type: "multiselect",
        options: [
          { value: "studio", label: "Studio" },
          { value: "one_bedroom", label: "1 Bedroom" },
          { value: "two_bedroom", label: "2 Bedroom" },
          { value: "three_bedroom", label: "3 Bedroom" },
          { value: "penthouse", label: "Penthouse" },
        ],
      },
    ],
  },
  food: {
    priceRange: { min: 500, max: 50000, step: 500 },
    filters: [
      {
        key: "cuisine_type",
        label: "Cuisine Type",
        type: "select",
        options: [
          { value: "nigerian", label: "Nigerian" },
          { value: "continental", label: "Continental" },
          { value: "chinese", label: "Chinese" },
          { value: "italian", label: "Italian" },
          { value: "indian", label: "Indian" },
          { value: "fast_food", label: "Fast Food" },
          { value: "seafood", label: "Seafood" },
          { value: "vegetarian", label: "Vegetarian" },
        ],
      },
      {
        key: "service_type",
        label: "Service Type",
        type: "multiselect",
        options: [
          { value: "dine_in", label: "Dine-in" },
          { value: "takeaway", label: "Takeaway" },
          { value: "delivery", label: "Delivery" },
          { value: "catering", label: "Catering" },
          { value: "buffet", label: "Buffet" },
        ],
      },
      {
        key: "capacity",
        label: "Seating Capacity",
        type: "range",
        min: 10,
        max: 500,
        step: 10,
      },
    ],
  },
  events: {
    priceRange: { min: 1000, max: 10000000, step: 10000 },
    filters: [
      {
        key: "event_type",
        label: "Event Type",
        type: "select",
        options: [
          { value: "event_center", label: "Event Center" },
          { value: "event_organizer", label: "Event Organizer" },
        ],
      },
      {
        key: "capacity",
        label: "Capacity",
        type: "range",
        min: 10,
        max: 5000,
        step: 50,
      },
      {
        key: "event_types",
        label: "Event Category",
        type: "multiselect",
        options: [
          { value: "wedding", label: "Wedding" },
          { value: "concert", label: "Concert" },
          { value: "conference", label: "Conference" },
          { value: "birthday", label: "Birthday" },
          { value: "corporate", label: "Corporate" },
        ],
      },
    ],
  },
  logistics: {
    priceRange: { min: 500, max: 100000, step: 500 },
    filters: [
      {
        key: "service_types",
        label: "Service Type",
        type: "multiselect",
        options: [
          { value: "same_day", label: "Same Day" },
          { value: "next_day", label: "Next Day" },
          { value: "express", label: "Express" },
          { value: "moving", label: "Moving" },
          { value: "freight", label: "Freight" },
        ],
      },
      {
        key: "vehicle_types",
        label: "Vehicle Type",
        type: "multiselect",
        options: [
          { value: "motorcycle", label: "Motorcycle" },
          { value: "car", label: "Car" },
          { value: "van", label: "Van" },
          { value: "truck", label: "Truck" },
        ],
      },
    ],
  },
  security: {
    priceRange: { min: 1000, max: 50000, step: 1000 },
    filters: [
      {
        key: "security_types",
        label: "Security Type",
        type: "multiselect",
        options: [
          { value: "event", label: "Event Security" },
          { value: "personal", label: "Personal Protection" },
          { value: "corporate", label: "Corporate Security" },
          { value: "residential", label: "Residential" },
          { value: "patrol", label: "Security Patrol" },
        ],
      },
      {
        key: "duration",
        label: "Duration",
        type: "multiselect",
        options: [
          { value: "hourly", label: "Hourly" },
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
        ],
      },
    ],
  },
  car_rentals: {
    priceRange: { min: 5000, max: 200000, step: 5000 },
    filters: [
      {
        key: "vehicle_categories",
        label: "Vehicle Category",
        type: "multiselect",
        options: [
          { value: "economy", label: "Economy" },
          { value: "standard", label: "Standard" },
          { value: "luxury", label: "Luxury" },
          { value: "suv", label: "SUV" },
          { value: "minivan", label: "Minivan" },
        ],
      },
      {
        key: "driver_service",
        label: "Driver Service",
        type: "select",
        options: [
          { value: "self_drive", label: "Self-drive" },
          { value: "with_driver", label: "With driver" },
          { value: "both", label: "Both options" },
        ],
      },
      {
        key: "transmission_types",
        label: "Transmission",
        type: "multiselect",
        options: [
          { value: "automatic", label: "Automatic" },
          { value: "manual", label: "Manual" },
        ],
      },
    ],
  },
};

// Utility Functions
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

const useWindowSize = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 640
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
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

    case "events":
      if (service.capacity)
        features.push({
          icon: <Users className="h-3 w-3" />,
          label: `${service.capacity} Capacity`,
        });
      if (service.event_type)
        features.push({
          icon: <PartyPopper className="h-3 w-3" />,
          label: service.event_type,
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
  const categoryData = extractCategoryData(service) || {};
  const category = service.category || "unknown";

  return {
    icon: CATEGORY_ICONS[category] || CATEGORY_ICONS.default,
    priceLabel:
      typeof PRICE_LABELS[category] === "function"
        ? PRICE_LABELS[category](service.event_type)
        : PRICE_LABELS[category] || PRICE_LABELS.default,
  };
};

const formatPrice = (service) => {
  const price = Number(service.price);
  const price_unit = service.price_unit || "fixed";

  if (isNaN(price)) return "Price not available";
  if (price_unit === "fixed" || price_unit === "per_event")
    return `₦${price.toLocaleString()}`;
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

const getButtonConfig = (category) =>
  BUTTON_CONFIG[category] || BUTTON_CONFIG.default;

// Filter Panel Component
const FilterPanel = React.memo(
  ({ category, filters, onFiltersChange, isOpen, onToggle, isMobile }) => {
    const config = FILTER_CONFIGS[category];
    const [priceRange, setPriceRange] = useState([
      config?.priceRange.min || 0,
      config?.priceRange.max || 1000000,
    ]);
    const [expandedSections, setExpandedSections] = useState(
      new Set(["price"])
    );

    const toggleSection = (section) => {
      const newExpanded = new Set(expandedSections);
      if (newExpanded.has(section)) {
        newExpanded.delete(section);
      } else {
        newExpanded.add(section);
      }
      setExpandedSections(newExpanded);
    };

    const handlePriceChange = useCallback(
      debounce((values) => {
        setPriceRange(values);
        onFiltersChange({
          ...filters,
          price_min: values[0],
          price_max: values[1],
        });
      }, 300),
      [filters, onFiltersChange]
    );

    const handleFilterChange = (filterKey, value, type) => {
      let newFilters = { ...filters };

      if (type === "multiselect") {
        const currentValues = newFilters[filterKey] || [];
        if (currentValues.includes(value)) {
          newFilters[filterKey] = currentValues.filter((v) => v !== value);
        } else {
          newFilters[filterKey] = [...currentValues, value];
        }
      } else if (type === "range") {
        newFilters[filterKey] = value;
      } else {
        newFilters[filterKey] = value;
      }

      onFiltersChange(newFilters);
    };

    const activeFilterCount = Object.keys(filters).filter((key) => {
      const value = filters[key];
      return value && (Array.isArray(value) ? value.length > 0 : true);
    }).length;

    if (!config) return null;

    return (
      <>
        {/* Mobile Filter Toggle */}
        {isMobile && (
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
            <Button
              onClick={onToggle}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        )}

        {/* Filter Panel */}
        <AnimatePresence>
          {(isOpen || !isMobile) && (
            <motion.div
              initial={isMobile ? { x: "-100%" } : { opacity: 0 }}
              animate={isMobile ? { x: 0 } : { opacity: 1 }}
              exit={isMobile ? { x: "-100%" } : { opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`
              ${
                isMobile
                  ? "fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl overflow-y-auto"
                  : "sticky top-4 h-fit"
              }
            `}
            >
              <div className="p-4 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filters
                  </h3>
                  {isMobile && (
                    <Button onClick={onToggle} variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {activeFilterCount > 0 && (
                    <Button
                      onClick={() => onFiltersChange({})}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("price")}
                  >
                    <h4 className="font-medium text-gray-900">Price Range</h4>
                    {expandedSections.has("price") ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>

                  {expandedSections.has("price") && (
                    <div className="space-y-3">
                      <Slider
                        value={priceRange}
                        onValueChange={handlePriceChange}
                        min={config.priceRange.min}
                        max={config.priceRange.max}
                        step={config.priceRange.step}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>₦{priceRange[0].toLocaleString()}</span>
                        <span>₦{priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamic Filters */}
                {config.filters.map((filter) => (
                  <div key={filter.key} className="space-y-3">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection(filter.key)}
                    >
                      <h4 className="font-medium text-gray-900">
                        {filter.label}
                      </h4>
                      {expandedSections.has(filter.key) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>

                    {expandedSections.has(filter.key) && (
                      <div className="space-y-2">
                        {filter.type === "multiselect" && (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {filter.options.map((option) => (
                              <div
                                key={option.value}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`${filter.key}-${option.value}`}
                                  checked={(filters[filter.key] || []).includes(
                                    option.value
                                  )}
                                  onCheckedChange={(checked) =>
                                    handleFilterChange(
                                      filter.key,
                                      option.value,
                                      "multiselect"
                                    )
                                  }
                                />
                                <label
                                  htmlFor={`${filter.key}-${option.value}`}
                                  className="text-sm text-gray-700 cursor-pointer"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}

                        {filter.type === "select" && (
                          <Select
                            value={filters[filter.key] || ""}
                            onValueChange={(value) =>
                              handleFilterChange(filter.key, value, "select")
                            }
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={`Select ${filter.label.toLowerCase()}`}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {filter.options.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {filter.type === "range" && (
                          <div className="space-y-3">
                            <Slider
                              value={
                                filters[filter.key]
                                  ? [filters[filter.key]]
                                  : [filter.min]
                              }
                              onValueChange={(values) =>
                                handleFilterChange(
                                  filter.key,
                                  values[0],
                                  "range"
                                )
                              }
                              min={filter.min}
                              max={filter.max}
                              step={filter.step}
                              className="w-full"
                            />
                            <div className="text-center text-sm text-gray-600">
                              {filters[filter.key] || filter.min}{" "}
                              {filter.label.toLowerCase()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Overlay */}
        {isMobile && isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onToggle}
          />
        )}
      </>
    );
  }
);
FilterPanel.displayName = "FilterPanel";

// Active Filters Display
const ActiveFilters = React.memo(({ filters, onRemoveFilter, category }) => {
  const config = FILTER_CONFIGS[category];
  const activeFilters = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return;

    if (key === "price_min" || key === "price_max") return; // Handled separately

    const filterConfig = config?.filters.find((f) => f.key === key);
    if (!filterConfig) return;

    if (Array.isArray(value)) {
      value.forEach((v) => {
        const option = filterConfig.options?.find((opt) => opt.value === v);
        if (option) {
          activeFilters.push({
            key: `${key}-${v}`,
            label: option.label,
            onRemove: () => onRemoveFilter(key, v),
          });
        }
      });
    } else {
      const option = filterConfig.options?.find((opt) => opt.value === value);
      activeFilters.push({
        key,
        label: option ? option.label : `${filterConfig.label}: ${value}`,
        onRemove: () => onRemoveFilter(key, null),
      });
    }
  });

  // Add price filter if active
  if (filters.price_min || filters.price_max) {
    const min = filters.price_min || config?.priceRange.min || 0;
    const max = filters.price_max || config?.priceRange.max || 1000000;
    activeFilters.push({
      key: "price",
      label: `₦${min.toLocaleString()} - ₦${max.toLocaleString()}`,
      onRemove: () => onRemoveFilter("price", null),
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="flex items-center gap-2 px-3 py-1"
        >
          {filter.label}
          <button
            onClick={filter.onRemove}
            className="hover:text-red-600 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
});
ActiveFilters.displayName = "ActiveFilters";

// CategoryTabs Component with URL navigation
const CategoryTabs = React.memo(({ activeCategory, setActiveCategory }) => {
  const router = useRouter();

  const handleCategoryChange = useCallback(
    (categoryValue) => {
      setActiveCategory(categoryValue);
      const url = new URL(window.location);
      url.searchParams.set("category", categoryValue);
      router.push(url.pathname + url.search, { scroll: false });
    },
    [setActiveCategory, router]
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {SCATEGORIES.map((category) => (
          <motion.div
            key={category.value}
            className={`flex items-center px-4 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 will-change-transform cursor-pointer ${
              activeCategory === category.value
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
            onClick={() => handleCategoryChange(category.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            role="tab"
            aria-selected={activeCategory === category.value}
            aria-label={`Filter by ${category.label}`}
          >
            {category.icon}
            <span className="ml-2">{category.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
});
CategoryTabs.displayName = "CategoryTabs";

// SearchBar Component
const SearchBar = React.memo(
  ({ searchQuery, setSearchQuery, categoryLabel }) => {
    const debouncedSetSearchQuery = useCallback(
      debounce((value) => setSearchQuery(value), 200),
      [setSearchQuery]
    );

    return (
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900 py-12 sm:py-16 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl" />
          <div className="absolute top-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl" />
          <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-indigo-400/20 rounded-full blur-2xl" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Find Your Perfect {categoryLabel} Experience
            </h1>
            <motion.div
              className="bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-white/30 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative flex items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={`Search ${categoryLabel.toLowerCase()}...`}
                  defaultValue={searchQuery}
                  onChange={(e) => debouncedSetSearchQuery(e.target.value)}
                  className="pl-10 h-12 rounded-full border-gray-200 focus:ring-2 focus:ring-blue-500 text-base w-full bg-white/90"
                  aria-label={`Search ${categoryLabel} services`}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
  }
);
SearchBar.displayName = "SearchBar";

// Enhanced ServiceCard Component
const ServiceCard = React.memo(({ service, lastListingRef, isMobile }) => {
  const category = useMemo(
    () =>
      SCATEGORIES.find((c) => c.value === service.category) || {
        label: service.category || "Unknown",
        icon: <Star className="h-4 w-4" />,
        image: "/placeholder.jpg",
      },
    [service.category]
  );

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
        : category.image,
    [service.media_urls, category.image]
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
        <Card className="group bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 rounded-2xl overflow-hidden flex flex-col h-full">
          <div className="relative h-52 sm:h-60">
            <Image
              src={serviceImage}
              alt={service.title || "Service"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={service.index < 4}
              loading={service.index < 4 ? "eager" : "lazy"}
            />
            <div className="absolute top-3 left-3 flex gap-2">
              {isPremium && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold px-2 py-1 text-xs rounded-full">
                  Premium
                </Badge>
              )}
              <Badge className="bg-white/90 text-gray-700 font-medium px-2 py-1 text-xs rounded-full flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1 text-green-600" />
                Verified
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-white flex items-center">
              <Star className="h-3 w-3 text-yellow-400 mr-1" />
              4.8 (128)
            </div>
          </div>

          <div className="p-4 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-xs text-gray-500">
                {category.icon}
                <span className="ml-1 font-medium">{category.label}</span>
              </div>
            </div>

            <CardTitle className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
              {service.title || "Untitled Service"}
            </CardTitle>

            <div className="flex items-center text-sm text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">
                {service.location || "Unknown Location"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {keyFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full"
                >
                  {feature.icon}
                  <span className="ml-1">{feature.label}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-auto">
              <div>
                <span className="text-xl font-bold text-gray-900">
                  {formattedPrice}
                </span>
                <span className="text-xs text-gray-500 ml-1 block">
                  {categoryInfo.priceLabel}
                </span>
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-4 py-2 font-medium text-sm"
                aria-label={buttonConfig.text}
              >
                <ButtonIcon className="h-4 w-4 mr-1" />
                {buttonConfig.text}
              </Button>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
});
ServiceCard.displayName = "ServiceCard";

// Skeleton and Loading Components
const SkeletonCard = React.memo(() => (
  <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm animate-pulse">
    <div className="relative h-52 sm:h-60 bg-gray-200">
      <div className="absolute top-3 left-3 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-white/60" />
        <div className="h-5 w-20 rounded-full bg-white/60" />
      </div>
      <div className="absolute bottom-3 left-3 h-5 w-20 rounded-full bg-white/70" />
    </div>
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-full bg-gray-200 rounded mb-3" />
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-5 w-28 bg-gray-200 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded-full" />
      </div>
    </div>
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

const EmptyState = React.memo(({ title, subtitle, icon: Icon = Search }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="flex flex-col items-center justify-center py-16"
  >
    <div className="h-20 w-20 flex items-center justify-center rounded-full bg-purple-100 mb-6">
      <Icon className="h-10 w-10 text-purple-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </motion.div>
));
EmptyState.displayName = "EmptyState";

const LoadingSpinner = React.memo(() => (
  <div className="flex justify-center py-8">
    <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
));
LoadingSpinner.displayName = "LoadingSpinner";

const ListingsGrid = React.memo(
  ({
    listings,
    fetchError,
    isLoadingMore,
    hasMore,
    lastListingRef,
    isMobile,
  }) => {
    if (fetchError) {
      return (
        <EmptyState
          title="We couldn't load services"
          subtitle="Please check your connection and try again."
          icon={Shield}
        />
      );
    }

    if (!listings.length && !isLoadingMore) {
      return (
        <EmptyState
          title="No services found"
          subtitle="Try adjusting your filters or search criteria."
          icon={Search}
        />
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((service, index) => (
            <div
              key={service.id}
              className="group is-visible"
              ref={index === listings.length - 1 ? lastListingRef : null}
            >
              <ServiceCard
                service={{ ...service, index }}
                isMobile={isMobile}
              />
            </div>
          ))}
        </div>
        {isLoadingMore && <LoadingSpinner />}
      </>
    );
  }
);
ListingsGrid.displayName = "ListingsGrid";

// Enhanced listings hook with filtering
const useListingsWithFilters = (category, searchQuery, filters) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const cache = useRef(new Map());
  const observer = useRef(null);
  const abortControllerRef = useRef(null);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    return () => {
      if (observer.current) observer.current.disconnect();
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const buildQuery = useCallback(
    (pageNum, currentCategory, currentQuery, currentFilters) => {
      let query = supabase
        .from("listings")
        .select("*")
        .eq("active", true)
        .eq("category", currentCategory)
        .range((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE - 1);

      // Search query
      if (currentQuery) {
        query = query.or(
          `title.ilike.%${currentQuery}%,location.ilike.%${currentQuery}%`
        );
      }

      // Apply filters
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return;

        switch (key) {
          case "price_min":
            query = query.gte("price", value);
            break;
          case "price_max":
            query = query.lte("price", value);
            break;
          case "bedrooms":
          case "bathrooms":
          case "capacity":
            query = query.gte(key, value);
            break;
          case "minimum_stay":
          case "event_type":
          case "cuisine_type":
          case "driver_service":
            query = query.eq(key, value);
            break;
          default:
            // Handle JSONB fields in category_data
            if (Array.isArray(value) && value.length > 0) {
              const conditions = value.map(
                (v) => `category_data->>'${key}' @> '"${v}"'`
              );
              query = query.or(conditions.join(","));
            }
            break;
        }
      });

      return query;
    },
    []
  );

  const fetchListings = useCallback(
    async (
      pageNum,
      reset = false,
      currentCategory,
      currentQuery,
      currentFilters
    ) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const cacheKey = `${currentCategory}:${currentQuery}:${JSON.stringify(currentFilters)}:${pageNum}`;

      if (cache.current.has(cacheKey)) {
        const cachedData = cache.current.get(cacheKey);
        setListings((prev) => (reset ? cachedData : [...prev, ...cachedData]));
        setHasMore(cachedData.length === ITEMS_PER_PAGE);
        setFetchError(null);
        setIsLoadingMore(false);
        setLoading(false);
        return;
      }

      setIsLoadingMore(true);
      if (reset) setLoading(true);

      try {
        const query = buildQuery(
          pageNum,
          currentCategory,
          currentQuery,
          currentFilters
        );
        const { data, error } = await query.abortSignal(
          abortControllerRef.current.signal
        );

        if (error) throw error;

        const safeData = Array.isArray(data) ? data : [];
        cache.current.set(cacheKey, safeData);
        setListings((prev) => (reset ? safeData : [...prev, ...safeData]));
        setHasMore(safeData.length === ITEMS_PER_PAGE);
        setFetchError(null);
      } catch (error) {
        const isAbort =
          error?.name === "AbortError" || /aborted/i.test(error?.message || "");
        if (isAbort) return;

        toast.error(`Error fetching listings: ${error.message}`);
        setFetchError(error.message);
      } finally {
        setIsLoadingMore(false);
        setLoading(false);
      }
    },
    [buildQuery]
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setListings([]);
    setHasMore(true);
    setFetchError(null);
    cache.current.clear();
    fetchListings(1, true, category, searchQuery, filters);
  }, [category, searchQuery, filters, fetchListings]);

  useEffect(() => {
    if (page > 1) {
      fetchListings(page, false, category, searchQuery, filters);
    }
  }, [page, category, searchQuery, filters, fetchListings]);

  const lastListingRef = useCallback(
    (node) => {
      if (isLoadingMore || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
            setPage((prev) => prev + 1);
          }
        },
        { threshold: 0.1, rootMargin: "200px" }
      );

      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore]
  );

  return {
    listings,
    loading,
    fetchError,
    isLoadingMore,
    hasMore,
    lastListingRef,
  };
};

// Main Services Page Component
export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get("category") || SCATEGORIES[0].value;
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const deferredQuery = useDeferredValue(searchQuery);
  const deferredFilters = useDeferredValue(filters);
  const isMobile = useWindowSize();

  useEffect(() => {
    const urlCategory = searchParams.get("category");
    if (urlCategory && urlCategory !== activeCategory) {
      setActiveCategory(urlCategory);
      setFilters({}); // Reset filters when category changes
    }
  }, [searchParams, activeCategory]);

  const categoryLabel = useMemo(
    () =>
      SCATEGORIES.find((c) => c.value === activeCategory)?.label || "Service",
    [activeCategory]
  );

  const {
    listings,
    loading,
    fetchError,
    isLoadingMore,
    hasMore,
    lastListingRef,
  } = useListingsWithFilters(activeCategory, deferredQuery, deferredFilters);

  const handleRemoveFilter = useCallback(
    (filterKey, value) => {
      const newFilters = { ...filters };

      if (filterKey === "price") {
        delete newFilters.price_min;
        delete newFilters.price_max;
      } else if (value !== null && Array.isArray(newFilters[filterKey])) {
        newFilters[filterKey] = newFilters[filterKey].filter(
          (v) => v !== value
        );
        if (newFilters[filterKey].length === 0) {
          delete newFilters[filterKey];
        }
      } else {
        delete newFilters[filterKey];
      }

      setFilters(newFilters);
    },
    [filters]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />

      <CategoryTabs
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryLabel={categoryLabel}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          {!isMobile && (
            <div className="w-80 flex-shrink-0">
              <FilterPanel
                category={activeCategory}
                filters={filters}
                onFiltersChange={setFilters}
                isOpen={true}
                onToggle={() => {}}
                isMobile={false}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            {isMobile && (
              <FilterPanel
                category={activeCategory}
                filters={filters}
                onFiltersChange={setFilters}
                isOpen={isFilterOpen}
                onToggle={() => setIsFilterOpen(!isFilterOpen)}
                isMobile={true}
              />
            )}

            {/* Active Filters */}
            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              category={activeCategory}
            />

            {/* Results Count */}
            {!loading && (
              <div className="mb-6">
                <p className="text-gray-600">
                  {listings.length}{" "}
                  {listings.length === 1 ? "service" : "services"} found
                </p>
              </div>
            )}

            {/* Listings Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <AnimatePresence>
                <ListingsGrid
                  listings={listings}
                  fetchError={fetchError}
                  isLoadingMore={isLoadingMore}
                  hasMore={hasMore}
                  lastListingRef={lastListingRef}
                  isMobile={isMobile}
                />
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
