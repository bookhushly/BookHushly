// components/shared/services/active-filters.jsx
"use client";

import React from "react";
import { X } from "lucide-react";
import {
  AMENITY_ICONS,
  APARTMENT_TYPES,
  WATER_SUPPLY_OPTIONS,
  SECURITY_FEATURES,
} from "@/lib/constants/filters";

const buildFilterLabels = (filters) => {
  const labels = [];

  if (filters.price_min || filters.price_max) {
    const parts = [];
    if (filters.price_min)
      parts.push(`From ₦${filters.price_min.toLocaleString()}`);
    if (filters.price_max)
      parts.push(`To ₦${filters.price_max.toLocaleString()}`);
    labels.push({ key: "price", label: parts.join(" – ") });
  }
  if (filters.state) labels.push({ key: "state", label: filters.state });
  if (filters.city) labels.push({ key: "city", label: filters.city });
  if (filters.apartment_type) {
    const t = APARTMENT_TYPES.find((t) => t.value === filters.apartment_type);
    labels.push({
      key: "apartment_type",
      label: t?.label || filters.apartment_type,
    });
  }
  if (filters.bedrooms)
    labels.push({ key: "bedrooms", label: `${filters.bedrooms}+ Beds` });
  if (filters.bathrooms)
    labels.push({ key: "bathrooms", label: `${filters.bathrooms}+ Baths` });
  if (filters.max_guests)
    labels.push({ key: "max_guests", label: `${filters.max_guests}+ Guests` });
  if (filters.parking_spaces)
    labels.push({
      key: "parking_spaces",
      label: `${filters.parking_spaces}+ Parking`,
    });
  if (filters.capacity)
    labels.push({ key: "capacity", label: `${filters.capacity}+ Capacity` });

  if (filters.furnished === true)
    labels.push({ key: "furnished", label: "Furnished" });
  if (filters.furnished === false)
    labels.push({ key: "furnished", label: "Unfurnished" });
  if (filters.utilities_included === true)
    labels.push({ key: "utilities_included", label: "Utilities Incl." });
  if (filters.utilities_included === false)
    labels.push({ key: "utilities_included", label: "No Utilities" });
  if (filters.internet_included === true)
    labels.push({ key: "internet_included", label: "WiFi Incl." });
  if (filters.internet_included === false)
    labels.push({ key: "internet_included", label: "No WiFi" });

  if (filters.generator_available)
    labels.push({ key: "generator_available", label: "Generator" });
  if (filters.inverter_available)
    labels.push({ key: "inverter_available", label: "Inverter" });
  if (filters.solar_power)
    labels.push({ key: "solar_power", label: "Solar Power" });

  if (filters.water_supply) {
    const w = WATER_SUPPLY_OPTIONS.find(
      (w) => w.value === filters.water_supply,
    );
    labels.push({
      key: "water_supply",
      label: w?.label || filters.water_supply,
    });
  }

  (filters.amenities || []).forEach((val) => {
    const a = AMENITY_ICONS.find((a) => a.value === val);
    if (a)
      labels.push({
        key: `amenity_${val}`,
        label: a.label,
        removeKey: "amenities",
        removeValue: val,
      });
  });

  (filters.security_features || []).forEach((val) => {
    const f = SECURITY_FEATURES.find((f) => f.value === val);
    if (f)
      labels.push({
        key: `security_${val}`,
        label: f.label,
        removeKey: "security_features",
        removeValue: val,
      });
  });

  return labels;
};

const ActiveFilters = ({ filters, onRemoveFilter }) => {
  const labels = buildFilterLabels(filters);
  if (!labels.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {labels.map((f) => (
        <span
          key={f.key}
          className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-full"
        >
          {f.label}
          <button
            onClick={() => {
              if (f.removeKey && f.removeValue) {
                const updated = (filters[f.removeKey] || []).filter(
                  (v) => v !== f.removeValue,
                );
                onRemoveFilter(f.removeKey, updated.length ? updated : null);
              } else {
                onRemoveFilter(f.key);
              }
            }}
            className="h-4 w-4 flex items-center justify-center rounded-full hover:bg-violet-200 transition-colors"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
    </div>
  );
};

export default ActiveFilters;
