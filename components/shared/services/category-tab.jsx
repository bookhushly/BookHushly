// components/shared/services/category-tab.jsx
"use client";

import React, { useCallback, memo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SCATEGORIES } from "@/lib/constants";
import SearchFilters from "./search";
import { Badge } from "@/components/ui/badge";

const BOOKHUSHLY_SERVICES = ["logistics", "security"];

const CategoryTabs = memo(
  ({ activeCategory, setActiveCategory, categoryLabel, onSearchResults }) => {
    const router = useRouter();
    const scrollContainerRef = useRef(null);

    const handleCategoryChange = useCallback(
      (categoryValue) => {
        // Check if it's a BookHushly service
        if (BOOKHUSHLY_SERVICES.includes(categoryValue)) {
          router.push(`/quote-services?tab=${categoryValue}`);
          return;
        }

        setActiveCategory(categoryValue);
        const url = new URL(window.location);
        url.searchParams.set("category", categoryValue);
        router.push(url.pathname + url.search, { scroll: false });
      },
      [setActiveCategory, router],
    );

    // Auto-scroll active category into view
    useEffect(() => {
      if (scrollContainerRef.current) {
        const activeButton = scrollContainerRef.current.querySelector(
          '[data-active="true"]',
        );
        if (activeButton) {
          activeButton.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
      }
    }, [activeCategory]);

    const activeLabel =
      SCATEGORIES.find((cat) => cat.value === activeCategory)?.label ||
      "All Services";

    return (
      <div className="bg-gradient-to-r from-[#2E004F] via-[#5C0077] to-[#8F33B0] border-b border-gray-200 pt-12">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Hero Section */}
          <div className="pt-8 sm:pt-12 pb-6 sm:pb-8 text-center">
            <h1 className="text-4xl sm:text-4xl md:text-5xl font-bold text-gray-50 mb-2 transition-all duration-500 ease-out">
              {activeLabel}
            </h1>
            <p className="text-sm sm:text-base text-gray-100 font-medium">
              Premium quality services across Nigeria
            </p>
          </div>

          {/* Category Selector */}
          <div
            ref={scrollContainerRef}
            className="flex md:justify-center gap-2 sm:gap-3 pb-6 sm:pb-8 overflow-x-auto snap-x snap-mandatory md:snap-none scrollbar-hide px-1"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {SCATEGORIES.map((category) => {
              const isActive = activeCategory === category.value;
              const isBookHushly = BOOKHUSHLY_SERVICES.includes(category.value);

              return (
                <button
                  key={category.value}
                  data-active={isActive}
                  onClick={() => handleCategoryChange(category.value)}
                  className={`snap-center flex-shrink-0 flex flex-col items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-4 md:py-3 rounded-2xl md:rounded-full min-w-[100px] md:min-w-0 transition-all duration-300 ease-out active:scale-95 relative ${
                    isActive
                      ? "bg-purple-600 text-white shadow-xl shadow-purple-600/40"
                      : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-200 hover:border-purple-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`transition-all duration-300 ease-out ${
                        isActive ? "text-white scale-110" : "text-purple-600"
                      }`}
                    >
                      {category.icon}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-center md:text-left leading-tight whitespace-nowrap">
                      {category.label}
                    </span>
                  </div>

                  {/* BookHushly Badge */}
                  {isBookHushly && (
                    <Badge
                      className={`absolute -top-2 -right-2 text-[10px] px-2 py-0.5 ${
                        isActive
                          ? "bg-white text-purple-600"
                          : "bg-purple-600 text-white"
                      }`}
                    >
                      Direct
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Only show search for non-BookHushly services */}
        {!BOOKHUSHLY_SERVICES.includes(activeCategory) && (
          <SearchFilters
            categoryLabel={categoryLabel}
            onSearchResults={onSearchResults}
          />
        )}
      </div>
    );
  },
);

CategoryTabs.displayName = "CategoryTabs";

export default CategoryTabs;
