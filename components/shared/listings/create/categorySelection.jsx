"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVendorCategories } from "@/hooks/use-categories";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EVENT_TYPES = [{ value: "event_organizer", label: "Event Organizer" }];

export default function CategorySelection({
  selectedCategory,
  onCategoryChange,
  eventType,
  onEventTypeChange,
  errors,
  vendorCategory,
}) {
  // Fetch categories with React Query
  const {
    data: categories = [],
    isLoading,
    error: fetchError,
  } = useVendorCategories(vendorCategory);

  // Memoize whether to show event type selector
  const showEventTypeSelector = useMemo(
    () => selectedCategory === "events",
    [selectedCategory],
  );

  // Memoized category options for better performance
  const categoryOptions = useMemo(() => {
    if (!categories.length) return null;

    return categories.map((category) => (
      <SelectItem key={category.value} value={category.value}>
        <div className="flex items-center">
          <span className="mr-2">{category.icon}</span>
          <span>{category.label}</span>
        </div>
      </SelectItem>
    ));
  }, [categories]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="border-none shadow-lg rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Select Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <Card className="border-none shadow-lg rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Select Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load categories. Please refresh the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!categories.length) {
    return (
      <Card className="border-none shadow-lg rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Select Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No categories available for your business type. Please contact
              support.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg rounded-2xl bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Select Category
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Category Selection */}
        <div className="space-y-2">
          <label
            htmlFor="category-select"
            className="text-sm font-medium text-gray-700"
          >
            Service Category <span className="text-red-500">*</span>
          </label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger
              id="category-select"
              className={`w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-purple-500 transition-colors ${
                errors.global ? "border-red-500 focus:ring-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>

            <SelectContent className="rounded-xl max-h-[300px]">
              {categoryOptions}
            </SelectContent>
          </Select>

          {errors.global && (
            <p className="text-sm text-red-500 font-medium flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.global}
            </p>
          )}
        </div>

        {/* Event Type Selection - Only shown for events category */}
        {showEventTypeSelector && (
          <div className="space-y-2">
            <label
              htmlFor="event-type-select"
              className="text-sm font-medium text-gray-700"
            >
              Event Type <span className="text-red-500">*</span>
            </label>
            <Select value={eventType} onValueChange={onEventTypeChange}>
              <SelectTrigger
                id="event-type-select"
                className={`w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-purple-500 transition-colors ${
                  errors.eventType ? "border-red-500 focus:ring-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>

              <SelectContent className="rounded-xl">
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.eventType && (
              <p className="text-sm text-red-500 font-medium flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.eventType}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
