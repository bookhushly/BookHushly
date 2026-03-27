"use client";

import React, { memo, Suspense } from "react";
import dynamic from "next/dynamic";
import { Search, Shield, Navigation } from "lucide-react";
import { SkeletonCard, EmptyState } from "./ui";

const ServiceCardWrapper = dynamic(
  () => import("@/components/shared/listings/details/ServiceCardWrapper"),
  {
    loading: () => <SkeletonCard />,
    ssr: false,
  },
);

const PROXIMITY_STYLE = {
  city:     "bg-green-100 text-green-700 border-green-200",
  state:    "bg-violet-100 text-violet-700 border-violet-200",
  national: "bg-gray-100 text-gray-500 border-gray-200",
};
const PROXIMITY_LABEL = {
  city:     "In your city",
  state:    "In your state",
  national: "Other location",
};

function ProximityBadge({ proximity }) {
  if (!proximity || !PROXIMITY_STYLE[proximity]) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-1.5 ${PROXIMITY_STYLE[proximity]}`}>
      <Navigation className="h-2.5 w-2.5" />
      {PROXIMITY_LABEL[proximity]}
    </span>
  );
}

const ListingsGrid = memo(
  ({
    listings,
    fetchError,
    isLoadingMore,
    lastListingRef,
    nearMeActive,
    hasActiveFilters,
    onClearFilters,
  }) => {
    if (fetchError) {
      return (
        <EmptyState
          title="Failed to load services"
          subtitle="Check your connection and try again."
          icon={Shield}
        />
      );
    }

    if (!listings.length && !isLoadingMore) {
      return (
        <EmptyState
          title="No results found"
          subtitle={
            hasActiveFilters
              ? "No services match your current filters."
              : "There are no listings in this category yet."
          }
          icon={Search}
          hasFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
        />
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {listings.map((service, index) => (
            <div
              key={service.id}
              ref={index === listings.length - 1 ? lastListingRef : null}
              className="flex flex-col h-full"
            >
              {nearMeActive && <ProximityBadge proximity={service.proximity} />}
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
  },
);

ListingsGrid.displayName = "ListingsGrid";

export default ListingsGrid;
