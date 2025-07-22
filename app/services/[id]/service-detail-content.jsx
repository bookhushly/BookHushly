"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/constants";

export default function ServiceDetailClient({ serviceId }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Mock service data - in real app, fetch from database
  const service = {
    id: serviceId,
    title: "Luxury Hotel Suite - Premium Accommodation",
    description:
      "Experience the finest hospitality with our luxury hotel suite featuring world-class amenities, stunning city views, and exceptional service. Perfect for business travelers, tourists, and special occasions.",
    category: "hotels",
    price: 75000,
    location: "Victoria Island, Lagos",
    capacity: 4,
    duration: "Per night",
    rating: 4.8,
    reviewCount: 127,
    availability: "available",
    features: [
      "24/7 Room Service",
      "High-Speed WiFi",
      "Air Conditioning",
      "City View",
      "Mini Bar",
      "Flat Screen TV",
      "Private Bathroom",
      "Concierge Service",
    ],
    requirements: [
      "Valid ID required at check-in",
      "Credit card for incidentals",
      "No smoking policy",
      "Quiet hours: 10 PM - 7 AM",
    ],
    cancellation_policy:
      "Free cancellation up to 24 hours before check-in. 50% refund for cancellations within 24 hours.",
    vendor: {
      id: "vendor-1",
      business_name: "Grand Lagos Hotels",
      name: "Adebayo Johnson",
      email: "info@grandlagoshotels.com",
      phone: "+234 901 234 5678",
      website: "www.grandlagoshotels.com",
      approved: true,
      rating: 4.9,
      totalBookings: 1250,
    },
    media_urls: [
      "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/6585751/pexels-photo-6585751.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
  };

  const category = CATEGORIES.find((cat) => cat.value === service.category);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <a
          href="/services"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-brand-600 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Services
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-medium">
              <img
                src={service.media_urls[selectedImageIndex]}
                alt={`${service.title} - Image ${selectedImageIndex + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            {service.media_urls.length > 1 && (
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
                    <img
                      src={url}
                      alt={`${service.title} thumbnail ${index + 1}`}
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
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {service.title}
                </h1>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {service.location}
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {service.rating} ({service.reviewCount} reviews)
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-brand-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Capacity
                    </p>
                    <p className="text-sm text-gray-600">
                      Up to {service.capacity} guests
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-brand-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Duration
                    </p>
                    <p className="text-sm text-gray-600">{service.duration}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-success-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status</p>
                    <p className="text-sm text-gray-600">Verified Service</p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Features & Amenities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
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
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

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

              <hr className="border-gray-200" />

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  Cancellation Policy
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {service.cancellation_policy}
                </p>
              </div>
            </div>
          </div>

          {/* Vendor Info */}
          <div className="card-hospitality">
            <h3 className="text-lg font-semibold mb-6 text-gray-900">
              About the Vendor
            </h3>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-brand">
                {service.vendor.business_name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {service.vendor.business_name}
                  </h4>
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
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {service.vendor.rating} rating
                  </div>
                  <span className="text-gray-400">•</span>
                  <span>{service.vendor.totalBookings} bookings</span>
                </div>
                <div className="space-y-3">
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
                  <div className="flex items-center space-x-3 text-sm">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      {service.vendor.website}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="space-y-6">
          <div className="card-hospitality sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  ₦{service.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">{service.duration}</div>
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
              <a
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
              </a>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Free cancellation up to 24 hours
                </p>
              </div>

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
          <div className="card-hospitality">
            <h3 className="font-semibold mb-4 text-gray-900">Need Help?</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-brand-300 transition-colors">
                <svg
                  className="w-4 h-4 mr-2 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Call Vendor
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-brand-300 transition-colors">
                <svg
                  className="w-4 h-4 mr-2 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
