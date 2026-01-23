import { Badge } from "@/components/ui/badge";
import {
  APARTMENT_AMENITIES,
  CATEGORY_LABELS,
  getAmenitiesByCategory,
} from "@/config/apartment-amenities";

const CATEGORIES = [
  { key: "kitchen", label: CATEGORY_LABELS.kitchen },
  { key: "entertainment", label: CATEGORY_LABELS.entertainment },
  { key: "power_utilities", label: CATEGORY_LABELS.power_utilities },
  { key: "comfort", label: CATEGORY_LABELS.comfort },
  { key: "laundry", label: CATEGORY_LABELS.laundry },
  { key: "building", label: CATEGORY_LABELS.building },
  { key: "services", label: CATEGORY_LABELS.services },
  { key: "family", label: CATEGORY_LABELS.family },
];

export default function EditAmenities({ formData, updateFormData }) {
  const amenities = formData.amenities || {};
  const securityFeatures = formData.security_features || {};

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

  const selectedCount = Object.values(amenities).filter(Boolean).length;
  const selectedSecurityCount =
    Object.values(securityFeatures).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <Badge variant="secondary">{selectedCount} amenities selected</Badge>
        <Badge variant="secondary">
          {selectedSecurityCount} security features
        </Badge>
      </div>

      {/* Security Features */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-900">Security Features</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      </div>

      {/* Amenities by Category */}
      {CATEGORIES.map((category) => {
        const categoryAmenities = getAmenitiesByCategory(category.key);

        return (
          <div key={category.key} className="space-y-3">
            <p className="text-sm font-semibold text-gray-900">
              {category.label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categoryAmenities.map((amenity) => {
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
          </div>
        );
      })}
    </div>
  );
}
