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
import { MapPin, LocateFixed, X, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SCATEGORIES } from "@/lib/constants";
import { useListingsData } from "@/hooks/useListingsData";
import { useGeolocation } from "@/hooks/useGeolocation";
import CategoryTabs from "@/components/shared/services/category-tab";
import FilterPanel from "@/components/shared/services/filter";
import ActiveFilters from "@/components/shared/services/active-filters";
import ListingsGrid from "@/components/shared/services/listings-grid";
import SmartQuestions from "@/components/shared/services/smart-questions";
import QuickChips from "@/components/shared/services/quick-chips";
import { SkeletonCard, EventCardSkeleton } from "@/components/shared/services/ui";

const BOOKHUSHLY_SERVICES = ["logistics", "security"];

// ── Sort control ──────────────────────────────────────────────────────────────
function SortControl({ sort, onSortChange }) {
  return (
    <Select value={sort} onValueChange={onSortChange}>
      <SelectTrigger className="h-8 text-xs w-40 border-gray-200 bg-white gap-1">
        <ArrowUpDown className="h-3 w-3 text-gray-400 shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="newest">Newest first</SelectItem>
        <SelectItem value="price_asc">Price: Low → High</SelectItem>
        <SelectItem value="price_desc">Price: High → Low</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initial = searchParams.get("category") || SCATEGORIES[0].value;
  const urlCity = searchParams.get("city") || null;

  const [activeCategory, setActiveCategory] = useState(initial);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(() =>
    urlCity ? { city: urlCity } : {},
  );
  const [sort, setSort] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [nearMeActive, setNearMeActive] = useState(!!urlCity);
  const [nearMeBannerDismissed, setNearMeBannerDismissed] = useState(false);

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

  // When geo resolves and near-me was activated, push city + state into filters
  useEffect(() => {
    if (nearMeActive && geo.granted && (geo.city || geo.state)) {
      startTransition(() => {
        setFilters((prev) => ({
          ...prev,
          city: geo.city || undefined,
          state: geo.state || undefined,
          nearMe: true,
        }));
      });
    }
  }, [nearMeActive, geo.granted, geo.city, geo.state]);

  const clearNearMeFilters = useCallback((prev) => {
    const next = { ...prev };
    delete next.city;
    delete next.state;
    delete next.nearMe;
    return next;
  }, []);

  const handleNearMeToggle = useCallback(() => {
    if (nearMeActive) {
      setNearMeActive(false);
      setFilters(clearNearMeFilters);
      return;
    }
    setNearMeActive(true);
    setNearMeBannerDismissed(true);
    if (!geo.granted) {
      geo.requestLocation();
    } else if (geo.city || geo.state) {
      startTransition(() => {
        setFilters((prev) => ({
          ...prev,
          city: geo.city || undefined,
          state: geo.state || undefined,
          nearMe: true,
        }));
      });
    }
  }, [nearMeActive, geo, clearNearMeFilters]);

  const categoryLabel = useMemo(
    () =>
      SCATEGORIES.find((c) => c.value === activeCategory)?.label || "Services",
    [activeCategory],
  );

  const {
    listings,
    loading,
    fetchError,
    isLoadingMore,
    hasMore,
    lastListingRef,
    totalCount,
  } = useListingsData(activeCategory, searchQuery, filters, sort);

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
        setSort("newest");
        router.push(`/services?category=${cat}`, { scroll: false });
      });
    },
    [router],
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
    if (key === "city" || key === "state") {
      setNearMeActive(false);
      setFilters((prev) => {
        const n = { ...prev };
        delete n.nearMe;
        return n;
      });
    }
  }, []);

  const handleFiltersChange = useCallback((f) => {
    startTransition(() => {
      setFilters(f);
      setNearMeActive(false);
    });
  }, []);

  const handleQuickFilters = useCallback((f) => {
    startTransition(() => setFilters(f));
  }, []);

  const handleLocationChange = useCallback(() => {
    setNearMeActive(false);
    setFilters((prev) => {
      const next = { ...prev };
      delete next.nearMe;
      return next;
    });
  }, []);

  const locationLabel = nearMeActive
    ? [geo.city, geo.state].filter(Boolean).join(", ")
    : null;

  const hasActiveFilters = Object.keys(filters).some(
    (k) => k !== "nearMe" && filters[k] !== null && filters[k] !== undefined,
  );

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
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Proactive near-me banner */}
        {!nearMeActive &&
          !geo.granted &&
          !geo.error &&
          !nearMeBannerDismissed && (
            <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-violet-50 border border-violet-100 rounded-xl">
              <MapPin className="h-4 w-4 text-violet-600 shrink-0" />
              <p className="text-sm text-gray-700 flex-1">
                Find{" "}
                <span className="font-medium text-violet-700">
                  {categoryLabel.toLowerCase()}
                </span>{" "}
                near you
              </p>
              <button
                onClick={handleNearMeToggle}
                className="text-sm font-semibold text-violet-700 hover:text-violet-900 transition-colors shrink-0"
              >
                Enable location →
              </button>
              <button
                onClick={() => setNearMeBannerDismissed(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop sidebar filter */}
          <aside className="hidden lg:block lg:w-72 xl:w-80 shrink-0">
            <FilterPanel
              category={activeCategory}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onLocationChange={handleLocationChange}
              isOpen={true}
              onToggle={() => {}}
              isMobile={false}
            />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Mobile filter trigger */}
            <div className="lg:hidden mb-4">
              <FilterPanel
                category={activeCategory}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                isOpen={isFilterOpen}
                onToggle={() => setIsFilterOpen((p) => !p)}
                onLocationChange={handleLocationChange}
                isMobile={true}
                totalCount={totalCount}
              />
            </div>

            {/* Location + near-me bar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
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
                Near me
              </button>

              {nearMeActive && locationLabel && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200">
                  <MapPin className="h-3 w-3" />
                  {locationLabel}
                  <button
                    onClick={() => {
                      geo.clearLocation();
                      setNearMeActive(false);
                      setFilters(clearNearMeFilters);
                    }}
                    className="ml-0.5 hover:text-violet-900 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {nearMeActive && geo.error && (
                <span className="text-xs text-red-500">{geo.error}</span>
              )}
            </div>

            {/* Smart contextual questions */}
            <SmartQuestions
              category={activeCategory}
              filters={filters}
              onFiltersChange={handleQuickFilters}
            />

            {/* Popular quick-filter chips */}
            <QuickChips
              category={activeCategory}
              filters={filters}
              onFiltersChange={handleQuickFilters}
            />

            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              nearMeActive={nearMeActive}
            />

            {/* Results count + sort */}
            {!loading && (
              <div className="flex items-center justify-between gap-3 mb-5">
                <p className="text-sm text-gray-500">
                  {listings.length > 0 ? (
                    <>
                      <span className="font-semibold text-gray-900">
                        {totalCount}
                      </span>{" "}
                      {totalCount === 1 ? "result" : "results"}
                      {nearMeActive && locationLabel && (
                        <span className="text-violet-600">
                          {" "}near {locationLabel}
                        </span>
                      )}
                    </>
                  ) : null}
                </p>
                <SortControl sort={sort} onSortChange={setSort} />
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {Array.from({ length: 12 }).map((_, i) =>
                  activeCategory === "events" ? (
                    <EventCardSkeleton key={i} />
                  ) : (
                    <SkeletonCard key={i} />
                  )
                )}
              </div>
            ) : (
              <ListingsGrid
                listings={listings}
                fetchError={fetchError}
                isLoadingMore={isLoadingMore}
                lastListingRef={lastListingRef}
                nearMeActive={nearMeActive}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={() => {
                  setFilters({});
                  setNearMeActive(false);
                }}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
