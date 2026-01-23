"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { createServicedApartment } from "@/app/actions/apartments";
import Step1BasicInfo from "../../../../../../components/shared/dashboard/vendor/apartments/step1";
import Step3Pricing from "../../../../../../components/shared/dashboard/vendor/apartments/step3";
import Step2Location from "../../../../../../components/shared/dashboard/vendor/apartments/step2";
import Step5Amenities from "../../../../../../components/shared/dashboard/vendor/apartments/step5";
import Step4Utilities from "../../../../../../components/shared/dashboard/vendor/apartments/step4";
import Step6Images from "../../../../../../components/shared/dashboard/vendor/apartments/step6";
import Step8Review from "../../../../../../components/shared/dashboard/vendor/apartments/step8";
import Step7Policies from "../../../../../../components/shared/dashboard/vendor/apartments/step7";
import { useVendor } from "../../../../../../hooks/use-vendor";

const STORAGE_KEY = "apartment_form_draft";
const STEPS_TOTAL = 8;

const STEP_COMPONENTS = {
  1: Step1BasicInfo,
  2: Step2Location,
  3: Step3Pricing,
  4: Step4Utilities,
  5: Step5Amenities,
  6: Step6Images,
  7: Step7Policies,
  8: Step8Review,
};

const STEP_TITLES = {
  1: "Basic Information",
  2: "Location Details",
  3: "Pricing",
  4: "Utilities & Power",
  5: "Amenities",
  6: "Photos & Media",
  7: "Policies & Rules",
  8: "Review & Submit",
};

const INITIAL_FORM_DATA = {
  // Basic Info
  name: "",
  description: "",
  apartment_type: "",
  bedrooms: "",
  bathrooms: "",
  max_guests: "",
  square_meters: "",
  floor_number: "",
  furnished: true,
  kitchen_equipped: true,
  has_balcony: false,
  has_terrace: false,
  parking_spaces: 0,

  // Location
  address: "",
  city: "",
  state: "",
  area: "",
  landmark: "",

  // Pricing
  price_per_night: "",
  price_per_week: "",
  price_per_month: "",
  minimum_stay: 1,
  caution_deposit: "",

  // Utilities
  utilities_included: false,
  electricity_included: false,
  generator_available: false,
  generator_hours: "",
  inverter_available: false,
  solar_power: false,
  water_supply: "",
  internet_included: false,
  internet_speed: "",

  // Security
  security_features: {
    "24hr_security": false,
    cctv_surveillance: false,
    estate_gate: false,
    access_control: false,
    intercom_system: false,
  },

  // Amenities
  amenities: {},

  // Media
  image_urls: [],
  video_url: "",
  virtual_tour_url: "",

  // Policies
  check_in_time: "14:00",
  check_out_time: "12:00",
  cancellation_policy: "",
  house_rules: "",
  instant_booking: true,
  available_from: "",
  available_until: "",
};

