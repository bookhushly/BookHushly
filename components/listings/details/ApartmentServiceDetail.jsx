import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  Bed,
  Bath,
  CheckCircle,
  Home,
  Phone,
  Mail,
  Wifi,
  Car,
  Kitchen,
  Tv,
  AirVent,
  Shield,
} from "lucide-react";
import Link from "next/link";

const ApartmentServiceDetail = ({ service, categoryData }) => {
  const renderApartmentInfo = () => (
    <div className="flex flex-wrap gap-6 text-sm text-gray-600">
      {service.bedrooms && (
        <div className="flex items-center">
          <Bed className="h-4 w-4 mr-2" />
          <span>
            {service.bedrooms} bedroom{service.bedrooms > 1 ? "s" : ""}
          </span>
        </div>
      )}
      {service.bathrooms && (
        <div className="flex items-center">
          <Bath className="h-4 w-4 mr-2" />
          <span>
            {service.bathrooms} bathroom{service.bathrooms > 1 ? "s" : ""}
          </span>
        </div>
      )}
      {service.capacity && (
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-2" />
          <span>{service.capacity} guests</span>
        </div>
      )}
      {service.minimum_stay && (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{service.minimum_stay.replace("_", " ")} min stay</span>
        </div>
      )}
    </div>
  );

  const formatPriceUnit = (unit) => {
    const units = {
      per_night: "per night",
      per_week: "per week",
      per_month: "per month",
      negotiable: "negotiable",
    };
    return units[unit] || "";
  };

  return (
    <div className="space-y-6">
      {/* Apartment Header Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant="outline"
            className="text-green-600 border-green-200 bg-green-50"
          >
            Serviced Apartment
          </Badge>
          {service.active && (
            <Badge
              variant="outline"
              className="text-green-600 border-green-200 bg-green-50"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified Property
            </Badge>
          )}
        </div>
        {renderApartmentInfo()}
      </div>

      {/* Apartment Features */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Apartment Features
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <Wifi className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">Free WiFi</span>
          </div>
          <div className="flex items-center space-x-3">
            <Kitchen className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">Full Kitchen</span>
          </div>
          <div className="flex items-center space-x-3">
            <AirVent className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">Air Conditioning</span>
          </div>
          <div className="flex items-center space-x-3">
            <Tv className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">Smart TV</span>
          </div>
          <div className="flex items-center space-x-3">
            <Car className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">Parking Space</span>
          </div>
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">24/7 Security</span>
          </div>
        </div>
      </div>

      {/* Apartment Types */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Available Unit Types
        </h3>
        <div className="grid gap-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Home className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Studio Apartment</h4>
              <p className="text-sm text-gray-600">
                1 bedroom • 1 bathroom • 2 guests
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">₦35,000</p>
              <p className="text-sm text-gray-600">per night</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Home className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">One Bedroom</h4>
              <p className="text-sm text-gray-600">
                1 bedroom • 1 bathroom • 4 guests
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">₦50,000</p>
              <p className="text-sm text-gray-600">per night</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Home className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Two Bedroom</h4>
              <p className="text-sm text-gray-600">
                2 bedrooms • 2 bathrooms • 6 guests
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">₦75,000</p>
              <p className="text-sm text-gray-600">per night</p>
            </div>
          </div>
        </div>
      </div>

      {/* Apartment Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Apartment Details
        </h3>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Bedrooms:</span>
                <span className="font-medium">{service.bedrooms || "1"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Bathrooms:</span>
                <span className="font-medium">{service.bathrooms || "1"}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Max Guests:</span>
                <span className="font-medium">{service.capacity || "4"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Min Stay:</span>
                <span className="font-medium">
                  {service.minimum_stay?.replace("_", " ") || "1 night"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Sidebar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
        <div className="mb-6">
          <div className="flex items-baseline mb-2">
            <span className="text-3xl font-bold text-gray-900">
              ₦{service.price.toLocaleString()}
            </span>
            <span className="text-sm text-gray-600 ml-2">
              {formatPriceUnit(service.price_unit)}
            </span>
          </div>
          {service.availability !== "available" && (
            <Badge variant="outline" className="text-red-600 border-red-200">
              {service.availability}
            </Badge>
          )}
        </div>

        <Button
          asChild={service.availability === "available"}
          disabled={service.availability !== "available"}
          className={`w-full mb-4 h-12 text-base font-semibold ${
            service.availability === "available"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {service.availability === "available" ? (
            <Link
              href={`/book/${service.id}`}
              className="flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Book Apartment
            </Link>
          ) : (
            <span>Unavailable</span>
          )}
        </Button>

        {service.security_deposit && (
          <div className="border-t border-gray-200 pt-4 mt-4 mb-4">
            <div className="flex justify-between text-sm">
              <span>Security deposit</span>
              <span>₦{service.security_deposit.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Apartment info */}
        <div className="bg-green-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Stay Details</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Check-in:</span>
              <span className="font-medium">2:00 PM</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Check-out:</span>
              <span className="font-medium">12:00 PM</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Housekeeping:</span>
              <span className="font-medium">Daily</span>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default ApartmentServiceDetail;
