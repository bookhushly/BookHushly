"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useDeferredValue,
  memo,
  lazy,
  Suspense,
} from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";
import { debounce } from "lodash";
import { supabase } from "@/lib/supabase";
import { SCATEGORIES } from "@/lib/constants";

// Lazy load heavy components
const ServiceCardWrapper = dynamic(
  () => import("@/components/listings/details/ServiceCardWrapper"),
  {
    loading: () => <SkeletonCard />,
    ssr: false,
  }
);

// Image preload utility
const preloadImages = (urls) => {
  if (typeof window === "undefined") return;
  urls.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;
    document.head.appendChild(link);
  });
};

// Constants with optimized image paths
const CATEGORY_IMAGES = {
  events: [
    "/service-images/events/1.jpg",
    "/service-images/events/2.jpg",
    "/service-images/events/3.jpg",
    "/service-images/events/4.jpg",
  ],
  serviced_apartments: [
    "/service-images/serviced_apartments/1.jpg",
    "/service-images/serviced_apartments/2.jpg",
    "/service-images/serviced_apartments/3.jpg",
    "/service-images/serviced_apartments/4.jpg",
  ],
  car_rentals: [
    "/service-images/car_rentals/1.jpg",
    "/service-images/car_rentals/2.jpg",
    "/service-images/car_rentals/3.jpg",
    "/service-images/car_rentals/4.jpg",
  ],
  "food & restaurants": [
    "/service-images/food/1.jpg",
    "/service-images/food/2.jpg",
    "/service-images/food/3.jpg",
    "/service-images/food/4.jpg",
  ],
  services: [
    "/service-images/services/1.jpg",
    "/service-images/services/2.jpg",
    "/service-images/services/3.jpg",
    "/service-images/services/4.jpg",
  ],
  security: [
    "/service-images/security/1.jpg",
    "/service-images/security/2.jpg",
    "/service-images/security/3.jpg",
    "/service-images/security/4.jpg",
  ],
  logistics: [
    "/service-images/logistics/1.jpg",
    "/service-images/logistics/2.jpg",
    "/service-images/logistics/3.jpg",
    "/service-images/logistics/4.jpg",
  ],
  hotels: [
    "/service-images/hotels/1.jpg",
    "/service-images/hotels/2.jpg",
    "/service-images/hotels/3.jpg",
    "/service-images/hotels/4.jpg",
  ],
};

const CATEGORY_KEY_MAP = {
  events: "events",
  "serviced apartments": "serviced_apartments",
  serviced_apartments: "serviced_apartments",
  "car rentals": "car_rentals",
  car_rentals: "car_rentals",
  "food & restaurants": "food & restaurants",
  services: "services",
  security: "security",
  logistics: "logistics",
  hotels: "hotels",
};

const normalizeCategoryKey = (label) => {
  const normalized = label
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ");
  return CATEGORY_KEY_MAP[normalized] || "services";
};

// Filter configurations
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

// Optimized hook for window size
const useWindowSize = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();

    const debouncedResize = debounce(checkMobile, 150);
    window.addEventListener("resize", debouncedResize);
    return () => {
      debouncedResize.cancel();
      window.removeEventListener("resize", debouncedResize);
    };
  }, []);

  return isMobile;
};

