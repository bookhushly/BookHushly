import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle,
  Truck,
  Package,
  Phone,
  Mail,
  MapPin,
  Shield,
  Scale,
  Timer,
} from "lucide-react";
import Link from "next/link";

const LogisticsServiceDetail = ({ service, categoryData }) => {
  const renderLogisticsInfo = () => (
    <div className="flex flex-wrap gap-6 text-sm text-gray-600">
      {service.vehicle_type && (
        <div className="flex items-center">
          <Truck className="h-4 w-4 mr-2" />
          <span className="capitalize">
            {service.vehicle_type.replace("_", " ")}
          </span>
        </div>
      )}
      {categoryData.weight_limit && (
        <div className="flex items-center">
          <Scale className="h-4 w-4 mr-2" />
          <span>{categoryData.weight_limit} weight limit</span>
        </div>
      )}
      {categoryData.delivery_time && (
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          <span>{categoryData.delivery_time}</span>
        </div>
      )}
    </div>
  );

  const formatPriceUnit = (unit) => {
    const units = {
      per_km: "per km",
      per_hour: "per hour",
      per_day: "per day",
      negotiable: "negotiable",
      fixed: "fixed rate",
    };
    return units[unit] || "";
  };

  return (
    <div className="space-y-6">
      {/* Logistics Header Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant="outline"
            className="text-indigo-600 border-indigo-200 bg-indigo-50"
          >
            Logistics
          </Badge>
          {service.active && (
            <Badge
              variant="outline"
              className="text-green-600 border-green-200 bg-green-50"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified Logistics
            </Badge>
          )}
        </div>
        {renderLogisticsInfo()}
      </div>

      {/* Service Types */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Service Types
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
            <Timer className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Same Day</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
            <Clock className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Next Day</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
            <Truck className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Express</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
            <Package className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Freight</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
            <MapPin className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Moving</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
            <Shield className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Insured</span>
          </div>
        </div>
      </div>

      {/* Vehicle Fleet */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Available Vehicles
        </h3>
        <div className="grid gap-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Truck className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Pickup Truck</h4>
              <p className="text-sm text-gray-600">Up to 1 ton capacity</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">₦15,000</p>
              <p className="text-sm text-gray-600">per day</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Truck className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Delivery Van</h4>
              <p className="text-sm text-gray-600">Up to 3 tons capacity</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">₦25,000</p>
              <p className="text-sm text-gray-600">per day</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Truck className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Large Truck</h4>
              <p className="text-sm text-gray-600">Up to 10 tons capacity</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">₦45,000</p>
              <p className="text-sm text-gray-600">per day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Service Details
        </h3>
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Vehicle Type:</span>
                <span className="font-medium capitalize">
                  {service.vehicle_type?.replace("_", " ") || "Multiple"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Max Weight:</span>
                <span className="font-medium">
                  {categoryData.weight_limit || "10 tons"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Delivery Time:</span>
                <span className="font-medium">
                  {categoryData.delivery_time || "Same day"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Coverage:</span>
                <span className="font-medium">Lagos & Environs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hire Sidebar */}
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
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {service.availability === "available" ? (
            <Link
              href={`/book/${service.id}`}
              className="flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" />
              Hire Service
            </Link>
          ) : (
            <span>Unavailable</span>
          )}
        </Button>

        {/* Service info */}
        <div className="bg-indigo-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Service Info</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Response Time:</span>
              <span className="font-medium">30 mins</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Service Areas:</span>
              <span className="font-medium">Lagos State</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Insurance:</span>
              <span className="font-medium text-green-600">Fully Covered</span>
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

export default LogisticsServiceDetail;
