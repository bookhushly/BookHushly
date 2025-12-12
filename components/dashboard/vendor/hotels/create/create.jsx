"use client";

import {
  useState,
  useCallback,
  useTransition,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Building2,
  Layers,
  Bed,
  Check,
} from "lucide-react";
import {
  createHotel,
  createRoomType,
  bulkCreateRooms,
  generateRoomNumbers,
} from "@/lib/hotel";
import { toast } from "sonner";

import { StepIndicator } from "./shared";
import Step1HotelDetails from "./step1";
import Step2SuiteTypes from "./step2";
import Step3RoomGeneration from "./step3";
import Step4Review from "./step4";
import RestoreDraftModal from "./restore-draft";
import {
  useImageUpload,
  useSuiteManagement,
  useRoomConfiguration,
  useStepNavigation,
} from "./hooks";
import { useFormPersistence } from "@/utils/useFormPersistence";

const STEPS = [
  { id: 1, title: "Hotel Details", icon: Building2 },
  { id: 2, title: "Suite Types", icon: Layers },
  { id: 3, title: "Add Rooms", icon: Bed },
  { id: 4, title: "Review", icon: Check },
];

export default function HotelRegistration({ onComplete }) {
  const [isPending, startTransition] = useTransition();
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [savedDraftDate, setSavedDraftDate] = useState(null);
  const supabase = createClient();
  // State management
  const [hotelData, setHotelData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    checkout_policy: "fixed_time",
    check_in_time: "14:00",
    check_out_time: "12:00",
    policies: "",
    amenities: [],
    image_urls: [],
  });

  // Custom hooks
  const { isUploading, uploadProgress, handleImageUpload, removeImage } =
    useImageUpload(supabase);

  const {
    suiteTypes,
    setSuiteTypes,
    currentSuite,
    setCurrentSuite,
    addSuiteType,
    removeSuiteType,
  } = useSuiteManagement();

  const { roomConfig, setRoomConfig, totalRooms } = useRoomConfiguration();

  const { currentStep, setCurrentStep, canProceed, nextStep, prevStep } =
    useStepNavigation(hotelData, suiteTypes, roomConfig);

  // Form persistence
  const { restoreDraft, clearDraft, hasSavedDraft } = useFormPersistence({
    hotelData,
    suiteTypes,
    currentSuite,
    roomConfig,
    currentStep,
    setHotelData,
    setSuiteTypes,
    setCurrentSuite,
    setRoomConfig,
    setCurrentStep,
  });

  // Use refs to always have current values (prevents stale closures)
  const hotelDataRef = useRef(hotelData);
  const suiteTypesRef = useRef(suiteTypes);
  const roomConfigRef = useRef(roomConfig);

  // Update refs when state changes
  useEffect(() => {
    hotelDataRef.current = hotelData;
  }, [hotelData]);

  useEffect(() => {
    suiteTypesRef.current = suiteTypes;
  }, [suiteTypes]);

  useEffect(() => {
    roomConfigRef.current = roomConfig;
  }, [roomConfig]);

  // Check for saved draft on mount
  useEffect(() => {
    if (hasSavedDraft()) {
      const saved = localStorage.getItem("hotel_registration_draft");
      if (saved) {
        const data = JSON.parse(saved);
        setSavedDraftDate(data.savedAt);
        setShowRestoreModal(true);
      }
    }
  }, [hasSavedDraft]);

  const handleRestoreDraft = () => {
    restoreDraft();
    setShowRestoreModal(false);
    toast.success("Draft restored successfully");
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowRestoreModal(false);
    toast.info("Starting with fresh form");
  };

  // Image upload handlers
  const handleHotelImageUpload = useCallback(
    async (e) => {
      const urls = await handleImageUpload(e.target.files, "hotels");
      if (urls.length) {
        setHotelData((prev) => ({
          ...prev,
          image_urls: [...prev.image_urls, ...urls],
        }));
      }
      e.target.value = "";
    },
    [handleImageUpload]
  );

  const handleSuiteImageUpload = useCallback(
    async (e) => {
      const urls = await handleImageUpload(e.target.files, "room-types");
      if (urls.length) {
        setCurrentSuite((prev) => ({
          ...prev,
          image_urls: [...prev.image_urls, ...urls],
        }));
      }
      e.target.value = "";
    },
    [handleImageUpload, setCurrentSuite]
  );

  const handleRemoveImage = useCallback(
    (url, type) => {
      removeImage(url, type, setHotelData, setCurrentSuite);
    },
    [removeImage, setCurrentSuite]
  );

  // Amenity toggle handler
  const toggleAmenity = useCallback(
    (amenity, type = "hotel") => {
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
    },
    [setCurrentSuite, setRoomConfig]
  );

  // Submission handler - using refs to avoid stale closures
  const handleSubmit = useCallback(async () => {
    console.log("🚀 Submit button clicked");

    startTransition(async () => {
      try {
        // Use refs to get current state (prevents stale closures)
        const currentHotelData = hotelDataRef.current;
        const currentSuiteTypes = suiteTypesRef.current;
        const currentRoomConfig = roomConfigRef.current;

        console.log("📊 Current State:");
        console.log("  Hotel Data:", currentHotelData);
        console.log("  Suite Types:", currentSuiteTypes.length);
        console.log("  Room Config Floors:", currentRoomConfig.floors?.length);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.error("❌ No authenticated user");
          throw new Error("Not authenticated");
        }

        console.log("✅ User authenticated:", user.id);

        // 1. Create Hotel
        console.log("📝 Creating hotel...");
        const { data: hotel, error: hotelError } = await createHotel({
          ...currentHotelData,
          vendor_id: user.id,
        });

        if (hotelError) {
          console.error("❌ Hotel creation error:", hotelError);
          throw hotelError;
        }

        console.log("✅ Hotel created:", hotel.id);

        // 2. Create Suite Types in parallel
        console.log(`📝 Creating ${currentSuiteTypes.length} suite types...`);
        const suitePromises = currentSuiteTypes.map((suite) => {
          console.log(`  - Creating suite: ${suite.name}`);
          return createRoomType({
            ...suite,
            hotel_id: hotel.id,
          });
        });

        const suiteResults = await Promise.all(suitePromises);

        // Check for errors
        const suiteErrors = suiteResults.filter((r) => r.error);
        if (suiteErrors.length > 0) {
          console.error("❌ Suite creation errors:", suiteErrors);
          throw new Error(
            `Failed to create ${suiteErrors.length} suite type(s)`
          );
        }

        const createdSuiteTypes = suiteResults.map((result, index) => ({
          ...result.data,
          tempId: currentSuiteTypes[index].id,
        }));

        console.log("✅ Suite types created:", createdSuiteTypes.length);

        // 3. Generate rooms for all floors and room groups
        console.log("📝 Generating rooms...");
        const allRooms = [];

        if (
          !currentRoomConfig.floors ||
          currentRoomConfig.floors.length === 0
        ) {
          console.error("❌ No floors configured");
          throw new Error("No floors configured");
        }

        for (const floor of currentRoomConfig.floors) {
          if (!floor.rooms || floor.rooms.length === 0) {
            console.warn(`⚠️ Floor ${floor.floor} has no rooms, skipping`);
            continue;
          }

          console.log(
            `  Processing Floor ${floor.floor} with ${floor.rooms.length} room groups`
          );

          for (const roomGroup of floor.rooms) {
            const suite = createdSuiteTypes.find(
              (s) =>
                s.id === roomGroup.suite_type_id ||
                s.tempId === roomGroup.suite_type_id
            );

            if (!suite) {
              console.error(`❌ Suite not found for room group:`, roomGroup);
              continue;
            }

            const roomNumbers = generateRoomNumbers(
              floor.floor,
              roomGroup.count,
              roomGroup.startNumber
            );

            console.log(
              `    - Generating ${roomNumbers.length} rooms: ${roomNumbers[0]}-${roomNumbers[roomNumbers.length - 1]} (${suite.name})`
            );

            const rooms = roomNumbers.map((roomNumber) => ({
              hotel_id: hotel.id,
              room_type_id: suite.id,
              room_number: roomNumber,
              floor: floor.floor,
              beds: roomGroup.beds || [{ type: "king", count: 1 }],
              status: "available",
              price_per_night:
                suite.base_price + (roomGroup.priceAdjustment || 0),
              amenities: [
                ...suite.amenities,
                ...(roomGroup.additionalAmenities || []),
              ],
              image_urls: suite.image_urls || [],
              notes: null,
            }));

            allRooms.push(...rooms);
          }
        }

        if (allRooms.length === 0) {
          console.error("❌ No rooms generated");
          throw new Error(
            "No rooms were generated. Please configure at least one floor with rooms."
          );
        }

        console.log(`✅ Generated ${allRooms.length} total rooms`);

        // 4. Bulk create rooms
        console.log("📝 Inserting rooms into database...");
        const { data: createdRooms, error: roomsError } =
          await bulkCreateRooms(allRooms);

        if (roomsError) {
          console.error("❌ Room creation error:", roomsError);
          throw roomsError;
        }

        console.log(
          "✅ Rooms created successfully:",
          createdRooms?.length || allRooms.length
        );

        toast.success(
          `Hotel "${hotel.name}" created with ${allRooms.length} rooms!`
        );

        // Clear draft after successful submission
        clearDraft();
        console.log("✅ Draft cleared");

        if (onComplete) {
          console.log("✅ Calling onComplete callback");
          onComplete(hotel);
        }
      } catch (error) {
        console.error("💥 Submission error:", error);

        // Provide specific error messages
        let errorMessage = "Failed to create hotel";

        if (error.message) {
          errorMessage = error.message;
        }

        if (error.code === "23505") {
          errorMessage =
            "Duplicate room numbers detected. Please check your room configuration.";
        }

        if (error.code === "23503") {
          errorMessage = "Invalid data reference. Please try again.";
        }

        if (error.code === "PGRST116") {
          errorMessage =
            "Database constraint violation. Please check your data.";
        }

        toast.error(errorMessage);
      }
    });
  }, [supabase, onComplete, clearDraft]);

  const totalRoomsAllSuites = useMemo(
    () => totalRooms * suiteTypes.length,
    [totalRooms, suiteTypes.length]
  );

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1HotelDetails
            hotelData={hotelData}
            setHotelData={setHotelData}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            handleHotelImageUpload={handleHotelImageUpload}
            removeImage={handleRemoveImage}
            toggleAmenity={toggleAmenity}
          />
        );
      case 2:
        return (
          <Step2SuiteTypes
            suiteTypes={suiteTypes}
            currentSuite={currentSuite}
            setCurrentSuite={setCurrentSuite}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            handleSuiteImageUpload={handleSuiteImageUpload}
            removeImage={handleRemoveImage}
            toggleAmenity={toggleAmenity}
            addSuiteType={addSuiteType}
            removeSuiteType={removeSuiteType}
          />
        );
      case 3:
        return (
          <Step3RoomGeneration
            roomConfig={roomConfig}
            setRoomConfig={setRoomConfig}
            suiteTypes={suiteTypes}
            totalRooms={totalRooms}
          />
        );
      case 4:
        return (
          <Step4Review
            hotelData={hotelData}
            suiteTypes={suiteTypes}
            totalRooms={totalRooms}
            totalRoomsAllSuites={totalRoomsAllSuites}
            roomConfig={roomConfig}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {showRestoreModal && (
        <RestoreDraftModal
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
          savedAt={savedDraftDate}
        />
      )}

      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Register Your Hotel
              </h1>
              <p className="text-gray-600">
                Set up your hotel, suite types, and rooms in just a few steps
              </p>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Auto-saving
            </div>
          </div>
        </div>

        <StepIndicator steps={STEPS} currentStep={currentStep} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          {renderStep()}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            type="button"
            className="flex items-center gap-2 px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={nextStep}
              disabled={!canProceed}
              type="button"
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isPending}
              type="button"
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
    </>
  );
}
