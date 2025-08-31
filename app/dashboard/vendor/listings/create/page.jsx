"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import { AuthGuard } from "@/components/auth/auth-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore, useListingStore } from "@/lib/store";
import { createListing, getVendorProfile } from "@/lib/database";
import { CATEGORIES } from "@/lib/constants";
import {
  getCategoryFormConfig,
  prepareCategoryData,
} from "@/lib/category-forms";
import { ArrowLeft, Upload, Image as ImageIcon, Info } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function CreateListingPage() {
  const { user } = useAuthStore();
  const { addListing } = useListingStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [eventType, setEventType] = useState("");
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [step, setStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  // Load form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(`listing-draft-${user?.id}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(parsed.formData || {});
      setSelectedCategory(parsed.selectedCategory || "");
      setEventType(parsed.eventType || "");
      setStep(parsed.step || 1);
    }
  }, [user?.id]);

  // Auto-save to localStorage
  useEffect(() => {
    if (debouncedFormData && Object.keys(debouncedFormData).length > 0) {
      localStorage.setItem(
        `listing-draft-${user?.id}`,
        JSON.stringify({
          formData: debouncedFormData,
          selectedCategory,
          eventType,
          step,
        })
      );
    }
  }, [debouncedFormData, selectedCategory, eventType, step, user?.id]);

  // Fetch vendor profile
  useEffect(() => {
    const fetchVendorProfile = async () => {
      const { data, error } = await getVendorProfile(user.id);
      if (error) setErrors({ global: error.message });
      else setVendor(data);
    };

    if (user?.id) fetchVendorProfile();
  }, [user?.id]);

  // Initialize form data based on category
  useEffect(() => {
    if (selectedCategory && categoryConfig) {
      const initialData = {};
      categoryConfig.fields.forEach((field) => {
        initialData[field.name] = field.type === "multiselect" ? [] : "";
      });
      initialData.availability = "available";
      setFormData((prev) => ({ ...initialData, ...prev }));
      setErrors({});
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

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setImages(files);
    setErrors((prev) => ({
      ...prev,
      images: files.length > 5 ? "Maximum 5 images allowed" : undefined,
    }));
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
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
        .from("listing-images")
        .upload(filePath, image);
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(filePath);
      uploadedUrls.push(urlData.publicUrl);
      setUploadProgress(((i + 1) / images.length) * 100);
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(totalSteps)) return;
    setLoading(true);
    setErrors({});

    try {
      const uploadedImageUrls = await uploadImages();
      const categoryData = prepareCategoryData(
        {
          ...formData,
          media_urls: uploadedImageUrls,
          event_type: selectedCategory === "events" ? eventType : null,
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

  const renderCustomProgressBar = (value, isNearLimit) => (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className={`h-full ${isNearLimit ? "bg-red-500" : "bg-blue-500"}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );

  const renderField = (field) => {
    const value =
      formData[field.name] ?? (field.type === "multiselect" ? [] : "");
    const maxLength =
      field.name === "title"
        ? 100
        : field.name === "description"
          ? 500
          : undefined;
    const isNearLimit = maxLength && value.length >= maxLength * 0.9;

    return (
      <div className="relative">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}{" "}
                  {field.required && <span className="text-red-500">*</span>}
                </Label>
                {field.description && (
                  <Info className="ml-2 h-4 w-4 text-gray-400" />
                )}
              </div>
            </TooltipTrigger>
            {field.description && (
              <TooltipContent>
                <p>{field.description}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        {field.type === "text" ||
        field.type === "url" ||
        field.type === "time" ||
        field.type === "date" ||
        field.type === "number" ? (
          <>
            <Input
              id={field.name}
              name={field.name}
              type={field.type === "number" ? "number" : field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={handleChange}
              required={field.required}
              maxLength={maxLength}
              className={`rounded-lg ${errors[field.name] ? "border-red-500" : ""}`}
              ref={
                field.name === categoryConfig?.fields[0]?.name
                  ? firstInputRef
                  : null
              }
              aria-invalid={errors[field.name] ? "true" : "false"}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
            />
            {maxLength && (
              <div className="mt-1">
                {renderCustomProgressBar(
                  (value.length / maxLength) * 100,
                  isNearLimit
                )}
                <p
                  className={`text-sm ${isNearLimit ? "text-red-500" : "text-gray-500"}`}
                >
                  {value.length}/{maxLength}
                </p>
              </div>
            )}
          </>
        ) : field.type === "textarea" ? (
          <>
            <Textarea
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              value={value}
              onChange={handleChange}
              rows={5}
              required={field.required}
              maxLength={maxLength}
              className={`rounded-lg ${errors[field.name] ? "border-red-500" : ""}`}
              ref={
                field.name === categoryConfig?.fields[0]?.name
                  ? firstInputRef
                  : null
              }
              aria-invalid={errors[field.name] ? "true" : "false"}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
            />
            {maxLength && (
              <div className="mt-1">
                {renderCustomProgressBar(
                  (value.length / maxLength) * 100,
                  isNearLimit
                )}
                <p
                  className={`text-sm ${isNearLimit ? "text-red-500" : "text-gray-500"}`}
                >
                  {value.length}/{maxLength}
                </p>
              </div>
            )}
          </>
        ) : field.type === "select" ? (
          <Select
            value={value}
            onValueChange={(val) => handleSelectChange(field.name, val)}
            required={field.required}
          >
            <SelectTrigger
              className={`rounded-lg ${errors[field.name] ? "border-red-500" : ""}`}
              aria-invalid={errors[field.name] ? "true" : "false"}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
            >
              <SelectValue
                placeholder={`Select ${field.label.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === "multiselect" ? (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.name}-${option.value}`}
                  checked={value.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleMultiSelectChange(field.name, option.value, checked)
                  }
                  aria-describedby={
                    errors[field.name] ? `${field.name}-error` : undefined
                  }
                />
                <Label htmlFor={`${field.name}-${option.value}`}>
                  {option.label}
                </Label>
              </div>
            ))}
            <p className="text-sm text-gray-500">Selected: {value.length}/5</p>
          </div>
        ) : null}
        {errors[field.name] && (
          <p id={`${field.name}-error`} className="text-sm text-red-500 mt-1">
            {errors[field.name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <AuthGuard requiredRole="vendor">
      <div className="container max-w-3xl py-8">
        <Link
          href="/dashboard/vendor"
          className="flex items-center text-blue-600 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Create New Listing</h1>
        <p className="text-gray-600 mb-8">
          Follow the steps to add your service easily.
        </p>

        <AnimatePresence>
          {errors.global && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{errors.global}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} aria-label="Create Listing Form">
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= s.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    animate={{ scale: step === s.id ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {s.id}
                  </motion.div>
                  <span className="text-sm mt-2">{s.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <motion.div
                    className={`flex-1 h-1 ${step > s.id ? "bg-blue-600" : "bg-gray-200"}`}
                    animate={{ width: step > s.id ? "100%" : "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
            ))}
          </div>

          <Accordion type="single" value={`step-${step}`} className="space-y-4">
            <AccordionItem value="step-1">
              <AccordionTrigger className="text-lg font-semibold">
                Step 1: Select Category
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <Select
                  value={selectedCategory}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger
                    className={`rounded-lg ${errors.global ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.icon} {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.global && (
                  <p className="text-sm text-red-500">{errors.global}</p>
                )}
                {selectedCategory === "events" && (
                  <Select
                    value={eventType}
                    onValueChange={handleEventTypeChange}
                  >
                    <SelectTrigger
                      className={`rounded-lg ${errors.eventType ? "border-red-500" : ""}`}
                    >
                      <SelectValue placeholder="Event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event_center">Event Center</SelectItem>
                      <SelectItem value="event_organizer">
                        Event Organizer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {errors.eventType && (
                  <p className="text-sm text-red-500">{errors.eventType}</p>
                )}
                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    className="rounded-lg"
                    onClick={nextStep}
                  >
                    Next
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {categoryConfig && (
              <AccordionItem value="step-2">
                <AccordionTrigger className="text-lg font-semibold">
                  Step 2: Service Details
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {categoryConfig.fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        {renderField(field)}
                      </div>
                    ))}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Availability
                      </Label>
                      <Select
                        value={formData.availability || "available"}
                        onValueChange={(value) =>
                          handleSelectChange("availability", value)
                        }
                      >
                        <SelectTrigger className="rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="unavailable">
                            Unavailable
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                  <div className="flex justify-between mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-lg"
                      onClick={prevStep}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      className="rounded-lg"
                      onClick={nextStep}
                    >
                      Next
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="step-3">
              <AccordionTrigger className="text-lg font-semibold">
                Step 3: Upload Media
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <Label className="text-sm font-medium">Images (up to 5)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className={`rounded-lg ${errors.images ? "border-red-500" : ""}`}
                  aria-describedby={errors.images ? "images-error" : undefined}
                />
                {errors.images && (
                  <p id="images-error" className="text-sm text-red-500">
                    {errors.images}
                  </p>
                )}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {imagePreviews.map((src, idx) => (
                      <motion.img
                        key={idx}
                        src={src}
                        alt={`Preview ${idx + 1}`}
                        className="rounded-md object-cover h-32 w-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: idx * 0.1 }}
                      />
                    ))}
                  </div>
                )}
                {loading && uploadProgress > 0 && (
                  <div className="mt-2">
                    {renderCustomProgressBar(uploadProgress, false)}
                    <p className="text-sm text-gray-500 mt-1">
                      Upload Progress: {Math.round(uploadProgress)}%
                    </p>
                  </div>
                )}
                <div className="flex justify-between mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg"
                    onClick={prevStep}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    className="rounded-lg"
                    onClick={nextStep}
                  >
                    Next
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step-4">
              <AccordionTrigger className="text-lg font-semibold">
                Step 4: Review & Submit
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Review Your Listing</CardTitle>
                      <CardDescription>
                        Ensure all details are correct before submitting
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p>
                        <strong>Category:</strong>{" "}
                        {CATEGORIES.find((c) => c.value === selectedCategory)
                          ?.label || selectedCategory}
                      </p>
                      {selectedCategory === "events" && eventType && (
                        <p>
                          <strong>Event Type:</strong>{" "}
                          {eventType === "event_center"
                            ? "Event Center"
                            : "Event Organizer"}
                        </p>
                      )}
                      {Object.entries(formData).map(([key, val]) => (
                        <p key={key}>
                          <strong>
                            {key.charAt(0).toUpperCase() +
                              key.slice(1).replace(/_/g, " ")}
                            :
                          </strong>{" "}
                          {Array.isArray(val)
                            ? val.join(", ")
                            : val || "Not set"}
                        </p>
                      ))}
                      <p>
                        <strong>Images:</strong> {images.length} uploaded
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
                <div className="flex justify-between mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg"
                    onClick={prevStep}
                  >
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg"
                  >
                    {loading ? (
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {loading ? "Creating..." : "Create Listing"}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </form>
      </div>
    </AuthGuard>
  );
}
