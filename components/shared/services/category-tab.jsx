// components/shared/services/category-tab.jsx
"use client";

import React, { useCallback, memo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SCATEGORIES } from "@/lib/constants";
import SearchFilters from "./search";

const BOOKHUSHLY_SERVICES = ["logistics", "security"];

const CategoryTabs = memo(
  ({ activeCategory, setActiveCategory, categoryLabel, onSearchResults }) => {
    const router = useRouter();
    const scrollRef = useRef(null);

    const handleCategoryChange = useCallback(
      (value) => {
        if (BOOKHUSHLY_SERVICES.includes(value)) {
          router.push(`/quote-services?tab=${value}`);
          return;
        }
        setActiveCategory(value);
        const url = new URL(window.location.href);
        url.searchParams.set("category", value);
        router.push(url.pathname + url.search, { scroll: false });
      },
      [setActiveCategory, router],
    );

    useEffect(() => {
      if (!scrollRef.current) return;
      const active = scrollRef.current.querySelector('[data-active="true"]');
      if (active)
        active.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
    }, [activeCategory]);

    const activeLabel =
      SCATEGORIES.find((c) => c.value === activeCategory)?.label || "Services";

    return (
      <div className="bg-white/80 backdrop-blur-sm border-b border-violet-100 shadow-[0_1px_12px_rgba(124,58,237,0.06)] pt-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="pt-10 pb-7">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-600 mb-3">
              Browse Services
            </p>
            <h1 className="font-fraunces text-4xl sm:text-5xl font-semibold text-gray-900 leading-[1.1]">
              {activeLabel}
            </h1>
          </div>

          {/* Category pills */}
          <div
            ref={scrollRef}
            className="flex gap-1 overflow-x-auto scrollbar-none"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          >
            {SCATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value;
              const isDirect = BOOKHUSHLY_SERVICES.includes(cat.value);

              return (
                <button
                  key={cat.value}
                  data-active={isActive}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`relative flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-150 whitespace-nowrap border-b-2 rounded-t-lg ${
                    isActive
                      ? "text-violet-700 border-b-violet-600 bg-violet-50"
                      : "text-gray-500 border-b-transparent hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <span className={isActive ? "opacity-100" : "opacity-50"}>
                    {cat.icon}
                  </span>
                  {cat.label}
                  {isDirect && (
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isActive
                          ? "bg-violet-200 text-violet-700"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      Direct
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
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
