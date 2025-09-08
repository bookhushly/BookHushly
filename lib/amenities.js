// utils/amenities.js - Utility functions for handling amenities

import { getFeatureIcon } from "@/lib/featureIcons";
import { AMENITY_OPTIONS } from "@/lib/category-forms";
import { ChevronDown } from "lucide-react";

/**
 * Normalize amenities from database to display format
 * Handles both old format (string array) and new format (structured objects)
 */
export const normalizeAmenities = (amenities, category = null) => {
  if (!amenities || !Array.isArray(amenities)) return [];

  return amenities
    .map((amenity) => {
      if (typeof amenity === "string") {
        // Old format - try to find matching option in category config
        const categoryOptions = category ? AMENITY_OPTIONS[category] : null;
        const matchedOption = categoryOptions?.find(
          (opt) =>
            opt.value === amenity ||
            opt.label.toLowerCase() === amenity.toLowerCase()
        );

        return {
          value: amenity,
          label: matchedOption?.label || amenity,
          icon: matchedOption?.icon || amenity,
        };
      } else if (amenity && typeof amenity === "object") {
        // New format - already structured
        return {
          value: amenity.value || "",
          label: amenity.label || amenity.value || "",
          icon: amenity.icon || amenity.value || "",
        };
      }

      return null;
    })
    .filter(Boolean);
};

/**
 * Convert amenities from form selection to database format
 */
export const prepareAmenitiesForStorage = (
  selectedAmenities,
  category,
  eventType = null
) => {
  if (!selectedAmenities || !Array.isArray(selectedAmenities)) return [];

  const categoryOptions = AMENITY_OPTIONS[category];
  if (!categoryOptions) return [];

  return selectedAmenities.map((amenityValue) => {
    const option = categoryOptions.find((opt) => opt.value === amenityValue);

    return {
      value: amenityValue,
      label: option?.label || amenityValue,
      icon: option?.icon || amenityValue,
    };
  });
};

/**
 * Extract amenities from listing data (handles both old and new formats)
 */
export const extractListingAmenities = (listing) => {
  // Check new amenities column first
  if (listing.amenities && Array.isArray(listing.amenities)) {
    return normalizeAmenities(listing.amenities, listing.category);
  }

  // Fall back to old features column
  if (listing.features) {
    const featuresArray =
      typeof listing.features === "string"
        ? listing.features
            .split(/[\n,]/)
            .map((f) => f.trim())
            .filter(Boolean)
        : Array.isArray(listing.features)
          ? listing.features
          : [];

    return normalizeAmenities(featuresArray, listing.category);
  }

  return [];
};

/**
 * React component for displaying amenities
 */
export const AmenitiesGrid = ({
  amenities,
  showAll = false,
  onToggle = null,
}) => {
  const normalizedAmenities = Array.isArray(amenities) ? amenities : [];

  if (normalizedAmenities.length === 0) return null;

  const displayAmenities = showAll
    ? normalizedAmenities
    : normalizedAmenities.slice(0, 4);
  const hasMore = normalizedAmenities.length > 4;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {displayAmenities.map((amenity, index) => (
          <div key={index} className="flex items-center text-sm">
            {getFeatureIcon(amenity.icon, amenity.value)}
            <span className="ml-2 text-gray-700">{amenity.label}</span>
          </div>
        ))}
      </div>

      {hasMore && onToggle && (
        <button
          onClick={onToggle}
          className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
        >
          {showAll ? (
            <>
              Show less <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
            </>
          ) : (
            <>
              Show all {normalizedAmenities.length} amenities{" "}
              <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </button>
      )}
    </>
  );
};
