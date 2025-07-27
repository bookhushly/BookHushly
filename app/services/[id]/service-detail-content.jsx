"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";

export default function ServiceDetailClient({ service }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const category = CATEGORIES.find((cat) => cat.value === service.category);
  console.log(service);
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link
          href="/services"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-brand-600 transition-colors"
        >
          {/* Back button icon */}
          Back to Services
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-medium">
              <Image
                src={
                  service.media_urls?.[selectedImageIndex] ||
                  category?.image ||
                  "/placeholder.jpg"
                }
                alt={`${service.title} - Main Image`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>

            {service.media_urls?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {service.media_urls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                      selectedImageIndex === index
                        ? "ring-2 ring-brand-500 shadow-brand"
                        : "hover:ring-2 hover:ring-gray-300"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${service.title} thumbnail ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Service Info */}
          <div className="card-hospitality">
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="bg-brand-100 text-brand-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {category?.label}
                  </span>
                  {service.active && (
                    <span className="bg-success-100 text-success-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {service.title}
                </h1>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                    {service.location}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    {service.rating || "4.8"} ({service.review_count || "0"}{" "}
                    reviews)
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Features & Amenities */}
              {service.features?.length > 0 && (
                <>
                  <hr className="border-gray-200" />
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Features & Amenities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {service.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3"
                        >
                          <div className="w-5 h-5 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-3 h-3 text-success-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="text-sm t ext-gray-700">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Requirements */}
              {service.requirements?.length > 0 && (
                <>
                  <hr className="border-gray-200" />
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Requirements
                    </h3>
                    <ul className="space-y-2">
                      {service.requirements.map((requirement, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-600 flex items-start"
                        >
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Cancellation Policy */}
              {service.cancellation_policy && (
                <>
                  <hr className="border-gray-200" />
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">
                      Cancellation Policy
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {service.cancellation_policy}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Vendor Info */}
          {service.vendor && (
            <div className="card-hospitality">
              <h3 className="text-lg font-semibold mb-6 text-gray-900">
                About the Vendor
              </h3>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-brand">
                  {service.vendor.business_name?.charAt(0) || "V"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {service.vendor.business_name || "Vendor Name"}
                    </h4>
                    {service.vendor.approved && (
                      <span className="bg-success-100 text-success-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  {/* Vendor contact info */}
                  <div className="space-y-3">
                    {service.vendor.phone && (
                      <div className="flex items-center space-x-3 text-sm">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span className="text-gray-700">
                          {service.vendor.phone}
                        </span>
                      </div>
                    )}
                    {service.vendor.email && (
                      <div className="flex items-center space-x-3 text-sm">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span className="text-gray-700">
                          {service.vendor.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Booking Sidebar */}
        <div className="space-y-6">
          <div className="card-hospitality sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  ₦{service.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  {service.duration || "Per session"}
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  service.availability === "available"
                    ? "bg-success-100 text-success-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {service.availability === "available" ? "Available" : "Busy"}
              </span>
            </div>

            <div className="space-y-4">
              <Link
                href={`/book/${service.id}`}
                className={`btn-hospitality w-full inline-flex items-center justify-center ${
                  service.availability === "available"
                    ? "bg-brand-600 text-white hover:bg-brand-700 shadow-brand"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                {service.availability === "available"
                  ? "Book Now"
                  : "Currently Unavailable"}
              </Link>

              {service.cancellation_policy && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {service.cancellation_policy.split(".")[0]}.
                  </p>
                </div>
              )}

              <hr className="border-gray-200" />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service fee</span>
                  <span className="font-medium">
                    ₦{service.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform fee</span>
                  <span className="font-medium">
                    ₦{(service.price * 0.05).toLocaleString()}
                  </span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₦{(service.price * 1.05).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact */}
          {service.vendor && (
            <div className="card-hospitality">
              <h3 className="font-semibold mb-4 text-gray-900">Need Help?</h3>
              <div className="space-y-3">
                {service.vendor.phone && (
                  <a
                    href={`tel:${service.vendor.phone}`}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-brand-300 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Call Vendor
                  </a>
                )}
                {service.vendor.email && (
                  <a
                    href={`mailto:${service.vendor.email}`}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-brand-300 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Send Message
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
