// components/shared/services/quick-chips.jsx
"use client";

import { memo } from "react";

const CHIPS = {
  hotels: [
    { id: "gen",   label: "Has Generator",      filterKey: "hotel_has_generator", value: true },
    { id: "bfast", label: "Breakfast Included",  filterKey: "breakfast_offered",   value: "included" },
    { id: "bud",   label: "Budget (<₦15k)",      filterKey: "price_max",           value: 15000 },
    { id: "mid",   label: "Mid-range",            filterKeys: { price_min: 15000, price_max: 50000 } },
    { id: "pool",  label: "Pool",                filterKey: "amenities",           arrayValue: ["waves"] },
    { id: "wifi",  label: "Free WiFi",            filterKey: "amenities",           arrayValue: ["wifi"] },
    { id: "gym",   label: "Gym",                 filterKey: "amenities",           arrayValue: ["dumbbell"] },
  ],
  serviced_apartments: [
    { id: "gen",     label: "Generator",         filterKey: "generator_available", value: true },
    { id: "inv",     label: "Inverter",           filterKey: "inverter_available",  value: true },
    { id: "util",    label: "All Utilities",      filterKey: "utilities_included",  value: true },
    { id: "wifi",    label: "WiFi Included",      filterKey: "internet_included",   value: true },
    { id: "studio",  label: "Studio",             filterKey: "apartment_type",      value: "studio" },
    { id: "2bed",    label: "2+ Bedrooms",        filterKey: "bedrooms",            value: 2 },
    { id: "instant", label: "Instant Booking",   filterKey: "instant_booking",     value: true },
  ],
  events: [
    { id: "bud100",  label: "Under ₦100k",       filterKey: "price_max",  value: 100000 },
    { id: "mid",     label: "₦100k–₦500k",       filterKeys: { price_min: 100000, price_max: 500000 } },
    { id: "big",     label: "200+ capacity",     filterKey: "capacity",   value: 200 },
    { id: "small",   label: "Intimate (<50)",     filterKey: "capacity",   value: 10 },
    { id: "wed",     label: "Wedding-ready",      filterKey: "capacity",   value: 100 },
  ],
};

function isChipActive(chip, filters) {
  if (chip.filterKeys) {
    return Object.entries(chip.filterKeys).every(([k, v]) => filters[k] === v);
  }
  if (chip.arrayValue) {
    const arr = filters[chip.filterKey] || [];
    return chip.arrayValue.every((v) => arr.includes(v));
  }
  return filters[chip.filterKey] === chip.value;
}

function toggleChip(chip, filters) {
  const active = isChipActive(chip, filters);
  const next = { ...filters };

  if (active) {
    if (chip.filterKeys) {
      Object.keys(chip.filterKeys).forEach((k) => delete next[k]);
    } else if (chip.arrayValue) {
      const arr = next[chip.filterKey] || [];
      next[chip.filterKey] = arr.filter((v) => !chip.arrayValue.includes(v));
      if (!next[chip.filterKey].length) delete next[chip.filterKey];
    } else {
      delete next[chip.filterKey];
    }
  } else {
    if (chip.filterKeys) {
      Object.assign(next, chip.filterKeys);
    } else if (chip.arrayValue) {
      next[chip.filterKey] = [...new Set([...(next[chip.filterKey] || []), ...chip.arrayValue])];
    } else {
      next[chip.filterKey] = chip.value;
    }
  }

  return next;
}

const QuickChips = memo(function QuickChips({ category, filters, onFiltersChange }) {
  const chips = CHIPS[category];
  if (!chips) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
      {chips.map((chip) => {
        const active = isChipActive(chip, filters);
        return (
          <button
            key={chip.id}
            onClick={() => onFiltersChange(toggleChip(chip, filters))}
            className={`flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
              active
                ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-700"
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
});

export default QuickChips;
