import { Building2, Upload } from "lucide-react";
import { ImagePreview, AmenityButton, InfoBanner } from "./shared";
import { AMENITY_ICONS } from "@/lib/hotel";
import RichTextEditor from "@/components/common/rich-text-editor";

export default function Step1HotelDetails({
  hotelData,
  setHotelData,
  isUploading,
  uploadProgress,
  handleHotelImageUpload,
  removeImage,
  toggleAmenity,
}) {
  return (
    <div className="space-y-6">
      <InfoBanner
        icon={Building2}
        title="Hotel Information"
        description="Provide basic details about your hotel. High-quality images help attract more bookings."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hotel Name *
          </label>
          <input
            type="text"
            value={hotelData.name}
            onChange={(e) =>
              setHotelData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="The Grand Plaza Hotel"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <RichTextEditor
            content={hotelData.description}
            onChange={(html) =>
              setHotelData((prev) => ({ ...prev, description: html }))
            }
            placeholder="Describe your hotel, its unique features, nearby attractions, and what makes it special..."
            minHeight="300px"
            showWordCount={true}
          />
          <p className="mt-1 text-xs text-gray-500">
            Use the toolbar to format your description. Add headings, lists,
            links, and images to make it engaging.
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address *
          </label>
          <input
            type="text"
            value={hotelData.address}
            onChange={(e) =>
              setHotelData((prev) => ({ ...prev, address: e.target.value }))
            }
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="123 Main Street"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            value={hotelData.city}
            onChange={(e) =>
              setHotelData((prev) => ({ ...prev, city: e.target.value }))
            }
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Lagos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State *
          </label>
          <input
            type="text"
            value={hotelData.state}
            onChange={(e) =>
              setHotelData((prev) => ({ ...prev, state: e.target.value }))
            }
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Lagos"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Checkout Policy *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              className={`
                relative flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all
                ${
                  hotelData.checkout_policy === "fixed_time"
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }
              `}
            >
              <input
                type="radio"
                name="checkout_policy"
                value="fixed_time"
                checked={hotelData.checkout_policy === "fixed_time"}
                onChange={(e) =>
                  setHotelData((prev) => ({
                    ...prev,
                    checkout_policy: e.target.value,
                  }))
                }
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Fixed Time (12:00 PM)
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Guest checks out at 12:00 PM regardless of check-in time. If
                  guest arrives at 2:00 AM, they leave by 12:00 PM same day.
                </p>
              </div>
            </label>

            <label
              className={`
                relative flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all
                ${
                  hotelData.checkout_policy === "24_hours"
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }
              `}
            >
              <input
                type="radio"
                name="checkout_policy"
                value="24_hours"
                checked={hotelData.checkout_policy === "24_hours"}
                onChange={(e) =>
                  setHotelData((prev) => ({
                    ...prev,
                    checkout_policy: e.target.value,
                  }))
                }
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">24-Hour Policy</p>
                <p className="text-sm text-gray-600 mt-1">
                  Guest gets full 24 hours from check-in time. If guest arrives
                  at 2:00 AM, they leave by 2:00 AM next day.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hotel Amenities
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {AMENITY_ICONS.map((amenity) => (
              <AmenityButton
                key={amenity.value}
                {...amenity}
                isSelected={hotelData.amenities.includes(amenity.value)}
                onToggle={() => toggleAmenity(amenity.value, "hotel")}
              />
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hotel Images
          </label>
          <div className="space-y-3">
            <label
              className={`
              flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
              transition-colors
              ${isUploading ? "border-purple-300 bg-purple-50" : "border-gray-300 hover:border-purple-500 bg-gray-50"}
            `}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload
                  className={`w-8 h-8 mb-2 ${isUploading ? "text-purple-500 animate-pulse" : "text-gray-400"}`}
                />
                <p className="text-sm text-gray-600">
                  {isUploading
                    ? `Uploading... ${Math.round(uploadProgress)}%`
                    : "Click to upload hotel images"}
                </p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleHotelImageUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {hotelData.image_urls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {hotelData.image_urls.map((url, index) => (
                  <ImagePreview
                    key={url}
                    url={url}
                    index={index}
                    onRemove={(url) => removeImage(url, "hotel")}
                    alt="Hotel"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Policies & House Rules
          </label>
          <RichTextEditor
            content={hotelData.policies}
            onChange={(html) =>
              setHotelData((prev) => ({ ...prev, policies: html }))
            }
            placeholder="Add your cancellation policy, pet policy, smoking rules, age restrictions, payment terms, etc..."
            minHeight="250px"
            showWordCount={true}
          />
          <p className="mt-1 text-xs text-gray-500">
            Include important information like cancellation deadlines, deposit
            requirements, and house rules.
          </p>
        </div>
      </div>
    </div>
  );
}
