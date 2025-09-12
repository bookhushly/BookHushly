import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  CheckCircle,
  Car,
  Phone,
  Mail,
  Shield,
  Key,
  Fuel,
  Settings,
  MapPin,
} from "lucide-react";
import Link from "next/link";

const CarRentalServiceDetail = ({ service, categoryData }) => {
  const renderCarRentalInfo = () => (
    <div className="flex flex-wrap gap-6 text-sm text-gray-600">
      {service.vehicle_type && (
        <div className="flex items-center">
          <Car className="h-4 w-4 mr-2" />
          <span className="capitalize">
            {service.vehicle_type.replace("_", " ")}
          </span>
        </div>
      )}
      {service.minimum_stay && (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{service.minimum_stay} min rental</span>
        </div>
      )}
      {service.security_deposit && (
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          <span>₦{service.security_deposit.toLocaleString()} deposit</span>
        </div>
      )}
    </div>
  );

  const formatPriceUnit = (unit) => {
    const units = {
      per_day: "per day",
      per_week: "per week",
      per_month: "per month",
      negotiable: "negotiable",
    };
    return units[unit] || "";
  };

  return (
    <div className="space-y-6">
      {/* Car Rental Header Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant="outline"
            className="text-purple-600 border-purple-200 bg-purple-50"
          >
            Car Rental
          </Badge>
          {service.active && (
            <Badge
              variant="outline"
              className="text-green-600 border-green-200 bg-green-50"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified Fleet
            </Badge>
          )}
        </div>
        {renderCarRentalInfo()}
      </div>

      {/* Vehicle Categories */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Vehicle Categories
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <Car className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Economy</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <Car className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Standard</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <Car className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Luxury</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <Car className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">SUV</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <Car className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Minivan</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <Car className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">
              Sports Car
            </span>
          </div>
        </div>
      </div>

      {/* Available Vehicles */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Available Vehicles
        </h3>
        <div className="grid gap-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Car className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Toyota Camry 2022</h4>
              <p className="text-sm text-gray-600">
                Automatic • 4 seats • Full AC
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">₦25,000</p>
              <p className="text-sm text-gray-600">per day</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Car className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Honda Accord 2021</h4>
              <p className="text-sm text-gray-600">
                Automatic • 4 seats • Premium
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">₦30,000</p>
              <p className="text-sm text-gray-600">per day</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Car className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                Toyota Highlander 2023
              </h4>
              <p className="text-sm text-gray-600">SUV • 7 seats • Luxury</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">₦50,000</p>
              <p className="text-sm text-gray-600">per day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rental Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rental Options
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center mb-3">
              <Key className="h-5 w-5 text-purple-600 mr-2" />
              <h4 className="font-semibold text-gray-900">Self-Drive</h4>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Drive yourself with our well-maintained vehicles
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Valid driver's license required</li>
              <li>• Security deposit required</li>
              <li>• Fuel at your expense</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center mb-3">
              <Users className="h-5 w-5 text-purple-600 mr-2" />
              <h4 className="font-semibold text-gray-900">With Driver</h4>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Professional driver included with vehicle
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Experienced professional drivers</li>
              <li>• Fuel included in price</li>
              <li>• Additional charges for overtime</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rental Details
        </h3>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Vehicle Type:</span>
                <span className="font-medium capitalize">
                  {service.vehicle_type?.replace("_", " ") || "Various"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Transmission:</span>
                <span className="font-medium">Automatic</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Min Rental:</span>
                <span className="font-medium">
                  {service.minimum_stay || "1 day"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fuel Policy:</span>
                <span className="font-medium">Full to Full</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rental Sidebar */}
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
          <div className="flex items-center mt-2">
            <Shield className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-600">
              Fully Insured
            </span>
          </div>
        </div>

        <Button
          asChild={service.availability === "available"}
          disabled={service.availability !== "available"}
          className={`w-full mb-4 h-12 text-base font-semibold ${
            service.availability === "available"
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {service.availability === "available" ? (
            <Link
              href={`/book/${service.id}`}
              className="flex items-center justify-center gap-2"
            >
              <Car className="w-4 h-4" />
              Rent Vehicle
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

        {/* Rental info */}
        <div className="bg-purple-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Rental Info</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Driver Option:</span>
              <span className="font-medium">Available</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Insurance:</span>
              <span className="font-medium text-green-600">Comprehensive</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Mileage:</span>
              <span className="font-medium">200km/day</span>
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

export default CarRentalServiceDetail;
