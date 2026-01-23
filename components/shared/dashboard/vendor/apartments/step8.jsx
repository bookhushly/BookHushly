"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Home,
  MapPin,
  DollarSign,
  Zap,
  Image as ImageIcon,
  FileText,
  AlertCircle,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getAmenityLabel } from "../../../../../config/apartment-amenities";

const STEP_NAMES = {
  1: "Basic Information",
  2: "Location",
  3: "Pricing",
  4: "Utilities",
  5: "Amenities",
  6: "Photos",
  7: "Policies",
};

export default function Step8Review({ formData, onNavigateToStep }) {
  const images = formData.image_urls || [];
  const amenities = formData.amenities || {};
  const securityFeatures = formData.security_features || {};

  const selectedAmenities = Object.keys(amenities).filter((k) => amenities[k]);
  const selectedSecurity = Object.keys(securityFeatures).filter(
    (k) => securityFeatures[k]
  );

  // Completeness checks
  const checks = {
    basicInfo: !!(
      formData.name &&
      formData.apartment_type &&
      formData.bedrooms &&
      formData.bathrooms &&
      formData.max_guests
    ),
    location: !!(formData.city && formData.state),
    pricing: !!formData.price_per_night,
    images: images.length > 0,
    policies: !!(formData.check_in_time && formData.check_out_time),
  };

  const allComplete = Object.values(checks).every(Boolean);
  const completionPercentage = Math.round(
    (Object.values(checks).filter(Boolean).length /
      Object.values(checks).length) *
      100
  );

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <Card
        className={`${allComplete ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}
      >
        <CardContent className="pt-6">
          <div className="flex gap-3">
            {allComplete ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`text-base font-semibold mb-2 ${allComplete ? "text-green-900" : "text-orange-900"}`}
              >
                {allComplete
                  ? "✓ Ready to Publish!"
                  : "Almost There! Complete Required Fields"}
              </p>
              <p
                className={`text-sm ${allComplete ? "text-green-800" : "text-orange-800"}`}
              >
                Your listing is {completionPercentage}% complete.{" "}
                {!allComplete &&
                  "Please complete all required sections before publishing."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Completeness Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Listing Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                key: "basicInfo",
                icon: Home,
                label: "Basic Information",
                step: 1,
              },
              { key: "location", icon: MapPin, label: "Location", step: 2 },
              { key: "pricing", icon: DollarSign, label: "Pricing", step: 3 },
              { key: "images", icon: ImageIcon, label: "Photos", step: 6 },
              { key: "policies", icon: FileText, label: "Policies", step: 7 },
            ].map((item) => {
              const Icon = item.icon;
              const isComplete = checks[item.key];

              return (
                <div
                  key={item.key}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isComplete
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 ${isComplete ? "text-green-600" : "text-red-600"}`}
                    />
                    <span
                      className={`font-medium ${isComplete ? "text-green-900" : "text-red-900"}`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigateToStep(item.step)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Complete
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Basic Information Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-purple-600" />
            Basic Information
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(1)}>
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Apartment Name</p>
            <p className="font-semibold text-gray-900">
              {formData.name || "Not set"}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-gray-600">Type</p>
              <Badge variant="secondary">
                {formData.apartment_type?.replace("_", " ") || "Not set"}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-600">Bedrooms</p>
              <p className="font-semibold">{formData.bedrooms || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Bathrooms</p>
              <p className="font-semibold">{formData.bathrooms || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Max Guests</p>
              <p className="font-semibold">{formData.max_guests || 0}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.furnished && (
              <Badge variant="outline">Fully Furnished</Badge>
            )}
            {formData.kitchen_equipped && (
              <Badge variant="outline">Kitchen Equipped</Badge>
            )}
            {formData.has_balcony && <Badge variant="outline">Balcony</Badge>}
            {formData.parking_spaces > 0 && (
              <Badge variant="outline">
                {formData.parking_spaces} Parking Space(s)
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Location
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(2)}>
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-semibold text-gray-900">
            {formData.area && `${formData.area}, `}
            {formData.city}, {formData.state}
          </p>
          {formData.landmark && (
            <p className="text-sm text-gray-600">
              <strong>Landmark:</strong> {formData.landmark}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Pricing
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(3)}>
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Per Night:</span>
              <span className="font-bold text-lg">
                ₦{parseFloat(formData.price_per_night || 0).toLocaleString()}
              </span>
            </div>
            {formData.price_per_week && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Per Week:</span>
                <span className="font-semibold">
                  ₦{parseFloat(formData.price_per_week || 0).toLocaleString()}
                </span>
              </div>
            )}
            {formData.price_per_month && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Per Month:</span>
                <span className="font-semibold">
                  ₦{parseFloat(formData.price_per_month || 0).toLocaleString()}
                </span>
              </div>
            )}
            {formData.caution_deposit && (
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-600">Security Deposit:</span>
                <span className="font-semibold">
                  ₦{parseFloat(formData.caution_deposit || 0).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Utilities Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Utilities & Power
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(4)}>
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {formData.electricity_included && (
              <Badge variant="outline" className="bg-green-50">
                ✓ Electricity Included
              </Badge>
            )}
            {formData.generator_available && (
              <Badge variant="outline" className="bg-green-50">
                ✓ Generator Available
              </Badge>
            )}
            {formData.inverter_available && (
              <Badge variant="outline" className="bg-green-50">
                ✓ Inverter Backup
              </Badge>
            )}
            {formData.internet_included && (
              <Badge variant="outline" className="bg-green-50">
                ✓ WiFi Included
              </Badge>
            )}
            {formData.water_supply && (
              <Badge variant="outline" className="bg-blue-50">
                {formData.water_supply.replace("_", " ")}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Amenities Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Amenities ({selectedAmenities.length})</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(5)}>
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {selectedAmenities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedAmenities.slice(0, 15).map((amenityKey) => (
                <Badge key={amenityKey} variant="secondary">
                  {getAmenityLabel(amenityKey)}
                </Badge>
              ))}
              {selectedAmenities.length > 15 && (
                <Badge variant="secondary">
                  +{selectedAmenities.length - 15} more
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No amenities selected</p>
          )}
          {selectedSecurity.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Security Features:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSecurity.map((key) => (
                  <Badge key={key} variant="outline" className="bg-green-50">
                    {key.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photos Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-purple-600" />
            Photos ({images.length})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(6)}>
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {images.length > 0 ? (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {images.slice(0, 6).map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                  {index === 0 && (
                    <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-1 rounded">
                      Cover
                    </div>
                  )}
                </div>
              ))}
              {images.length > 6 && (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">
                    +{images.length - 6}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-red-600">
              ⚠️ No photos uploaded. At least one photo is required.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Policies Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-600" />
            Policies
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(7)}>
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600">Check-in</p>
              <p className="font-semibold">
                {formData.check_in_time || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Check-out</p>
              <p className="font-semibold">
                {formData.check_out_time || "Not set"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {formData.instant_booking !== false && (
              <Badge variant="outline" className="bg-green-50">
                Instant Booking Enabled
              </Badge>
            )}
            {formData.cancellation_policy_type && (
              <Badge variant="outline">
                {formData.cancellation_policy_type} Cancellation
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Final Warning */}
      {!allComplete && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  Cannot Publish Yet
                </p>
                <p className="text-xs text-red-800 mt-1">
                  Please complete all required sections (marked above) before
                  submitting your listing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