export default function ApartmentCreationForm() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.data || INITIAL_FORM_DATA);
        setCurrentStep(parsed.step || 1);
        toast.info("Draft restored from last session");
      } catch (error) {
        console.error("Failed to parse saved draft:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Auto-save to localStorage with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            data: formData,
            step: currentStep,
            lastSaved: new Date().toISOString(),
          })
        );
      } catch (error) {
        console.error("Failed to save draft:", error);
      }
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timer);
  }, [formData, currentStep]);
  const { data: user, error: userError } = supabase.auth.getUser();
  console.log("user is", user);
  const { data: vendor, isLoading, error } = useVendor(user.id);
  if (isLoading) {
    return <p>Verifying Vendor...</p>;
  }
  if (error) {
    console.log("Vendor Fetch Failed", error);
    return <p>Something went wrong</p>;
  }
  // Update form data
  const updateFormData = useCallback((updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(updates).forEach((key) => {
        delete newErrors[key];
      });
      return newErrors;
    });
  }, []);

  // Validate current step
  const validateStep = () => {
    const stepErrors = {};

    if (currentStep === 1) {
      if (!formData.name?.trim()) {
        stepErrors.name = "Apartment name is required";
      }
      if (!formData.apartment_type) {
        stepErrors.apartment_type = "Apartment type is required";
      }
      if (!formData.bedrooms || formData.bedrooms < 1) {
        stepErrors.bedrooms = "At least 1 bedroom is required";
      }
      if (!formData.bathrooms || formData.bathrooms < 1) {
        stepErrors.bathrooms = "At least 1 bathroom is required";
      }
      if (!formData.max_guests || formData.max_guests < 1) {
        stepErrors.max_guests = "Maximum guests is required";
      }
    }

    if (currentStep === 2) {
      if (!formData.city?.trim()) {
        stepErrors.city = "City is required";
      }
      if (!formData.state?.trim()) {
        stepErrors.state = "State is required";
      }
    }

    if (currentStep === 3) {
      if (!formData.price_per_night || formData.price_per_night <= 0) {
        stepErrors.price_per_night = "Valid nightly price is required";
      }
    }

    if (currentStep === 6) {
      if (!formData.image_urls || formData.image_urls.length === 0) {
        stepErrors.image_urls = "At least one image is required";
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Navigate to next step
  const handleNext = () => {
    if (!validateStep()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (currentStep < STEPS_TOTAL) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Manual save draft
  const handleSaveDraft = () => {
    setIsSaving(true);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          data: formData,
          step: currentStep,
          lastSaved: new Date().toISOString(),
        })
      );
      toast.success("Draft saved successfully");
    } catch (error) {
      toast.error("Failed to save draft");
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateStep()) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for server action
      const submitData = new FormData();

      submitData.append("vendor_id", vendor.id);

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          return; // Skip empty values
        }

        if (typeof value === "object" && !Array.isArray(value)) {
          // JSON objects (amenities, security_features)
          submitData.append(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
          // Arrays (image_urls)
          submitData.append(key, JSON.stringify(value));
        } else if (typeof value === "boolean") {
          submitData.append(key, value.toString());
        } else {
          submitData.append(key, value.toString());
        }
      });

      // Call server action
      const result = await createServicedApartment(submitData);

      if (result.success) {
        toast.success(result.message || "Apartment created successfully!");

        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);

        // Redirect to apartment page
        router.push(`/vendor/serviced-apartments/${result.data.id}`);
      } else {
        toast.error(result.error || "Failed to create apartment");

        // Handle validation errors
        if (result.errors) {
          setErrors(result.errors);

          // Find which step has errors and navigate there
          const errorFields = Object.keys(result.errors);
          if (
            errorFields.some((f) =>
              [
                "name",
                "apartment_type",
                "bedrooms",
                "bathrooms",
                "max_guests",
              ].includes(f)
            )
          ) {
            setCurrentStep(1);
          } else if (errorFields.some((f) => ["city", "state"].includes(f))) {
            setCurrentStep(2);
          } else if (errorFields.some((f) => ["price_per_night"].includes(f))) {
            setCurrentStep(3);
          } else if (errorFields.some((f) => ["image_urls"].includes(f))) {
            setCurrentStep(6);
          }
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle exit with unsaved changes
  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    localStorage.removeItem(STORAGE_KEY);
    router.push("/vendor/dashboard");
  };

  // Clear draft
  const clearDraft = () => {
    if (
      confirm(
        "Are you sure you want to clear this draft? This cannot be undone."
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      setFormData(INITIAL_FORM_DATA);
      setCurrentStep(1);
      toast.success("Draft cleared");
    }
  };

  // Navigate to specific step (for review page)
  const navigateToStep = (step) => {
    if (step >= 1 && step <= STEPS_TOTAL) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const progress = (currentStep / STEPS_TOTAL) * 100;
  const CurrentStepComponent = STEP_COMPONENTS[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create Serviced Apartment
              </h1>
              <p className="text-gray-600 mt-1">
                Step {currentStep} of {STEPS_TOTAL}: {STEP_TITLES[currentStep]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExit}>
                Exit
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            {/* <Progress value={progress} className="h-2" /> */}
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress: {Math.round(progress)}%</span>
              <span>Auto-saving...</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {CurrentStepComponent ? (
            currentStep === 8 ? (
              <CurrentStepComponent
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
                onNavigateToStep={navigateToStep}
              />
            ) : (
              <CurrentStepComponent
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Step Under Construction
              </h3>
              <p className="text-gray-600">
                This step is being built. For now, you can navigate using the
                buttons below.
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between py-6 border-t border-gray-200 bg-white rounded-lg px-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDraft}
              disabled={isSubmitting}
            >
              Clear Draft
            </Button>
          </div>

          {currentStep < STEPS_TOTAL ? (
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Apartment"
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress has been auto-saved. You can return anytime to
              continue from where you left off.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit}>Exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
