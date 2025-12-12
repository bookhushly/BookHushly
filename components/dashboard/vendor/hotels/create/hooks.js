import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { uploadHotelImages, deleteHotelImage } from "@/lib/hotel";
import { compressImage, uploadImagesInParallel } from "@/lib/images";

export function useImageUpload(supabase) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = useCallback(
    async (files, category) => {
      if (!files.length) return [];

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const compressedFiles = await Promise.all(
          Array.from(files).map((file) => compressImage(file))
        );

        const urls = await uploadImagesInParallel(
          compressedFiles,
          async (file) => {
            const result = await uploadHotelImages([file], user.id, category);
            return result[0];
          },
          3
        );

        toast.success(`${urls.length} image(s) uploaded`);
        return urls;
      } catch (error) {
        toast.error("Failed to upload images");
        console.error(error);
        return [];
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [supabase]
  );

  const removeImage = useCallback(
    async (url, type, setHotelData, setCurrentSuite) => {
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
    },
    []
  );

  return {
    isUploading,
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

  const totalRooms = useMemo(() => {
    if (!roomConfig.floors || !Array.isArray(roomConfig.floors)) return 0;
    return roomConfig.floors.reduce((sum, floor) => {
      if (!floor.rooms || !Array.isArray(floor.rooms)) return sum;
      return (
        sum +
        floor.rooms.reduce((floorSum, room) => floorSum + (room.count || 0), 0)
      );
    }, 0);
  }, [roomConfig.floors]);

  return {
    roomConfig,
    setRoomConfig,
    totalRooms,
  };
}

export function useStepNavigation(hotelData, suiteTypes, roomConfig) {
  const [currentStep, setCurrentStep] = useState(1);

  const canProceed = useMemo(() => {
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

      // Check for room number conflicts on any floor
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
  }, [currentStep, hotelData, suiteTypes, roomConfig]);

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
