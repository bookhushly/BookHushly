"use client";

import { useState, useCallback, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { createListing } from "@/app/actions/listings";
import {
  getCategoryFormConfig,
  prepareCategoryData,
} from "@/lib/category-forms";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// Static imports for critical path components
import Stepper from "@/components/shared/listings/create/Stepper";
import CategorySelection from "@/components/shared/listings/create/categorySelection";
import ServiceDetails from "@/components/shared/listings/create/ServiceDetails";
import MediaUpload from "@/components/shared/listings/create/MediaUpload";
import ReviewListing from "@/components/shared/listings/create/ReviewListing";
import NavigationButtons from "@/components/shared/listings/create/NavigationButtons";
import HotelRegistration from "../../../../../../components/shared/dashboard/vendor/hotels/create/create";

const STEPS = [
  { id: 1, label: "Category" },
  { id: 2, label: "Details" },
  { id: 3, label: "Media" },
  { id: 4, label: "Review" },
];

const TOTAL_STEPS = 4;
const MAX_IMAGES = 5;
const MAX_MEALS = 20;
const MAX_TICKETS = 10;

export default function CreateListingPage() {
  const supabase = createClient();
  const { data: authData } = useAuth();
  const user = authData?.user;
  const vendor = authData?.vendor;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Track if form has been initialized to prevent re-initialization
  const isInitialized = useRef(false);
  const currentCategory = useRef("");

  // Core state - grouped logically
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [eventType, setEventType] = useState("");
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Media state
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Food category state
  const [meals, setMeals] = useState([]);
  const [tempMeal, setTempMeal] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [tempMealImage, setTempMealImage] = useState(null);
  const [tempMealImagePreview, setTempMealImagePreview] = useState(null);

  // Event category state
  const [useMultiplePackages, setUseMultiplePackages] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [tempTicket, setTempTicket] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
  });

  // Memoized category config
  const categoryConfig = selectedCategory
    ? getCategoryFormConfig(selectedCategory, eventType)
    : null;

  // Load saved draft once on mount
  useEffect(() => {
    if (!user?.id) return;

    const savedData = localStorage.getItem(`listing-draft-${user.id}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed.formData || {});
        setSelectedCategory(parsed.selectedCategory || "");
        setEventType(parsed.eventType || "");
        setStep(parsed.step || 1);
        setMeals(parsed.meals || []);
        setTickets(parsed.tickets || []);
        setUseMultiplePackages(parsed.useMultiplePackages || false);

        if (parsed.selectedCategory) {
          isInitialized.current = true;
          currentCategory.current = parsed.selectedCategory;
        }
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, [user?.id]);

  // Debounced save to localStorage
  useEffect(() => {
    if (!user?.id || Object.keys(formData).length === 0) return;

    const timeoutId = setTimeout(() => {
      const draftData = {
        formData,
        selectedCategory,
        eventType,
        step,
        meals: meals.map(({ image, imagePreview, ...rest }) => rest),
        tickets,
        useMultiplePackages,
      };

      try {
        localStorage.setItem(
          `listing-draft-${user.id}`,
          JSON.stringify(draftData),
        );
      } catch (e) {
        console.error("Failed to save draft:", e);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [
    formData,
    selectedCategory,
    eventType,
    step,
    meals,
    tickets,
    useMultiplePackages,
    user?.id,
  ]);

  // Initialize form data when category changes
  useEffect(() => {
    if (!selectedCategory || !categoryConfig) return;

    if (currentCategory.current === selectedCategory && isInitialized.current) {
      return;
    }

    currentCategory.current = selectedCategory;
    isInitialized.current = true;

    const initialData = { availability: "available" };
    categoryConfig.fields.forEach((field) => {
      initialData[field.name] =
        field.type === "multiselect" || field.type === "amenity_multiselect"
          ? []
          : "";
    });

    setFormData(initialData);
    setErrors({});

    if (selectedCategory === "food") {
      setMeals([]);
    }
    if (selectedCategory === "events" && eventType === "event_organizer") {
      setTickets([]);
    }
  }, [selectedCategory, eventType, categoryConfig]);

  // Handlers
  const handleCategoryChange = useCallback((category) => {
    isInitialized.current = false;
    setSelectedCategory(category);
    setEventType("");
    setErrors({});
    setStep(1);
  }, []);

  const handleEventTypeChange = useCallback((type) => {
    setEventType(type);
    setErrors({});
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const maxLength =
      name === "title" ? 100 : name === "description" ? 500 : undefined;

    let limitedValue = value;
    if (maxLength && value.length > maxLength) {
      limitedValue = value.slice(0, maxLength);
      setErrors((prev) => ({
        ...prev,
        [name]: `Max ${maxLength} characters allowed`,
      }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : limitedValue,
    }));
  }, []);

  const handleMultiSelectChange = useCallback((fieldName, value, checked) => {
    setFormData((prev) => {
      const currentValues = prev[fieldName] || [];
      const newValues = checked
        ? [...currentValues, value]
        : currentValues.filter((v) => v !== value);
      return { ...prev, [fieldName]: newValues };
    });
    setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
  }, []);

  const handleSelectChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleImageChange = useCallback((e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_IMAGES);
    setImages(files);

    if (files.length > MAX_IMAGES) {
      setErrors((prev) => ({
        ...prev,
        images: `Maximum ${MAX_IMAGES} images allowed`,
      }));
    } else {
      setErrors((prev) => ({ ...prev, images: undefined }));
    }

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  }, []);

  // Meal handlers
  const handleTempMealChange = useCallback((e) => {
    const { name, value } = e.target;
    setTempMeal((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleTempMealImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempMealImage(file);
      setTempMealImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const addMeal = useCallback(() => {
    if (!tempMeal.name || !tempMeal.price || !tempMealImage) {
      setErrors((prev) => ({
        ...prev,
        meals: "Meal name, price, and image are required",
      }));
      return;
    }
    if (meals.length >= MAX_MEALS) {
      setErrors((prev) => ({
        ...prev,
        meals: `Maximum ${MAX_MEALS} meals allowed`,
      }));
      return;
    }

    setMeals((prev) => [
      ...prev,
      { ...tempMeal, image: tempMealImage, imagePreview: tempMealImagePreview },
    ]);
    setTempMeal({ name: "", price: "", description: "" });
    setTempMealImage(null);
    setTempMealImagePreview(null);
    setErrors((prev) => ({ ...prev, meals: undefined }));
  }, [tempMeal, tempMealImage, tempMealImagePreview, meals.length]);

  const removeMeal = useCallback((index) => {
    setMeals((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Ticket handlers
  const handleTempTicketChange = useCallback((e) => {
    const { name, value } = e.target;
    setTempTicket((prev) => ({ ...prev, [name]: value }));
  }, []);

  const addTicket = useCallback(() => {
    if (!tempTicket.name || !tempTicket.price || !tempTicket.quantity) {
      setErrors((prev) => ({
        ...prev,
        tickets: "Ticket name, price, and quantity are required",
      }));
      return;
    }
    if (tickets.length >= MAX_TICKETS) {
      setErrors((prev) => ({
        ...prev,
        tickets: `Maximum ${MAX_TICKETS} packages allowed`,
      }));
      return;
    }

    setTickets((prev) => [
      ...prev,
      { ...tempTicket, remaining: tempTicket.quantity },
    ]);
    setTempTicket({ name: "", price: "", quantity: "", description: "" });
    setErrors((prev) => ({ ...prev, tickets: undefined }));
  }, [tempTicket, tickets.length]);

  const removeTicket = useCallback((index) => {
    setTickets((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Validation
  const validateStep = useCallback(
    (currentStep) => {
      const newErrors = {};

      if (currentStep === 1) {
        if (!selectedCategory) newErrors.global = "Please select a category";
        if (selectedCategory === "events" && !eventType) {
          newErrors.eventType = "Please select an event type";
        }
      }

      if (currentStep === 2 && categoryConfig) {
        categoryConfig.fields.forEach((field) => {
          if (field.required) {
            if (
              selectedCategory === "events" &&
              eventType === "event_organizer" &&
              useMultiplePackages &&
              (field.name === "price" || field.name === "total_tickets")
            ) {
              return;
            }

            const value = formData[field.name];
            if (!value || (Array.isArray(value) && value.length === 0)) {
              newErrors[field.name] = `${field.label} is required`;
            }
          }
        });

        if (selectedCategory === "food" && meals.length === 0) {
          newErrors.meals = "At least one meal is required";
        }

        if (
          selectedCategory === "events" &&
          eventType === "event_organizer" &&
          useMultiplePackages &&
          tickets.length === 0
        ) {
          newErrors.tickets = "At least one ticket package is required";
        }

        if (
          selectedCategory === "events" &&
          eventType === "event_organizer" &&
          !useMultiplePackages &&
          (!formData.price || parseFloat(formData.price) <= 0)
        ) {
          newErrors.price = "Valid price required";
        }
      }

      if (currentStep === 3 && images.length === 0) {
        newErrors.images = "At least one image is required";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [
      selectedCategory,
      eventType,
      categoryConfig,
      formData,
      meals,
      tickets,
      images,
      useMultiplePackages,
    ],
  );

  const nextStep = useCallback(() => {
    if (validateStep(step)) {
      startTransition(() => {
        setStep((s) => s + 1);
      });
    }
  }, [step, validateStep]);

  const prevStep = useCallback(() => {
    startTransition(() => {
      setStep((s) => s - 1);
    });
  }, []);

  // Optimized upload functions with parallel processing
  const uploadImages = async () => {
    const bucket =
      selectedCategory === "food" ? "food-images" : "listing-images";

    const uploadPromises = images.map(async (image, index) => {
      const filePath = `${user.id}/${Date.now()}-${index}-${image.name}`;
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error)
        throw new Error(`Failed to upload ${image.name}: ${error.message}`);

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    setUploadProgress(100);

    return uploadedUrls;
  };

  const uploadMealImages = async () => {
    const mealsWithImages = meals.filter((meal) => meal.image);

    const uploadPromises = mealsWithImages.map(async (meal, index) => {
      const filePath = `${user.id}/${Date.now()}-meal-${index}-${meal.image.name}`;
      const { data, error } = await supabase.storage
        .from("food-images")
        .upload(filePath, meal.image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error)
        throw new Error(`Failed to upload meal image: ${error.message}`);

      const { data: urlData } = supabase.storage
        .from("food-images")
        .getPublicUrl(filePath);

      return { meal, url: urlData.publicUrl };
    });

    const uploadedMeals = await Promise.all(uploadPromises);

    return meals.map((meal) => {
      const uploaded = uploadedMeals.find((um) => um.meal === meal);
      return uploaded ? uploaded.url : null;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[Client] ===== FORM SUBMIT START =====");

    if (!validateStep(TOTAL_STEPS)) {
      console.log("[Client] Validation failed at step:", TOTAL_STEPS);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log("[Client] Step 1: Processing amenities");
      // Process amenities
      const processedAmenities = Array.isArray(formData.amenities)
        ? formData.amenities.map((amenityValue) => {
            const amenityField = categoryConfig?.fields.find(
              (f) => f.name === "amenities",
            );
            const amenityOption = amenityField?.options?.find(
              (opt) => opt.value === amenityValue,
            );
            return {
              value: amenityValue,
              label: amenityOption?.label || amenityValue,
              icon: amenityOption?.icon || amenityValue,
            };
          })
        : [];
      console.log("[Client] Processed amenities:", processedAmenities);

      // Upload all images in parallel
      console.log("[Client] Step 2: Starting image uploads");
      setUploadProgress(10);
      const uploadPromises = [uploadImages()];

      if (selectedCategory === "food" && meals.length > 0) {
        console.log("[Client] Adding meal image uploads");
        uploadPromises.push(uploadMealImages());
      }

      console.log("[Client] Waiting for image uploads...");
      const [uploadedImageUrls, mealImageUrls] =
        await Promise.all(uploadPromises);
      console.log("[Client] Image uploads complete:", {
        mainImages: uploadedImageUrls.length,
        mealImages: mealImageUrls?.length || 0,
      });

      setUploadProgress(50);

      // Process meals with uploaded image URLs
      console.log("[Client] Step 3: Processing meals");
      let processedMeals = null;
      if (selectedCategory === "food" && meals.length > 0) {
        processedMeals = meals.map((meal, i) => ({
          name: meal.name,
          price: parseFloat(meal.price),
          description: meal.description,
          image_url: mealImageUrls[i],
        }));
        console.log("[Client] Processed meals:", processedMeals);
      }

      // Process tickets and calculate pricing
      console.log("[Client] Step 4: Processing tickets");
      let listingPrice = parseFloat(formData.price) || 0;
      let processedTickets = null;
      let totalTickets = 0;

      if (tickets.length > 0) {
        processedTickets = tickets.map((ticket) => ({
          name: ticket.name,
          price: parseFloat(ticket.price),
          total: parseInt(ticket.quantity),
          remaining: parseInt(ticket.quantity),
          description: ticket.description,
        }));
        totalTickets = processedTickets.reduce((sum, t) => sum + t.total, 0);
        listingPrice = Math.min(...processedTickets.map((t) => t.price));
        console.log("[Client] Processed tickets:", {
          count: processedTickets.length,
          totalTickets,
          lowestPrice: listingPrice,
        });
      }

      setUploadProgress(70);

      // Prepare category-specific data
      console.log("[Client] Step 5: Preparing category data");
      const categoryData = prepareCategoryData(
        {
          ...formData,
          media_urls: uploadedImageUrls,
          event_type: selectedCategory === "events" ? eventType : null,
          meals: processedMeals,
          amenities: processedAmenities,
        },
        selectedCategory,
        eventType,
      );
      console.log("[Client] Category data prepared:", categoryData);

      // Create final listing data object
      console.log("[Client] Step 6: Creating final listing data");
      const listingData = {
        ...categoryData,
        vendor_id: vendor.id,
        vendor_name: vendor?.business_name || "",
        vendor_phone: vendor?.phone_number || "",
        active: true,
        event_type: selectedCategory === "events" ? eventType : null,
        price: listingPrice,
        total_tickets: totalTickets,
        remaining_tickets: totalTickets,
        ticket_packages: processedTickets || [],
        amenities: processedAmenities,
      };
      console.log("[Client] Final listing data:", listingData);

      setUploadProgress(90);

      // Create listing via server action
      console.log("[Client] Step 7: Calling server action");
      console.time("[Client] Server action duration");
      const result = await createListing(listingData);
      console.timeEnd("[Client] Server action duration");
      console.log("[Client] Server action result:", result);

      if (!result.success) {
        console.error("[Client] Server action failed:", result.error);
        throw new Error(result.error);
      }

      setUploadProgress(100);
      console.log("[Client] Step 8: Success! Cleaning up");

      // Cleanup
      localStorage.removeItem(`listing-draft-${user?.id}`);

      toast.success("Listing created successfully!");
      console.log("[Client] Navigating to dashboard");
      router.push("/vendor/dashboard");
      console.log("[Client] ===== FORM SUBMIT SUCCESS =====");
    } catch (err) {
      console.error("[Client] ===== FORM SUBMIT ERROR =====");
      console.error("[Client] Error:", err);
      console.error("[Client] Error message:", err.message);
      console.error("[Client] Error stack:", err.stack);
      setErrors({
        global: err.message || "Failed to create listing. Please try again.",
      });
      toast.error(err.message || "Failed to create listing");
    } finally {
      console.log("[Client] Cleanup: resetting loading state");
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const onComplete = () => {
    router.push("/vendor/dashboard");
  };

  return (
    <div className="max-w-4xl mx-auto py-10 min-h-screen">
      <Link
        href="/vendor/dashboard"
        className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors mb-8 font-medium"
      >
        <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
      </Link>
      {vendor?.business_category === "hotels" ? (
        <HotelRegistration onComplete={onComplete} />
      ) : (
        <>
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Create New Listing
            </h1>
            <p className="text-lg text-gray-600">
              Add your service in a few simple steps
            </p>
          </div>

          {errors.global && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert variant="destructive">
                <AlertDescription>{errors.global}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {loading && uploadProgress > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert className="border-purple-200 bg-purple-50">
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-purple-900">
                      {uploadProgress < 50
                        ? "Uploading images..."
                        : uploadProgress < 90
                          ? "Creating listing..."
                          : "Finalizing..."}{" "}
                      {uploadProgress}%
                    </p>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <Stepper steps={STEPS} currentStep={step} />
            <div className={isPending ? "opacity-50 pointer-events-none" : ""}>
              {step === 1 && (
                <CategorySelection
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                  eventType={eventType}
                  onEventTypeChange={handleEventTypeChange}
                  errors={errors}
                  vendorCategory={vendor?.business_category}
                />
              )}

              {step === 2 && categoryConfig && (
                <ServiceDetails
                  categoryConfig={categoryConfig}
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  selectedCategory={selectedCategory}
                  eventType={eventType}
                  meals={meals}
                  setMeals={setMeals}
                  tempMeal={tempMeal}
                  setTempMeal={setTempMeal}
                  tempMealImage={tempMealImage}
                  setTempMealImage={setTempMealImage}
                  tempMealImagePreview={tempMealImagePreview}
                  setTempMealImagePreview={setTempMealImagePreview}
                  handleTempMealChange={handleTempMealChange}
                  handleTempMealImageChange={handleTempMealImageChange}
                  addMeal={addMeal}
                  removeMeal={removeMeal}
                  useMultiplePackages={useMultiplePackages}
                  setUseMultiplePackages={setUseMultiplePackages}
                  tickets={tickets}
                  setTickets={setTickets}
                  tempTicket={tempTicket}
                  setTempTicket={setTempTicket}
                  handleTempTicketChange={handleTempTicketChange}
                  addTicket={addTicket}
                  removeTicket={removeTicket}
                  handleSelectChange={handleSelectChange}
                  handleChange={handleChange}
                  handleMultiSelectChange={handleMultiSelectChange}
                />
              )}

              {step === 3 && (
                <MediaUpload
                  handleImageChange={handleImageChange}
                  errors={errors}
                  imagePreviews={imagePreviews}
                  loading={loading}
                  uploadProgress={uploadProgress}
                />
              )}

              {step === 4 && (
                <ReviewListing
                  formData={formData}
                  selectedCategory={selectedCategory}
                  eventType={eventType}
                  images={images}
                  meals={meals}
                  tickets={tickets}
                />
              )}
            </div>

            <NavigationButtons
              step={step}
              totalSteps={TOTAL_STEPS}
              prevStep={prevStep}
              nextStep={nextStep}
              loading={loading}
            />
          </form>
        </>
      )}
    </div>
  );
}
