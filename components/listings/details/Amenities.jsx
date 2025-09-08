import React, { useState } from "react";
import { getFeatureIcon } from "@/lib/featureIcons";
import { ChevronDown } from "lucide-react";

// Component to display amenities with proper icons
const AmenitiesDisplay = ({
  amenities,
  features,
  category,
  title = "Amenities",
}) => {
  const [showAll, setShowAll] = useState(false);

  // Handle both old format (features) and new format (amenities)
  let normalizedAmenities = [];

  // Priority: Use amenities if available, otherwise fall back to features
  if (amenities && Array.isArray(amenities) && amenities.length > 0) {
    // New format - structured amenities
    normalizedAmenities = amenities
      .map((amenity) => {
        if (typeof amenity === "string") {
          return {
            value: amenity,
            label: amenity,
            icon: amenity,
          };
        } else if (amenity && typeof amenity === "object") {
          return {
            value: amenity.value || "",
            label: amenity.label || amenity.value || "",
            icon: amenity.icon || amenity.value || "",
          };
        }
        return null;
      })
      .filter(Boolean);
  } else if (features && Array.isArray(features) && features.length > 0) {
    // Old format - features array
    normalizedAmenities = features.map((feature) => ({
      value: feature,
      label: feature,
      icon: feature,
    }));
  }

  if (normalizedAmenities.length === 0) return null;

  const displayAmenities = showAll
    ? normalizedAmenities
    : normalizedAmenities.slice(0, 4);
  const hasMore = normalizedAmenities.length > 4;

  return (
    <div className="border-t border-gray-200 py-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {displayAmenities.map((amenity, index) => (
          <div key={index} className="flex items-center text-sm">
            {getFeatureIcon(amenity.icon, amenity.value)}
            <span className="ml-2 text-gray-700">{amenity.label}</span>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
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
    </div>
  );
};

export default AmenitiesDisplay;
