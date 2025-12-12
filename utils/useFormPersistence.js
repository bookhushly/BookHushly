import { useEffect, useCallback } from "react";

const STORAGE_KEY = "hotel_registration_draft";
const AUTOSAVE_DELAY = 2000; // 2 seconds

export function useFormPersistence({
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
}) {
  // Save to localStorage
  const saveToStorage = useCallback(() => {
    try {
      const dataToSave = {
        hotelData,
        suiteTypes,
        currentSuite,
        roomConfig,
        currentStep,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      console.log("✅ Draft saved to localStorage");
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  }, [hotelData, suiteTypes, currentSuite, roomConfig, currentStep]);

  // Load from localStorage on mount
  const loadFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const data = JSON.parse(saved);

      // Check if data is not too old (e.g., 7 days)
      const savedDate = new Date(data.savedAt);
      const daysSince =
        (Date.now() - savedDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSince > 7) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Failed to load draft:", error);
      return null;
    }
  }, []);

  // Restore saved data
  const restoreDraft = useCallback(() => {
    const saved = loadFromStorage();
    if (!saved) return false;

    setHotelData(saved.hotelData || {});
    setSuiteTypes(saved.suiteTypes || []);
    setCurrentSuite(saved.currentSuite || {});
    setRoomConfig(saved.roomConfig || {});
    setCurrentStep(saved.currentStep || 1);

    console.log("✅ Draft restored from localStorage");
    return true;
  }, [
    loadFromStorage,
    setHotelData,
    setSuiteTypes,
    setCurrentSuite,
    setRoomConfig,
    setCurrentStep,
  ]);

  // Clear localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log("✅ Draft cleared from localStorage");
    } catch (error) {
      console.error("Failed to clear draft:", error);
    }
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      saveToStorage();
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timer);
  }, [saveToStorage]);

  // Check for saved data on mount
  const hasSavedDraft = useCallback(() => {
    const saved = loadFromStorage();
    return saved !== null;
  }, [loadFromStorage]);

  return {
    restoreDraft,
    clearDraft,
    hasSavedDraft,
    saveToStorage,
  };
}
