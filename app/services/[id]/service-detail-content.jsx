"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/constants";
import { extractCategoryData } from "@/lib/category-forms";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Star,
  Users,
  Clock,
  Bed,
  Bath,
  Utensils,
  Calendar,
  Truck,
  Shield,
  Building,
  Wifi,
  Car,
  Phone,
  Mail,
  CheckCircle,
  MapIcon,
  Timer,
  Award,
  Package,
} from "lucide-react";

// Category-specific detail renderers
const CategoryDetailsRenderer = ({ service, categoryData, category }) => {
  switch (category.value) {
    case "hotels":
      return <HotelDetails service={service} categoryData={categoryData} />;
    case "food":
      return (
        <RestaurantDetails service={service} categoryData={categoryData} />
      );
    case "events":
      return <EventDetails service={service} categoryData={categoryData} />;
    case "logistics":
      return <LogisticsDetails service={service} categoryData={categoryData} />;
    case "security":
      return <SecurityDetails service={service} categoryData={categoryData} />;
    default:
      return <GenericDetails service={service} categoryData={categoryData} />;
  }
};

// Hotel-specific details
const HotelDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    {/* Room Information */}
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <Building className="w-5 h-5 mr-2 text-brand-600" />
        Accommodation Details
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categoryData.room_type && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Bed className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <div className="text-sm text-gray-600">Room Type</div>
            <div className="font-semibold capitalize">
              {categoryData.room_type.replace("_", " ")}
            </div>
          </div>
        )}
        {service.capacity && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <div className="text-sm text-gray-600">Guests</div>
            <div className="font-semibold">{service.capacity}</div>
          </div>
        )}
        {categoryData.bedrooms && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Bed className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <div className="text-sm text-gray-600">Bedrooms</div>
            <div className="font-semibold">{categoryData.bedrooms}</div>
          </div>
        )}
        {categoryData.bathrooms && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Bath className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <div className="text-sm text-gray-600">Bathrooms</div>
            <div className="font-semibold">{categoryData.bathrooms}</div>
          </div>
        )}
      </div>
    </div>

    {/* Check-in/Check-out */}
    {(categoryData.check_in_time || categoryData.check_out_time) && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-brand-600" />
            Check-in & Check-out
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryData.check_in_time && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Check-in</div>
                  <div className="text-sm text-gray-600">
                    {categoryData.check_in_time}
                  </div>
                </div>
              </div>
            )}
            {categoryData.check_out_time && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="font-medium">Check-out</div>
                  <div className="text-sm text-gray-600">
                    {categoryData.check_out_time}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    )}

    {/* Amenities */}
    {categoryData.amenities && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Hotel Amenities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryData.amenities.split(",").map((amenity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Wifi className="w-4 h-4 text-brand-600" />
                <span className="text-sm text-gray-700">{amenity.trim()}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    )}
  </div>
);

// Restaurant-specific details
const RestaurantDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    {/* Restaurant Information */}
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <Utensils className="w-5 h-5 mr-2 text-brand-600" />
        Restaurant Details
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categoryData.cuisine_type && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Utensils className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <div className="text-sm text-gray-600">Cuisine</div>
            <div className="font-semibold capitalize">
              {categoryData.cuisine_type.replace("_", " ")}
            </div>
          </div>
        )}
        {service.capacity && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <div className="text-sm text-gray-600">Seating</div>
            <div className="font-semibold">{service.capacity} seats</div>
          </div>
        )}
        {service.operating_hours && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <div className="text-sm text-gray-600">Hours</div>
            <div className="font-semibold text-xs">
              {service.operating_hours}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Service Types */}
    {categoryData.service_type && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Available Services
          </h3>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(categoryData.service_type)
              ? categoryData.service_type
              : [categoryData.service_type]
            ).map((type, index) => (
              <span
                key={index}
                className="bg-brand-100 text-brand-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                {type
                  .replace("_", " ")
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </span>
            ))}
          </div>
        </div>
      </>
    )}

    {/* Special Diets */}
    {categoryData.special_diets && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Dietary Options
          </h3>
          <p className="text-gray-600">{categoryData.special_diets}</p>
        </div>
      </>
    )}

    {/* Delivery Areas */}
    {categoryData.delivery_areas && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <MapIcon className="w-5 h-5 mr-2 text-brand-600" />
            Delivery Areas
          </h3>
          <p className="text-gray-600">{categoryData.delivery_areas}</p>
        </div>
      </>
    )}
  </div>
);

