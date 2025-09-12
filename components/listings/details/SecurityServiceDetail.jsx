import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  CheckCircle,
  Shield,
  Phone,
  Mail,
  Eye,
  UserCheck,
  AlertTriangle,
  Award,
} from "lucide-react";
import Link from "next/link";

const SecurityServiceDetail = ({ service, categoryData }) => {
  const renderSecurityInfo = () => (
    <div className="flex flex-wrap gap-6 text-sm text-gray-600">
      {categoryData.team_size && (
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-2" />
          <span>{categoryData.team_size} team size</span>
        </div>
      )}
      {categoryData.experience_years && (
        <div className="flex items-center">
          <Award className="h-4 w-4 mr-2" />
          <span>{categoryData.experience_years} years experience</span>
        </div>
      )}
      {categoryData.response_time && (
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          <span>{categoryData.response_time} response time</span>
        </div>
      )}
    </div>
  );

  const formatPriceUnit = (unit) => {
    const units = {
      per_hour: "per hour",
      per_day: "per day",
      per_week: "per week",
      per_month: "per month",
      negotiable: "negotiable",
    };
    return units[unit] || "";
  };

  return (
    <div className="space-y-6">
      {/* Security Header Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant="outline"
            className="text-red-600 border-red-200 bg-red-50"
          >
            Security Services
          </Badge>
          {service.active && (
            <Badge
              variant="outline"
              className="text-green-600 border-green-200 bg-green-50"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Licensed & Certified
            </Badge>
          )}
        </div>
        {renderSecurityInfo()}
      </div>

      {/* Security Types */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Security Services
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
            <Eye className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-gray-700">
              Event Security
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
            <UserCheck className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-gray-700">
              Personal Protection
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
            <Shield className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-gray-700">
              Corporate Security
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-gray-700">
              Residential
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
            <Eye className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-gray-700">
              Security Patrol
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
            <Shield className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-gray-700">
              VIP Protection
            </span>
          </div>
        </div>
      </div>

      {/* Security Team */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Security Personnel
        </h3>
        <div className="grid gap-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Armed Security</h4>
              <p className="text-sm text-gray-600">Licensed armed personnel</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">₦8,000</p>
              <p className="text-sm text-gray-600">per hour</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Unarmed Security</h4>
              <p className="text-sm text-gray-600">Trained security guards</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">₦5,000</p>
              <p className="text-sm text-gray-600">per hour</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                Security Supervisor
              </h4>
              <p className="text-sm text-gray-600">Team leader & coordinator</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">₦12,000</p>
              <p className="text-sm text-gray-600">per hour</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications & Experience */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Certifications & Experience
        </h3>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Team Size:</span>
                <span className="font-medium">
                  {categoryData.team_size || "50+"} personnel
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Experience:</span>
                <span className="font-medium">
                  {categoryData.experience_years || "15+"} years
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Response Time:</span>
                <span className="font-medium">
                  {categoryData.response_time || "15 mins"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>License:</span>
                <span className="font-medium text-green-600">
                  Valid & Current
                </span>
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
              Licensed & Insured
            </span>
          </div>
        </div>

        <Button
          asChild={service.availability === "available"}
          disabled={service.availability !== "available"}
          className={`w-full mb-4 h-12 text-base font-semibold ${
            service.availability === "available"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {service.availability === "available" ? (
            <Link
              href={`/book/${service.id}`}
              className="flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Hire Security
            </Link>
          ) : (
            <span>Unavailable</span>
          )}
        </Button>

        {/* Security info */}
        <div className="bg-red-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Security Details</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Minimum Duration:</span>
              <span className="font-medium">4 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Coverage Area:</span>
              <span className="font-medium">Lagos & Ogun</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Equipment:</span>
              <span className="font-medium">Provided</span>
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

export default SecurityServiceDetail;
