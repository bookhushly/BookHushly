"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import RichContentRenderer from "@/components/common/rich-text-renderer";
import {
  MapPin,
  Users,
  Bed,
  Bath,
  Maximize2,
  Wifi,
  Car,
  Wind,
  Zap,
  Droplet,
  Shield,
  Calendar,
  Clock,
  Star,
  Share2,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";

export default function ApartmentClient({ apartment }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const images = apartment.image_urls || [];

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

  return (
    <div className="min-h-screen bg-white">
      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <div className="relative h-full w-full">
              <button
                onClick={() => setShowGallery(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="absolute top-4 left-4 z-10 text-white font-medium bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
                {selectedImage + 1} / {images.length}
              </div>

              <div className="h-full flex items-center justify-center">
                <button
                  onClick={() =>
                    setSelectedImage(Math.max(0, selectedImage - 1))
                  }
                  className="absolute left-4 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition disabled:opacity-50"
                  disabled={selectedImage === 0}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <img
                  src={images[selectedImage]}
                  alt={`${apartment.name} - Image ${selectedImage + 1}`}
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                />

                <button
                  onClick={() =>
                    setSelectedImage(
                      Math.min(images.length - 1, selectedImage + 1)
                    )
                  }
                  className="absolute right-4 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition disabled:opacity-50"
                  disabled={selectedImage === images.length - 1}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-3">
            {apartment.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-gray-700">
              <MapPin className="w-4 h-4" />
              <span>
                {apartment.area}, {apartment.city}, {apartment.state}
              </span>
            </div>

            {apartment.views_count > 0 && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <Star className="w-4 h-4" />
                <span>{apartment.views_count} views</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-sm font-medium"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>

            <button
              onClick={() => setIsSaved(!isSaved)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-sm font-medium"
            >
              <Heart
                className={`w-4 h-4 ${isSaved ? "fill-purple-600 text-purple-600" : ""}`}
              />
              Save
            </button>
          </div>
        </div>

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden mb-12 h-[400px]">
            <div
              className="col-span-4 sm:col-span-2 row-span-2 relative cursor-pointer group"
              onClick={() => {
                setSelectedImage(0);
                setShowGallery(true);
              }}
            >
              <Image
                src={images[0]}
                alt={apartment.name}
                fill
                className="object-cover group-hover:scale-105 transition duration-300"
                priority
              />
            </div>

            {images.slice(1, 5).map((img, idx) => (
              <div
                key={idx}
                className={`relative cursor-pointer group ${idx === 3 ? "relative" : ""}`}
                onClick={() => {
                  setSelectedImage(idx + 1);
                  setShowGallery(true);
                }}
              >
                <Image
                  src={img}
                  alt={`${apartment.name} - ${idx + 2}`}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
                {idx === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium">
                      +{images.length - 5} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Quick Info */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-2xl font-semibold mb-4">
                {apartmentTypeLabel[apartment.apartment_type]} Apartment
              </h2>

              <div className="flex flex-wrap gap-4 text-gray-700">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>{apartment.max_guests} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-purple-600" />
                  <span>
                    {apartment.bedrooms} bedroom
                    {apartment.bedrooms > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-purple-600" />
                  <span>
                    {apartment.bathrooms} bath
                    {apartment.bathrooms > 1 ? "s" : ""}
                  </span>
                </div>
                {apartment.square_meters && (
                  <div className="flex items-center gap-2">
                    <Maximize2 className="w-5 h-5 text-purple-600" />
                    <span>{apartment.square_meters} m²</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {apartment.description && (
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-semibold mb-4">About this place</h3>
                <RichContentRenderer
                  content={apartment.description}
                  className="text-gray-700 leading-relaxed"
                />
              </div>
            )}

            {/* Amenities & Utilities */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold mb-6">
                What this place offers
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {apartment.internet_included && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Wifi className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">WiFi</p>
                      {apartment.internet_speed && (
                        <p className="text-sm text-gray-500">
                          {apartment.internet_speed}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {apartment.parking_spaces > 0 && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Car className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Parking</p>
                      <p className="text-sm text-gray-500">
                        {apartment.parking_spaces} space
                        {apartment.parking_spaces > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                )}

                {apartment.generator_available && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Generator</p>
                      {apartment.generator_hours && (
                        <p className="text-sm text-gray-500">
                          {apartment.generator_hours}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {apartment.inverter_available && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <p className="font-medium">Inverter available</p>
                  </div>
                )}

                {apartment.solar_power && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <p className="font-medium">Solar power</p>
                  </div>
                )}

                {apartment.water_supply && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Droplet className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Water supply</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {apartment.water_supply.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                )}

                {apartment.has_balcony && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-purple-600" />
                    <p className="font-medium">Balcony</p>
                  </div>
                )}

                {apartment.has_terrace && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-purple-600" />
                    <p className="font-medium">Terrace</p>
                  </div>
                )}

                {apartment.furnished && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-purple-600" />
                    <p className="font-medium">Fully furnished</p>
                  </div>
                )}

                {apartment.kitchen_equipped && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-purple-600" />
                    <p className="font-medium">Equipped kitchen</p>
                  </div>
                )}
              </div>
            </div>

            {/* Security Features */}
            {Object.values(securityFeatures).some((v) => v) && (
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-semibold mb-6">
                  Security features
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {securityFeatures.estate_gate && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <p className="font-medium">Estate gate</p>
                    </div>
                  )}
                  {securityFeatures["24hr_security"] && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <p className="font-medium">24-hour security</p>
                    </div>
                  )}
                  {securityFeatures.access_control && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <p className="font-medium">Access control</p>
                    </div>
                  )}
                  {securityFeatures.intercom_system && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <p className="font-medium">Intercom system</p>
                    </div>
                  )}
                  {securityFeatures.cctv_surveillance && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <p className="font-medium">CCTV surveillance</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* House Rules */}
            {apartment.house_rules && (
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-semibold mb-4">House rules</h3>
                <RichContentRenderer
                  content={apartment.house_rules}
                  className="text-gray-700"
                />
              </div>
            )}

            {/* Cancellation Policy */}
            {apartment.cancellation_policy && (
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Cancellation policy
                </h3>
                <RichContentRenderer
                  content={apartment.cancellation_policy}
                  className="text-gray-700"
                />
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="border border-gray-300 rounded-2xl p-6 shadow-xl">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-gray-900">
                      {formatPrice(apartment.price_per_night)}
                    </span>
                    <span className="text-gray-600">/ night</span>
                  </div>

                  {apartment.price_per_week && (
                    <p className="text-sm text-gray-600 mt-1">
                      {formatPrice(apartment.price_per_week)} / week
                    </p>
                  )}

                  {apartment.price_per_month && (
                    <p className="text-sm text-gray-600">
                      {formatPrice(apartment.price_per_month)} / month
                    </p>
                  )}
                </div>

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
                      <span className="text-gray-700">Caution deposit</span>
                      <span className="font-medium">
                        {formatPrice(apartment.caution_deposit)}
                      </span>
                    </div>
                  )}
                </div>

                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3.5 rounded-lg transition mb-3">
                  {apartment.instant_booking ? "Book now" : "Request to book"}
                </button>

                <button className="w-full border border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold py-3.5 rounded-lg transition">
                  Contact host
                </button>

                {apartment.instant_booking && (
                  <p className="text-xs text-center text-gray-500 mt-4">
                    Instant booking available - You won't be charged yet
                  </p>
                )}
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 mb-1">
                      This is a verified property
                    </p>
                    <p className="text-gray-600">
                      All details have been confirmed by our team
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
