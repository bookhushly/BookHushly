"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { useAuthStore, useListingStore } from "@/lib/store";
import { createListing, getVendorProfile } from "@/lib/database";
import { CATEGORIES } from "@/lib/constants";
import {
  getCategoryFormConfig,
  prepareCategoryData,
} from "@/lib/category-forms";
import {
  ArrowLeft,
  Upload,
  DollarSign,
  MapPin,
  Clock,
  Users,
  Image as ImageIcon,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function CreateListingPage() {
  const { user } = useAuthStore();
  const [vendor, setVendor] = useState([]);
  const { addListing } = useListingStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [eventType, setEventType] = useState("event_center");
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Memoize categoryConfig to prevent unnecessary re-computation
  const categoryConfig = useMemo(
    () =>
      selectedCategory
        ? getCategoryFormConfig(selectedCategory, eventType)
        : null,
    [selectedCategory, eventType]
  );

  useEffect(() => {
    const fetchVendorProfile = async () => {
      const { data, error } = await getVendorProfile(user.id);
      if (error) {
        setError(error);
      } else {
        setVendor(data);
      }
    };

    if (user?.id) {
      fetchVendorProfile();
    }
  }, [user?.id]);

  // Initialize form data when category or event type changes
  useEffect(() => {
    if (selectedCategory && categoryConfig) {
      const initialData = {};
      categoryConfig.fields.forEach((field) => {
        initialData[field.name] = field.type === "multiselect" ? [] : "";
      });
      initialData.availability = "available";
      setFormData(initialData);
    } else {
      setFormData({});
    }
  }, [selectedCategory, eventType, categoryConfig]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setEventType(""); // Reset event type when category changes
    setError("");
  };

  const handleEventTypeChange = (type) => {
    setEventType(type);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleMultiSelectChange = (fieldName, value, checked) => {
    setFormData((prev) => {
      const currentValues = prev[fieldName] || [];
      if (checked) {
        return { ...prev, [fieldName]: [...currentValues, value] };
      } else {
        return {
          ...prev,
          [fieldName]: currentValues.filter((v) => v !== value),
        };
      }
    });
    if (error) setError("");
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!selectedCategory) {
      setError("Please select a category");
      return false;
    }

    if (selectedCategory === "events" && !eventType) {
      setError("Please select an event type");
      return false;
    }

    if (!categoryConfig) {
      setError("Invalid category configuration");
      return false;
    }

    // Validate required fields
    for (const field of categoryConfig.fields) {
      if (field.required) {
        const value = formData[field.name];
        if (
          value === undefined ||
          value === null ||
          (typeof value === "string" && !value.trim()) ||
          (Array.isArray(value) && value.length === 0)
        ) {
          setError(`${field.label} is required`);
          return false;
        }
      }
    }

    // Validate price
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      setError("Please enter a valid price greater than 0");
      return false;
    }

    // Validate ticket count and event date for event organizers
    if (selectedCategory === "events" && eventType === "event_organizer") {
      if (
        !formData.total_tickets ||
        isNaN(parseInt(formData.total_tickets)) ||
        parseInt(formData.total_tickets) <= 0
      ) {
        setError("Please enter a valid number of total tickets greater than 0");
        return false;
      }

      if (
        !formData.event_date ||
        isNaN(new Date(formData.event_date).getTime())
      ) {
        setError("Please enter a valid event date");
        return false;
      }
    }

    return true;
  };

  const uploadImages = async () => {
    const uploadedUrls = [];
    for (const image of images) {
      const filePath = `${user.id}/${Date.now()}-${image.name}`;
      const { data, error } = await supabase.storage
        .from("listing-images")
        .upload(filePath, image);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(filePath);

      uploadedUrls.push(urlData.publicUrl);
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const uploadedImageUrls = await uploadImages();

      // Prepare data based on category and event type
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
        vendor_name: vendor.business_name,
        vendor_phone: vendor.phone_number,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        event_type: selectedCategory === "events" ? eventType : null,
        remaining_tickets:
          selectedCategory === "events" && eventType === "event_organizer"
            ? parseInt(formData.total_tickets)
            : 0,
      };

      const { data, error } = await createListing(listingData);

      if (error) {
        setError(error.message);
        toast.error("Failed to create listing", { description: error.message });
        return;
      }

      addListing(data);
      toast.success("Listing created successfully!", {
        description: "Your service is now live and accepting bookings",
      });

      router.push("/dashboard/vendor");
    } catch (err) {
      setError("An unexpected error occurred");
      toast.error("Failed to create listing", {
        description: err.message || "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const value =
      formData[field.name] ?? (field.type === "multiselect" ? [] : "");

    switch (field.type) {
      case "text":
      case "url":
      case "time":
      case "date":
        return (
          <Input
            id={field.name}
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={handleChange}
            required={field.required}
          />
        );

      case "number":
        return (
          <Input
            id={field.name}
            name={field.name}
            type="number"
            placeholder={field.placeholder}
            value={value}
            onChange={handleChange}
            min={
              field.name === "price" || field.name === "total_tickets"
                ? "0"
                : undefined
            }
            step={field.name === "price" ? "0.01" : undefined}
            required={field.required}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={field.name}
            name={field.name}
            placeholder={field.placeholder}
            value={value}
            onChange={handleChange}
            rows={3}
            required={field.required}
          />
        );

      case "select":
        return (
          <Select
            value={value}
            onValueChange={(val) => handleSelectChange(field.name, val)}
            required={field.required}
          >
            <SelectTrigger>
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
        );

      case "multiselect":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.name}-${option.value}`}
                  checked={value.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleMultiSelectChange(field.name, option.value, checked)
                  }
                />
                <Label
                  htmlFor={`${field.name}-${option.value}`}
                  className="text-sm font-normal"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        console.warn(
          `Unsupported field type: ${field.type} for field: ${field.name}`
        );
        return null;
    }
  };

  return (
    <AuthGuard requiredRole="vendor">
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/vendor"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create New Listing</h1>
          <p className="text-muted-foreground">
            Add a new service to your portfolio and start accepting bookings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Category</CardTitle>
              <CardDescription>
                Choose the category that best describes your service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center">
                        <span className="mr-2">{category.icon}</span>
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Event Type Selection for Events Category */}
          {selectedCategory === "events" && (
            <Card>
              <CardHeader>
                <CardTitle>Event Type</CardTitle>
                <CardDescription>
                  Specify whether you are offering an event center or organizing
                  an event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={eventType}
                  onValueChange={handleEventTypeChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event_center">Event Center</SelectItem>
                    <SelectItem value="event_organizer">
                      Event Organizer
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Dynamic Form Fields */}
          {categoryConfig && (
            <Card>
              <CardHeader>
                <CardTitle>{categoryConfig.title}</CardTitle>
                <CardDescription>{categoryConfig.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {categoryConfig.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}

                {/* Availability Status */}
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability Status</Label>
                  <Select
                    value={formData.availability || "available"}
                    onValueChange={(value) =>
                      handleSelectChange("availability", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Media Upload */}
          {selectedCategory && (
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>
                  Upload photos to showcase your service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="media">Upload Images</Label>
                  <Input
                    id="media"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {imagePreviews.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt={`preview-${idx}`}
                        className="rounded-md object-cover w-full h-32"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          {selectedCategory && (
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/vendor">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Creating Listing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Create Listing
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </AuthGuard>
  );
}
