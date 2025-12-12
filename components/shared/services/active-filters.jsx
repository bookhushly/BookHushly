"use client";

import React, { useMemo, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const ActiveFilters = memo(({ filters, onRemoveFilter }) => {
  const activeFilters = useMemo(() => {
    const items = [];
    if (filters.price_min || filters.price_max) {
      items.push({
        key: "price",
        label: `₦${(filters.price_min || 0).toLocaleString()} - ₦${(filters.price_max || 1000000).toLocaleString()}`,
        onRemove: () => onRemoveFilter("price", null),
      });
    }
    return items;
  }, [filters, onRemoveFilter]);

  if (!activeFilters.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="flex items-center gap-2 px-3 py-1"
        >
          {filter.label}
          <button onClick={filter.onRemove}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
});

ActiveFilters.displayName = "ActiveFilters";

export default ActiveFilters;
