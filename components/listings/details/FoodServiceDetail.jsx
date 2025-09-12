import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  CheckCircle,
  ChefHat,
  Utensils,
  Truck,
  Phone,
  Mail,
  MapPin,
  Star,
} from "lucide-react";
import Link from "next/link";

const FoodServiceDetail = ({ service, categoryData }) => {
  const renderFoodInfo = () => (
    <div className="flex flex-wrap gap-6 text-sm text-gray-600">
      {categoryData.cuisine_type && (
        <div className="flex items-center">
          <ChefHat className="h-4 w-4 mr-2" />
          <span className="capitalize">
            {categoryData.cuisine_type.replace("_", " ")}
          </span>
        </div>
      )}
      {service.capacity && (
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-2" />
          <span>{service.capacity} seats</span>
        </div>
      )}
      {service.operating_hours && (
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          <span>{service.operating_hours}</span>
        </div>
      )}
    </div>
  );

  const formatPriceUnit = (unit) => {
    return unit === "per_person"
      ? "per person"
      : unit === "negotiable"
        ? "negotiable"
        : "";
  };

  return (
    <div className="space-y-6">
      {/* Restaurant Header Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant="outline"
            className="text-orange-600 border-orange-200 bg-orange-50"
          >
            Restaurant
          </Badge>
          {service.active && (
            <Badge
              variant="outline"
              className="text-green-600 border-green-200 bg-green-50"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified Restaurant
            </Badge>
          )}
        </div>
        {renderFoodInfo()}
      </div>

      {/* Service Types */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Service Options
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
            <Utensils className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Dine-in</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
            <Truck className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Delivery</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
            <MapPin className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Takeaway</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
            <Users className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Catering</span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      {service.category_data?.meals &&
        service.category_data.meals.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Featured Menu Items
            </h3>
            <div className="grid gap-4">
              {service.category_data.meals.slice(0, 6).map((meal, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {meal.image_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={meal.image_url}
                        alt={meal.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {meal.name}
                    </h4>
                    <p className="text-lg font-bold text-orange-600">
                      ₦{meal.price?.toLocaleString()}
                    </p>
                    {meal.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {meal.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    4.5
                  </div>
                </div>
              ))}
              {service.category_data.meals.length > 6 && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    View Full Menu ({service.category_data.meals.length} items)
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Restaurant Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Restaurant Details
        </h3>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Cuisine Type:</span>
                <span className="font-medium capitalize">
                  {categoryData.cuisine_type?.replace("_", " ") ||
                    "International"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Seating Capacity:</span>
                <span className="font-medium">
                  {service.capacity || "50"} seats
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Operating Hours:</span>
                <span className="font-medium">
                  {service.operating_hours || "9AM - 10PM"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Time:</span>
                <span className="font-medium">30-45 mins</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Sidebar */}
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
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">4.8 (120+ reviews)</span>
          </div>
        </div>

        <Button
          asChild={service.availability === "available"}
          disabled={service.availability !== "available"}
          className={`w-full mb-4 h-12 text-base font-semibold ${
            service.availability === "available"
              ? "bg-orange-600 hover:bg-orange-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {service.availability === "available" ? (
            <Link
              href={`/book/${service.id}`}
              className="flex items-center justify-center gap-2"
            >
              <Utensils className="w-4 h-4" />
              Order Now
            </Link>
          ) : (
            <span>Closed</span>
          )}
        </Button>

        {/* Delivery info */}
        <div className="bg-orange-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Delivery Info</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Delivery Fee:</span>
              <span className="font-medium">₦500 - ₦1,500</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery Time:</span>
              <span className="font-medium">30-45 mins</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Minimum Order:</span>
              <span className="font-medium">₦2,000</span>
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

export default FoodServiceDetail;
