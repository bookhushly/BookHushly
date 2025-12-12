"use client";

import React, { memo, Suspense } from "react";
import dynamic from "next/dynamic";
import { Search, Shield } from "lucide-react";
import { SkeletonCard, EmptyState } from "./ui";

const ServiceCardWrapper = dynamic(
  () => import("@/components/shared/listings/details/ServiceCardWrapper"),
  {
    loading: () => <SkeletonCard />,
    ssr: false,
  }
);

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

export default ListingsGrid;
