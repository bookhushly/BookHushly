// components/shared/services/active-filters.jsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  AMENITY_ICONS,
  APARTMENT_TYPES,
  WATER_SUPPLY_OPTIONS,
  SECURITY_FEATURES,
} from "@/lib/constants/filters";

const ActiveFilters = ({ filters, onRemoveFilter }) => {
  const filterLabels = [];

  // Price filters
  if (filters.price_min || filters.price_max) {
    const priceLabel = [];
    if (filters.price_min)
      priceLabel.push(`From ₦${filters.price_min.toLocaleString()}`);
    if (filters.price_max)
      priceLabel.push(`To ₦${filters.price_max.toLocaleString()}`);
    filterLabels.push({
      key: "price",
      label: priceLabel.join(" - "),
    });
  }

  // Location filters
  if (filters.state) {
    filterLabels.push({ key: "state", label: filters.state });
  }
  if (filters.city) {
    filterLabels.push({ key: "city", label: filters.city });
  }

  // Apartment type
  if (filters.apartment_type) {
    const type = APARTMENT_TYPES.find(
      (t) => t.value === filters.apartment_type,
    );
    filterLabels.push({
      key: "apartment_type",
      label: type?.label || filters.apartment_type,
    });
  }

  // Number filters
  if (filters.bedrooms) {
    filterLabels.push({
      key: "bedrooms",
      label: `${filters.bedrooms}+ Bedrooms`,
    });
  }
  if (filters.bathrooms) {
    filterLabels.push({
      key: "bathrooms",
      label: `${filters.bathrooms}+ Bathrooms`,
    });
  }
  if (filters.max_guests) {
    filterLabels.push({
      key: "max_guests",
      label: `${filters.max_guests}+ Guests`,
    });
  }
  if (filters.parking_spaces) {
    filterLabels.push({
      key: "parking_spaces",
      label: `${filters.parking_spaces}+ Parking`,
    });
  }
  if (filters.capacity) {
    filterLabels.push({
      key: "capacity",
      label: `${filters.capacity}+ Capacity`,
    });
  }

  // Boolean filters
  if (filters.furnished === true) {
    filterLabels.push({ key: "furnished", label: "Furnished" });
  } else if (filters.furnished === false) {
    filterLabels.push({ key: "furnished", label: "Unfurnished" });
  }

  if (filters.utilities_included === true) {
    filterLabels.push({
      key: "utilities_included",
      label: "Utilities Included",
    });
  } else if (filters.utilities_included === false) {
    filterLabels.push({
      key: "utilities_included",
      label: "Utilities Not Included",
    });
  }

  if (filters.internet_included === true) {
    filterLabels.push({ key: "internet_included", label: "Internet Included" });
  } else if (filters.internet_included === false) {
    filterLabels.push({ key: "internet_included", label: "No Internet" });
  }

  // Power supply
  if (filters.generator_available) {
    filterLabels.push({ key: "generator_available", label: "Generator" });
  }
  if (filters.inverter_available) {
    filterLabels.push({ key: "inverter_available", label: "Inverter" });
  }
  if (filters.solar_power) {
    filterLabels.push({ key: "solar_power", label: "Solar Power" });
  }

  // Water supply
  if (filters.water_supply) {
    const water = WATER_SUPPLY_OPTIONS.find(
      (w) => w.value === filters.water_supply,
    );
    filterLabels.push({
      key: "water_supply",
      label: water?.label || filters.water_supply,
    });
  }

  // Amenities
  if (filters.amenities && filters.amenities.length > 0) {
    filters.amenities.forEach((amenityValue) => {
      const amenity = AMENITY_ICONS.find((a) => a.value === amenityValue);
      if (amenity) {
        filterLabels.push({
          key: `amenity_${amenityValue}`,
          label: amenity.label,
          removeKey: "amenities",
          removeValue: amenityValue,
        });
      }
    });
  }

  // Security features
  if (filters.security_features && filters.security_features.length > 0) {
    filters.security_features.forEach((featureValue) => {
      const feature = SECURITY_FEATURES.find((f) => f.value === featureValue);
      if (feature) {
        filterLabels.push({
          key: `security_${featureValue}`,
          label: feature.label,
          removeKey: "security_features",
          removeValue: featureValue,
        });
      }
    });
  }

  if (filterLabels.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filterLabels.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="px-3 py-1.5 bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100"
        >
          <span className="text-sm">{filter.label}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (filter.removeKey && filter.removeValue) {
                // For array filters, remove specific item
                const current = filters[filter.removeKey] || [];
                const updated = current.filter(
                  (item) => item !== filter.removeValue,
                );
                onRemoveFilter(
                  filter.removeKey,
                  updated.length > 0 ? updated : null,
                );
              } else {
                onRemoveFilter(filter.key);
              }
            }}
            className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );
};

export default ActiveFilters;
