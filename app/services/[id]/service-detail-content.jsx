"use client";

import { useState, useEffect, useMemo } from "react";
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
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Optimize by memoizing category find
const getCategory = (categoryValue) =>
  CATEGORIES.find((cat) => cat.value === categoryValue);

// Utility to normalize features to an array
const normalizeFeatures = (features) => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === "string")
    return features.split("\n").filter((f) => f.trim());
  return [];
};

// Category-specific detail renderers
const CategoryDetailsRenderer = ({ service, categoryData, category }) => {
  switch (category.value) {
    case "hotels":
    case "serviced_apartments":
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
    case "car_rentals":
      return <CarRentalDetails service={service} categoryData={categoryData} />;
    default:
      return <GenericDetails service={service} categoryData={categoryData} />;
  }
};

// Hotel and Serviced Apartment details
const HotelDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    {/* Room Information */}
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <Building className="w-5 h-5 mr-2 text-brand-600" />
        {service.category === "hotels" ? "Hotel" : "Serviced Apartment"} Details
      </h3>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {categoryData.room_type && (
            <tr>
              <td className="border px-4 py-2 font-medium">Room Type</td>
              <td className="border px-4 py-2 capitalize">
                {categoryData.room_type.replace("_", " ")}
              </td>
            </tr>
          )}
          {service.bedrooms && (
            <tr>
              <td className="border px-4 py-2 font-medium">Bedrooms</td>
              <td className="border px-4 py-2">{service.bedrooms}</td>
            </tr>
          )}
          {service.bathrooms && (
            <tr>
              <td className="border px-4 py-2 font-medium">Bathrooms</td>
              <td className="border px-4 py-2">{service.bathrooms}</td>
            </tr>
          )}
          {service.capacity && (
            <tr>
              <td className="border px-4 py-2 font-medium">Guests</td>
              <td className="border px-4 py-2">{service.capacity}</td>
            </tr>
          )}
          {service.maximum_capacity && (
            <tr>
              <td className="border px-4 py-2 font-medium">Maximum Capacity</td>
              <td className="border px-4 py-2">{service.maximum_capacity}</td>
            </tr>
          )}
          {service.minimum_stay && (
            <tr>
              <td className="border px-4 py-2 font-medium">Minimum Stay</td>
              <td className="border px-4 py-2">{service.minimum_stay}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Check-in/Check-out */}
    {(service.check_in_time || service.check_out_time) && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-brand-600" />
            Check-in & Check-out
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {service.check_in_time && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Check-in</div>
                  <div className="text-sm text-gray-600">
                    {service.check_in_time}
                  </div>
                </div>
              </div>
            )}
            {service.check_out_time && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="font-medium">Check-out</div>
                  <div className="text-sm text-gray-600">
                    {service.check_out_time}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    )}

    {/* Amenities */}
    {service.features && normalizeFeatures(service.features).length > 0 && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <Wifi className="w-5 h-5 mr-2 text-brand-600" />
            Amenities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {normalizeFeatures(service.features).map((amenity, index) => (
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

// Restaurant details - Updated with menu display
const RestaurantDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <Utensils className="w-5 h-5 mr-2 text-brand-600" />
        Restaurant Details
      </h3>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {categoryData.cuisine_type && (
            <tr>
              <td className="border px-4 py-2 font-medium">Cuisine</td>
              <td className="border px-4 py-2 capitalize">
                {categoryData.cuisine_type.replace("_", " ")}
              </td>
            </tr>
          )}
          {service.capacity && (
            <tr>
              <td className="border px-4 py-2 font-medium">Seating</td>
              <td className="border px-4 py-2">{service.capacity} seats</td>
            </tr>
          )}
          {service.operating_hours && (
            <tr>
              <td className="border px-4 py-2 font-medium">Operating Hours</td>
              <td className="border px-4 py-2">{service.operating_hours}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {categoryData.service_type && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <Utensils className="w-5 h-5 mr-2 text-brand-600" />
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

    {categoryData.special_diets && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <Utensils className="w-5 h-5 mr-2 text-brand-600" />
            Dietary Options
          </h3>
          <p className="text-gray-600">{categoryData.special_diets}</p>
        </div>
      </>
    )}

    {service.service_areas && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <MapIcon className="w-5 h-5 mr-2 text-brand-600" />
            Delivery Areas
          </h3>
          <p className="text-gray-600">{service.service_areas}</p>
        </div>
      </>
    )}

    {/* New: Menu Display */}
    {(categoryData.meals?.length > 0 || categoryData.menu_url) && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <Utensils className="w-5 h-5 mr-2 text-brand-600" />
            Menu
          </h3>
          {categoryData.meals?.length > 0 && (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border px-4 py-2 text-left font-medium">
                    Name
                  </th>
                  <th className="border px-4 py-2 text-left font-medium">
                    Description
                  </th>
                  <th className="border px-4 py-2 text-right font-medium">
                    Price (₦)
                  </th>
                </tr>
              </thead>
              <tbody>
                {categoryData.meals.map((meal, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{meal.name}</td>
                    <td className="border px-4 py-2">
                      {meal.description || "N/A"}
                    </td>
                    <td className="border px-4 py-2 text-right">
                      {Number(meal.price).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {categoryData.menu_url && (
            <a
              href={categoryData.menu_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-brand-600 hover:text-brand-700 text-sm font-medium mt-4"
            >
              View Full Menu <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          )}
        </div>
      </>
    )}
  </div>
);

// Event details
const EventDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-brand-600" />
        Event Details
      </h3>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {service.event_type && (
            <tr>
              <td className="border px-4 py-2 font-medium">Event Type</td>
              <td className="border px-4 py-2 capitalize">
                {service.event_type.replace("_", " ")}
              </td>
            </tr>
          )}
          {service.capacity && (
            <tr>
              <td className="border px-4 py-2 font-medium">Max Guests</td>
              <td className="border px-4 py-2">{service.capacity}</td>
            </tr>
          )}
          {service.duration && (
            <tr>
              <td className="border px-4 py-2 font-medium">Duration</td>
              <td className="border px-4 py-2">{service.duration}</td>
            </tr>
          )}
          {service.remaining_tickets &&
            service.event_type === "event_organizer" && (
              <tr>
                <td className="border px-4 py-2 font-medium">
                  Tickets Available
                </td>
                <td className="border px-4 py-2">
                  {service.remaining_tickets}
                </td>
              </tr>
            )}
          {categoryData.advance_booking && (
            <tr>
              <td className="border px-4 py-2 font-medium">Advance Booking</td>
              <td className="border px-4 py-2">
                {categoryData.advance_booking}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {categoryData.event_types && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-brand-600" />
            Event Types Supported
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

    {categoryData.services_included && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-brand-600" />
            Services Included
          </h3>
          <p className="text-gray-600">{categoryData.services_included}</p>
        </div>
      </>
    )}

    {categoryData.equipment_provided && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <Package className="w-5 h-5 mr-2 text-brand-600" />
            Equipment Provided
          </h3>
          <p className="text-gray-600">{categoryData.equipment_provided}</p>
        </div>
      </>
    )}
  </div>
);

// Logistics details
const LogisticsDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <Truck className="w-5 h-5 mr-2 text-brand-600" />
        Logistics Details
      </h3>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {categoryData.weight_limit && (
            <tr>
              <td className="border px-4 py-2 font-medium">Weight Limit</td>
              <td className="border px-4 py-2">{categoryData.weight_limit}</td>
            </tr>
          )}
          {categoryData.delivery_time && (
            <tr>
              <td className="border px-4 py-2 font-medium">Delivery Time</td>
              <td className="border px-4 py-2">{categoryData.delivery_time}</td>
            </tr>
          )}
          {categoryData.tracking_available && (
            <tr>
              <td className="border px-4 py-2 font-medium">Tracking</td>
              <td className="border px-4 py-2 capitalize">
                {categoryData.tracking_available}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {categoryData.service_types && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <Truck className="w-5 h-5 mr-2 text-brand-600" />
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

    {service.vehicle_type && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <Car className="w-5 h-5 mr-2 text-brand-600" />
            Vehicle Type
          </h3>
          <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
            {service.vehicle_type
              .replace("_", " ")
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </span>
        </div>
      </>
    )}

    {categoryData.insurance_covered && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-brand-600" />
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

// Security details
const SecurityDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <Shield className="w-5 h-5 mr-2 text-brand-600" />
        Security Details
      </h3>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {categoryData.team_size && (
            <tr>
              <td className="border px-4 py-2 font-medium">Team Size</td>
              <td className="border px-4 py-2">{categoryData.team_size}</td>
            </tr>
          )}
          {categoryData.experience_years && (
            <tr>
              <td className="border px-4 py-2 font-medium">Experience</td>
              <td className="border px-4 py-2">
                {categoryData.experience_years} years
              </td>
            </tr>
          )}
          {categoryData.response_time && (
            <tr>
              <td className="border px-4 py-2 font-medium">Response Time</td>
              <td className="border px-4 py-2">{categoryData.response_time}</td>
            </tr>
          )}
          {service.duration && (
            <tr>
              <td className="border px-4 py-2 font-medium">Duration</td>
              <td className="border px-4 py-2">{service.duration}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {categoryData.security_types && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-brand-600" />
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

    {categoryData.certifications && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-brand-600" />
            Certifications & Licenses
          </h3>
          <p className="text-gray-600">{categoryData.certifications}</p>
        </div>
      </>
    )}

    {categoryData.equipment && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <Package className="w-5 h-5 mr-2 text-brand-600" />
            Equipment & Technology
          </h3>
          <p className="text-gray-600">{categoryData.equipment}</p>
        </div>
      </>
    )}

    {categoryData.background_check && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-brand-600" />
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

// Car Rental details
const CarRentalDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <Car className="w-5 h-5 mr-2 text-brand-600" />
        Car Rental Details
      </h3>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {service.vehicle_type && (
            <tr>
              <td className="border px-4 py-2 font-medium">Vehicle Type</td>
              <td className="border px-4 py-2 capitalize">
                {service.vehicle_type.replace("_", " ")}
              </td>
            </tr>
          )}
          {categoryData.seating_capacity && (
            <tr>
              <td className="border px-4 py-2 font-medium">Seating Capacity</td>
              <td className="border px-4 py-2">
                {categoryData.seating_capacity}
              </td>
            </tr>
          )}
          {service.minimum_stay && (
            <tr>
              <td className="border px-4 py-2 font-medium">
                Minimum Rental Period
              </td>
              <td className="border px-4 py-2">{service.minimum_stay}</td>
            </tr>
          )}
          {categoryData.fuel_policy && (
            <tr>
              <td className="border px-4 py-2 font-medium">Fuel Policy</td>
              <td className="border px-4 py-2">{categoryData.fuel_policy}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {categoryData.features &&
      normalizeFeatures(categoryData.features).length > 0 && (
        <>
          <hr className="border-gray-200" />
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
              <Car className="w-5 h-5 mr-2 text-brand-600" />
              Vehicle Features
            </h3>
            <div className="flex flex-wrap gap-2">
              {normalizeFeatures(categoryData.features).map(
                (feature, index) => (
                  <span
                    key={index}
                    className="bg-brand-100 text-brand-800 text-sm font-medium px-3 py-1 rounded-full"
                  >
                    {feature.trim()}
                  </span>
                )
              )}
            </div>
          </div>
        </>
      )}

    {categoryData.insurance_covered && (
      <>
        <hr className="border-gray-200" />
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-brand-600" />
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

// Generic details fallback
const GenericDetails = ({ service, categoryData }) => (
  <div className="space-y-8">
    {categoryData.features &&
      normalizeFeatures(categoryData.features).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-brand-600" />
            Features & Amenities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {normalizeFeatures(categoryData.features).map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-success-600" />
                </div>
                <span className="text-sm text-gray-700">{feature.trim()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
  </div>
);

export default function ServiceDetailClient({ service }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [similarServices, setSimilarServices] = useState([]);
  const [isZoomed, setIsZoomed] = useState(false);

  const category = useMemo(
    () => getCategory(service.category),
    [service.category]
  );
  const categoryData = useMemo(() => extractCategoryData(service), [service]);

  // Fetch similar services
  useEffect(() => {
    const fetchSimilar = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("category", service.category)
        .neq("id", service.id)
        .eq("active", true)
        .limit(4)
        .order("price", { ascending: true });
      setSimilarServices(data || []);
    };
    fetchSimilar();
  }, [service.category, service.id]);

  const handlePrev = () => {
    setSelectedImageIndex((prev) =>
      prev > 0 ? prev - 1 : (service.media_urls?.length || 1) - 1
    );
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) =>
      prev < (service.media_urls?.length || 1) - 1 ? prev + 1 : 0
    );
  };

  return (
    <div className="container py-8">
      {/* Breadcrumbs */}
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-brand-600">
          Home
        </Link>{" "}
        &gt;
        <Link href="/services" className="hover:text-brand-600 ml-1">
          Services
        </Link>{" "}
        &gt;
        <Link
          href={`/services?category=${category?.value}`}
          className="hover:text-brand-600 ml-1"
        >
          {category?.label}
        </Link>{" "}
        &gt;
        <span className="ml-1">{service.title}</span>
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
                alt={`${service.title} - Image ${selectedImageIndex + 1}`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                priority={selectedImageIndex === 0}
                loading={selectedImageIndex !== 0 ? "lazy" : undefined}
              />
              {service.media_urls?.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsZoomed(true)}
                className="absolute bottom-2 right-2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
                aria-label="Zoom image"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>

            {isZoomed && (
              <div
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
                onClick={() => setIsZoomed(false)}
              >
                <Image
                  src={
                    service.media_urls?.[selectedImageIndex] ||
                    "/placeholder.jpg"
                  }
                  alt={`${service.title} - Zoomed Image`}
                  className="max-w-[90%] max-h-[90%] object-contain"
                  width={1200}
                  height={900}
                />
              </div>
            )}

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
                      fill
                      className="object-cover"
                      loading="lazy"
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
                      <CheckCircle className="w-3 h-3 mr-1" /> Active
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {service.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {service.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                      {service.location}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    {service.rating || "N/A"} ({service.review_count || "0"}{" "}
                    reviews)
                  </div>
                  {service.capacity && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1 text-gray-500" />
                      {service.capacity}{" "}
                      {service.category === "events" ? "guests" : "capacity"}
                    </div>
                  )}
                  {service.duration && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-gray-500" />
                      {service.duration}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Description */}
              {service.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-brand-600" />
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              )}

              <hr className="border-gray-200" />
              <CategoryDetailsRenderer
                service={service}
                categoryData={categoryData}
                category={category}
              />

              {/* Requirements */}
              {service.requirements &&
                normalizeFeatures(service.requirements).length > 0 && (
                  <>
                    <hr className="border-gray-200" />
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-brand-600" />
                        Requirements
                      </h3>
                      <ul className="space-y-2">
                        {normalizeFeatures(service.requirements).map(
                          (requirement, index) => (
                            <li
                              key={index}
                              className="text-sm text-gray-600 flex items-start"
                            >
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              {requirement.trim()}
                            </li>
                          )
                        )}
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
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-brand-600" />
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
          <div className="card-hospitality">
            <h3 className="text-lg font-semibold mb-6 text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-brand-600" />
              About the Vendor
            </h3>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-brand">
                {service.vendor_name?.charAt(0) || "V"}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {service.vendor_name || "Vendor Name"}
                  </h4>
                  {service.active && (
                    <span className="bg-success-100 text-success-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" /> Verified
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {service.vendor_phone && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        {service.vendor_phone}
                      </span>
                    </div>
                  )}
                  {service.vendor?.email && (
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

          {/* You Might Also Like */}
          {similarServices.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">
                You Might Also Like
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {similarServices.map((sim) => (
                  <Link
                    key={sim.id}
                    href={`/services/${sim.id}`}
                    className="card-hospitality block"
                  >
                    <div className="relative h-40 rounded-t-lg overflow-hidden">
                      <Image
                        src={sim.media_urls?.[0] || "/placeholder.jpg"}
                        alt={sim.title}
                        fill
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900">
                        {sim.title}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {sim.location}
                      </p>
                      <p className="font-bold text-brand-600 mt-2">
                        ₦{sim.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
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
                      : service.price_unit === "per_night"
                        ? "per night"
                        : service.price_unit === "per_person"
                          ? "per person"
                          : service.price_unit === "per_km"
                            ? "per km"
                            : service.price_unit === "per_event"
                              ? "per event"
                              : service.price_unit === "per_week"
                                ? "per week"
                                : service.price_unit === "per_month"
                                  ? "per month"
                                  : service.price_unit === "negotiable"
                                    ? "negotiable"
                                    : "fixed"}
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  service.availability === "available"
                    ? "bg-success-100 text-success-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {service.availability === "available"
                  ? "Available"
                  : service.availability === "busy"
                    ? "Busy"
                    : "Unavailable"}
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
                <table className="w-full text-sm">
                  <tbody>
                    {service.security_deposit && (
                      <tr>
                        <td className="py-1">Security Deposit</td>
                        <td className="py-1 text-right">
                          ₦{service.security_deposit.toLocaleString()}
                        </td>
                      </tr>
                    )}
                    <tr className="font-bold border-t">
                      <td className="py-1">Total</td>
                      <td className="py-1 text-right">
                        ₦
                        {(
                          service.price + (service.security_deposit || 0)
                        ).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Contact */}
          {(service.vendor_phone || service.vendor?.email) && (
            <div className="card-hospitality">
              <h3 className="font-semibold mb-4 text-gray-900 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-brand-600" />
                Need Help?
              </h3>
              <div className="space-y-3">
                {service.vendor_phone && (
                  <a
                    href={`tel:${service.vendor_phone}`}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-brand-300 transition-colors"
                  >
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    Call Vendor
                  </a>
                )}
                {service.vendor?.email && (
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
