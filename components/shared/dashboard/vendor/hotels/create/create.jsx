"use client";

import {
  useState,
  useCallback,
  useTransition,
  useMemo,
  useEffect,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Building2,
  Layers,
  Bed,
  Check,
} from "lucide-react";
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
import { useFormPersistence } from "@/hooks/useFormPersistence";
import {
  createHotelWithRoomsAction,
  validateRoomConfigAction,
} from "@/app/actions/hotels";

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
    useImageUpload();

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
    [handleImageUpload],
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
    [handleImageUpload, setCurrentSuite],
  );

  const handleRemoveImage = useCallback(
    (url, type) => {
      removeImage(url, type, setHotelData, setCurrentSuite);
    },
    [removeImage, setCurrentSuite],
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
      }
    },
    [setCurrentSuite],
  );

  // Submission handler with Server Action
  const handleSubmit = useCallback(async () => {
    console.log("🚀 Submit button clicked");

    startTransition(async () => {
      try {
        // Validate room configuration first
        const validation = await validateRoomConfigAction(roomConfig);

        if (!validation.valid) {
          if (validation.conflicts) {
            toast.error(
              `Room number conflicts detected on ${validation.conflicts.length} floor(s)`,
            );
          } else {
            toast.error(validation.error || "Invalid room configuration");
          }
          return;
        }

        console.log("✅ Room configuration validated");

        // Create hotel with all data using Server Action
        const result = await createHotelWithRoomsAction(
          hotelData,
          suiteTypes,
          roomConfig,
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        console.log("✅ Hotel created successfully:", result.hotel.id);

        toast.success(
          `Hotel "${result.hotel.name}" created with ${result.roomCount} rooms!`,
          { duration: 5000 },
        );

        // Clear draft after successful submission
        clearDraft();

        if (onComplete) {
          onComplete(result.hotel);
        }
      } catch (error) {
        console.error("💥 Submission error:", error);

        let errorMessage = "Failed to create hotel";

        if (error.message) {
          errorMessage = error.message;
        }

        // Handle specific error codes
        if (error.code === "23505") {
          errorMessage =
            "Duplicate room numbers detected. Please check your room configuration.";
        } else if (error.code === "23503") {
          errorMessage = "Invalid data reference. Please try again.";
        } else if (error.code === "PGRST116") {
          errorMessage =
            "Database constraint violation. Please check your data.";
        }

        toast.error(errorMessage);
      }
    });
  }, [hotelData, suiteTypes, roomConfig, onComplete, clearDraft]);

  const totalRoomsAllSuites = useMemo(
    () => totalRooms * suiteTypes.length,
    [totalRooms, suiteTypes.length],
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
