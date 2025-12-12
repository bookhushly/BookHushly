import Image from "next/image";
import { Check } from "lucide-react";
import { InfoBanner } from "./shared";

export default function Step4Review({
  hotelData,
  suiteTypes,
  totalRooms,
  totalRoomsAllSuites,
  roomConfig,
}) {
  return (
    <div className="space-y-6">
      <InfoBanner
        icon={Check}
        title="Review & Submit"
        description="Review your hotel details before creating. You can edit individual rooms after creation."
      />

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h4 className="font-medium text-gray-900">Hotel Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Name:</span>
            <p className="font-medium text-gray-900 mt-1">{hotelData.name}</p>
          </div>
          <div>
            <span className="text-gray-600">Location:</span>
            <p className="font-medium text-gray-900 mt-1">
              {hotelData.city}, {hotelData.state}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Checkout Policy:</span>
            <p className="font-medium text-gray-900 mt-1">
              {hotelData.checkout_policy === "fixed_time"
                ? "Fixed Time (12:00 PM)"
                : "24-Hour Policy"}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Check-out Time:</span>
            <p className="font-medium text-gray-900 mt-1">
              {hotelData.check_out_time}
            </p>
          </div>
        </div>
        {hotelData.image_urls.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {hotelData.image_urls.slice(0, 4).map((url, i) => (
              <div
                key={url}
                className="relative w-full h-20 rounded-lg overflow-hidden"
              >
                <Image
                  src={url}
                  alt={`Hotel preview ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="25vw"
                  loading="lazy"
                  quality={75}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h4 className="font-medium text-gray-900">
          Suite Types ({suiteTypes.length})
        </h4>
        <div className="space-y-3">
          {suiteTypes.map((suite) => (
            <div
              key={suite.id}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
            >
              {suite.image_urls[0] && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={suite.image_urls[0]}
                    alt={suite.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    loading="lazy"
                    quality={75}
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{suite.name}</p>
                <p className="text-sm text-gray-600">
                  ₦{suite.base_price.toLocaleString()}/night •{" "}
                  {suite.max_occupancy} guests
                </p>
              </div>
              <div className="text-right text-sm text-gray-600">
                {totalRooms} rooms
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h4 className="font-medium text-gray-900">Room Configuration</h4>
        {roomConfig.floors && roomConfig.floors.length > 0 ? (
          <div className="space-y-3">
            {roomConfig.floors.map((floor, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900 mb-2">
                  Floor {floor.floor}
                </p>
                <div className="space-y-2">
                  {floor.rooms && floor.rooms.length > 0 ? (
                    floor.rooms.map((roomGroup, rgIndex) => {
                      const suite = suiteTypes.find(
                        (s) => s.id === roomGroup.suite_type_id
                      );
                      return (
                        <div
                          key={rgIndex}
                          className="text-sm text-gray-600 flex items-center justify-between"
                        >
                          <span>
                            {suite?.name || "Unknown Suite"} × {roomGroup.count}{" "}
                            rooms
                          </span>
                          <span className="text-xs text-gray-500">
                            Rooms {roomGroup.startNumber}-
                            {roomGroup.startNumber + roomGroup.count - 1}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">
                      No rooms configured for this floor
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No floors configured yet</p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h4 className="font-medium text-gray-900">Summary</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {totalRoomsAllSuites || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Rooms</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {roomConfig.floors ? roomConfig.floors.length : 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Floors</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {suiteTypes.length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Suite Types</p>
          </div>
        </div>
      </div>
    </div>
  );
}
