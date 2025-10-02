"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useDeferredValue,
  memo,
  Suspense,
  startTransition,
} from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import {
  motion,
  AnimatePresence,
  LazyMotion,
  domAnimation,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster, toast } from "react-hot-toast";
import { debounce } from "lodash";
import { supabase } from "@/lib/supabase";
import { SCATEGORIES } from "@/lib/constants";

// Lazy load with prefetch on hover
const ServiceCardWrapper = dynamic(
  () => import("@/components/listings/details/ServiceCardWrapper"),
  {
    loading: () => <SkeletonCard />,
    ssr: false,
  }
);

// Optimized constants - only store what's needed
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

// Simplified filter configs - only essentials
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
    ],
  },
  events: {
    priceRange: { min: 1000, max: 10000000, step: 10000 },
    filters: [
      {
        key: "capacity",
        label: "Capacity",
        type: "range",
        min: 10,
        max: 5000,
        step: 50,
      },
    ],
  },
  food: {
    priceRange: { min: 500, max: 50000, step: 500 },
    filters: [
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
};

// Optimized window size hook - runs once
const useWindowSize = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    const debouncedResize = debounce(checkMobile, 200);
    window.addEventListener("resize", debouncedResize, { passive: true });
    return () => {
      debouncedResize.cancel();
      window.removeEventListener("resize", debouncedResize);
    };
  }, []);

  return isMobile;
};