// Memoized Skeleton Component
const SkeletonCard = memo(() => (
  <div className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm animate-pulse">
    <div className="relative h-48 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
      <div className="h-4 w-full bg-gray-200 rounded" />
      <div className="h-6 w-24 bg-gray-200 rounded" />
    </div>
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

// Memoized Empty State
const EmptyState = memo(({ title, subtitle, icon: Icon = Search }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="flex flex-col items-center justify-center py-16"
  >
    <div className="h-16 w-16 flex items-center justify-center rounded-full bg-purple-100 mb-4">
      <Icon className="h-8 w-8 text-purple-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </motion.div>
));
EmptyState.displayName = "EmptyState";

// Optimized Search Bar with image preloading
const SearchBar = memo(({ searchQuery, setSearchQuery, categoryLabel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const categoryKey = useMemo(
    () => normalizeCategoryKey(categoryLabel),
    [categoryLabel]
  );

  const images = useMemo(
    () => CATEGORY_IMAGES[categoryKey] || CATEGORY_IMAGES.services,
    [categoryKey]
  );

  // Preload images on mount
  useEffect(() => {
    preloadImages(images);
    setImagesLoaded(true);
  }, [images]);

  const debouncedSetSearchQuery = useMemo(
    () => debounce((value) => setSearchQuery(value), 300),
    [setSearchQuery]
  );

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  const goToSlide = useCallback(
    (index) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000);
    },
    [currentIndex]
  );

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [currentIndex, images.length]);

  const goToNext = useCallback(() => {
    setDirection(1);
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [currentIndex, images.length]);

  const slideVariants = useMemo(
    () => ({
      enter: (direction) => ({
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0,
      }),
      center: {
        x: 0,
        opacity: 1,
      },
      exit: (direction) => ({
        x: direction > 0 ? "-100%" : "100%",
        opacity: 0,
      }),
    }),
    []
  );

  return (
    <section className="relative bg-white text-gray-900 h-[500px] overflow-hidden">
      <div className="absolute inset-0">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0"
          >
            {imagesLoaded && (
              <Image
                src={images[currentIndex]}
                alt={`${categoryLabel} ${currentIndex + 1}`}
                fill
                className="object-cover"
                priority={currentIndex === 0}
                quality={85}
                sizes="100vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          </motion.div>
        </AnimatePresence>

        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-10"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4 h-full flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center w-full"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
            Find Your Perfect {categoryLabel}
          </h1>
          <motion.div
            className="bg-white p-3 rounded-2xl shadow-2xl max-w-xl mx-auto"
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
                className="pl-10 h-12 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 text-base w-full"
                aria-label={`Search ${categoryLabel} services`}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
});
SearchBar.displayName = "SearchBar";

// Optimized Category Tabs
const CategoryTabs = memo(({ activeCategory, setActiveCategory }) => {
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
    <div className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center overflow-x-auto scrollbar-hide py-4 gap-2">
          {SCATEGORIES.map((category) => {
            const isActive = activeCategory === category.value;
            return (
              <motion.button
                key={category.value}
                onClick={() => handleCategoryChange(category.value)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "text-purple-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                whileTap={{ scale: 0.97 }}
                role="tab"
                aria-selected={isActive}
              >
                <span
                  className={`text-lg ${isActive ? "text-purple-600" : "text-gray-400"}`}
                >
                  {category.icon}
                </span>
                <span>{category.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
CategoryTabs.displayName = "CategoryTabs";

// Filter Panel Component (optimized)
const FilterPanel = memo(
  ({ category, filters, onFiltersChange, isOpen, onToggle, isMobile }) => {
    const config = FILTER_CONFIGS[category];
    const [priceRange, setPriceRange] = useState([
      config?.priceRange.min || 0,
      config?.priceRange.max || 1000000,
    ]);
    const [expandedSections, setExpandedSections] = useState(
      new Set(["price"])
    );

    const toggleSection = useCallback((section) => {
      setExpandedSections((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(section)) {
          newSet.delete(section);
        } else {
          newSet.add(section);
        }
        return newSet;
      });
    }, []);

    const handlePriceChange = useMemo(
      () =>
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

    const handleFilterChange = useCallback(
      (filterKey, value, type) => {
        const newFilters = { ...filters };

        if (type === "multiselect") {
          const currentValues = newFilters[filterKey] || [];
          newFilters[filterKey] = currentValues.includes(value)
            ? currentValues.filter((v) => v !== value)
            : [...currentValues, value];
        } else if (type === "range") {
          newFilters[filterKey] = value;
        } else {
          newFilters[filterKey] = value;
        }

        onFiltersChange(newFilters);
      },
      [filters, onFiltersChange]
    );

    const activeFilterCount = useMemo(
      () =>
        Object.keys(filters).filter((key) => {
          const value = filters[key];
          return value && (Array.isArray(value) ? value.length > 0 : true);
        }).length,
      [filters]
    );

    if (!config) return null;

    return (
      <>
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
                      className="text-red-600"
                    >
                      Clear
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
                                  onCheckedChange={() =>
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
const ActiveFilters = memo(({ filters, onRemoveFilter, category }) => {
  const config = FILTER_CONFIGS[category];

  const activeFilters = useMemo(() => {
    const items = [];

    Object.entries(filters).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return;
      if (key === "price_min" || key === "price_max") return;

      const filterConfig = config?.filters.find((f) => f.key === key);
      if (!filterConfig) return;

      if (Array.isArray(value)) {
        value.forEach((v) => {
          const option = filterConfig.options?.find((opt) => opt.value === v);
          if (option) {
            items.push({
              key: `${key}-${v}`,
              label: option.label,
              onRemove: () => onRemoveFilter(key, v),
            });
          }
        });
      } else {
        const option = filterConfig.options?.find((opt) => opt.value === value);
        items.push({
          key,
          label: option ? option.label : `${filterConfig.label}: ${value}`,
          onRemove: () => onRemoveFilter(key, null),
        });
      }
    });

    if (filters.price_min || filters.price_max) {
      const min = filters.price_min || config?.priceRange.min || 0;
      const max = filters.price_max || config?.priceRange.max || 1000000;
      items.push({
        key: "price",
        label: `₦${min.toLocaleString()} - ₦${max.toLocaleString()}`,
        onRemove: () => onRemoveFilter("price", null),
      });
    }

    return items;
  }, [filters, config, onRemoveFilter]);

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

// Optimized Listings Grid
const ListingsGrid = memo(
  ({ listings, fetchError, isLoadingMore, lastListingRef, isMobile }) => {
    if (fetchError) {
      return (
        <EmptyState
          title="Failed to load services"
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
              ref={index === listings.length - 1 ? lastListingRef : null}
            >
              <Suspense fallback={<SkeletonCard />}>
                <ServiceCardWrapper service={service} isMobile={isMobile} />
              </Suspense>
            </div>
          ))}
        </div>
        {isLoadingMore && (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </>
    );
  }
);
ListingsGrid.displayName = "ListingsGrid";

// Optimized listings hook with better query building
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

  const buildQuery = useCallback(
    (pageNum, currentCategory, currentQuery, currentFilters) => {
      let query = supabase
        .from("listings")
        .select("*", { count: "exact" })
        .eq("active", true)
        .eq("category", currentCategory)
        .range((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE - 1)
        .order("created_at", { ascending: false });

      if (currentQuery) {
        query = query.or(
          `title.ilike.%${currentQuery}%,location.ilike.%${currentQuery}%,description.ilike.%${currentQuery}%`
        );
      }

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
    async (pageNum, reset, currentCategory, currentQuery, currentFilters) => {
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

        if (cache.current.size > 50) {
          const firstKey = cache.current.keys().next().value;
          cache.current.delete(firstKey);
        }

        setListings((prev) => (reset ? safeData : [...prev, ...safeData]));
        setHasMore(safeData.length === ITEMS_PER_PAGE);
        setFetchError(null);
      } catch (error) {
        const isAbort =
          error?.name === "AbortError" || /aborted/i.test(error?.message || "");
        if (isAbort) return;

        setFetchError(error.message);
        toast.error("Failed to load services");
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

  useEffect(() => {
    return () => {
      if (observer.current) observer.current.disconnect();
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return {
    listings,
    loading,
    fetchError,
    isLoadingMore,
    hasMore,
    lastListingRef,
  };
};

// Main Component
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
      setFilters({});
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
      <Toaster position="top-center" />

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

          <div className="flex-1">
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

            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              category={activeCategory}
            />

            {!loading && (
              <div className="mb-6">
                <p className="text-gray-600 text-sm">
                  {listings.length}{" "}
                  {listings.length === 1 ? "service" : "services"} found
                </p>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <ListingsGrid
                listings={listings}
                fetchError={fetchError}
                isLoadingMore={isLoadingMore}
                lastListingRef={lastListingRef}
                isMobile={isMobile}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
