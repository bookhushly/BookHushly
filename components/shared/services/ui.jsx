"use client";

import React, { memo } from "react";
import { Search } from "lucide-react";

export const SkeletonCard = memo(() => (
  <div className="rounded-xl overflow-hidden bg-white border border-gray-100 animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
      <div className="h-4 w-full bg-gray-200 rounded" />
      <div className="h-6 w-24 bg-gray-200 rounded" />
    </div>
  </div>
));

SkeletonCard.displayName = "SkeletonCard";

export const EmptyState = memo(({ title, subtitle, icon: Icon = Search }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="h-16 w-16 flex items-center justify-center rounded-full bg-purple-100 mb-4">
      <Icon className="h-8 w-8 text-purple-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
));

EmptyState.displayName = "EmptyState";
