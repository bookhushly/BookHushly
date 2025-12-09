"use client";

import { useState, useCallback, useTransition } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import {
  Building2,
  Upload,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Image as ImageIcon,
  Bed,
  DollarSign,
  Layers,
  Clock,
  FileText,
  Hash,
  MapPin,
  Users,
  Save,
  Sparkles,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import {
  createHotel,
  createRoomType,
  bulkCreateRooms,
  uploadHotelImages,
  deleteHotelImage,
  generateRoomNumbers,
  BED_TYPES,
  AMENITY_ICONS,
} from "@/lib/hotel";
import { toast } from "sonner";

const STEPS = [
  { id: 1, title: "Hotel Details", icon: Building2 },
  { id: 2, title: "Suite Types", icon: Layers },
  { id: 3, title: "Add Rooms", icon: Bed },
  { id: 4, title: "Review", icon: Check },
];

export default function HotelRegistration({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  // Step 1: Hotel Details
  const [hotelData, setHotelData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    check_in_time: "14:00",
    check_out_time: "12:00",
    policies: "",
    amenities: [],
    image_urls: [],
  });
  const [hotelImages, setHotelImages] = useState([]);

  // Step 2: Suite Types
  const [suiteTypes, setSuiteTypes] = useState([]);
  const [currentSuite, setCurrentSuite] = useState({
    name: "",
    description: "",
    max_occupancy: 2,
    base_price: "",
    size_sqm: "",
    amenities: [],
    image_urls: [],
  });
  const [suiteImages, setSuiteImages] = useState([]);

  // Step 3: Rooms
  const [selectedSuiteForRooms, setSelectedSuiteForRooms] = useState(null);
  const [roomConfig, setRoomConfig] = useState({
    floors: [{ floor: 1, count: 5, startNumber: 1 }],
    beds: [{ type: "king", count: 1 }],
    amenities: [],
    priceAdjustment: 0,
  });

  const supabase = createClient();

  // ==================== IMAGE HANDLING ====================

  const handleImageUpload = async (files, category) => {
    if (!files.length) return [];

    setIsUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const urls = await uploadHotelImages(
        Array.from(files),
        user.id,
        category
      );
      toast.success(`${urls.length} image(s) uploaded`);
      return urls;
    } catch (error) {
      toast.error("Failed to upload images");
      console.error(error);
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const handleHotelImageUpload = async (e) => {
    const urls = await handleImageUpload(e.target.files, "hotels");
    if (urls.length) {
      setHotelData((prev) => ({
        ...prev,
        image_urls: [...prev.image_urls, ...urls],
      }));
      setHotelImages((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleSuiteImageUpload = async (e) => {
    const urls = await handleImageUpload(e.target.files, "room-types");
    if (urls.length) {
      setCurrentSuite((prev) => ({
        ...prev,
        image_urls: [...prev.image_urls, ...urls],
      }));
      setSuiteImages((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeImage = async (url, type) => {
    try {
      await deleteHotelImage(url);
      if (type === "hotel") {
        setHotelData((prev) => ({
          ...prev,
          image_urls: prev.image_urls.filter((u) => u !== url),
        }));
      } else if (type === "suite") {
        setCurrentSuite((prev) => ({
          ...prev,
          image_urls: prev.image_urls.filter((u) => u !== url),
        }));
      }
    } catch (error) {
      toast.error("Failed to remove image");
    }
  };

  // ==================== SUITE TYPE MANAGEMENT ====================

  const addSuiteType = useCallback(() => {
    if (!currentSuite.name || !currentSuite.base_price) {
      toast.error("Please fill in suite name and price");
      return;
    }

    const newSuite = {
      ...currentSuite,
      id: `temp-${Date.now()}`,
      base_price: parseFloat(currentSuite.base_price),
      size_sqm: currentSuite.size_sqm
        ? parseFloat(currentSuite.size_sqm)
        : null,
    };

    setSuiteTypes((prev) => [...prev, newSuite]);
    setCurrentSuite({
      name: "",
      description: "",
      max_occupancy: 2,
      base_price: "",
      size_sqm: "",
      amenities: [],
      image_urls: [],
    });
    setSuiteImages([]);
    toast.success("Suite type added");
  }, [currentSuite]);

  const removeSuiteType = (id) => {
    setSuiteTypes((prev) => prev.filter((s) => s.id !== id));
    toast.success("Suite type removed");
  };

  // ==================== ROOM GENERATION ====================

  const addFloor = () => {
    setRoomConfig((prev) => ({
      ...prev,
      floors: [
        ...prev.floors,
        {
          floor: prev.floors.length + 1,
          count: 5,
          startNumber: 1,
        },
      ],
    }));
  };

  const updateFloor = (index, field, value) => {
    setRoomConfig((prev) => ({
      ...prev,
      floors: prev.floors.map((f, i) =>
        i === index ? { ...f, [field]: parseInt(value) || 0 } : f
      ),
    }));
  };

  const removeFloor = (index) => {
    setRoomConfig((prev) => ({
      ...prev,
      floors: prev.floors.filter((_, i) => i !== index),
    }));
  };

  const toggleAmenity = (amenity, type = "hotel") => {
    if (type === "hotel") {
      setHotelData((prev) => ({
        ...prev,
        amenities: prev.amenities.includes(amenity)
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      }));
    } else if (type === "suite") {
      setCurrentSuite((prev) => ({
        ...prev,
        amenities: prev.amenities.includes(amenity)
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      }));
    } else if (type === "room") {
      setRoomConfig((prev) => ({
        ...prev,
        amenities: prev.amenities.includes(amenity)
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      }));
    }
  };

  const updateBedConfig = (index, field, value) => {
    setRoomConfig((prev) => ({
      ...prev,
      beds: prev.beds.map((b, i) =>
        i === index
          ? { ...b, [field]: field === "count" ? parseInt(value) || 1 : value }
          : b
      ),
    }));
  };

  const addBed = () => {
    setRoomConfig((prev) => ({
      ...prev,
      beds: [...prev.beds, { type: "single", count: 1 }],
    }));
  };

  const removeBed = (index) => {
    setRoomConfig((prev) => ({
      ...prev,
      beds: prev.beds.filter((_, i) => i !== index),
    }));
  };

  // ==================== SUBMISSION ====================

  const handleSubmit = async () => {
    startTransition(async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // 1. Create Hotel
        const { data: hotel, error: hotelError } = await createHotel({
          ...hotelData,
          vendor_id: user.id,
        });

        if (hotelError) throw hotelError;

        // 2. Create Suite Types
        const createdSuiteTypes = [];
        for (const suite of suiteTypes) {
          const { data: suiteType, error: suiteError } = await createRoomType({
            ...suite,
            hotel_id: hotel.id,
          });

          if (suiteError) throw suiteError;
          createdSuiteTypes.push({ ...suiteType, tempId: suite.id });
        }

        // 3. Generate and Create Rooms
        const allRooms = [];

        for (const suite of createdSuiteTypes) {
          const config = roomConfig; // You can have different configs per suite if needed

          for (const floorConfig of config.floors) {
            const roomNumbers = generateRoomNumbers(
              floorConfig.floor,
              floorConfig.count,
              floorConfig.startNumber
            );

            const rooms = roomNumbers.map((roomNumber) => ({
              hotel_id: hotel.id,
              room_type_id: suite.id,
              room_number: roomNumber,
              floor: floorConfig.floor,
              beds: config.beds,
              status: "available",
              price_per_night: suite.base_price + (config.priceAdjustment || 0),
              amenities: config.amenities,
              image_urls: suite.image_urls,
              notes: null,
            }));

            allRooms.push(...rooms);
          }
        }

        const { error: roomsError } = await bulkCreateRooms(allRooms);
        if (roomsError) throw roomsError;

        toast.success(
          `Hotel "${hotel.name}" created with ${allRooms.length} rooms!`
        );

        if (onComplete) {
          onComplete(hotel);
        }
      } catch (error) {
        console.error("Submission error:", error);
        toast.error(error.message || "Failed to create hotel");
      }
    });
  };

  // ==================== NAVIGATION ====================

  const canProceed = () => {
    if (currentStep === 1) {
      return hotelData.name && hotelData.city && hotelData.address;
    }
    if (currentStep === 2) {
      return suiteTypes.length > 0;
    }
    if (currentStep === 3) {
      return roomConfig.floors.length > 0;
    }
    return true;
  };

  const nextStep = () => {
    if (canProceed()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    } else {
      toast.error("Please complete required fields");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // ==================== RENDER ====================

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all
                ${isActive ? "bg-purple-600 text-white scale-110" : ""}
                ${isCompleted ? "bg-purple-100 text-purple-600" : ""}
                ${!isActive && !isCompleted ? "bg-gray-100 text-gray-400" : ""}
              `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <p
                className={`mt-2 text-sm font-medium ${
                  isActive
                    ? "text-purple-600"
                    : isCompleted
                      ? "text-gray-700"
                      : "text-gray-400"
                }`}
              >
                {step.title}
              </p>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  isCompleted ? "bg-purple-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-purple-900">Hotel Information</h3>
          <p className="text-sm text-purple-700 mt-1">
            Provide basic details about your hotel. High-quality images help
            attract more bookings.
          </p>
        </div>
      </div>

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
          <textarea
            value={hotelData.description}
            onChange={(e) =>
              setHotelData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Describe your hotel..."
          />
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-in Time
          </label>
          <input
            type="time"
            value={hotelData.check_in_time}
            onChange={(e) =>
              setHotelData((prev) => ({
                ...prev,
                check_in_time: e.target.value,
              }))
            }
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-out Time
          </label>
          <input
            type="time"
            value={hotelData.check_out_time}
            onChange={(e) =>
              setHotelData((prev) => ({
                ...prev,
                check_out_time: e.target.value,
              }))
            }
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hotel Amenities
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {AMENITY_ICONS.map(({ value, label, icon }) => {
              const Icon = LucideIcons[icon] || LucideIcons.HelpCircle;
              const isSelected = hotelData.amenities.includes(value);

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleAmenity(value, "hotel")}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm
                    ${
                      isSelected
                        ? "border-purple-600 bg-purple-50 text-purple-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
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
                    ? "Uploading..."
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
                  <div key={index} className="relative group">
                    <div className="relative w-full h-24 rounded-lg overflow-hidden">
                      <Image
                        src={url}
                        alt={`Hotel ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      />
                    </div>
                    <button
                      onClick={() => removeImage(url, "hotel")}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Policies
          </label>
          <textarea
            value={hotelData.policies}
            onChange={(e) =>
              setHotelData((prev) => ({ ...prev, policies: e.target.value }))
            }
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Cancellation policy, pet policy, smoking policy, etc."
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex items-start gap-3">
        <Layers className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-purple-900">Suite Types</h3>
          <p className="text-sm text-purple-700 mt-1">
            Create different suite types (e.g., Deluxe, Executive). You&#39;ll
            assign specific rooms to these types in the next step.
          </p>
        </div>
      </div>

      {/* Added Suite Types */}
      {suiteTypes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Added Suite Types ({suiteTypes.length})
          </h4>
          <div className="grid gap-3">
            {suiteTypes.map((suite) => (
              <div
                key={suite.id}
                className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg"
              >
                {suite.image_urls[0] && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={suite.image_urls[0]}
                      alt={suite.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{suite.name}</h5>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span>₦{suite.base_price.toLocaleString()}/night</span>
                    <span>•</span>
                    <span>{suite.max_occupancy} guests</span>
                    {suite.size_sqm && (
                      <>
                        <span>•</span>
                        <span>{suite.size_sqm}m²</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeSuiteType(suite.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Suite Type Form */}
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
              {AMENITY_ICONS.map(({ value, label, icon }) => {
                const Icon = LucideIcons[icon] || LucideIcons.HelpCircle;
                const isSelected = currentSuite.amenities.includes(value);

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleAmenity(value, "suite")}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm
                      ${
                        isSelected
                          ? "border-purple-600 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
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
                    {isUploading ? "Uploading..." : "Upload suite images"}
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
                    <div key={index} className="relative group">
                      <div className="relative w-full h-20 rounded-lg overflow-hidden">
                        <Image
                          src={url}
                          alt={`Suite ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 33vw, 25vw"
                        />
                      </div>
                      <button
                        onClick={() => removeImage(url, "suite")}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
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

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex items-start gap-3">
        <Bed className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-purple-900">Room Generation</h3>
          <p className="text-sm text-purple-700 mt-1">
            Configure floors and room counts. Rooms will be automatically
            generated with sequential numbers.
          </p>
        </div>
      </div>

      {/* Bed Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">
            Bed Configuration
          </h4>
          <button
            onClick={addBed}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Bed Type
          </button>
        </div>

        <div className="grid gap-3">
          {roomConfig.beds.map((bed, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <select
                value={bed.type}
                onChange={(e) => updateBedConfig(index, "type", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  updateBedConfig(index, "count", e.target.value)
                }
                min="1"
                className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {roomConfig.beds.length > 1 && (
                <button
                  onClick={() => removeBed(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Floor Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">
            Floor Configuration
          </h4>
          <button
            onClick={addFloor}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Floor
          </button>
        </div>

        <div className="grid gap-3">
          {roomConfig.floors.map((floor, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Floor
                  </label>
                  <input
                    type="number"
                    value={floor.floor}
                    onChange={(e) =>
                      updateFloor(index, "floor", e.target.value)
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Room Count
                  </label>
                  <input
                    type="number"
                    value={floor.count}
                    onChange={(e) =>
                      updateFloor(index, "count", e.target.value)
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Start #
                  </label>
                  <input
                    type="number"
                    value={floor.startNumber}
                    onChange={(e) =>
                      updateFloor(index, "startNumber", e.target.value)
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Generates:{" "}
                {generateRoomNumbers(
                  floor.floor,
                  floor.count,
                  floor.startNumber
                ).join(", ")}
              </div>
              {roomConfig.floors.length > 1 && (
                <button
                  onClick={() => removeFloor(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Room-Specific Amenities */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">
          Additional Room Amenities
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {AMENITY_ICONS.map(({ value, label, icon }) => {
            const Icon = LucideIcons[icon] || LucideIcons.HelpCircle;
            const isSelected = roomConfig.amenities.includes(value);

            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleAmenity(value, "room")}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm
                  ${
                    isSelected
                      ? "border-purple-600 bg-purple-50 text-purple-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Adjustment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Adjustment (₦)
        </label>
        <input
          type="number"
          value={roomConfig.priceAdjustment}
          onChange={(e) =>
            setRoomConfig((prev) => ({
              ...prev,
              priceAdjustment: parseFloat(e.target.value) || 0,
            }))
          }
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">
          Add or subtract from suite base price for these rooms
        </p>
      </div>

      {/* Preview */}
      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
        <h4 className="text-sm font-medium text-purple-900 mb-2">
          Generation Preview
        </h4>
        <div className="text-sm text-purple-700 space-y-1">
          <p>
            • {roomConfig.floors.reduce((sum, f) => sum + f.count, 0)} rooms
            will be created
          </p>
          <p>• Across {roomConfig.floors.length} floor(s)</p>
          <p>
            • With {roomConfig.beds.reduce((sum, b) => sum + b.count, 0)} bed(s)
            per room
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const totalRooms = roomConfig.floors.reduce((sum, f) => sum + f.count, 0);
    const totalRoomsAllSuites = totalRooms * suiteTypes.length;

    return (
      <div className="space-y-6">
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex items-start gap-3">
          <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-purple-900">Review & Submit</h3>
            <p className="text-sm text-purple-700 mt-1">
              Review your hotel details before creating. You can edit individual
              rooms after creation.
            </p>
          </div>
        </div>

        {/* Hotel Summary */}
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
              <span className="text-gray-600">Check-in:</span>
              <p className="font-medium text-gray-900 mt-1">
                {hotelData.check_in_time}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Check-out:</span>
              <p className="font-medium text-gray-900 mt-1">
                {hotelData.check_out_time}
              </p>
            </div>
          </div>
          {hotelData.image_urls.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {hotelData.image_urls.slice(0, 4).map((url, i) => (
                <div
                  key={i}
                  className="relative w-full h-20 rounded-lg overflow-hidden"
                >
                  <Image
                    src={url}
                    alt={`Hotel preview ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suite Types Summary */}
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

        {/* Room Generation Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h4 className="font-medium text-gray-900">Room Generation</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {totalRoomsAllSuites}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Rooms</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {roomConfig.floors.length}
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
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Register Your Hotel
        </h1>
        <p className="text-gray-600">
          Set up your hotel, suite types, and rooms in just a few steps
        </p>
      </div>

      {renderStepIndicator()}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        {currentStep < STEPS.length ? (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Hotel
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
