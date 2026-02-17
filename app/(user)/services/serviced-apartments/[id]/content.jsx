"use client";

import { useState } from "react";
import RichContentRenderer from "@/components/common/rich-text-renderer";
import {
  MapPin,
  Users,
  Bed,
  Bath,
  Maximize2,
  Wifi,
  Car,
  Zap,
  Droplet,
  Shield,
  Calendar,
  Clock,
  Share2,
  Check,
  Navigation,
  Sun,
  Wind,
  DollarSign,
  Home,
  Waves,
  Timer,
  Info,
  CheckCircle2,
  PlayCircle,
  Globe,
  Sparkles,
} from "lucide-react";
import ImageGallery from "@/components/common/home/ImageGallery";
import { getAmenityLabel } from "@/config/apartment-amenities";
import ApartmentBookingCard from "../../../../../components/shared/apartment/booking-card";

export default function ApartmentClient({ apartment }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const apartmentTypeLabel = {
    studio: "Studio",
    "1_bedroom": "1 Bedroom",
    "2_bedroom": "2 Bedroom",
    "3_bedroom": "3 Bedroom",
    penthouse: "Penthouse",
  };

  const waterSupplyLabel = {
    borehole: "Borehole Water",
    public_supply: "Public Water Supply",
    both: "Borehole & Public Supply",
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: apartment.name,
          text: `Check out ${apartment.name} in ${apartment.city}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    }
  };

  const securityFeatures = apartment.security_features || {};
  const amenities = apartment.amenities || {};

  // Get selected amenities for display
  const selectedAmenities = Object.entries(amenities)
    .filter(([_, value]) => value)
    .map(([key]) => key);

  const selectedSecurityFeatures = Object.entries(securityFeatures)
    .filter(([_, value]) => value)
    .map(([key]) => key);

  const securityFeatureLabels = {
    "24hr_security": "24-Hour Security",
    cctv_surveillance: "CCTV Surveillance",
    estate_gate: "Gated Estate",
    access_control: "Access Control System",
    intercom_system: "Intercom System",
  };

  // Calculate weekly/monthly savings if available
  const weeklyNightlyTotal = apartment.price_per_night * 7;
  const monthlightlyTotal = apartment.price_per_night * 30;
  const weeklySavings = apartment.price_per_week
    ? weeklyNightlyTotal - apartment.price_per_week
    : 0;
  const monthlySavings = apartment.price_per_month
    ? monthlightlyTotal - apartment.price_per_month
    : 0;

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
              {apartment.name}
            </h1>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-sm font-medium"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
            <div className="flex items-center gap-1.5 text-gray-700">
              <MapPin className="w-4 h-4" />
              <span>
                {apartment.area && `${apartment.area}, `}
                {apartment.city}, {apartment.state}
              </span>
            </div>

            {apartment.views_count > 0 && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <span>{apartment.views_count} views</span>
              </div>
            )}

            {apartment.instant_booking && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                <Zap className="w-3 h-3" />
                Instant Booking
              </div>
            )}

            {apartment.is_verified && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </div>
            )}
          </div>

          {/* Landmark - Important for Nigerian context */}
          {apartment.landmark && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm">
              <Navigation className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-blue-900">Landmark: </span>
                <span className="text-blue-800">{apartment.landmark}</span>
              </div>
            </div>
          )}
        </div>

        {/* Image Gallery */}
        <div className="mb-12">
          <ImageGallery
            images={apartment.image_urls}
            altPrefix={apartment.name}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Overview */}
            <div className="pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-semibold mb-4">
                {apartmentTypeLabel[apartment.apartment_type]} Apartment
              </h2>

              <div className="flex flex-wrap gap-6 text-gray-700">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">{apartment.max_guests}</span>
                  <span className="text-gray-600">guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">{apartment.bedrooms}</span>
                  <span className="text-gray-600">
                    bedroom{apartment.bedrooms > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">{apartment.bathrooms}</span>
                  <span className="text-gray-600">
                    bath{apartment.bathrooms > 1 ? "s" : ""}
                  </span>
                </div>
                {apartment.square_meters && (
                  <div className="flex items-center gap-2">
                    <Maximize2 className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">
                      {apartment.square_meters}
                    </span>
                    <span className="text-gray-600">m²</span>
                  </div>
                )}
                {apartment.floor_number !== null && (
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">
                      {apartment.floor_number === 0
                        ? "Ground Floor"
                        : `${apartment.floor_number}${apartment.floor_number === 1 ? "st" : apartment.floor_number === 2 ? "nd" : apartment.floor_number === 3 ? "rd" : "th"} Floor`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {apartment.description && (
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-xl font-semibold mb-4">About this place</h3>
                <RichContentRenderer
                  content={apartment.description}
                  className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                />
              </div>
            )}

            {/* Power & Utilities - Critical for Nigeria */}
            <div className="pb-8 border-b border-gray-200">
              <h3 className="text-xl font-semibold mb-6">Power & Utilities</h3>

              <div className="space-y-4">
                {/* Power Supply Section */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Zap className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Power Supply
                      </h4>
                      <div className="space-y-2 text-sm">
                        {apartment.electricity_included && (
                          <div className="flex items-center gap-2 text-green-700">
                            <Check className="w-4 h-4" />
                            <span>Electricity cost included in price</span>
                          </div>
                        )}
                        {!apartment.electricity_included && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Info className="w-4 h-4" />
                            <span>
                              Prepaid meter - buy your own electricity units
                            </span>
                          </div>
                        )}

                        {apartment.generator_available && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Check className="w-4 h-4" />
                            <span>
                              Generator backup
                              {apartment.generator_hours &&
                                ` - ${apartment.generator_hours}`}
                            </span>
                          </div>
                        )}

                        {apartment.inverter_available && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Check className="w-4 h-4" />
                            <span>Inverter backup system</span>
                          </div>
                        )}

                        {apartment.solar_power && (
                          <div className="flex items-center gap-2 text-green-700">
                            <Sun className="w-4 h-4" />
                            <span>Solar power system</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Water Supply */}
                {apartment.water_supply && (
                  <div className="flex items-start gap-3">
                    <Droplet className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Water Supply</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {waterSupplyLabel[apartment.water_supply]}
                      </p>
                    </div>
                  </div>
                )}

                {/* Internet */}
                {apartment.internet_included && (
                  <div className="flex items-start gap-3">
                    <Wifi className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">WiFi Internet</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {apartment.internet_speed
                          ? `High-speed connection - ${apartment.internet_speed}`
                          : "Included in price"}
                      </p>
                    </div>
                  </div>
                )}

                {/* All Utilities Included Badge */}
                {apartment.utilities_included && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-900">
                        All utilities included in price
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mt-1 ml-7">
                      No additional costs for electricity, water, or internet
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Features & Furnishing */}
            <div className="pb-8 border-b border-gray-200">
              <h3 className="text-xl font-semibold mb-6">
                Features & Furnishing
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {apartment.furnished && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-purple-600" />
                    <span>Fully Furnished</span>
                  </div>
                )}
                {apartment.kitchen_equipped && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-purple-600" />
                    <span>Equipped Kitchen</span>
                  </div>
                )}
                {apartment.has_balcony && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-purple-600" />
                    <span>Balcony</span>
                  </div>
                )}
                {apartment.has_terrace && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-purple-600" />
                    <span>Terrace</span>
                  </div>
                )}
                {apartment.parking_spaces > 0 && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Car className="w-5 h-5 text-purple-600" />
                    <span>
                      {apartment.parking_spaces} Parking Space
                      {apartment.parking_spaces > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {selectedAmenities.length > 0 && (
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-xl font-semibold mb-6">
                  Amenities ({selectedAmenities.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedAmenities.map((amenityKey) => (
                    <div
                      key={amenityKey}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="text-sm">
                        {getAmenityLabel(amenityKey)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Features */}
            {selectedSecurityFeatures.length > 0 && (
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-xl font-semibold mb-6">
                  Security Features
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedSecurityFeatures.map((featureKey) => (
                    <div
                      key={featureKey}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <Shield className="w-5 h-5 text-purple-600" />
                      <span>{securityFeatureLabels[featureKey]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* House Rules */}
            {apartment.house_rules && (
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-xl font-semibold mb-4">House Rules</h3>
                <RichContentRenderer
                  content={apartment.house_rules}
                  className="text-gray-700 prose prose-sm max-w-none"
                />
              </div>
            )}

            {/* Cancellation Policy */}
            {apartment.cancellation_policy && (
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-xl font-semibold mb-4">
                  Cancellation Policy
                </h3>
                <RichContentRenderer
                  content={apartment.cancellation_policy}
                  className="text-gray-700 prose prose-sm max-w-none"
                />
              </div>
            )}

            {/* Video & Virtual Tour */}
            {(apartment.video_url || apartment.virtual_tour_url) && (
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-xl font-semibold mb-4">
                  Video & Virtual Tour
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  {apartment.video_url && (
                    <a
                      href={apartment.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <PlayCircle className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Watch Video Tour</span>
                    </a>
                  )}
                  {apartment.virtual_tour_url && (
                    <a
                      href={apartment.virtual_tour_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Globe className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">View Virtual Tour</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Location Details */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Location</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {apartment.area && `${apartment.area}, `}
                      {apartment.city}, {apartment.state}
                    </p>
                    {apartment.address && (
                      <p className="text-sm text-gray-600 mt-1">
                        Full address shared after booking confirmation
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="border border-gray-300 rounded-2xl p-6 shadow-xl">
                {/* Pricing */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-semibold text-gray-900">
                      {formatPrice(apartment.price_per_night)}
                    </span>
                    <span className="text-gray-600">/ night</span>
                  </div>

                  {apartment.price_per_week && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-sm text-gray-700">
                          Weekly rate:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatPrice(apartment.price_per_week)}
                        </span>
                      </div>
                      {weeklySavings > 0 && (
                        <p className="text-xs text-green-700">
                          Save {formatPrice(weeklySavings)} vs. nightly rate
                        </p>
                      )}
                    </div>
                  )}

                  {apartment.price_per_month && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-sm text-gray-700">
                          Monthly rate:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatPrice(apartment.price_per_month)}
                        </span>
                      </div>
                      {monthlySavings > 0 && (
                        <p className="text-xs text-green-700">
                          Save {formatPrice(monthlySavings)} vs. nightly rate
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Booking Details */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span>Minimum stay</span>
                    </div>
                    <span className="font-medium">
                      {apartment.minimum_stay}{" "}
                      {apartment.minimum_stay === 1 ? "night" : "nights"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4" />
                      <span>Check-in</span>
                    </div>
                    <span className="font-medium">
                      {apartment.check_in_time}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4" />
                      <span>Check-out</span>
                    </div>
                    <span className="font-medium">
                      {apartment.check_out_time}
                    </span>
                  </div>

                  {apartment.caution_deposit && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Security deposit</span>
                      <span className="font-medium">
                        {formatPrice(apartment.caution_deposit)}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <ApartmentBookingCard apartment={apartment} />
                {apartment.instant_booking && (
                  <p className="text-xs text-center text-gray-500">
                    Instant booking - You won't be charged yet
                  </p>
                )}
              </div>

              {/* Trust Badge */}
              {apartment.is_verified && (
                <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 mb-1">
                        Verified Property
                      </p>
                      <p className="text-gray-600">
                        All details confirmed by our team
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Availability Notice */}
              {(apartment.available_from || apartment.available_until) && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-1">
                        Availability Period
                      </p>
                      <p className="text-blue-800">
                        {apartment.available_from &&
                          `From: ${new Date(apartment.available_from).toLocaleDateString()}`}
                        {apartment.available_from &&
                          apartment.available_until && <br />}
                        {apartment.available_until &&
                          `Until: ${new Date(apartment.available_until).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
