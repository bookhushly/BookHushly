"use client";

import React, { memo } from "react";
import { Search } from "lucide-react";

export const SkeletonCard = memo(() => (
  <div className="rounded-xl overflow-hidden bg-white border border-gray-100 animate-pulse">
    <div className="h-36 sm:h-48 bg-gray-200" />
    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
      <div className="h-3 w-full bg-gray-200 rounded" />
      <div className="h-5 w-24 bg-gray-200 rounded" />
    </div>
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

export const EventCardSkeleton = memo(() => (
  <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 animate-pulse h-full flex flex-col">
    {/* image */}
    <div className="h-36 sm:h-52 bg-gray-200 relative">
      <div className="absolute top-3 left-3 h-5 w-12 bg-gray-300 rounded-lg" />
    </div>
    {/* body */}
    <div className="p-3 sm:p-4 flex-1 flex flex-col gap-2.5">
      <div className="h-3 w-24 bg-gray-200 rounded" />
      <div className="h-4 w-5/6 bg-gray-200 rounded" />
      <div className="h-3 w-4/6 bg-gray-200 rounded" />
      {/* countdown placeholder */}
      <div className="rounded-xl overflow-hidden border border-gray-100 mt-1">
        <div className="h-5 bg-gray-200" />
        <div className="h-12 bg-gray-100 flex gap-2 items-center justify-center px-2">
          {[0,1,2,3].map(i => (
            <div key={i} className="w-8 h-8 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
      {/* price + CTA */}
      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="h-6 w-20 bg-gray-200 rounded" />
        <div className="h-9 w-28 bg-gray-200 rounded-xl" />
      </div>
    </div>
  </div>
));
EventCardSkeleton.displayName = "EventCardSkeleton";

export const EmptyState = memo(
  ({ title, subtitle, icon: Icon = Search, hasFilters, onClearFilters }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="h-16 w-16 flex items-center justify-center rounded-full bg-purple-100 mb-4">
        <Icon className="h-8 w-8 text-purple-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-5 max-w-xs">{subtitle}</p>
      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  ),
);
EmptyState.displayName = "EmptyState";
