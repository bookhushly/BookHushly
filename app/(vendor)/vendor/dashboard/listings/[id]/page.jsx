"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { useAuth } from "@/hooks/use-auth";
import { useListing, useUpdateListing } from "@/hooks/useListingsData";
import { CATEGORIES } from "@/lib/constants";
import {
  ArrowLeft,
  Save,
  DollarSign,
  MapPin,
  Clock,
  Users,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: authData } = useAuth();
  const user = authData?.user;
  const vendor = authData?.vendor;

  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    location: "",
    capacity: "",
    duration: "",
    availability: "available",
    features: "",
    requirements: "",
    cancellation_policy: "",
  });
  const [error, setError] = useState("");

  // Fetch listing with React Query
  const {
    data: listing,
    isLoading,
    error: fetchError,
  } = useListing(params.id, vendor?.business_category);

  // Update mutation
  const updateMutation = useUpdateListing(vendor?.business_category);

  // Populate form when listing loads
  useEffect(() => {
    if (!listing) return;

    if (vendor?.business_category === "hotels") {
      setFormData({
        title: listing.name || "",
        description: listing.description || "",
        category: "hotels",
        price: "",
        location:
          `${listing.address || ""}, ${listing.city || ""}, ${listing.state || ""}`.trim(),
        capacity: "",
        duration: "",
        availability: "available",
        features: listing.amenities ? JSON.stringify(listing.amenities) : "",
        requirements: "",
        cancellation_policy: listing.checkout_policy || "",
      });
    } else {
      setFormData({
        title: listing.title || "",
        description: listing.description || "",
        category: listing.category || "",
        price: listing.price?.toString() || "",
        location: listing.location || "",
        capacity: listing.capacity?.toString() || "",
        duration: listing.duration || "",
        availability: listing.availability || "available",
        features: listing.features || "",
        requirements: listing.requirements || "",
        cancellation_policy: listing.cancellation_policy || "",
      });
    }
  }, [listing, vendor?.business_category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    const required = ["title", "description", "category", "price", "location"];
    for (const field of required) {
      if (!formData[field].trim()) {
        setError(
          `${field.replace("_", " ").charAt(0).toUpperCase() + field.replace("_", " ").slice(1)} is required`,
        );
        return false;
      }
    }

    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      setError("Please enter a valid price");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setError("");

    startTransition(async () => {
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        location: formData.location.trim(),
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        duration: formData.duration.trim() || null,
        availability: formData.availability,
        features: formData.features.trim() || null,
        requirements: formData.requirements.trim() || null,
        cancellation_policy: formData.cancellation_policy.trim() || null,
      };

      updateMutation.mutate(
        { listingId: params.id, updateData },
        {
          onSuccess: () => {
            toast.success("Listing updated successfully!");
            router.push("/vendor/dashboard");
          },
          onError: (error) => {
            setError(error.message || "Failed to update listing");
            toast.error("Failed to update listing", {
              description: error.message,
            });
          },
        },
      );
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Error Loading Listing
            </h3>
            <p className="text-muted-foreground mb-4">
              {fetchError.message || "Failed to load listing"}
            </p>
            <Button asChild>
              <Link href="/vendor/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not found state
  if (!listing) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Listing Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The listing you&apos;re trying to edit could not be found.
            </p>
            <Button asChild>
              <Link href="/vendor/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <Link
          href="/vendor/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Edit Listing</h1>
        <p className="text-muted-foreground">Update your service information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Essential details about your service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Service Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Luxury Hotel Suite, Event Security Service"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your service in detail..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                  disabled={isPending}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (₦) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    className="pl-10"
                    min="0"
                    step="0.01"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>Location and capacity information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Victoria Island, Lagos"
                  value={formData.location}
                  onChange={handleChange}
                  className="pl-10"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (Optional)</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    placeholder="e.g., 50 guests"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="pl-10"
                    min="1"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Optional)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="duration"
                    name="duration"
                    placeholder="e.g., 2 hours, 1 day"
                    value={formData.duration}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Select
                value={formData.availability}
                onValueChange={(value) =>
                  handleSelectChange("availability", value)
                }
                disabled={isPending}
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

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Features, requirements, and policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="features">Features & Amenities</Label>
              <Textarea
                id="features"
                name="features"
                placeholder="List key features and amenities (e.g., WiFi, AC, Security, etc.)"
                value={formData.features}
                onChange={handleChange}
                rows={3}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                name="requirements"
                placeholder="Any special requirements or conditions"
                value={formData.requirements}
                onChange={handleChange}
                rows={3}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
              <Textarea
                id="cancellation_policy"
                name="cancellation_policy"
                placeholder="Describe your cancellation and refund policy"
                value={formData.cancellation_policy}
                onChange={handleChange}
                rows={3}
                disabled={isPending}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" asChild disabled={isPending}>
            <Link href="/vendor/dashboard">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={isPending || updateMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isPending || updateMutation.isPending ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
