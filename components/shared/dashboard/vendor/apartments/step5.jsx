"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Info, Sparkles } from "lucide-react";
import {
  APARTMENT_AMENITIES,
  CATEGORY_LABELS,
  AMENITY_CATEGORIES,
  getAmenitiesByCategory,
} from "@/config/apartment-amenities";
import { useState } from "react";

const CATEGORIES = [
  { key: "kitchen", label: CATEGORY_LABELS.kitchen },
  { key: "entertainment", label: CATEGORY_LABELS.entertainment },
  { key: "power_utilities", label: CATEGORY_LABELS.power_utilities },
  { key: "comfort", label: CATEGORY_LABELS.comfort },
  { key: "laundry", label: CATEGORY_LABELS.laundry },
  { key: "security", label: CATEGORY_LABELS.security },
  { key: "building", label: CATEGORY_LABELS.building },
  { key: "services", label: CATEGORY_LABELS.services },
  { key: "family", label: CATEGORY_LABELS.family },
];

export default function Step5Amenities({ formData, updateFormData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const amenities = formData.amenities || {};
  const securityFeatures = formData.security_features || {};

  // Count selected amenities
  const selectedCount = Object.values(amenities).filter(Boolean).length;
  const selectedSecurityCount =
    Object.values(securityFeatures).filter(Boolean).length;

  // Filter amenities by search
  const filteredCategories = CATEGORIES.map((cat) => {
    const categoryAmenities = getAmenitiesByCategory(cat.key).filter(
      (amenity) =>
        amenity.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...cat, amenities: categoryAmenities };
  }).filter((cat) => cat.amenities.length > 0 || !searchQuery);

  const toggleAmenity = (amenityKey) => {
    updateFormData({
      amenities: {
        ...amenities,
        [amenityKey]: !amenities[amenityKey],
      },
    });
  };

  const toggleSecurityFeature = (featureKey) => {
    updateFormData({
      security_features: {
        ...securityFeatures,
        [featureKey]: !securityFeatures[featureKey],
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-900 mb-2">
                Stand Out with Great Amenities
              </p>
              <p className="text-xs text-purple-800 mb-3">
                The more amenities you offer, the more attractive your listing
                becomes. Focus on essentials like WiFi, AC, and generator -
                these are highly valued in Nigeria.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white">
                  {selectedCount} amenities selected
                </Badge>
                <Badge variant="secondary" className="bg-white">
                  {selectedSecurityCount} security features
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="space-y-2">
        <Input
          placeholder="Search amenities (e.g., WiFi, AC, Generator)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Security Features (Separate Card) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Security Features</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Highly valued in Nigerian market
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <label className="flex items-start space-x-3 cursor-pointer p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={securityFeatures["24hr_security"] || false}
                onChange={() => toggleSecurityFeature("24hr_security")}
                className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
              />
              <span className="text-sm font-medium">24hr Security Guard</span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={securityFeatures.cctv_surveillance || false}
                onChange={() => toggleSecurityFeature("cctv_surveillance")}
                className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
              />
              <span className="text-sm font-medium">CCTV Surveillance</span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={securityFeatures.estate_gate || false}
                onChange={() => toggleSecurityFeature("estate_gate")}
                className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
              />
              <span className="text-sm font-medium">Gated Estate</span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={securityFeatures.access_control || false}
                onChange={() => toggleSecurityFeature("access_control")}
                className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
              />
              <span className="text-sm font-medium">Access Control</span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={securityFeatures.intercom_system || false}
                onChange={() => toggleSecurityFeature("intercom_system")}
                className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
              />
              <span className="text-sm font-medium">Intercom System</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Amenities by Category */}
      {filteredCategories.map((category) => {
        if (category.key === "security") return null; // Skip security, handled above

        return (
          <Card key={category.key}>
            <CardHeader>
              <CardTitle className="text-lg">{category.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.amenities.map((amenity) => {
                  const Icon = amenity.icon;
                  const isSelected = amenities[amenity.value] || false;

                  return (
                    <label
                      key={amenity.value}
                      className={`flex items-start space-x-3 cursor-pointer p-3 border-2 rounded-lg transition-all ${
                        isSelected
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAmenity(amenity.value)}
                        className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
                      />
                      <div className="flex items-start gap-2 flex-1">
                        {Icon && (
                          <Icon
                            className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                              isSelected ? "text-purple-600" : "text-gray-600"
                            }`}
                          />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            isSelected ? "text-purple-900" : "text-gray-900"
                          }`}
                        >
                          {amenity.label}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Summary */}
      {selectedCount > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-green-900 mb-2">
              ✓ Great Selection!
            </p>
            <p className="text-xs text-green-800">
              You've selected {selectedCount} amenities and{" "}
              {selectedSecurityCount} security features. This makes your
              apartment competitive in the Nigerian market.
            </p>
            {selectedCount < 10 && (
              <p className="text-xs text-green-800 mt-2">
                💡 Tip: Apartments with 10+ amenities get 40% more bookings on
                average.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {searchQuery &&
        filteredCategories.every((c) => c.amenities.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">
                No amenities found for "{searchQuery}"
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
