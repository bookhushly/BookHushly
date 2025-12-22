"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, MapPin, FileText, Info } from "lucide-react";
import { toast } from "sonner";
import RichTextEditor from "@/components/common/rich-text-editor";

export function HotelDetailsTab({ hotel, onUpdate }) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: hotel.name || "",
    description: hotel.description || "",
    address: hotel.address || "",
    city: hotel.city || "",
    state: hotel.state || "",
    checkout_policy: hotel.checkout_policy || "",
    policies: hotel.policies || "",
  });

  const [amenities, setAmenities] = useState({
    wifi: hotel.amenities?.wifi || false,
    parking: hotel.amenities?.parking || false,
    pool: hotel.amenities?.pool || false,
    gym: hotel.amenities?.gym || false,
    restaurant: hotel.amenities?.restaurant || false,
    bar: hotel.amenities?.bar || false,
    spa: hotel.amenities?.spa || false,
    laundry: hotel.amenities?.laundry || false,
    room_service: hotel.amenities?.room_service || false,
    conference_room: hotel.amenities?.conference_room || false,
    airport_shuttle: hotel.amenities?.airport_shuttle || false,
    pet_friendly: hotel.amenities?.pet_friendly || false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleDescriptionChange = (html) => {
    setFormData((prev) => ({ ...prev, description: html }));
    if (error) setError("");
  };

  const handlePoliciesChange = (html) => {
    setFormData((prev) => ({ ...prev, policies: html }));
    if (error) setError("");
  };

  const handleAmenityChange = (amenity) => {
    setAmenities((prev) => ({ ...prev, [amenity]: !prev[amenity] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.city.trim() ||
      !formData.state.trim()
    ) {
      setError("Hotel name, city, and state are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // Clean up HTML content - remove empty paragraphs
      const cleanDescription = formData.description
        ? formData.description
            .replace(/<p><\/p>/g, "")
            .replace(/<p>\s*<\/p>/g, "")
            .trim()
        : "";

      const cleanPolicies = formData.policies
        ? formData.policies
            .replace(/<p><\/p>/g, "")
            .replace(/<p>\s*<\/p>/g, "")
            .trim()
        : "";

      const updateData = {
        name: formData.name.trim(),
        description: cleanDescription || null,
        address: formData.address.trim() || null,
        city: formData.city.trim(),
        state: formData.state.trim(),
        checkout_policy: formData.checkout_policy || null,
        policies: cleanPolicies || null,
        amenities: amenities,
      };

      console.log("Updating hotel with data:", updateData);
      console.log("hotel id", hotel.id);
      const { data, error: updateError } = await supabase
        .from("hotels")
        .update([updateData])
        .eq("id", hotel.id)
        .select();

      if (updateError) {
        console.error("Supabase error:", updateError);
        throw updateError;
      }

      console.log("Update successful:", data);
      toast.success("Hotel details updated successfully");

      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error("Error updating hotel:", err);
      setError(err.message || "Failed to update hotel details");
      toast.error(err.message || "Failed to update hotel details");
    } finally {
      setSaving(false);
    }
  };

  const amenityLabels = {
    wifi: "WiFi",
    parking: "Parking",
    pool: "Swimming Pool",
    gym: "Gym/Fitness Center",
    restaurant: "Restaurant",
    bar: "Bar/Lounge",
    spa: "Spa",
    laundry: "Laundry Service",
    room_service: "Room Service",
    conference_room: "Conference Room",
    airport_shuttle: "Airport Shuttle",
    pet_friendly: "Pet Friendly",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>Essential details about your hotel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Hotel Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Grand Palace Hotel"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <RichTextEditor
              content={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Describe your hotel, its unique features, nearby attractions, and what makes it special..."
              minHeight="300px"
              showWordCount={true}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use the toolbar to format your description with headings, lists,
              links, and more.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
          <CardDescription>Hotel address and location details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              name="address"
              placeholder="e.g., 123 Victoria Island Road"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                placeholder="e.g., Lagos"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                name="state"
                placeholder="e.g., Lagos State"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>Hotel Amenities</CardTitle>
          <CardDescription>
            Select the amenities available at your hotel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.keys(amenities).map((amenity) => (
              <label
                key={amenity}
                className="flex items-center space-x-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={amenities[amenity]}
                  onChange={() => handleAmenityChange(amenity)}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {amenityLabels[amenity]}
                </span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Policies & House Rules
          </CardTitle>
          <CardDescription>
            Define your hotel&apos;s checkout and general policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checkout_policy">Checkout Policy</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`
                  relative flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${
                    formData.checkout_policy === "fixed_time"
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <input
                  type="radio"
                  name="checkout_policy"
                  value="fixed_time"
                  checked={formData.checkout_policy === "fixed_time"}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    Fixed Time (12:00 PM)
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Guest checks out at 12:00 PM regardless of check-in time.
                  </p>
                </div>
              </label>

              <label
                className={`
                  relative flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${
                    formData.checkout_policy === "24_hours"
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <input
                  type="radio"
                  name="checkout_policy"
                  value="24_hours"
                  checked={formData.checkout_policy === "24_hours"}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">24-Hour Policy</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Guest gets full 24 hours from check-in time.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="policies">General Policies & House Rules</Label>
            <RichTextEditor
              content={formData.policies}
              onChange={handlePoliciesChange}
              placeholder="Add your cancellation policy, pet policy, smoking rules, age restrictions, payment terms, etc..."
              minHeight="250px"
              showWordCount={true}
            />
            <p className="text-xs text-gray-500 mt-1">
              Include important information like cancellation deadlines, deposit
              requirements, and any restrictions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {saving ? (
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
  );
}