// Event-specific details
const EventDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    {/* Event Information */}
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-brand-600" />
        Event Service Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {service.capacity && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <div className="text-sm text-gray-600">Max Guests</div>
            <div className="font-semibold">{service.capacity}</div>
          </div>
        )}
        {service.duration && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Timer className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <div className="text-sm text-gray-600">Duration</div>
            <div className="font-semibold">{service.duration}</div>
          </div>
        )}
        {categoryData.advance_booking && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <div className="text-sm text-gray-600">Advance Booking</div>
            <div className="font-semibold">{categoryData.advance_booking}</div>
          </div>
        )}
      </div>
    </div>

    {/* Event Types */}
    {categoryData.event_types && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Event Types We Handle
          </h3>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(categoryData.event_types)
              ? categoryData.event_types
              : [categoryData.event_types]
            ).map((type, index) => (
              <span
                key={index}
                className="bg-brand-100 text-brand-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                {type
                  .replace("_", " ")
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </span>
            ))}
          </div>
        </div>
      </>
    )}

    {/* Services Included */}
    {categoryData.services_included && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Services Included
          </h3>
          <p className="text-gray-600">{categoryData.services_included}</p>
        </div>
      </>
    )}

    {/* Equipment Provided */}
    {categoryData.equipment_provided && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Equipment & Items Provided
          </h3>
          <p className="text-gray-600">{categoryData.equipment_provided}</p>
        </div>
      </>
    )}
  </div>
);

// Logistics-specific details
const LogisticsDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    {/* Logistics Information */}
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <Truck className="w-5 h-5 mr-2 text-brand-600" />
        Logistics Service Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categoryData.weight_limit && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Package className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <div className="text-sm text-gray-600">Weight Limit</div>
            <div className="font-semibold">{categoryData.weight_limit}</div>
          </div>
        )}
        {categoryData.delivery_time && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Timer className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <div className="text-sm text-gray-600">Delivery Time</div>
            <div className="font-semibold">{categoryData.delivery_time}</div>
          </div>
        )}
        {categoryData.tracking_available && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <MapIcon className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <div className="text-sm text-gray-600">Tracking</div>
            <div className="font-semibold capitalize">
              {categoryData.tracking_available}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Service Types */}
    {categoryData.service_types && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Available Services
          </h3>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(categoryData.service_types)
              ? categoryData.service_types
              : [categoryData.service_types]
            ).map((type, index) => (
              <span
                key={index}
                className="bg-brand-100 text-brand-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                {type
                  .replace("_", " ")
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </span>
            ))}
          </div>
        </div>
      </>
    )}

    {/* Vehicle Types */}
    {categoryData.vehicle_types && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <Car className="w-5 h-5 mr-2 text-brand-600" />
            Available Vehicles
          </h3>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(categoryData.vehicle_types)
              ? categoryData.vehicle_types
              : [categoryData.vehicle_types]
            ).map((vehicle, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                {vehicle
                  .replace("_", " ")
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </span>
            ))}
          </div>
        </div>
      </>
    )}

    {/* Insurance Coverage */}
    {categoryData.insurance_covered && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Insurance Coverage
          </h3>
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-brand-600" />
            <span className="text-gray-700 capitalize">
              {categoryData.insurance_covered.replace("_", " ")}
            </span>
          </div>
        </div>
      </>
    )}
  </div>
);