// Minimal skeleton
const SkeletonCard = memo(() => (
  <div className="rounded-xl overflow-hidden bg-white border border-gray-100 animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
      <div className="h-4 w-full bg-gray-200 rounded" />
      <div className="h-6 w-24 bg-gray-200 rounded" />
    </div>
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

// Simplified empty state
const EmptyState = memo(({ title, subtitle, icon: Icon = Search }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="h-16 w-16 flex items-center justify-center rounded-full bg-purple-100 mb-4">
      <Icon className="h-8 w-8 text-purple-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
));
EmptyState.displayName = "EmptyState";

// Optimized SearchBar - reduced animations
const SearchBar = memo(({ searchQuery, setSearchQuery, categoryLabel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  const categoryKey = useMemo(
    () => normalizeCategoryKey(categoryLabel),
    [categoryLabel]
  );
  const images = useMemo(
    () => CATEGORY_IMAGES[categoryKey] || CATEGORY_IMAGES.services,
    [categoryKey]
  );

  const debouncedSetSearchQuery = useMemo(
    () => debounce((value) => setSearchQuery(value), 400),
    [setSearchQuery]
  );

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  return (
    <section className="relative bg-white h-[500px] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={images[currentIndex]}
          alt={categoryLabel}
          fill
          className="object-cover transition-opacity duration-700"
          priority={currentIndex === 0}
          quality={75}
          sizes="100vw"
          loading={currentIndex === 0 ? "eager" : "lazy"}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center z-10"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center z-10"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50"
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="container relative z-10 mx-auto px-4 h-full flex items-center ">
        <div className="max-w-4xl mx-auto text-center w-full flex flex-col space-y-3 md:space-y-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-14 text-white drop-shadow-lg">
            Find Your Perfect {categoryLabel}
          </h1>
          <div className="max-w-2xl md:w-[500px] mx-auto px-6 py-4 rounded-2xl border border-white/30 backdrop-blur-md bg-white/5 shadow-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
              <Input
                placeholder={`Search ${categoryLabel.toLowerCase()}...`}
                defaultValue={searchQuery}
                onChange={(e) => debouncedSetSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl border-none outline-none bg-transparent text-white placeholder-white/90 focus:ring-2 focus:ring-white/50 w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
SearchBar.displayName = "SearchBar";

// Simplified CategoryTabs
const CategoryTabs = memo(({ activeCategory, setActiveCategory }) => {
  const router = useRouter();

  const handleCategoryChange = useCallback(
    (categoryValue) => {
      startTransition(() => {
        setActiveCategory(categoryValue);
        const url = new URL(window.location);
        url.searchParams.set("category", categoryValue);
        router.push(url.pathname + url.search, { scroll: false });
      });
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
              <button
                key={category.value}
                onClick={() => handleCategoryChange(category.value)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-purple-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`text-lg ${isActive ? "text-purple-600" : "text-gray-400"}`}
                >
                  {category.icon}
                </span>
                <span>{category.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
CategoryTabs.displayName = "CategoryTabs";

// Simplified FilterPanel
const FilterPanel = memo(
  ({ category, filters, onFiltersChange, isOpen, onToggle, isMobile }) => {
    const config = FILTER_CONFIGS[category];
    const [priceRange, setPriceRange] = useState([
      config?.priceRange.min || 0,
      config?.priceRange.max || 1000000,
    ]);

    const handlePriceChange = useMemo(
      () =>
        debounce((values) => {
          setPriceRange(values);
          onFiltersChange({
            ...filters,
            price_min: values[0],
            price_max: values[1],
          });
        }, 400),
      [filters, onFiltersChange]
    );

    if (!config) return null;

    return (
      <>
        {isMobile && (
          <div className="sticky top-0 z-10 bg-white border-b p-4">
            <Button onClick={onToggle} variant="outline" className="w-full">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        )}

        {(isOpen || !isMobile) && (
          <div
            className={
              isMobile
                ? "fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl overflow-y-auto"
                : "sticky top-4"
            }
          >
            <div className="p-4 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                {isMobile && (
                  <Button onClick={onToggle} variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Price Range</h4>
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  min={config.priceRange.min}
                  max={config.priceRange.max}
                  step={config.priceRange.step}
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>₦{priceRange[0].toLocaleString()}</span>
                  <span>₦{priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {config.filters.map((filter) => (
                <div key={filter.key} className="space-y-3">
                  <h4 className="font-medium">{filter.label}</h4>
                  {filter.type === "range" && (
                    <Slider
                      value={
                        filters[filter.key]
                          ? [filters[filter.key]]
                          : [filter.min]
                      }
                      onValueChange={(values) =>
                        onFiltersChange({ ...filters, [filter.key]: values[0] })
                      }
                      min={filter.min}
                      max={filter.max}
                      step={filter.step}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isMobile && isOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={onToggle} />
        )}
      </>
    );
  }
);
FilterPanel.displayName = "FilterPanel";

// Simplified Active Filters
const ActiveFilters = memo(({ filters, onRemoveFilter }) => {
  const activeFilters = useMemo(() => {
    const items = [];
    if (filters.price_min || filters.price_max) {
      items.push({
        key: "price",
        label: `₦${(filters.price_min || 0).toLocaleString()} - ₦${(filters.price_max || 1000000).toLocaleString()}`,
        onRemove: () => onRemoveFilter("price", null),
      });
    }
    return items;
  }, [filters, onRemoveFilter]);

  if (!activeFilters.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="flex items-center gap-2 px-3 py-1"
        >
          {filter.label}
          <button onClick={filter.onRemove}>
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
  ({ listings, fetchError, isLoadingMore, lastListingRef }) => {
    if (fetchError) {
      return (
        <EmptyState
          title="Failed to load services"
          subtitle="Please try again."
          icon={Shield}
        />
      );
    }

    if (!listings.length && !isLoadingMore) {
      return (
        <EmptyState
          title="No services found"
          subtitle="Try different filters."
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
                <ServiceCardWrapper service={service} />
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

// Optimized data fetching hook
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
  const ITEMS_PER_PAGE = 16; // Increased for fewer requests

  const buildQuery = useCallback(
    (pageNum, currentCategory, currentQuery, currentFilters) => {
      let query = supabase
        .from("listings")
        .select("id,title,location,price,media_urls,category,vendor_name", {
          count: "exact",
        }) // Only essential fields
        .eq("active", true)
        .eq("category", currentCategory)
        .range((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE - 1)
        .order("created_at", { ascending: false });

      if (currentQuery) {
        query = query.or(
          `title.ilike.%${currentQuery}%,location.ilike.%${currentQuery}%`
        );
      }

      if (currentFilters.price_min)
        query = query.gte("price", currentFilters.price_min);
      if (currentFilters.price_max)
        query = query.lte("price", currentFilters.price_max);

      return query;
    },
    []
  );

  const fetchListings = useCallback(
    async (pageNum, reset, currentCategory, currentQuery, currentFilters) => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      const cacheKey = `${currentCategory}:${currentQuery}:${JSON.stringify(currentFilters)}:${pageNum}`;

      if (cache.current.has(cacheKey)) {
        const cachedData = cache.current.get(cacheKey);
        setListings((prev) => (reset ? cachedData : [...prev, ...cachedData]));
        setHasMore(cachedData.length === ITEMS_PER_PAGE);
        setLoading(false);
        setIsLoadingMore(false);
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

        if (cache.current.size > 30) {
          const firstKey = cache.current.keys().next().value;
          cache.current.delete(firstKey);
        }

        setListings((prev) => (reset ? safeData : [...prev, ...safeData]));
        setHasMore(safeData.length === ITEMS_PER_PAGE);
        setFetchError(null);
      } catch (error) {
        if (error?.name !== "AbortError") {
          setFetchError(error.message);
          toast.error("Failed to load");
        }
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
    fetchListings(1, true, category, searchQuery, filters);
  }, [category, searchQuery, filters, fetchListings]);

  useEffect(() => {
    if (page > 1) fetchListings(page, false, category, searchQuery, filters);
  }, [page, category, searchQuery, filters, fetchListings]);

  const lastListingRef = useCallback(
    (node) => {
      if (isLoadingMore || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) setPage((prev) => prev + 1);
        },
        { threshold: 0.1, rootMargin: "300px" }
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
      startTransition(() => {
        setActiveCategory(urlCategory);
        setFilters({});
      });
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

  const handleRemoveFilter = useCallback((filterKey) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (filterKey === "price") {
        delete newFilters.price_min;
        delete newFilters.price_max;
      } else {
        delete newFilters[filterKey];
      }
      return newFilters;
    });
  }, []);
  console.log(listings);

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
                {[...Array(16)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <ListingsGrid
                listings={listings}
                fetchError={fetchError}
                isLoadingMore={isLoadingMore}
                lastListingRef={lastListingRef}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
