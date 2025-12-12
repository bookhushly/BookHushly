import { Bed, Plus, Trash2, Edit2 } from "lucide-react";
import { InfoBanner } from "./shared";
import { BED_TYPES, generateRoomNumbers } from "@/lib/hotel";
import { useState } from "react";

export default function Step3RoomGeneration({
  roomConfig,
  setRoomConfig,
  suiteTypes,
  totalRooms,
}) {
  const [expandedFloor, setExpandedFloor] = useState(null);

  const addFloor = () => {
    setRoomConfig((prev) => ({
      ...prev,
      floors: [
        ...prev.floors,
        {
          floor: prev.floors.length + 1,
          rooms: [],
        },
      ],
    }));
  };

  const removeFloor = (index) => {
    setRoomConfig((prev) => ({
      ...prev,
      floors: prev.floors.filter((_, i) => i !== index),
    }));
  };

  const addRoomGroup = (floorIndex) => {
    const floor = roomConfig.floors[floorIndex];

    // Calculate the next available starting number
    let nextStartNumber = 1;
    if (floor.rooms && floor.rooms.length > 0) {
      // Find the highest room number used so far on this floor
      const maxRoomNumber = Math.max(
        ...floor.rooms.map((rg) => rg.startNumber + rg.count - 1)
      );
      nextStartNumber = maxRoomNumber + 1;
    }

    setRoomConfig((prev) => ({
      ...prev,
      floors: prev.floors.map((floor, i) =>
        i === floorIndex
          ? {
              ...floor,
              rooms: [
                ...floor.rooms,
                {
                  id: `room-${Date.now()}`,
                  suite_type_id: suiteTypes[0]?.id || null,
                  count: 5,
                  startNumber: nextStartNumber,
                  beds: [{ type: "king", count: 1 }],
                  additionalAmenities: [],
                  priceAdjustment: 0,
                },
              ],
            }
          : floor
      ),
    }));
  };

  const removeRoomGroup = (floorIndex, roomGroupIndex) => {
    setRoomConfig((prev) => ({
      ...prev,
      floors: prev.floors.map((floor, i) =>
        i === floorIndex
          ? {
              ...floor,
              rooms: floor.rooms.filter((_, ri) => ri !== roomGroupIndex),
            }
          : floor
      ),
    }));
  };

  const updateRoomGroup = (floorIndex, roomGroupIndex, field, value) => {
    setRoomConfig((prev) => ({
      ...prev,
      floors: prev.floors.map((floor, i) =>
        i === floorIndex
          ? {
              ...floor,
              rooms: floor.rooms.map((room, ri) =>
                ri === roomGroupIndex ? { ...room, [field]: value } : room
              ),
            }
          : floor
      ),
    }));
  };

  const updateBedConfig = (
    floorIndex,
    roomGroupIndex,
    bedIndex,
    field,
    value
  ) => {
    setRoomConfig((prev) => ({
      ...prev,
      floors: prev.floors.map((floor, i) =>
        i === floorIndex
          ? {
              ...floor,
              rooms: floor.rooms.map((room, ri) =>
                ri === roomGroupIndex
                  ? {
                      ...room,
                      beds: room.beds.map((bed, bi) =>
                        bi === bedIndex
                          ? {
                              ...bed,
                              [field]:
                                field === "count"
                                  ? parseInt(value) || 1
                                  : value,
                            }
                          : bed
                      ),
                    }
                  : room
              ),
            }
          : floor
      ),
    }));
  };

  const addBed = (floorIndex, roomGroupIndex) => {
    setRoomConfig((prev) => ({
      ...prev,
      floors: prev.floors.map((floor, i) =>
        i === floorIndex
          ? {
              ...floor,
              rooms: floor.rooms.map((room, ri) =>
                ri === roomGroupIndex
                  ? {
                      ...room,
                      beds: [...room.beds, { type: "single", count: 1 }],
                    }
                  : room
              ),
            }
          : floor
      ),
    }));
  };

  const removeBed = (floorIndex, roomGroupIndex, bedIndex) => {
    setRoomConfig((prev) => ({
      ...prev,
      floors: prev.floors.map((floor, i) =>
        i === floorIndex
          ? {
              ...floor,
              rooms: floor.rooms.map((room, ri) =>
                ri === roomGroupIndex
                  ? {
                      ...room,
                      beds: room.beds.filter((_, bi) => bi !== bedIndex),
                    }
                  : room
              ),
            }
          : floor
      ),
    }));
  };

  const getSuiteTypeName = (suiteTypeId) => {
    const suite = suiteTypes.find((s) => s.id === suiteTypeId);
    return suite ? suite.name : "Unknown Suite";
  };

  const getFloorRoomCount = (floor) => {
    if (!floor.rooms || !Array.isArray(floor.rooms)) return 0;
    return floor.rooms.reduce((sum, room) => sum + (room.count || 0), 0);
  };

  // Check for room number overlaps on a floor
  const hasRoomNumberConflict = (floorIndex, currentRoomGroupIndex) => {
    const floor = roomConfig.floors[floorIndex];
    if (!floor.rooms || floor.rooms.length <= 1) return false;

    const currentGroup = floor.rooms[currentRoomGroupIndex];
    const currentStart = currentGroup.startNumber;
    const currentEnd = currentStart + currentGroup.count - 1;

    return floor.rooms.some((roomGroup, index) => {
      if (index === currentRoomGroupIndex) return false;

      const groupStart = roomGroup.startNumber;
      const groupEnd = groupStart + roomGroup.count - 1;

      // Check if ranges overlap
      return (
        (currentStart >= groupStart && currentStart <= groupEnd) ||
        (currentEnd >= groupStart && currentEnd <= groupEnd) ||
        (groupStart >= currentStart && groupStart <= currentEnd)
      );
    });
  };

  return (
    <div className="space-y-6">
      <InfoBanner
        icon={Bed}
        title="Room Assignment"
        description="Assign suite types to rooms on each floor. You can have multiple suite types per floor and customize individual rooms."
      />

      {suiteTypes.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Please add at least one suite type in the previous step before
            configuring rooms.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">
            Floor Configuration
          </h4>
          <button
            onClick={addFloor}
            type="button"
            disabled={suiteTypes.length === 0}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Floor
          </button>
        </div>

        {roomConfig.floors.length === 0 && suiteTypes.length > 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-3">No floors configured yet</p>
            <button
              onClick={addFloor}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Your First Floor
            </button>
          </div>
        )}

        <div className="space-y-3">
          {roomConfig.floors.map((floor, floorIndex) => (
            <div
              key={floorIndex}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Floor Header */}
              <div className="bg-gray-50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <input
                      type="number"
                      value={floor.floor}
                      onChange={(e) =>
                        setRoomConfig((prev) => ({
                          ...prev,
                          floors: prev.floors.map((f, i) =>
                            i === floorIndex
                              ? { ...f, floor: parseInt(e.target.value) || 1 }
                              : f
                          ),
                        }))
                      }
                      min="1"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Floor {floor.floor}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getFloorRoomCount(floor)} rooms • {floor.rooms.length}{" "}
                      suite type(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addRoomGroup(floorIndex)}
                    className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Suite Type
                  </button>
                  <button
                    onClick={() =>
                      setExpandedFloor(
                        expandedFloor === floorIndex ? null : floorIndex
                      )
                    }
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {roomConfig.floors.length > 1 && (
                    <button
                      onClick={() => removeFloor(floorIndex)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Room Groups */}
              {expandedFloor === floorIndex && (
                <div className="p-4 space-y-4 bg-white">
                  {floor.rooms.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">
                        No rooms configured for this floor
                      </p>
                      <button
                        onClick={() => addRoomGroup(floorIndex)}
                        className="text-sm text-purple-600 hover:text-purple-700"
                      >
                        Add Suite Type
                      </button>
                    </div>
                  ) : (
                    floor.rooms.map((roomGroup, roomGroupIndex) => (
                      <div
                        key={roomGroup.id}
                        className="border border-gray-200 rounded-lg p-4 space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <h5 className="text-sm font-medium text-gray-900">
                            Room Group {roomGroupIndex + 1}
                          </h5>
                          <button
                            onClick={() =>
                              removeRoomGroup(floorIndex, roomGroupIndex)
                            }
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Suite Type *
                            </label>
                            <select
                              value={roomGroup.suite_type_id || ""}
                              onChange={(e) =>
                                updateRoomGroup(
                                  floorIndex,
                                  roomGroupIndex,
                                  "suite_type_id",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              {suiteTypes.map((suite) => (
                                <option key={suite.id} value={suite.id}>
                                  {suite.name} (₦
                                  {suite.base_price.toLocaleString()})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Number of Rooms *
                            </label>
                            <input
                              type="number"
                              value={roomGroup.count}
                              onChange={(e) =>
                                updateRoomGroup(
                                  floorIndex,
                                  roomGroupIndex,
                                  "count",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              min="1"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Start Room # *
                            </label>
                            <input
                              type="number"
                              value={roomGroup.startNumber}
                              onChange={(e) =>
                                updateRoomGroup(
                                  floorIndex,
                                  roomGroupIndex,
                                  "startNumber",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              min="1"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>

                        {/* Bed Configuration */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs text-gray-600">
                              Bed Configuration
                            </label>
                            <button
                              onClick={() => addBed(floorIndex, roomGroupIndex)}
                              className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add Bed
                            </button>
                          </div>
                          <div className="space-y-2">
                            {roomGroup.beds.map((bed, bedIndex) => (
                              <div
                                key={bedIndex}
                                className="flex items-center gap-2"
                              >
                                <select
                                  value={bed.type}
                                  onChange={(e) =>
                                    updateBedConfig(
                                      floorIndex,
                                      roomGroupIndex,
                                      bedIndex,
                                      "type",
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                >
                                  {BED_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                      {type.label}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  value={bed.count}
                                  onChange={(e) =>
                                    updateBedConfig(
                                      floorIndex,
                                      roomGroupIndex,
                                      bedIndex,
                                      "count",
                                      e.target.value
                                    )
                                  }
                                  min="1"
                                  className="w-16 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                />
                                {roomGroup.beds.length > 1 && (
                                  <button
                                    onClick={() =>
                                      removeBed(
                                        floorIndex,
                                        roomGroupIndex,
                                        bedIndex
                                      )
                                    }
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Price Adjustment */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Price Adjustment (₦)
                          </label>
                          <input
                            type="number"
                            value={roomGroup.priceAdjustment}
                            onChange={(e) =>
                              updateRoomGroup(
                                floorIndex,
                                roomGroupIndex,
                                "priceAdjustment",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            placeholder="0"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Add or subtract from suite base price
                          </p>
                        </div>

                        {/* Room Preview */}
                        <div
                          className={`border rounded-lg p-3 ${
                            hasRoomNumberConflict(floorIndex, roomGroupIndex)
                              ? "bg-red-50 border-red-200"
                              : "bg-purple-50 border-purple-100"
                          }`}
                        >
                          <p
                            className={`text-xs font-medium mb-1 ${
                              hasRoomNumberConflict(floorIndex, roomGroupIndex)
                                ? "text-red-900"
                                : "text-purple-900"
                            }`}
                          >
                            {hasRoomNumberConflict(
                              floorIndex,
                              roomGroupIndex
                            ) && "⚠️ "}
                            Preview
                          </p>
                          <p
                            className={`text-xs ${
                              hasRoomNumberConflict(floorIndex, roomGroupIndex)
                                ? "text-red-700"
                                : "text-purple-700"
                            }`}
                          >
                            Rooms:{" "}
                            {generateRoomNumbers(
                              floor.floor,
                              roomGroup.count,
                              roomGroup.startNumber
                            ).join(", ")}
                          </p>
                          <p
                            className={`text-xs ${
                              hasRoomNumberConflict(floorIndex, roomGroupIndex)
                                ? "text-red-700"
                                : "text-purple-700"
                            }`}
                          >
                            Suite: {getSuiteTypeName(roomGroup.suite_type_id)}
                          </p>
                          {hasRoomNumberConflict(
                            floorIndex,
                            roomGroupIndex
                          ) && (
                            <p className="text-xs text-red-700 mt-2 font-medium">
                              ⚠️ Room numbers overlap with another group on this
                              floor!
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Total Summary */}
      {roomConfig.floors && roomConfig.floors.length > 0 && (
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-900 mb-2">
            Generation Summary
          </h4>
          <div className="text-sm text-purple-700 space-y-1">
            <p>• {totalRooms} total rooms across all floors</p>
            <p>• {roomConfig.floors.length} floor(s) configured</p>
            <p>
              •{" "}
              {roomConfig.floors.reduce(
                (sum, f) => sum + (f.rooms ? f.rooms.length : 0),
                0
              )}{" "}
              room group(s) defined
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
