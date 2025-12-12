import { Layers, Upload, Plus } from "lucide-react";
import { ImagePreview, AmenityButton, SuiteCard, InfoBanner } from "./shared";
import { AMENITY_ICONS } from "@/lib/hotel";

export default function Step2SuiteTypes({
  suiteTypes,
  currentSuite,
  setCurrentSuite,
  isUploading,
  uploadProgress,
  handleSuiteImageUpload,
  removeImage,
  toggleAmenity,
  addSuiteType,
  removeSuiteType,
}) {
  return (
    <div className="space-y-6">
      <InfoBanner
        icon={Layers}
        title="Suite Types"
        description="Create different suite types (e.g., Deluxe, Executive). You'll assign specific rooms to these types in the next step."
      />

      {suiteTypes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Added Suite Types ({suiteTypes.length})
          </h4>
          <div className="grid gap-3">
            {suiteTypes.map((suite) => (
              <SuiteCard
                key={suite.id}
                suite={suite}
                onRemove={removeSuiteType}
              />
            ))}
          </div>
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 space-y-6">
        <h4 className="text-sm font-medium text-gray-700">
          {suiteTypes.length === 0
            ? "Add Your First Suite Type"
            : "Add Another Suite Type"}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suite Name *
            </label>
            <input
              type="text"
              value={currentSuite.name}
              onChange={(e) =>
                setCurrentSuite((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Deluxe Suite"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Price (₦) *
            </label>
            <input
              type="number"
              value={currentSuite.base_price}
              onChange={(e) =>
                setCurrentSuite((prev) => ({
                  ...prev,
                  base_price: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="25000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Occupancy
            </label>
            <input
              type="number"
              value={currentSuite.max_occupancy}
              onChange={(e) =>
                setCurrentSuite((prev) => ({
                  ...prev,
                  max_occupancy: parseInt(e.target.value) || 2,
                }))
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size (m²)
            </label>
            <input
              type="number"
              value={currentSuite.size_sqm}
              onChange={(e) =>
                setCurrentSuite((prev) => ({
                  ...prev,
                  size_sqm: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="35"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={currentSuite.description}
              onChange={(e) =>
                setCurrentSuite((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Describe this suite type..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suite Amenities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {AMENITY_ICONS.map((amenity) => (
                <AmenityButton
                  key={amenity.value}
                  {...amenity}
                  isSelected={currentSuite.amenities.includes(amenity.value)}
                  onToggle={() => toggleAmenity(amenity.value, "suite")}
                />
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suite Images
            </label>
            <div className="space-y-3">
              <label
                className={`
                flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer
                transition-colors
                ${isUploading ? "border-purple-300 bg-purple-50" : "border-gray-300 hover:border-purple-500 bg-gray-50"}
              `}
              >
                <div className="flex items-center gap-2">
                  <Upload
                    className={`w-6 h-6 ${isUploading ? "text-purple-500 animate-pulse" : "text-gray-400"}`}
                  />
                  <p className="text-sm text-gray-600">
                    {isUploading
                      ? `Uploading... ${Math.round(uploadProgress)}%`
                      : "Upload suite images"}
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleSuiteImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>

              {currentSuite.image_urls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {currentSuite.image_urls.map((url, index) => (
                    <ImagePreview
                      key={url}
                      url={url}
                      index={index}
                      onRemove={(url) => removeImage(url, "suite")}
                      alt="Suite"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={addSuiteType}
          disabled={!currentSuite.name || !currentSuite.base_price}
          className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Suite Type
        </button>
      </div>
    </div>
  );
}
