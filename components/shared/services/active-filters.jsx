// components/shared/services/active-filters.jsx
"use client";

import React, { useMemo, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { X, DollarSign, MapPin, Bed, Bath, Users, Home } from "lucide-react";

const APARTMENT_TYPE_LABELS = {
  studio: "Studio",
  "1_bedroom": "1 Bedroom",
  "2_bedroom": "2 Bedroom",
  "3_bedroom": "3 Bedroom",
  penthouse: "Penthouse",
};

const ActiveFilters = memo(({ filters, onRemoveFilter }) => {
  const activeFilters = useMemo(() => {
    const items = [];

    // Price range
    if (filters.price_min || filters.price_max) {
      items.push({
        key: "price",
        icon: <DollarSign className="h-3 w-3" />,
        label: `₦${(filters.price_min || 0).toLocaleString()} - ₦${(filters.price_max || "∞").toLocaleString()}`,
        onRemove: () => onRemoveFilter("price"),
      });
    }

    // Location filters
    if (filters.state) {
      items.push({
        key: "state",
        icon: <MapPin className="h-3 w-3" />,
        label: filters.state,
        onRemove: () => onRemoveFilter("state"),
      });
    }

    if (filters.city) {
      items.push({
        key: "city",
        icon: <MapPin className="h-3 w-3" />,
        label: filters.city,
        onRemove: () => onRemoveFilter("city"),
      });
    }

    // Apartment type
    if (filters.apartment_type) {
      items.push({
        key: "apartment_type",
        icon: <Home className="h-3 w-3" />,
        label:
          APARTMENT_TYPE_LABELS[filters.apartment_type] ||
          filters.apartment_type,
        onRemove: () => onRemoveFilter("apartment_type"),
      });
    }

    // Bedrooms
    if (filters.bedrooms) {
      items.push({
        key: "bedrooms",
        icon: <Bed className="h-3 w-3" />,
        label: `${filters.bedrooms}+ Beds`,
        onRemove: () => onRemoveFilter("bedrooms"),
      });
    }

    // Bathrooms
    if (filters.bathrooms) {
      items.push({
        key: "bathrooms",
        icon: <Bath className="h-3 w-3" />,
        label: `${filters.bathrooms}+ Baths`,
        onRemove: () => onRemoveFilter("bathrooms"),
      });
    }

    // Max guests
    if (filters.max_guests) {
      items.push({
        key: "max_guests",
        icon: <Users className="h-3 w-3" />,
        label: `${filters.max_guests}+ Guests`,
        onRemove: () => onRemoveFilter("max_guests"),
      });
    }

    // Capacity (events)
    if (filters.capacity) {
      items.push({
        key: "capacity",
        icon: <Users className="h-3 w-3" />,
        label: `${filters.capacity}+ Capacity`,
        onRemove: () => onRemoveFilter("capacity"),
      });
    }

    return items;
  }, [filters, onRemoveFilter]);

  if (!activeFilters.length) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-700">
          Active Filters:
        </span>
        <span className="text-xs text-gray-500">({activeFilters.length})</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <Badge
            key={filter.key}
            variant="secondary"
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
          >
            {filter.icon}
            {filter.label}
            <button
              onClick={filter.onRemove}
              className="ml-1 hover:text-purple-900 transition-colors"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
});

ActiveFilters.displayName = "ActiveFilters";

export default ActiveFilters;
