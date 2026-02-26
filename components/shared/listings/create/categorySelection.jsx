"use client";

import { useMemo, useEffect } from "react";
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

export default function CategorySelection({
  selectedCategory,
  onCategoryChange,
  onEventTypeChange,
  errors,
  vendorCategory,
}) {
  const {
    data: categories = [],
    isLoading,
    error: fetchError,
  } = useVendorCategories(vendorCategory);

  // Auto-set event_organizer silently whenever events is selected
  useEffect(() => {
    if (selectedCategory === "events") {
      onEventTypeChange("event_organizer");
    }
  }, [selectedCategory, onEventTypeChange]);

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
      </CardContent>
    </Card>
  );
}
