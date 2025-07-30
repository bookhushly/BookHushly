import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  FileText,
  Building,
  Star,
  Eye,
  Loader2,
  Bed,
  Bath,
  Wifi,
  Car,
  Utensils,
  Shield,
  Truck,
  PartyPopper,
  Home,
  CheckCircle,
  AlertCircle,
  Users,
  Timer,
  Package,
  Camera,
  Music,
  Briefcase,
} from "lucide-react";
import { getBooking } from "@/lib/database";
import Link from "next/link";

// Simple date formatting functions
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Category-specific components
const HotelBookingDetails = ({ booking }) => (
  <div className="space-y-6">
    {/* Room Information */}
    <div className="bg-blue-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Home className="h-5 w-5 mr-2 text-blue-600" />
        Accommodation Details
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm text-gray-500">Room Type</span>
          <p className="font-medium capitalize">
            {booking.listings?.category_data?.room_type || "Standard Room"}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Guests</span>
          <p className="font-medium">{booking.guests} guests</p>
        </div>
        {booking.listings?.category_data?.bedrooms && (
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-2 text-gray-400" />
            <div>
              <span className="text-sm text-gray-500">Bedrooms</span>
              <p className="font-medium">
                {booking.listings.category_data.bedrooms}
              </p>
            </div>
          </div>
        )}
        {booking.listings?.category_data?.bathrooms && (
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-2 text-gray-400" />
            <div>
              <span className="text-sm text-gray-500">Bathrooms</span>
              <p className="font-medium">
                {booking.listings.category_data.bathrooms}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Check-in/out Information */}
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Stay Details</h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <span className="text-sm text-gray-500">Check-in</span>
          <p className="font-medium">{formatDate(booking.booking_date)}</p>
          <p className="text-sm text-gray-600">
            {booking.listings?.category_data?.check_in_time || "3:00 PM"}
          </p>
        </div>
        <div className="space-y-2">
          <span className="text-sm text-gray-500">Check-out</span>
          <p className="font-medium">
            {formatDate(
              new Date(
                new Date(booking.booking_date).getTime() +
                  (parseInt(booking.duration) || 1) * 24 * 60 * 60 * 1000
              )
            )}
          </p>
          <p className="text-sm text-gray-600">
            {booking.listings?.category_data?.check_out_time || "12:00 PM"}
          </p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-500">Total nights</span>
        <p className="font-medium">{booking.duration || "1"} night(s)</p>
      </div>
    </div>

    {/* Amenities */}
    {booking.listings?.features && (
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Wifi className="h-5 w-5 mr-2 text-green-600" />
          Amenities Included
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {booking.listings.features.split("\n").map((amenity, index) => (
            <div key={index} className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm">{amenity.trim()}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Cancellation Policy */}
    {booking.listings?.cancellation_policy && (
      <div className="bg-yellow-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
          Cancellation Policy
        </h3>
        <p className="text-gray-700">{booking.listings.cancellation_policy}</p>
      </div>
    )}
  </div>
);

const FoodBookingDetails = ({ booking }) => (
  <div className="space-y-6">
    {/* Restaurant Information */}
    <div className="bg-orange-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Utensils className="h-5 w-5 mr-2 text-orange-600" />
        Restaurant Details
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm text-gray-500">Cuisine Type</span>
          <p className="font-medium capitalize">
            {booking.listings?.category_data?.cuisine_type || "Mixed"}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Service Type</span>
          <p className="font-medium">
            {Array.isArray(booking.listings?.category_data?.service_type)
              ? booking.listings.category_data.service_type.join(", ")
              : booking.listings?.category_data?.service_type || "Dine-in"}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Party Size</span>
          <p className="font-medium">{booking.guests} people</p>
        </div>
        {booking.listings?.category_data?.operating_hours && (
          <div>
            <span className="text-sm text-gray-500">Operating Hours</span>
            <p className="font-medium">
              {booking.listings.category_data.operating_hours}
            </p>
          </div>
        )}
      </div>
    </div>

    {/* Reservation Details */}
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Reservation Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm text-gray-500">Date & Time</span>
          <p className="font-medium">{formatDate(booking.booking_date)}</p>
          <p className="text-sm text-gray-600">{booking.booking_time}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Estimated Duration</span>
          <p className="font-medium">{booking.duration || "2 hours"}</p>
        </div>
      </div>
    </div>

    {/* Special Dietary Options */}
    {booking.listings?.category_data?.special_diets && (
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
          Dietary Options Available
        </h3>
        <p className="text-gray-700">
          {booking.listings.category_data.special_diets}
        </p>
      </div>
    )}

    {/* Delivery Information */}
    {booking.listings?.category_data?.service_type?.includes("delivery") && (
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Truck className="h-5 w-5 mr-2 text-blue-600" />
          Delivery Information
        </h3>
        {booking.listings?.category_data?.delivery_areas && (
          <p className="text-gray-700">
            <span className="font-medium">Delivery Areas: </span>
            {booking.listings.category_data.delivery_areas}
          </p>
        )}
      </div>
    )}
  </div>
);

const EventsBookingDetails = ({ booking }) => (
  <div className="space-y-6">
    {/* Event Information */}
    <div className="bg-purple-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <PartyPopper className="h-5 w-5 mr-2 text-purple-600" />
        Event Details
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm text-gray-500">Event Type</span>
          <p className="font-medium">
            {Array.isArray(booking.listings?.category_data?.event_types)
              ? booking.listings.category_data.event_types.join(", ")
              : booking.listings?.category_data?.event_types || "General Event"}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Expected Guests</span>
          <p className="font-medium">{booking.guests} people</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Event Date</span>
          <p className="font-medium">{formatDate(booking.booking_date)}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Duration</span>
          <p className="font-medium">{booking.duration}</p>
        </div>
      </div>
    </div>

    {/* Services Included */}
    {booking.listings?.category_data?.services_included && (
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
          Services Included
        </h3>
        <p className="text-gray-700 whitespace-pre-line">
          {booking.listings.category_data.services_included}
        </p>
      </div>
    )}

    {/* Equipment Provided */}
    {booking.listings?.category_data?.equipment_provided && (
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Package className="h-5 w-5 mr-2 text-green-600" />
          Equipment & Items Provided
        </h3>
        <p className="text-gray-700 whitespace-pre-line">
          {booking.listings.category_data.equipment_provided}
        </p>
      </div>
    )}

    {/* Portfolio Link */}
    {booking.listings?.category_data?.portfolio_link && (
      <div className="bg-yellow-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Camera className="h-5 w-5 mr-2 text-yellow-600" />
          Portfolio
        </h3>
        <a
          href={booking.listings.category_data.portfolio_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          View Previous Work & Gallery
        </a>
      </div>
    )}
  </div>
);

const LogisticsBookingDetails = ({ booking }) => (
  <div className="space-y-6">
    {/* Service Information */}
    <div className="bg-blue-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Truck className="h-5 w-5 mr-2 text-blue-600" />
        Logistics Service Details
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm text-gray-500">Service Type</span>
          <p className="font-medium">
            {Array.isArray(booking.listings?.category_data?.service_types)
              ? booking.listings.category_data.service_types.join(", ")
              : booking.listings?.category_data?.service_types ||
                "Standard Delivery"}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Vehicle Type</span>
          <p className="font-medium">
            {Array.isArray(booking.listings?.category_data?.vehicle_types)
              ? booking.listings.category_data.vehicle_types.join(", ")
              : booking.listings?.category_data?.vehicle_types || "Van"}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Pickup Date</span>
          <p className="font-medium">{formatDate(booking.booking_date)}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Pickup Time</span>
          <p className="font-medium">{booking.booking_time}</p>
        </div>
      </div>
    </div>

    {/* Delivery Information */}
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
      <div className="space-y-3">
        {booking.listings?.category_data?.weight_limit && (
          <div>
            <span className="text-sm text-gray-500">Weight Capacity</span>
            <p className="font-medium">
              {booking.listings.category_data.weight_limit}
            </p>
          </div>
        )}
        {booking.listings?.category_data?.delivery_time && (
          <div>
            <span className="text-sm text-gray-500">
              Estimated Delivery Time
            </span>
            <p className="font-medium">
              {booking.listings.category_data.delivery_time}
            </p>
          </div>
        )}
        {booking.listings?.service_areas && (
          <div>
            <span className="text-sm text-gray-500">Service Areas</span>
            <p className="font-medium">{booking.listings.service_areas}</p>
          </div>
        )}
      </div>
    </div>

    {/* Tracking & Insurance */}
    <div className="bg-green-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Additional Services</h3>
      <div className="grid grid-cols-2 gap-4">
        {booking.listings?.category_data?.tracking_available && (
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <div>
              <span className="text-sm font-medium">Tracking</span>
              <p className="text-sm text-gray-600 capitalize">
                {booking.listings.category_data.tracking_available === "yes"
                  ? "Real-time tracking available"
                  : "No tracking"}
              </p>
            </div>
          </div>
        )}
        {booking.listings?.category_data?.insurance_covered && (
          <div className="flex items-center">
            <Shield className="h-4 w-4 text-green-500 mr-2" />
            <div>
              <span className="text-sm font-medium">Insurance</span>
              <p className="text-sm text-gray-600 capitalize">
                {booking.listings.category_data.insurance_covered === "yes"
                  ? "Items insured"
                  : "No insurance"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const SecurityBookingDetails = ({ booking }) => (
  <div className="space-y-6">
    {/* Security Service Information */}
    <div className="bg-red-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Shield className="h-5 w-5 mr-2 text-red-600" />
        Security Service Details
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm text-gray-500">Service Type</span>
          <p className="font-medium">
            {Array.isArray(booking.listings?.category_data?.security_types)
              ? booking.listings.category_data.security_types.join(", ")
              : booking.listings?.category_data?.security_types ||
                "General Security"}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Team Size</span>
          <p className="font-medium">
            {booking.listings?.category_data?.team_size || "As required"}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Service Date</span>
          <p className="font-medium">{formatDate(booking.booking_date)}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Duration</span>
          <p className="font-medium">{booking.duration}</p>
        </div>
      </div>
    </div>

    {/* Qualifications */}
    {booking.listings?.category_data?.certifications && (
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
          Certifications & Qualifications
        </h3>
        <p className="text-gray-700 whitespace-pre-line">
          {booking.listings.category_data.certifications}
        </p>
      </div>
    )}

    {/* Equipment */}
    {booking.listings?.category_data?.equipment && (
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Package className="h-5 w-5 mr-2 text-green-600" />
          Equipment & Technology
        </h3>
        <p className="text-gray-700 whitespace-pre-line">
          {booking.listings.category_data.equipment}
        </p>
      </div>
    )}

    {/* Response Time */}
    {booking.listings?.category_data?.response_time && (
      <div className="bg-yellow-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Timer className="h-5 w-5 mr-2 text-yellow-600" />
          Emergency Response
        </h3>
        <p className="text-gray-700">
          {booking.listings.category_data.response_time}
        </p>
      </div>
    )}
  </div>
);

export const BookingDetailsModal = ({ isOpen, onClose, bookingId }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchBookingDetails();
    }
  }, [isOpen, bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await getBooking(bookingId);
      console.log(data);
      if (error) {
        setError(error);
      } else {
        setBooking(data);
      }
    } catch (err) {
      setError("Failed to fetch booking details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "refunded":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "hotels":
        return <Home className="h-5 w-5" />;
      case "food":
        return <Utensils className="h-5 w-5" />;
      case "events":
        return <PartyPopper className="h-5 w-5" />;
      case "logistics":
        return <Truck className="h-5 w-5" />;
      case "security":
        return <Shield className="h-5 w-5" />;
      default:
        return <Building className="h-5 w-5" />;
    }
  };

  const renderCategorySpecificDetails = () => {
    if (!booking) return null;

    switch (booking.listings?.category) {
      case "hotels":
        return <HotelBookingDetails booking={booking} />;
      case "food":
        return <FoodBookingDetails booking={booking} />;
      case "events":
        return <EventsBookingDetails booking={booking} />;
      case "logistics":
        return <LogisticsBookingDetails booking={booking} />;
      case "security":
        return <SecurityBookingDetails booking={booking} />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden max-h-screen">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute right-0 top-0 h-full w-full max-w-3xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {booking && (
                <div className="mr-3 p-2 rounded-full bg-gray-100">
                  {getCategoryIcon(booking.listings?.category)}
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-900">
                Booking Details
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">
                Loading booking details...
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="text-red-500 mb-2">
                <FileText className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error Loading Details
              </h3>
              <p className="text-gray-600 text-center mb-4">{error}</p>
              <button
                onClick={fetchBookingDetails}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : booking ? (
            <div className="p-6 space-y-8 pb-6">
              {/* Service Overview */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  {getCategoryIcon(booking.listings?.category)}
                  <span className="ml-2">Service Overview</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {booking.listings?.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {booking.listings?.description}
                    </p>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{booking.listings?.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(booking.payment_status)}`}
                      >
                        {booking.payment_status.charAt(0).toUpperCase() +
                          booking.payment_status.slice(1)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-600">
                        ₦{booking.total_amount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category-Specific Details */}
              {renderCategorySpecificDetails()}

              {/* Special Requests */}
              {booking.special_requests && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Special Requests
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {booking.special_requests}
                  </p>
                </div>
              )}

              {/* Vendor Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-purple-600" />
                  Vendor Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {booking.listings.vendor_name}
                    </h4>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Phone</span>
                      <p className="font-medium">
                        {booking.listings.vendor_phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                  Payment Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₦{booking.total_amount?.toLocaleString()}
                    </span>
                  </div>
                  {booking.payment_reference && (
                    <div className="text-sm">
                      <span className="text-gray-500">Payment Reference:</span>
                      <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">
                        {booking.payment_reference}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Timeline */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-600" />
                  Booking Timeline
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Booking Created:</span>
                    <span className="font-medium">
                      {formatDateTime(booking.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="font-medium">
                      {formatDateTime(booking.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Action Buttons - Sticky Footer */}
        {booking && (
          <div className="flex-shrink-0 bg-white border-t border-gray-200 p-6 relative">
            {/* Blur overlay for mobile */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 md:hidden"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row gap-3">
                {booking.status === "completed" && (
                  <button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center">
                    <Star className="h-4 w-4 mr-2" />
                    Leave Review
                  </button>
                )}

                {booking.status === "confirmed" &&
                  booking.payment_status === "pending" && (
                    <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      <Link
                        href={`/payments?booking=${booking.id}&reference=${booking.payment_reference}`}
                      >
                        Pay Now
                      </Link>
                    </button>
                  )}

                {booking.status === "confirmed" && (
                  <button className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Cancel Booking
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
