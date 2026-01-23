"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Bed, Bath, Users, Maximize } from "lucide-react";
import RichTextEditor from "@/components/common/rich-text-editor";

const APARTMENT_TYPES = [
  { value: "studio", label: "Studio Apartment" },
  { value: "1_bedroom", label: "1 Bedroom" },
  { value: "2_bedroom", label: "2 Bedrooms" },
  { value: "3_bedroom", label: "3 Bedrooms" },
  { value: "penthouse", label: "Penthouse" },
];

export default function Step1BasicInfo({ formData, updateFormData, errors }) {
  return (
    <div className="space-y-6">
      {/* Apartment Name & Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-purple-600" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Apartment Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Luxury 2BR in Lekki Phase 1"
              value={formData.name || ""}
              onChange={(e) => updateFormData({ name: e.target.value })}
              className={errors?.name ? "border-red-500" : ""}
            />
            {errors?.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
            <p className="text-xs text-gray-500">
              Choose a descriptive name that highlights your apartment's best
              features
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apartment_type">
              Apartment Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.apartment_type || ""}
              onValueChange={(value) =>
                updateFormData({ apartment_type: value })
              }
            >
              <SelectTrigger
                className={errors?.apartment_type ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select apartment type" />
              </SelectTrigger>
              <SelectContent>
                {APARTMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.apartment_type && (
              <p className="text-sm text-red-500">{errors.apartment_type}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <RichTextEditor
              content={formData.description || ""}
              onChange={(html) => updateFormData({ description: html })}
              placeholder="Describe your apartment, highlight unique features, nearby attractions, and what makes it special..."
              minHeight="250px"
              showWordCount={true}
            />
            <p className="text-xs text-gray-500">
              Use formatting to make your description stand out. Mention nearby
              landmarks, shopping areas, and transportation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Capacity & Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Capacity & Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms" className="flex items-center gap-2">
                <Bed className="h-4 w-4" />
                Bedrooms <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bedrooms"
                type="number"
                min="1"
                max="10"
                placeholder="e.g., 2"
                value={formData.bedrooms || ""}
                onChange={(e) =>
                  updateFormData({ bedrooms: parseInt(e.target.value) || "" })
                }
                className={errors?.bedrooms ? "border-red-500" : ""}
              />
              {errors?.bedrooms && (
                <p className="text-sm text-red-500">{errors.bedrooms}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms" className="flex items-center gap-2">
                <Bath className="h-4 w-4" />
                Bathrooms <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bathrooms"
                type="number"
                min="1"
                max="10"
                step="0.5"
                placeholder="e.g., 2 or 2.5"
                value={formData.bathrooms || ""}
                onChange={(e) =>
                  updateFormData({
                    bathrooms: parseFloat(e.target.value) || "",
                  })
                }
                className={errors?.bathrooms ? "border-red-500" : ""}
              />
              {errors?.bathrooms && (
                <p className="text-sm text-red-500">{errors.bathrooms}</p>
              )}
              <p className="text-xs text-gray-500">
                Use 0.5 for half bathrooms (e.g., 2.5 for 2 full + 1 half)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_guests" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Maximum Guests <span className="text-red-500">*</span>
              </Label>
              <Input
                id="max_guests"
                type="number"
                min="1"
                max="20"
                placeholder="e.g., 4"
                value={formData.max_guests || ""}
                onChange={(e) =>
                  updateFormData({ max_guests: parseInt(e.target.value) || "" })
                }
                className={errors?.max_guests ? "border-red-500" : ""}
              />
              {errors?.max_guests && (
                <p className="text-sm text-red-500">{errors.max_guests}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="square_meters"
                className="flex items-center gap-2"
              >
                <Maximize className="h-4 w-4" />
                Size (Square Meters)
              </Label>
              <Input
                id="square_meters"
                type="number"
                min="10"
                placeholder="e.g., 85"
                value={formData.square_meters || ""}
                onChange={(e) =>
                  updateFormData({
                    square_meters: parseFloat(e.target.value) || "",
                  })
                }
              />
              <p className="text-xs text-gray-500">Optional but recommended</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="floor_number">Floor Number</Label>
            <Input
              id="floor_number"
              type="number"
              min="0"
              max="100"
              placeholder="e.g., 3 (Ground floor = 0)"
              value={formData.floor_number || ""}
              onChange={(e) =>
                updateFormData({ floor_number: parseInt(e.target.value) || "" })
              }
            />
            <p className="text-xs text-gray-500">
              Helps guests know if there's elevator access needed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Features */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.furnished || false}
                onChange={(e) =>
                  updateFormData({ furnished: e.target.checked })
                }
                className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="font-medium">Fully Furnished</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.kitchen_equipped || false}
                onChange={(e) =>
                  updateFormData({ kitchen_equipped: e.target.checked })
                }
                className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="font-medium">Kitchen Equipped</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.has_balcony || false}
                onChange={(e) =>
                  updateFormData({ has_balcony: e.target.checked })
                }
                className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="font-medium">Has Balcony</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.has_terrace || false}
                onChange={(e) =>
                  updateFormData({ has_terrace: e.target.checked })
                }
                className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="font-medium">Has Terrace</span>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parking_spaces">Parking Spaces Available</Label>
            <Input
              id="parking_spaces"
              type="number"
              min="0"
              max="10"
              placeholder="e.g., 1"
              value={formData.parking_spaces || ""}
              onChange={(e) =>
                updateFormData({
                  parking_spaces: parseInt(e.target.value) || 0,
                })
              }
            />
            <p className="text-xs text-gray-500">
              Number of parking spaces included (0 if none)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
