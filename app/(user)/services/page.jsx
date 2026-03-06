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
import { SCATEGORIES } from "@/lib/constants";
import { useListingsData } from "@/hooks/useListingsData";
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
  const [activeCategory, setActiveCategory] = useState(initial);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
      });
    }
  }, [searchParams, activeCategory]);

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
  }, []);

  const handleFiltersChange = useCallback((f) => {
    startTransition(() => setFilters(f));
  }, []);

  // Redirect spinner
  if (isBookHushly) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f5f3ff" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(160deg, #f5f3ff 0%, #fdf8ff 45%, #faf5ff 100%)",
      }}
    >
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
