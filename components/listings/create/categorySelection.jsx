"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

export default function CategorySelection({
  selectedCategory,
  onCategoryChange,
  eventType,
  onEventTypeChange,
  errors,
  vendorCategory,
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      if (!vendorCategory) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("value", vendorCategory);

        if (!error && data) {
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, [vendorCategory]);

  if (loading) {
    return (
      <Card className="border-none shadow-lg rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Select Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
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
        <div>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger
              className={`w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-purple-500 ${
                errors.global ? "border-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>

            <SelectContent className="rounded-xl">
              {categories.length > 0 ? (
                categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <span className="mr-2">{c.icon}</span> {c.label}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-4 text-sm text-gray-500">
                  No categories available
                </div>
              )}
            </SelectContent>
          </Select>

          {errors.global && (
            <p className="text-sm text-red-500 font-medium mt-2">
              {errors.global}
            </p>
          )}
        </div>

        {selectedCategory === "events" && (
          <div>
            <Select value={eventType} onValueChange={onEventTypeChange}>
              <SelectTrigger
                className={`w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-purple-500 ${
                  errors.eventType ? "border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>

              <SelectContent className="rounded-xl">
                <SelectItem value="event_center">Event Center</SelectItem>
                <SelectItem value="event_organizer">Event Organizer</SelectItem>
              </SelectContent>
            </Select>

            {errors.eventType && (
              <p className="text-sm text-red-500 font-medium mt-2">
                {errors.eventType}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