// Security-specific details
const SecurityDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    {/* Security Information */}
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <Shield className="w-5 h-5 mr-2 text-brand-600" />
        Security Service Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categoryData.team_size && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <div className="text-sm text-gray-600">Team Size</div>
            <div className="font-semibold">{categoryData.team_size}</div>
          </div>
        )}
        {categoryData.experience_years && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Award className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <div className="text-sm text-gray-600">Experience</div>
            <div className="font-semibold">
              {categoryData.experience_years} years
            </div>
          </div>
        )}
        {categoryData.response_time && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Timer className="w-6 h-6 mx-auto mb-2 text-brand-600" />
            <div className="text-sm text-gray-600">Response Time</div>
            <div className="font-semibold">{categoryData.response_time}</div>
          </div>
        )}
      </div>
    </div>

    {/* Security Types */}
    {categoryData.security_types && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Security Services
          </h3>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(categoryData.security_types)
              ? categoryData.security_types
              : [categoryData.security_types]
            ).map((type, index) => (
              <span
                key={index}
                className="bg-brand-100 text-brand-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                {type
                  .replace("_", " ")
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </span>
            ))}
          </div>
        </div>
      </>
    )}

    {/* Duration Options */}
    {categoryData.duration && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Service Duration Options
          </h3>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(categoryData.duration) ? (
              categoryData.duration.map((dur, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full"
                >
                  {dur
                    .replace("_", " ")
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </span>
              ))
            ) : (
              <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                {String(categoryData.duration)
                  .replace("_", " ")
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </span>
            )}
          </div>
        </div>
      </>
    )}

    {/* Certifications */}
    {categoryData.certifications && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Certifications & Licenses
          </h3>
          <p className="text-gray-600">{categoryData.certifications}</p>
        </div>
      </>
    )}

    {/* Equipment */}
    {categoryData.equipment && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Equipment & Technology
          </h3>
          <p className="text-gray-600">{categoryData.equipment}</p>
        </div>
      </>
    )}

    {/* Background Check */}
    {categoryData.background_check && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Background Verification
          </h3>
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-gray-700 capitalize">
              {categoryData.background_check.replace("_", " ")}
            </span>
          </div>
        </div>
      </>
    )}
  </div>
);

// Generic details fallback
const GenericDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    {categoryData.features && categoryData.features.length > 0 && (
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Features & Amenities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categoryData.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-3 h-3 text-success-600" />
              </div>
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default function ServiceDetailClient({ service }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const category = CATEGORIES.find((cat) => cat.value === service.category);
  const categoryData = extractCategoryData(service);

  console.log("Service:", service);
  console.log("Category Data:", categoryData);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link
          href="/services"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-brand-600 transition-colors"
        >
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
                      <CheckCircle className="w-3 h-3 mr-1" />
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

              {/* Category-specific details */}
              <hr className="border-gray-200" />
              <CategoryDetailsRenderer
                service={service}
                categoryData={categoryData}
                category={category}
              />

              {/* Requirements */}
              {categoryData.requirements &&
                categoryData.requirements.length > 0 && (
                  <>
                    <hr className="border-gray-200" />
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">
                        Requirements
                      </h3>
                      <ul className="space-y-2">
                        {categoryData.requirements.map((requirement, index) => (
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

              {/* Service Areas */}
              {service.service_areas && (
                <>
                  <hr className="border-gray-200" />
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                      <MapIcon className="w-5 h-5 mr-2 text-brand-600" />
                      Service Areas
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {service.service_areas}
                    </p>
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
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                  {/* Vendor contact info */}
                  <div className="space-y-3">
                    {service.vendor.phone && (
                      <div className="flex items-center space-x-3 text-sm">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">
                          {service.vendor.phone}
                        </span>
                      </div>
                    )}
                    {service.vendor.email && (
                      <div className="flex items-center space-x-3 text-sm">
                        <Mail className="w-4 h-4 text-gray-500" />
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
                  {service.price_unit === "per_hour"
                    ? "per hour"
                    : service.price_unit === "per_day"
                      ? "per day"
                      : service.price_unit === "per_person"
                        ? "per person"
                        : service.price_unit === "per_km"
                          ? "per km"
                          : service.duration || "Per session"}
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
                <Calendar className="w-4 h-4 mr-2" />
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
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    Call Vendor
                  </a>
                )}
                {service.vendor.email && (
                  <a
                    href={`mailto:${service.vendor.email}`}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-brand-300 transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
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
