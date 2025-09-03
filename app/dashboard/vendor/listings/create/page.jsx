"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore, useListingStore } from "@/lib/store";
import { createListing } from "@/lib/database";
import { CATEGORIES } from "@/lib/constants";
import {
  getCategoryFormConfig,
  prepareCategoryData,
} from "@/lib/category-forms";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Dynamically import components to optimize bundle size
const Stepper = dynamic(() => import("@/components/listings/create/Stepper"), {
  ssr: false,
});
const CategorySelection = dynamic(
  () => import("@/components/listings/create/CategorySelection"),
  {
    ssr: false,
  }
);
const ServiceDetails = dynamic(
  () => import("@/components/listings/create/ServiceDetails"),
  {
    ssr: false,
  }
);
const MediaUpload = dynamic(
  () => import("@/components/listings/create/MediaUpload"),
  { ssr: false }
);
const ReviewListing = dynamic(
  () => import("@/components/listings/create/ReviewListing"),
  { ssr: false }
);
const NavigationButtons = dynamic(
  () => import("@/components/listings/create/NavigationButtons"),
  {
    ssr: false,
  }
);

export default function CreateListingPage() {
  const { user, vendor } = useAuthStore();
  const { addListing } = useListingStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [eventType, setEventType] = useState("");
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [step, setStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [meals, setMeals] = useState([]);
  const [tempMeal, setTempMeal] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [tempMealImage, setTempMealImage] = useState(null);
  const [tempMealImagePreview, setTempMealImagePreview] = useState(null);
  const totalSteps = 4;
  const firstInputRef = useRef(null);

  const steps = [
    { id: 1, label: "Category" },
    { id: 2, label: "Details" },
    { id: 3, label: "Media" },
    { id: 4, label: "Review" },
  ];

  const [debouncedFormData] = useDebounce(formData, 500);

  const categoryConfig = useMemo(
    () =>
      selectedCategory
        ? getCategoryFormConfig(selectedCategory, eventType)
        : null,
    [selectedCategory, eventType]
  );

  useEffect(() => {
    const savedData = localStorage.getItem(`listing-draft-${user?.id}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(parsed.formData || {});
      setSelectedCategory(parsed.selectedCategory || "");
      setEventType(parsed.eventType || "");
      setStep(parsed.step || 1);
      setMeals(parsed.meals || []);
    }
  }, [user?.id]);

  useEffect(() => {
    if (debouncedFormData && Object.keys(debouncedFormData).length > 0) {
      localStorage.setItem(
        `listing-draft-${user?.id}`,
        JSON.stringify({
          formData: debouncedFormData,
          selectedCategory,
          eventType,
          step,
          meals: meals.map(({ image, imagePreview, ...rest }) => rest),
        })
      );
    }
  }, [debouncedFormData, selectedCategory, eventType, step, meals, user?.id]);

  useEffect(() => {
    if (selectedCategory && categoryConfig) {
      const initialData = {};
      categoryConfig.fields.forEach((field) => {
        initialData[field.name] = field.type === "multiselect" ? [] : "";
      });
      initialData.availability = "available";
      setFormData((prev) => ({ ...initialData, ...prev }));
      setErrors({});
      if (selectedCategory === "food") {
        setMeals([]);
      }
    } else {
      setFormData({});
    }
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [selectedCategory, eventType, categoryConfig]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setEventType("");
    setErrors({});
    setStep(1);
  };

  const handleEventTypeChange = (type) => {
    setEventType(type);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let limitedValue = value;
    const maxLength =
      name === "title" ? 100 : name === "description" ? 500 : undefined;

    if (maxLength) {
      limitedValue = value.slice(0, maxLength);
      setErrors((prev) => ({
        ...prev,
        [name]:
          value.length > maxLength
            ? `Max ${maxLength} characters allowed`
            : undefined,
      }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : limitedValue,
    }));
  };

  const handleMultiSelectChange = (fieldName, value, checked) => {
    setFormData((prev) => {
      const currentValues = prev[fieldName] || [];
      if (checked && currentValues.length >= 5) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: "Maximum 5 selections allowed",
        }));
        return prev;
      }
      const newValues = checked
        ? [...currentValues, value]
        : currentValues.filter((v) => v !== value);
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
      return { ...prev, [fieldName]: newValues };
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setImages(files);
    setErrors((prev) => ({
      ...prev,
      images: files.length > 5 ? "Maximum 5 images allowed" : undefined,
    }));
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleTempMealChange = (e) => {
    const { name, value } = e.target;
    setTempMeal((prev) => ({ ...prev, [name]: value }));
  };

  const handleTempMealImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempMealImage(file);
      setTempMealImagePreview(URL.createObjectURL(file));
    }
  };

  const addMeal = () => {
    if (!tempMeal.name || !tempMeal.price || !tempMealImage) {
      setErrors((prev) => ({
        ...prev,
        meals: "Meal name, price, and image are required",
      }));
      return;
    }
    if (meals.length >= 20) {
      setErrors((prev) => ({ ...prev, meals: "Maximum 20 meals allowed" }));
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
  };

  const removeMeal = (index) => {
    setMeals((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!selectedCategory) newErrors.global = "Please select a category";
      if (selectedCategory === "events" && !eventType)
        newErrors.eventType = "Please select an event type";
    }
    if (currentStep === 2 && categoryConfig) {
      categoryConfig.fields.forEach((field) => {
        if (field.required) {
          const value = formData[field.name];
          if (!value || (Array.isArray(value) && value.length === 0)) {
            newErrors[field.name] = `${field.label} is required`;
          }
        }
      });
      if (selectedCategory === "food" && meals.length === 0) {
        newErrors.meals = "At least one meal is required";
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        newErrors.price = "Valid price required";
      }
    }
    if (currentStep === 3 && images.length === 0) {
      newErrors.images = "At least one image is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  const uploadImages = async () => {
    const uploadedUrls = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const filePath = `${user.id}/${Date.now()}-${image.name}`;
      const { data, error } = await supabase.storage
        .from("food-images")
        .upload(filePath, image);
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("food-images")
        .getPublicUrl(filePath);
      uploadedUrls.push(urlData.publicUrl);
      setUploadProgress(((i + 1) / images.length) * 100);
    }
    return uploadedUrls;
  };

  const uploadMealImages = async () => {
    const urls = [];
    for (const meal of meals) {
      const image = meal.image;
      if (image) {
        const filePath = `${user.id}/${Date.now()}-${image.name}`;
        const { data, error } = await supabase.storage
          .from("food-images")
          .upload(filePath, image);
        if (error) throw error;
        const { data: urlData } = supabase.storage
          .from("food-images")
          .getPublicUrl(filePath);
        urls.push(urlData.publicUrl);
      } else {
        urls.push(null);
      }
    }
    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(totalSteps)) return;
    setLoading(true);
    setErrors({});

    try {
      const uploadedImageUrls = await uploadImages();
      let processedMeals = null;
      if (selectedCategory === "food") {
        const mealImageUrls = await uploadMealImages();
        processedMeals = meals.map((meal, i) => ({
          name: meal.name,
          price: meal.price,
          description: meal.description,
          image_url: mealImageUrls[i],
        }));
      }

      const categoryData = prepareCategoryData(
        {
          ...formData,
          media_urls: uploadedImageUrls,
          event_type: selectedCategory === "events" ? eventType : null,
          meals: processedMeals,
        },
        selectedCategory,
        eventType
      );

      const listingData = {
        ...categoryData,
        vendor_id: user.id,
        vendor_name: vendor?.business_name || "",
        vendor_phone: vendor?.phone_number || "",
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        event_type: selectedCategory === "events" ? eventType : null,
        remaining_tickets:
          selectedCategory === "events" && eventType === "event_organizer"
            ? parseInt(formData.total_tickets) || 0
            : 0,
      };

      const { data, error } = await createListing(listingData);
      if (error) throw error;

      addListing(data);
      localStorage.removeItem(`listing-draft-${user?.id}`);
      toast.success("Listing created!");
      router.push("/dashboard/vendor");
    } catch (err) {
      setErrors({ global: err.message });
      toast.error("Failed to create listing");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <AuthGuard requiredRole="vendor">
      <div className="container max-w-4xl mx-auto py-10 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <Link
          href="/dashboard/vendor"
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
        </Link>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
          Create New Listing
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          Add your service in a few simple steps with our streamlined process.
        </p>

        <AnimatePresence>
          {errors.global && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <Alert variant="destructive" className="rounded-xl shadow-md">
                <AlertDescription>{errors.global}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <form
          onSubmit={handleSubmit}
          aria-label="Create Listing Form"
          className="space-y-8"
        >
          <Stepper steps={steps} currentStep={step} />
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && (
                <CategorySelection
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                  eventType={eventType}
                  onEventTypeChange={handleEventTypeChange}
                  errors={errors}
                />
              )}
              {step === 2 && categoryConfig && (
                <ServiceDetails
                  categoryConfig={categoryConfig}
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  selectedCategory={selectedCategory}
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
                  handleSelectChange={handleSelectChange}
                  handleChange={handleChange}
                  handleMultiSelectChange={handleMultiSelectChange}
                  firstInputRef={firstInputRef}
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
                />
              )}
            </motion.div>
          </AnimatePresence>
          <NavigationButtons
            step={step}
            totalSteps={totalSteps}
            prevStep={prevStep}
            nextStep={nextStep}
            loading={loading}
          />
        </form>
      </div>
    </AuthGuard>
  );
}
