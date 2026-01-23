"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Save,
  X,
  Loader2,
  Home,
  MapPin,
  DollarSign,
  Zap,
  Sparkles,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { updateServicedApartment } from "@/app/actions/apartments";
import Image from "next/image";
import { getAmenityLabel } from "@/config/apartment-amenities";
import EditBasicInfo from "./edit";
import EditLocation from "./edit/location";
import EditPricing from "./edit/pricing";
import EditUtilities from "./edit/utilities";
import EditAmenities from "./edit/amenities";
import EditPhotos from "./edit/photos";
import EditPolicies from "./edit/policies";

const SECTIONS = {
  NONE: null,
  BASIC: "basic",
  LOCATION: "location",
  PRICING: "pricing",
  UTILITIES: "utilities",
  AMENITIES: "amenities",
  PHOTOS: "photos",
  POLICIES: "policies",
};

export default function OverviewTab({ apartment, apartmentId, onUpdate }) {
  const [editingSection, setEditingSection] = useState(SECTIONS.NONE);
  const [formData, setFormData] = useState(apartment);
  const [isSaving, setIsSaving] = useState(false);

  const updateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleStartEdit = (section) => {
    setEditingSection(section);
    setFormData(apartment); // Reset to current data
  };

  const handleCancelEdit = () => {
    setEditingSection(SECTIONS.NONE);
    setFormData(apartment); // Reset changes
  };

  const handleSaveSection = async () => {
    setIsSaving(true);

    try {
      // Create FormData for server action
      const submitData = new FormData();

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          return;
        }

        if (typeof value === "object" && !Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value));
        } else if (typeof value === "boolean") {
          submitData.append(key, value.toString());
        } else {
          submitData.append(key, value.toString());
        }
      });

      const result = await updateServicedApartment(apartmentId, submitData);

      if (result.success) {
        onUpdate(result.data); // Update parent component
        setEditingSection(SECTIONS.NONE);
        toast.success("Section updated successfully");
      } else {
        toast.error(result.error || "Failed to update section");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const amenities = apartment.amenities || {};
  const securityFeatures = apartment.security_features || {};
  const selectedAmenities = Object.keys(amenities).filter((k) => amenities[k]);
  const selectedSecurity = Object.keys(securityFeatures).filter(
    (k) => securityFeatures[k]
  );

  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-purple-600" />
              Basic Information
            </CardTitle>
            {editingSection !== SECTIONS.BASIC && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartEdit(SECTIONS.BASIC)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingSection === SECTIONS.BASIC ? (
            <div className="space-y-4">
              <EditBasicInfo
                formData={formData}
                updateFormData={updateFormData}
              />
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveSection} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Apartment Type</p>
                <Badge variant="secondary" className="text-base">
                  {apartment.apartment_type?.replace("_", " ").toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Bedrooms</p>
                  <p className="text-lg font-semibold">{apartment.bedrooms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bathrooms</p>
                  <p className="text-lg font-semibold">{apartment.bathrooms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Max Guests</p>
                  <p className="text-lg font-semibold">
                    {apartment.max_guests}
                  </p>
                </div>
                {apartment.square_meters && (
                  <div>
                    <p className="text-sm text-gray-600">Size</p>
                    <p className="text-lg font-semibold">
                      {apartment.square_meters}m²
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {apartment.furnished && (
                  <Badge variant="outline">Fully Furnished</Badge>
                )}
                {apartment.kitchen_equipped && (
                  <Badge variant="outline">Kitchen Equipped</Badge>
                )}
                {apartment.has_balcony && (
                  <Badge variant="outline">Balcony</Badge>
                )}
                {apartment.has_terrace && (
                  <Badge variant="outline">Terrace</Badge>
                )}
                {apartment.parking_spaces > 0 && (
                  <Badge variant="outline">
                    {apartment.parking_spaces} Parking Space(s)
                  </Badge>
                )}
              </div>

              {apartment.description && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: apartment.description }}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Location
            </CardTitle>
            {editingSection !== SECTIONS.LOCATION && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartEdit(SECTIONS.LOCATION)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingSection === SECTIONS.LOCATION ? (
            <div className="space-y-4">
              <EditLocation
                formData={formData}
                updateFormData={updateFormData}
              />
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveSection} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold">
                  {apartment.area && `${apartment.area}, `}
                  {apartment.city}, {apartment.state}
                </p>
              </div>
              {apartment.address && (
                <div>
                  <p className="text-sm text-gray-600">Full Address</p>
                  <p className="text-gray-800">{apartment.address}</p>
                </div>
              )}
              {apartment.landmark && (
                <div>
                  <p className="text-sm text-gray-600">Nearby Landmarks</p>
                  <p className="text-gray-800">{apartment.landmark}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Pricing
            </CardTitle>
            {editingSection !== SECTIONS.PRICING && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartEdit(SECTIONS.PRICING)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingSection === SECTIONS.PRICING ? (
            <div className="space-y-4">
              <EditPricing
                formData={formData}
                updateFormData={updateFormData}
              />
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveSection} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Per Night:</span>
                <span className="text-xl font-bold">
                  ₦{parseFloat(apartment.price_per_night).toLocaleString()}
                </span>
              </div>
              {apartment.price_per_week && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Per Week:</span>
                  <span className="text-lg font-semibold">
                    ₦{parseFloat(apartment.price_per_week).toLocaleString()}
                  </span>
                </div>
              )}
              {apartment.price_per_month && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Per Month:</span>
                  <span className="text-lg font-semibold">
                    ₦{parseFloat(apartment.price_per_month).toLocaleString()}
                  </span>
                </div>
              )}
              {apartment.caution_deposit && (
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-gray-600">Security Deposit:</span>
                  <span className="font-semibold">
                    ₦{parseFloat(apartment.caution_deposit).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600">
                  Minimum Stay: {apartment.minimum_stay} night(s)
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Utilities Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Utilities & Power
            </CardTitle>
            {editingSection !== SECTIONS.UTILITIES && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartEdit(SECTIONS.UTILITIES)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingSection === SECTIONS.UTILITIES ? (
            <div className="space-y-4">
              <EditUtilities
                formData={formData}
                updateFormData={updateFormData}
              />
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveSection} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {apartment.electricity_included && (
                  <Badge variant="outline" className="bg-green-50">
                    ✓ Electricity Included
                  </Badge>
                )}
                {apartment.generator_available && (
                  <Badge variant="outline" className="bg-green-50">
                    ✓ Generator{" "}
                    {apartment.generator_hours &&
                      `(${apartment.generator_hours})`}
                  </Badge>
                )}
                {apartment.inverter_available && (
                  <Badge variant="outline" className="bg-green-50">
                    ✓ Inverter Backup
                  </Badge>
                )}
                {apartment.solar_power && (
                  <Badge variant="outline" className="bg-green-50">
                    ✓ Solar Power
                  </Badge>
                )}
                {apartment.internet_included && (
                  <Badge variant="outline" className="bg-blue-50">
                    ✓ WiFi{" "}
                    {apartment.internet_speed &&
                      `(${apartment.internet_speed})`}
                  </Badge>
                )}
                {apartment.water_supply && (
                  <Badge variant="outline" className="bg-blue-50">
                    {apartment.water_supply.replace("_", " ")}
                  </Badge>
                )}
              </div>
              {apartment.utilities_included && (
                <div className="pt-3 border-t">
                  <Badge className="bg-purple-100 text-purple-700">
                    All Utilities Included in Price
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Amenities Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Amenities ({selectedAmenities.length})
            </CardTitle>
            {editingSection !== SECTIONS.AMENITIES && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartEdit(SECTIONS.AMENITIES)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingSection === SECTIONS.AMENITIES ? (
            <div className="space-y-4">
              <EditAmenities
                formData={formData}
                updateFormData={updateFormData}
              />
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveSection} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedAmenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedAmenities.map((amenityKey) => (
                    <Badge key={amenityKey} variant="secondary">
                      {getAmenityLabel(amenityKey)}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No amenities listed</p>
              )}

              {selectedSecurity.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Security Features:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSecurity.map((key) => (
                      <Badge
                        key={key}
                        variant="outline"
                        className="bg-green-50"
                      >
                        {key.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photos Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-purple-600" />
              Photos ({apartment.image_urls?.length || 0})
            </CardTitle>
            {editingSection !== SECTIONS.PHOTOS && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartEdit(SECTIONS.PHOTOS)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Manage Photos
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingSection === SECTIONS.PHOTOS ? (
            <div className="space-y-4">
              <EditPhotos formData={formData} updateFormData={updateFormData} />
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveSection} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {apartment.image_urls && apartment.image_urls.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {apartment.image_urls.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
                    >
                      <Image
                        src={url}
                        alt={`${apartment.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No photos uploaded</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Policies Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              Policies & Rules
            </CardTitle>
            {editingSection !== SECTIONS.POLICIES && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartEdit(SECTIONS.POLICIES)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingSection === SECTIONS.POLICIES ? (
            <div className="space-y-4">
              <EditPolicies
                formData={formData}
                updateFormData={updateFormData}
              />
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveSection} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Check-in Time</p>
                  <p className="font-semibold">{apartment.check_in_time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check-out Time</p>
                  <p className="font-semibold">{apartment.check_out_time}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {apartment.instant_booking !== false && (
                  <Badge variant="outline" className="bg-green-50">
                    Instant Booking Enabled
                  </Badge>
                )}
              </div>

              {apartment.cancellation_policy && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-1">
                    Cancellation Policy
                  </p>
                  <p className="text-gray-800 text-sm">
                    {apartment.cancellation_policy}
                  </p>
                </div>
              )}

              {apartment.house_rules && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-2">House Rules</p>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: apartment.house_rules }}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
