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
import { Toaster } from "react-hot-toast";
import { SCATEGORIES, isBookHushlyService } from "@/lib/constants";
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
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const initialCategory = searchParams.get("category") || SCATEGORIES[0].value;
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const isBookHushlyServiceCategory =
    BOOKHUSHLY_SERVICES.includes(activeCategory);

  // SEO: Update document title and meta description dynamically
  useEffect(() => {
    const category = SCATEGORIES.find((c) => c.value === activeCategory);
    if (!category) return;

    const title = `${category.label} in Nigeria | BookHushly`;
    const description = `Find the best ${category.label.toLowerCase()} services in Nigeria. Browse verified providers, compare prices, and book instantly on BookHushly.`;

    document.title = title;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = title;

    let ogDescription = document.querySelector(
      'meta[property="og:description"]',
    );
    if (!ogDescription) {
      ogDescription = document.createElement("meta");
      ogDescription.setAttribute("property", "og:description");
      document.head.appendChild(ogDescription);
    }
    ogDescription.content = description;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `https://bookhushly.com/services?category=${activeCategory}`;
  }, [activeCategory]);

  // Redirect to quote page for BookHushly services
  useEffect(() => {
    if (isBookHushlyServiceCategory) {
      router.push(`/quote-services?tab=${activeCategory}`);
    }
  }, [isBookHushlyServiceCategory, activeCategory, router]);

  // Sync URL with category
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    if (
      urlCategory &&
      urlCategory !== activeCategory &&
      !BOOKHUSHLY_SERVICES.includes(urlCategory)
    ) {
      startTransition(() => {
        setActiveCategory(urlCategory);
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
    (category) => {
      if (BOOKHUSHLY_SERVICES.includes(category)) {
        router.push(`/quote-services?tab=${category}`);
        return;
      }

      startTransition(() => {
        setActiveCategory(category);
        setFilters({});
        setSearchQuery("");
        router.push(`/services?category=${category}`, { scroll: false });
      });
    },
    [router],
  );

  const handleRemoveFilter = useCallback((filterKey, newValue) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (filterKey === "price") {
        delete newFilters.price_min;
        delete newFilters.price_max;
      } else if (newValue !== undefined) {
        // For array filters, set the new value
        if (newValue === null) {
          delete newFilters[filterKey];
        } else {
          newFilters[filterKey] = newValue;
        }
      } else {
        delete newFilters[filterKey];
      }
      return newFilters;
    });
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    startTransition(() => {
      setFilters(newFilters);
    });
  }, []);

  if (isBookHushlyServiceCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `${categoryLabel} Services in Nigeria`,
            description: `Browse and book ${categoryLabel.toLowerCase()} services across Nigeria. Verified providers, instant booking, secure payments.`,
            url: `https://bookhushly.com/services?category=${activeCategory}`,
            provider: {
              "@type": "Organization",
              name: "BookHushly",
              url: "https://bookhushly.com",
              logo: "https://bookhushly.com/logo.png",
            },
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "NGN",
              offerCount: totalCount || 0,
            },
          }),
        }}
      />

      <CategoryTabs
        activeCategory={activeCategory}
        categoryLabel={categoryLabel}
        setActiveCategory={handleCategoryChange}
      />

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <aside className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
            <FilterPanel
              category={activeCategory}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isOpen={true}
              onToggle={() => {}}
              isMobile={false}
            />
          </aside>

          <main className="flex-1 min-w-0">
            <div className="lg:hidden">
              <FilterPanel
                category={activeCategory}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                isOpen={isFilterOpen}
                onToggle={() => setIsFilterOpen(!isFilterOpen)}
                isMobile={true}
              />
            </div>

            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
            />

            <h1 className="sr-only">
              {categoryLabel} Services in Nigeria - Book Online
            </h1>

            {!loading && listings.length > 0 && (
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600 text-sm md:text-base">
                  <span itemProp="numberOfItems">{totalCount}</span>{" "}
                  {totalCount === 1 ? "service" : "services"} available
                </p>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                {[...Array(20)].map((_, i) => (
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

      <footer className="bg-white border-t mt-16 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-600 max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              About {categoryLabel} Services on BookHushly
            </h2>
            <p className="mb-4">
              BookHushly connects you with verified{" "}
              {categoryLabel.toLowerCase()} providers across Nigeria. Whether
              you're in Lagos, Abuja, Port Harcourt, or any other Nigerian city,
              find quality services with transparent pricing, instant booking,
              and secure payment options.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                Verified Providers
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                Instant Booking
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                Secure Payments
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                24/7 Support
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
