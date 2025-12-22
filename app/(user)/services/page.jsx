"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useDeferredValue,
  startTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { SCATEGORIES } from "@/lib/constants";
import { useListingsData } from "@/hooks/useListingsData";
import { useWindowSize } from "@/hooks/useWindowSize";
import CategoryTabs from "@/components/shared/services/category-tab";
import FilterPanel from "@/components/shared/services/filter";
import ActiveFilters from "@/components/shared/services/active-filters";
import ListingsGrid from "@/components/shared/services/listings-grid";
import { SkeletonCard } from "@/components/shared/services/ui";

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get("category") || SCATEGORIES[0].value;
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [activeSearchFilters, setActiveSearchFilters] = useState(null);

  const deferredQuery = useDeferredValue(searchQuery);
  const deferredFilters = useDeferredValue(filters);
  const isMobile = useWindowSize();

  useEffect(() => {
    const urlCategory = searchParams.get("category");
    if (urlCategory && urlCategory !== activeCategory) {
      startTransition(() => {
        setActiveCategory(urlCategory);
        setFilters({});
        setSearchResults(null);
        setActiveSearchFilters(null);
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
  } = useListingsData(activeCategory, deferredQuery, deferredFilters);

  // Use search results if available, otherwise use regular listings
  const displayListings = searchResults || listings;

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

  const handleSearchResults = useCallback((results, searchFilters) => {
    setSearchResults(results);
    setActiveSearchFilters(searchFilters);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchResults(null);
    setActiveSearchFilters(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <CategoryTabs
        activeCategory={activeCategory}
        categoryLabel={categoryLabel}
        setActiveCategory={setActiveCategory}
        onSearchResults={handleSearchResults}
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

            {/* Show search status if search is active */}
            {searchResults && (
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600 text-sm">
                  Search results: {searchResults.length}{" "}
                  {searchResults.length === 1 ? "service" : "services"} found
                </p>
                <button
                  onClick={handleClearSearch}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear search
                </button>
              </div>
            )}

            {!loading && !searchResults && (
              <div className="mb-6">
                <p className="text-gray-600 text-sm">
                  {listings.length}{" "}
                  {listings.length === 1 ? "service" : "services"} found
                </p>
              </div>
            )}

            {loading && !searchResults ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(16)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <ListingsGrid
                listings={displayListings}
                fetchError={fetchError}
                isLoadingMore={searchResults ? false : isLoadingMore}
                lastListingRef={searchResults ? null : lastListingRef}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
