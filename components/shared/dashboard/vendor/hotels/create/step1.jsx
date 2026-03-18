import { Building2, Upload } from "lucide-react";
import { ImagePreview, AmenityButton, InfoBanner } from "./shared";
import { AMENITY_ICONS } from "@/lib/hotel";
import RichTextEditor from "@/components/common/rich-text-editor";
import { NIGERIAN_STATES } from "@/lib/constants";

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
          <select
            value={hotelData.state}
            onChange={(e) =>
              setHotelData((prev) => ({ ...prev, state: e.target.value }))
            }
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            <option value="">Select state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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

        {/* ── Power & Generator ── */}
        <div className="md:col-span-2 border border-gray-200 rounded-lg p-4 space-y-4">
          <p className="text-sm font-medium text-gray-700">Power & Generator</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Generator Available?
              </label>
              <select
                value={hotelData.generator_available}
                onChange={(e) =>
                  setHotelData((prev) => ({
                    ...prev,
                    generator_available: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="">Select</option>
                <option value="24h">24 Hours</option>
                <option value="partial">Partial Hours</option>
                <option value="none">No Generator</option>
              </select>
            </div>
            {hotelData.generator_available === "partial" && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Generator Hours
                </label>
                <input
                  type="text"
                  value={hotelData.generator_hours}
                  onChange={(e) =>
                    setHotelData((prev) => ({
                      ...prev,
                      generator_hours: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. 6pm – 6am"
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Inverter / Solar?
              </label>
              <select
                value={hotelData.inverter_available}
                onChange={(e) =>
                  setHotelData((prev) => ({
                    ...prev,
                    inverter_available: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="">None</option>
                <option value="inverter">Inverter</option>
                <option value="solar">Solar</option>
                <option value="both">Inverter + Solar</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Breakfast ── */}
        <div className="md:col-span-2 border border-gray-200 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Breakfast</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Breakfast Offered?
              </label>
              <select
                value={hotelData.breakfast_offered}
                onChange={(e) =>
                  setHotelData((prev) => ({
                    ...prev,
                    breakfast_offered: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="none">Not Available</option>
                <option value="included">Included in Price</option>
                <option value="paid">Available (Extra Charge)</option>
              </select>
            </div>
            {hotelData.breakfast_offered !== "none" && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Breakfast Type
                </label>
                <select
                  value={hotelData.breakfast_type}
                  onChange={(e) =>
                    setHotelData((prev) => ({
                      ...prev,
                      breakfast_type: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="">Select type</option>
                  <option value="continental">Continental</option>
                  <option value="nigerian">Full Nigerian</option>
                  <option value="both">Continental + Nigerian</option>
                  <option value="buffet">Buffet</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ── Fees & Pricing ── */}
        <div className="md:col-span-2 border border-gray-200 rounded-lg p-4 space-y-4">
          <p className="text-sm font-medium text-gray-700">
            Fees & Pricing Rules
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Early Check-in Fee (₦)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={hotelData.early_checkin_fee}
                onChange={(e) =>
                  setHotelData((prev) => ({
                    ...prev,
                    early_checkin_fee: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. 5000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Charged for arrivals before standard check-in time
              </p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Late Check-out Fee (₦)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={hotelData.late_checkout_fee}
                onChange={(e) =>
                  setHotelData((prev) => ({
                    ...prev,
                    late_checkout_fee: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. 5000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Charged for departures after standard checkout time
              </p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Weekend Price Adjustment
              </label>
              <select
                value={hotelData.weekend_pricing}
                onChange={(e) =>
                  setHotelData((prev) => ({
                    ...prev,
                    weekend_pricing: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="none">No adjustment</option>
                <option value="10">+10% on Fri & Sat</option>
                <option value="20">+20% on Fri & Sat</option>
                <option value="30">+30% on Fri & Sat</option>
                <option value="50">+50% on Fri & Sat</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={hotelData.vat_inclusive}
                  onChange={(e) =>
                    setHotelData((prev) => ({
                      ...prev,
                      vat_inclusive: e.target.checked,
                    }))
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
              <div>
                <p className="text-sm text-gray-700 font-medium">
                  VAT Inclusive (7.5%)
                </p>
                <p className="text-xs text-gray-500">
                  Prices shown include VAT
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── WhatsApp Contact ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp Number
          </label>
          <input
            type="tel"
            value={hotelData.whatsapp_number}
            onChange={(e) =>
              setHotelData((prev) => ({
                ...prev,
                whatsapp_number: e.target.value,
              }))
            }
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="+2348012345678"
          />
          <p className="mt-1 text-xs text-gray-500">
            Guests can reach you directly on WhatsApp for quick inquiries
          </p>
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
            Security Deposit (₦)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  ₦
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={hotelData.security_deposit}
                  onChange={(e) =>
                    setHotelData((prev) => ({
                      ...prev,
                      security_deposit: e.target.value,
                    }))
                  }
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="50000"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Refundable deposit charged at checkout. Leave blank if none.
              </p>
            </div>
            <div>
              <input
                type="text"
                value={hotelData.security_deposit_notes}
                onChange={(e) =>
                  setHotelData((prev) => ({
                    ...prev,
                    security_deposit_notes: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g. Refunded within 48 hours after checkout"
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional note about deposit refund terms.
              </p>
            </div>
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
