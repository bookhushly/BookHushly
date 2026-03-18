// app/services/page.jsx
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  startTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, LocateFixed, X } from "lucide-react";
import { SCATEGORIES } from "@/lib/constants";
import { useListingsData } from "@/hooks/useListingsData";
import { useGeolocation } from "@/hooks/useGeolocation";
import CategoryTabs from "@/components/shared/services/category-tab";
import FilterPanel from "@/components/shared/services/filter";
import ActiveFilters from "@/components/shared/services/active-filters";
import ListingsGrid from "@/components/shared/services/listings-grid";
import { SkeletonCard } from "@/components/shared/services/ui";

const BOOKHUSHLY_SERVICES = ["logistics", "security"];

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initial = searchParams.get("category") || SCATEGORIES[0].value;
  const urlCity = searchParams.get("city") || null;

  const [activeCategory, setActiveCategory] = useState(initial);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(() =>
    urlCity ? { city: urlCity } : {}
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [nearMeActive, setNearMeActive] = useState(!!urlCity);

  const geo = useGeolocation();
  const isBookHushly = BOOKHUSHLY_SERVICES.includes(activeCategory);

  // Redirect BookHushly services
  useEffect(() => {
    if (isBookHushly) router.push(`/quote-services?tab=${activeCategory}`);
  }, [isBookHushly, activeCategory, router]);

  // Sync URL → state
  useEffect(() => {
    const urlCat = searchParams.get("category");
    if (
      urlCat &&
      urlCat !== activeCategory &&
      !BOOKHUSHLY_SERVICES.includes(urlCat)
    ) {
      startTransition(() => {
        setActiveCategory(urlCat);
        setFilters({});
        setNearMeActive(false);
      });
    }
  }, [searchParams, activeCategory]);

  // When geo resolves and near-me was activated, push city into filters
  useEffect(() => {
    if (nearMeActive && geo.granted && (geo.city || geo.state)) {
      startTransition(() => {
        setFilters((prev) => ({
          ...prev,
          city: geo.city || undefined,
          state: !geo.city ? geo.state : undefined,
        }));
      });
    }
  }, [nearMeActive, geo.granted, geo.city, geo.state]);

  const handleNearMeToggle = useCallback(() => {
    if (nearMeActive) {
      // Turn off — remove location filters
      setNearMeActive(false);
      setFilters((prev) => {
        const next = { ...prev };
        delete next.city;
        delete next.state;
        return next;
      });
      return;
    }
    // Turn on
    setNearMeActive(true);
    if (!geo.granted) {
      geo.requestLocation();
    } else if (geo.city || geo.state) {
      startTransition(() => {
        setFilters((prev) => ({
          ...prev,
          city: geo.city || undefined,
          state: !geo.city ? geo.state : undefined,
        }));
      });
    }
  }, [nearMeActive, geo]);

  const categoryLabel = useMemo(
    () =>
      SCATEGORIES.find((c) => c.value === activeCategory)?.label || "Services",
    [activeCategory]
  );

  const {
    listings,
    loading,
    fetchError,
    isLoadingMore,
    hasMore,
    lastListingRef,
    totalCount,
  } = useListingsData(activeCategory, searchQuery, filters);

  const handleCategoryChange = useCallback(
    (cat) => {
      if (BOOKHUSHLY_SERVICES.includes(cat)) {
        router.push(`/quote-services?tab=${cat}`);
        return;
      }
      startTransition(() => {
        setActiveCategory(cat);
        setFilters({});
        setSearchQuery("");
        setNearMeActive(false);
        router.push(`/services?category=${cat}`, { scroll: false });
      });
    },
    [router]
  );

  const handleRemoveFilter = useCallback((key, newValue) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (key === "price") {
        delete next.price_min;
        delete next.price_max;
      } else if (newValue !== undefined) {
        if (newValue === null) delete next[key];
        else next[key] = newValue;
      } else delete next[key];
      return next;
    });
    if (key === "city" || key === "state") setNearMeActive(false);
  }, []);

  const handleFiltersChange = useCallback((f) => {
    startTransition(() => {
      setFilters(f);
      // If user manually changed city, deactivate near-me
      setNearMeActive(false);
    });
  }, []);

  const locationLabel = nearMeActive
    ? [geo.city, geo.state].filter(Boolean).join(", ")
    : null;

  // Redirect spinner
  if (isBookHushly) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-violet-50/60">
      {/* Category header */}
      <CategoryTabs
        activeCategory={activeCategory}
        categoryLabel={categoryLabel}
        setActiveCategory={handleCategoryChange}
      />

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop sidebar filter */}
          <aside className="hidden lg:block lg:w-72 xl:w-80 shrink-0">
            <FilterPanel
              category={activeCategory}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isOpen={true}
              onToggle={() => {}}
              isMobile={false}
            />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Mobile filter */}
            <div className="lg:hidden mb-4">
              <FilterPanel
                category={activeCategory}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                isOpen={isFilterOpen}
                onToggle={() => setIsFilterOpen((p) => !p)}
                isMobile={true}
              />
            </div>

            {/* Location bar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Near me toggle */}
              <button
                onClick={handleNearMeToggle}
                disabled={geo.loading}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                  nearMeActive
                    ? "bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-200"
                    : "bg-white text-gray-600 border-gray-200 hover:border-violet-400 hover:text-violet-600"
                } disabled:opacity-50`}
              >
                {geo.loading ? (
                  <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LocateFixed className="h-3.5 w-3.5" />
                )}
                {nearMeActive ? "Near me" : "Near me"}
              </button>

              {/* Detected location pill */}
              {nearMeActive && locationLabel && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200">
                  <MapPin className="h-3 w-3" />
                  {locationLabel}
                  <button
                    onClick={() => {
                      geo.clearLocation();
                      setNearMeActive(false);
                      setFilters((prev) => {
                        const next = { ...prev };
                        delete next.city;
                        delete next.state;
                        return next;
                      });
                    }}
                    className="ml-0.5 hover:text-violet-900 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Geo error */}
              {nearMeActive && geo.error && (
                <span className="text-xs text-red-500">{geo.error}</span>
              )}
            </div>

            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
            />

            {/* Results count */}
            {!loading && listings.length > 0 && (
              <p className="text-sm text-gray-500 mb-6">
                <span className="font-semibold text-gray-900">
                  {totalCount}
                </span>{" "}
                {totalCount === 1 ? "service" : "services"} available
                {nearMeActive && locationLabel && (
                  <span className="text-violet-600"> near {locationLabel}</span>
                )}
              </p>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 12 }).map((_, i) => (
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
          </main>
        </div>
      </div>
    </div>
  );
}
