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
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { debounce } from "lodash";
import {
  extractCategoryData,
  getCategoryFormConfig,
} from "@/lib/category-forms";
import { getFeatureIcon } from "@/lib/featureIcons";
import { supabase } from "@/lib/supabase";
import { SCATEGORIES } from "@/lib/constants";

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

// CategoryTabs Component
const CategoryTabs = React.memo(({ activeCategory, setActiveCategory }) => {
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
            onClick={() => setActiveCategory(category.value)}
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
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900 py-12 sm:py-16">
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance">
              Find Your Perfect {categoryLabel} Experience
            </h1>
            <motion.div
              className="bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-lg border border-gray-100 max-w-xl mx-auto"
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
                  className="pl-10 h-12 rounded-full border-gray-200 focus:ring-2 focus:ring-blue-500 text-base w-full"
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

// ServiceCard Component
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
  const isVerified = service.active;
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
  const features = useMemo(() => {
    const result = formatFeatures(service, isMobile);
    return result;
  }, [service, isMobile]);
  const ButtonIcon = buttonConfig.icon;

  return (
    <div
      ref={lastListingRef}
      className="transform transition-opacity duration-300 opacity-0 group-[.is-visible]:opacity-100"
    >
      <Link href={`/services/${service.id}`}>
        <Card className="group bg-white hover:shadow-xl transition-shadow duration-300 border border-gray-100 rounded-2xl overflow-hidden flex flex-col">
          <div className="relative h-60 sm:h-72">
            <Image
              src={serviceImage}
              alt={service.title || "Service"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-2xl"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={service.index < 4}
              loading={service.index < 4 ? "eager" : "lazy"}
            />
            <div className="absolute top-4 left-4 flex gap-2">
              {isPremium && (
                <Badge className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold px-3 py-1 rounded-full">
                  Premium
                </Badge>
              )}
              {isVerified && (
                <Badge className="bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold px-3 py-1 rounded-full flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-1" /> Verified
                </Badge>
              )}
            </div>
            <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md rounded-full px-3 py-1 text-sm font-semibold flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" /> 4.8 (128)
            </div>
          </div>
          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-sm text-gray-600">
                {category.icon}
                <span className="ml-2 font-medium">{category.label}</span>
              </div>
              {service.availability !== "available" && (
                <Badge
                  variant="outline"
                  className="text-red-600 border-red-600"
                >
                  {service.availability}
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-3 line-clamp-1">
              {service.title || "Untitled Service"}
            </CardTitle>
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="line-clamp-1">
                {service.location || "Unknown Location"}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-4 line-clamp-2">
              {categoryInfo.details || "No details available"}
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {features.map((f) => (
                <Badge
                  key={f.key}
                  variant="outline"
                  className="flex items-center text-gray-700 bg-gray-50 hover:bg-gray-100 px-2.5 py-1"
                  title={f.label}
                  aria-label={f.label}
                >
                  {f.icon}
                  <span className="text-xs">{f.label}</span>
                </Badge>
              ))}
            </div>
            <div className="flex justify-between items-center mt-auto">
              <div>
                <span className="text-lg font-bold text-gray-900">
                  {formattedPrice}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  {categoryInfo.priceLabel}
                </span>
              </div>
              <div className="transform transition-transform duration-300 hover:scale-105 active:scale-95">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-5 py-2.5 font-semibold"
                  aria-label={buttonConfig.text}
                >
                  <ButtonIcon className="h-4 w-4 mr-2" />
                  {buttonConfig.text}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
});
ServiceCard.displayName = "ServiceCard";

// ✨ Polished Skeleton Card (mirrors ServiceCard layout)
const SkeletonCard = React.memo(() => (
  <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm animate-pulse">
    <div className="relative h-60 sm:h-72 bg-gray-200">
      <div className="absolute top-4 left-4 flex gap-2">
        <div className="h-6 w-20 rounded-full bg-white/60" />
        <div className="h-6 w-24 rounded-full bg-white/60" />
      </div>
      <div className="absolute bottom-4 left-4 h-6 w-24 rounded-full bg-white/70" />
    </div>
    <div className="p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-28 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-6 w-3/5 bg-gray-200 rounded mb-3" />
      <div className="h-4 w-48 bg-gray-200 rounded mb-4" />
      <div className="space-y-2 mb-5">
        <div className="h-6 w-24 bg-gray-200 rounded-full" />
        <div className="h-6 w-28 bg-gray-200 rounded-full" />
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-10 w-28 bg-gray-200 rounded-full" />
      </div>
    </div>
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

// ✨ Empty / Error States (lightweight & animated)
const EmptyState = React.memo(({ title, subtitle, icon: Icon = Search }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="flex flex-col items-center justify-center py-16"
  >
    <div className="h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-6">
      <Icon className="h-10 w-10 text-blue-500" />
    </div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </motion.div>
));
EmptyState.displayName = "EmptyState";

// LoadingSpinner Component (for infinite scroll)
const LoadingSpinner = React.memo(() => (
  <div className="flex justify-center py-8">
    <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
));
LoadingSpinner.displayName = "LoadingSpinner";

// ListingsGrid Component (no fallbacks, friendly empty/error states)
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
          title="We couldn’t load services"
          subtitle="Please check your connection and try again."
          icon={Shield}
        />
      );
    }

    if (!listings.length && !isLoadingMore) {
      return (
        <EmptyState
          title="No services found"
          subtitle="Try adjusting your search or choose another category."
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

const getCategorySpecificInfo = (service) => {
  const categoryData = extractCategoryData(service) || {};
  const category = service.category || "unknown";

  const details = [];
  if (service.availability)
    details.push(`Availability: ${service.availability}`);
  if (service.price_unit && service.price_unit !== "fixed")
    details.push(`Price Unit: ${service.price_unit}`);
  if (service.capacity) details.push(`Capacity: ${service.capacity}`);
  if (service.bedrooms) details.push(`Bedrooms: ${service.bedrooms}`);
  if (service.bathrooms) details.push(`Bathrooms: ${service.bathrooms}`);
  if (service.minimum_stay)
    details.push(`Minimum Stay: ${service.minimum_stay}`);
  if (service.security_deposit)
    details.push(
      `Security Deposit: ₦${Number(service.security_deposit).toLocaleString()}`
    );
  if (service.remaining_tickets)
    details.push(`Tickets Left: ${service.remaining_tickets}`);
  if (service.event_type) details.push(`Event Type: ${service.event_type}`);
  if (service.service_areas)
    details.push(`Service Areas: ${service.service_areas}`);
  if (service.vehicle_type)
    details.push(`Vehicle Type: ${service.vehicle_type}`);
  if (service.features) details.push(`Features: ${service.features}`);

  const config = getCategoryFormConfig(category, service.event_type);
  if (config) {
    config.fields.forEach((field) => {
      const value = categoryData[field.name] || service[field.name];
      if (!value || (Array.isArray(value) && value.length === 0)) return;
      if (
        [
          "title",
          "description",
          "price",
          "location",
          "capacity",
          "bedrooms",
          "bathrooms",
          "minimum_stay",
          "security_deposit",
          "remaining_tickets",
          "event_type",
          "service_areas",
          "vehicle_type",
          "features",
          "cancellation_policy",
        ].includes(field.name)
      )
        return;
      const label = field.label;
      const formattedValue = Array.isArray(value)
        ? value.join(", ")
        : String(value);
      details.push(`${label}: ${formattedValue}`);
    });
  }

  return {
    icon: CATEGORY_ICONS[category] || CATEGORY_ICONS.default,
    details: details.slice(0, 3).join(" • ") || "No details available",
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

const formatFeatures = (service, isMobile) => {
  const categoryData = extractCategoryData(service) || {};
  const config = getCategoryFormConfig(service.category, service.event_type);
  if (!config) return [];

  const prioritizedFields = [
    "features",
    "cancellation_policy",
    "service_areas",
    "vehicle_type",
    "amenities",
    "services_included",
    "cuisine_type",
    "event_types",
    "security_types",
    "vehicle_SCATEGORIES",
    "service_types",
    "apartment_types",
    "special_diets",
  ];
  const preferredValues = [
    "free_24h",
    "free_48h",
    "free_7d",
    "comprehensive",
    "yes",
  ];
  const featureLimit = isMobile ? 2 : 4;

  const sortedFields = config.fields
    .filter(
      (field) =>
        !["title", "description", "price", "location"].includes(field.name) &&
        (categoryData[field.name] || service[field.name])
    )
    .sort((a, b) =>
      prioritizedFields.includes(a.name) && !prioritizedFields.includes(b.name)
        ? -1
        : prioritizedFields.includes(b.name) &&
            !prioritizedFields.includes(a.name)
          ? 1
          : 0
    );

  const features = [];
  for (const field of sortedFields) {
    const value = categoryData[field.name] || service[field.name];
    if (!value || (Array.isArray(value) && value.length === 0)) continue;
    const formattedValue = Array.isArray(value)
      ? value.filter((v) => preferredValues.includes(v)).join(", ") || value[0]
      : String(value);
    features.push({
      key: field.name,
      label: formattedValue || field.label,
      icon: getFeatureIcon(field.name, formattedValue),
    });
    if (features.length >= featureLimit) break;
  }

  return features;
};

// ✅ Fixed useListings hook (AbortError silenced & fallbacks removed)
const useListings = (category, searchQuery) => {
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

  // Clean up observer and inflight requests on unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchListings = useCallback(
    async (pageNum, reset = false, currentCategory, currentQuery) => {
      // Abort previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const cacheKey = `${currentCategory}:${currentQuery}:${pageNum}`;

      // Check cache first
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
      if (reset) {
        setLoading(true);
      }

      try {
        let query = supabase
          .from("listings")
          .select(
            "id, title, category, price, location, media_urls, active, category_data, price_unit, availability, bedrooms, bathrooms, minimum_stay, security_deposit, remaining_tickets, event_type, features, cancellation_policy, service_areas, vehicle_type"
          )
          .eq("active", true)
          .eq("category", currentCategory)
          .range((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE - 1)
          .abortSignal(abortControllerRef.current.signal);

        if (currentQuery) {
          query = query.or(
            `title.ilike.%${currentQuery}%,location.ilike.%${currentQuery}%`
          );
        }

        const { data, error } = await query;

        if (error) throw error;

        const safeData = Array.isArray(data) ? data : [];
        cache.current.set(cacheKey, safeData);
        setListings((prev) => (reset ? safeData : [...prev, ...safeData]));
        setHasMore(safeData.length === ITEMS_PER_PAGE);
        setFetchError(null);
      } catch (error) {
        // Broader Abort detection across environments
        const isAbort =
          error?.name === "AbortError" ||
          /aborted/i.test(error?.message || "") ||
          error?.cause?.name === "AbortError";

        if (isAbort) {
          // Silently ignore aborted requests (no console, no toast)
          return;
        }

        // Real error
        toast.error(`Error fetching listings: ${error.message}`, {
          position: "top-center",
          style: {
            background: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #b91c1c",
          },
        });
        setFetchError(error.message);
      } finally {
        setIsLoadingMore(false);
        setLoading(false);
      }
    },
    []
  );

  // Reset when category or search changes
  useEffect(() => {
    setLoading(true);
    setPage(1);
    setListings([]);
    setHasMore(true);
    setFetchError(null);
    // Clear cache for different category/search combinations
    cache.current.clear();
    fetchListings(1, true, category, searchQuery);
  }, [category, searchQuery, fetchListings]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchListings(page, false, category, searchQuery);
    }
  }, [page, category, searchQuery, fetchListings]);

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

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState(SCATEGORIES[0].value);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);
  const isMobile = useWindowSize();
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
  } = useListings(activeCategory, deferredQuery);

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
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          // ✨ Sleek skeletons while fetching
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
  );
}
