import { useState, useCallback, useTransition } from "react";
import { toast } from "sonner";
import {
  uploadHotelImagesAction,
  deleteHotelImageAction,
} from "@/app/actions/hotels";
import { compressImage } from "@/lib/images";

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleImageUpload = useCallback(async (files, category) => {
    if (!files || files.length === 0) return [];

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Compress images in parallel
      const compressionPromises = Array.from(files).map((file) =>
        compressImage(file),
      );

      const compressedFiles = await Promise.all(compressionPromises);
      setUploadProgress(30);

      // Create FormData
      const formData = new FormData();
      compressedFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("category", category);

      setUploadProgress(50);

      // Upload using Server Action
      const result = await uploadHotelImagesAction(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      setUploadProgress(100);
      toast.success(`${result.urls.length} image(s) uploaded successfully`);

      return result.urls;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload images");
      return [];
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const removeImage = useCallback(
    async (url, type, setHotelData, setCurrentSuite) => {
      startTransition(async () => {
        try {
          const result = await deleteHotelImageAction(url);

          if (!result.success) {
            throw new Error(result.error);
          }

          // Update state based on type
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

          toast.success("Image removed");
        } catch (error) {
          console.error("Remove image error:", error);
          toast.error(error.message || "Failed to remove image");
        }
      });
    },
    [],
  );

  return {
    isUploading: isUploading || isPending,
    uploadProgress,
    handleImageUpload,
    removeImage,
  };
}

export function useSuiteManagement() {
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
    toast.success("Suite type added");
  }, [currentSuite]);

  const removeSuiteType = useCallback((id) => {
    setSuiteTypes((prev) => prev.filter((s) => s.id !== id));
    toast.success("Suite type removed");
  }, []);

  return {
    suiteTypes,
    setSuiteTypes,
    currentSuite,
    setCurrentSuite,
    addSuiteType,
    removeSuiteType,
  };
}

export function useRoomConfiguration() {
  const [roomConfig, setRoomConfig] = useState({
    floors: [],
  });

  const totalRooms = useCallback(() => {
    if (!roomConfig.floors || !Array.isArray(roomConfig.floors)) return 0;
    return roomConfig.floors.reduce((sum, floor) => {
      if (!floor.rooms || !Array.isArray(floor.rooms)) return sum;
      return (
        sum +
        floor.rooms.reduce((floorSum, room) => floorSum + (room.count || 0), 0)
      );
    }, 0);
  }, [roomConfig.floors])();

  return {
    roomConfig,
    setRoomConfig,
    totalRooms,
  };
}

export function useStepNavigation(hotelData, suiteTypes, roomConfig) {
  const [currentStep, setCurrentStep] = useState(1);

  const canProceed = useCallback(() => {
    if (currentStep === 1) {
      return (
        hotelData.name &&
        hotelData.city &&
        hotelData.address &&
        hotelData.checkout_policy
      );
    }
    if (currentStep === 2) {
      return suiteTypes.length > 0;
    }
    if (currentStep === 3) {
      if (!roomConfig.floors || roomConfig.floors.length === 0) return false;

      // Check for room number conflicts
      const hasConflicts = roomConfig.floors.some((floor) => {
        if (!floor.rooms || floor.rooms.length <= 1) return false;

        return floor.rooms.some((currentGroup, currentIndex) => {
          const currentStart = currentGroup.startNumber;
          const currentEnd = currentStart + currentGroup.count - 1;

          return floor.rooms.some((otherGroup, otherIndex) => {
            if (currentIndex === otherIndex) return false;

            const otherStart = otherGroup.startNumber;
            const otherEnd = otherStart + otherGroup.count - 1;

            return (
              (currentStart >= otherStart && currentStart <= otherEnd) ||
              (currentEnd >= otherStart && currentEnd <= otherEnd) ||
              (otherStart >= currentStart && otherStart <= currentEnd)
            );
          });
        });
      });

      return !hasConflicts;
    }
    return true;
  }, [currentStep, hotelData, suiteTypes, roomConfig])();

  const nextStep = useCallback(() => {
    if (canProceed) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    } else {
      if (currentStep === 3) {
        toast.error("Please fix room number conflicts before proceeding");
      } else {
        toast.error("Please complete required fields");
      }
    }
  }, [canProceed, currentStep]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  return {
    currentStep,
    setCurrentStep,
    canProceed,
    nextStep,
    prevStep,
  };
}
