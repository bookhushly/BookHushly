// components/shared/listings/details/GeneralServiceDetail.jsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  DollarSign,
  Shield,
  CheckCircle,
  Star,
  Share2,
  Heart,
  ArrowLeft,
  Calendar,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { RobustImage } from "@/components/common/RobustImage";

const GeneralServiceDetail = ({ service }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const images = service.media_urls || [];
  const amenities = service.amenities || [];

  const formatPrice = (price, priceUnit) => {
    if (!price) return "Contact for pricing";

    const formatted = `₦${Number(price).toLocaleString()}`;
    const unitMap = {
      per_hour: "per hour",
      per_day: "per day",
      per_night: "per night",
      per_person: "per person",
      per_km: "per km",
      per_event: "per event",
      fixed: "",
      negotiable: "(Negotiable)",
    };

    const unit = unitMap[priceUnit] || priceUnit || "";
    return `${formatted} ${unit}`.trim();
  };

  const navigateImage = (direction) => {
    if (direction === "next") {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    } else {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length,
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/services"
              className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to services</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${
                  isLiked
                    ? "text-red-500 bg-red-50"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </button>
              <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image Gallery */}
      {images.length > 0 && (
        <div className="relative h-[60vh] bg-gray-900">
          <RobustImage
            src={images[currentImageIndex]}
            alt={service.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => navigateImage("prev")}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => navigateImage("next")}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-purple-600 text-white">
                  {service.category}
                </Badge>
                {service.active && (
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                {service.title}
              </h1>
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{service.location}</span>
                </div>
                {service.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>Up to {service.capacity} people</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About This Service
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Amenities/Features */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Features & Amenities
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg"
                    >
                      <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-900">
                        {typeof amenity === "string"
                          ? amenity
                          : amenity.name || amenity.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            {(service.requirements || service.cancellation_policy) && (
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Important Information
                </h2>
                <div className="space-y-4">
                  {service.requirements && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Requirements
                      </h3>
                      <p className="text-gray-700">{service.requirements}</p>
                    </div>
                  )}
                  {service.cancellation_policy && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Cancellation Policy
                      </h3>
                      <p className="text-gray-700">
                        {service.cancellation_policy}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-xl border p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatPrice(service.price, service.price_unit)}
                </div>
                {service.security_deposit && (
                  <div className="text-sm text-gray-600">
                    + ₦{Number(service.security_deposit).toLocaleString()}{" "}
                    deposit
                  </div>
                )}
              </div>

              <Button
                asChild={service.availability === "available"}
                disabled={service.availability !== "available"}
                className="w-full h-12 text-base font-semibold bg-purple-600 hover:bg-purple-700 mb-4"
              >
                {service.availability === "available" ? (
                  <Link href={`/book/${service.id}`}>Book Now</Link>
                ) : (
                  <span>Unavailable</span>
                )}
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="w-4 h-4 mr-1" />
                  Message
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  Verified Service Provider
                </div>
              </div>
            </div>

            {/* Contact Info */}
            {(service.vendor_name || service.vendor_phone) && (
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Provider Contact
                </h3>
                <div className="space-y-3">
                  {service.vendor_name && (
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">{service.vendor_name}</span>
                    </div>
                  )}
                  {service.vendor_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-purple-600" />
                      <span>{service.vendor_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralServiceDetail;
