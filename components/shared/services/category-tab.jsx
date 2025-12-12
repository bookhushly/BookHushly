"use client";

import React, { useCallback, memo, startTransition } from "react";
import { useRouter } from "next/navigation";
import { SCATEGORIES } from "@/lib/constants";

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

export default CategoryTabs;
