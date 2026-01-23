"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, Droplet, Wifi, Sun, AlertCircle } from "lucide-react";

const GENERATOR_HOURS_OPTIONS = [
  { value: "24/7", label: "24/7 (Always Available)" },
  { value: "12hrs_daily", label: "12 Hours Daily" },
  { value: "evening_only", label: "Evening Only (6PM - 6AM)" },
  { value: "peak_hours", label: "Peak Hours (Morning & Evening)" },
  { value: "on_demand", label: "On Demand (Extra Cost)" },
];

const WATER_SUPPLY_OPTIONS = [
  { value: "borehole", label: "Borehole" },
  { value: "public_supply", label: "Public Water Supply" },
  { value: "both", label: "Both Borehole & Public Supply" },
];

const INTERNET_SPEED_OPTIONS = [
  { value: "10mbps", label: "10 Mbps" },
  { value: "20mbps", label: "20 Mbps" },
  { value: "50mbps", label: "50 Mbps" },
  { value: "100mbps", label: "100 Mbps" },
  { value: "200mbps", label: "200 Mbps+" },
];

export default function Step4Utilities({ formData, updateFormData, errors }) {
  return (
    <div className="space-y-6">
      {/* Utilities Info */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-900 mb-2">
                Why Utilities Matter
              </p>
              <p className="text-xs text-orange-800">
                Clear utility information is crucial for Nigerian guests. Power
                supply reliability and internet availability are top concerns.
                Being transparent about what's included vs. what guests pay for
                separately builds trust and reduces disputes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Power Supply (Critical for Nigeria) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Power Supply & Backup
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Critical information for Nigerian guests
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start space-x-3 cursor-pointer p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.electricity_included || false}
                onChange={(e) =>
                  updateFormData({ electricity_included: e.target.checked })
                }
                className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
              />
              <div>
                <span className="font-medium block">
                  Electricity Cost Included
                </span>
                <span className="text-xs text-gray-600">
                  All electricity costs covered in booking price
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.generator_available || false}
                onChange={(e) =>
                  updateFormData({ generator_available: e.target.checked })
                }
                className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
              />
              <div>
                <span className="font-medium block">Generator Available</span>
                <span className="text-xs text-gray-600">
                  Backup generator for power outages
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.inverter_available || false}
                onChange={(e) =>
                  updateFormData({ inverter_available: e.target.checked })
                }
                className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
              />
              <div>
                <span className="font-medium block">Inverter Backup</span>
                <span className="text-xs text-gray-600">
                  Inverter system for silent backup power
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.solar_power || false}
                onChange={(e) =>
                  updateFormData({ solar_power: e.target.checked })
                }
                className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
              />
              <div>
                <span className="font-medium block">Solar Power System</span>
                <span className="text-xs text-gray-600">
                  Solar panels for sustainable power
                </span>
              </div>
            </label>
          </div>

          {formData.generator_available && (
            <div className="space-y-2 pl-4 border-l-2 border-purple-200">
              <Label htmlFor="generator_hours">Generator Availability</Label>
              <Select
                value={formData.generator_hours || ""}
                onValueChange={(value) =>
                  updateFormData({ generator_hours: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  {GENERATOR_HOURS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Be specific about when generator is available
              </p>
            </div>
          )}

          {!formData.electricity_included && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-900 mb-1">
                Prepaid Meter Information
              </p>
              <p className="text-xs text-yellow-800">
                Since electricity is not included, ensure you have a prepaid
                meter installed. Guests will need to purchase their own
                electricity units during their stay.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Water Supply */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5 text-blue-600" />
            Water Supply
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="water_supply">Water Source</Label>
            <Select
              value={formData.water_supply || ""}
              onValueChange={(value) => updateFormData({ water_supply: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select water source" />
              </SelectTrigger>
              <SelectContent>
                {WATER_SUPPLY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Important for guests to know water reliability
            </p>
          </div>

          {formData.water_supply === "borehole" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 mb-1">
                ✓ Borehole Water
              </p>
              <p className="text-xs text-green-800">
                Reliable water supply independent of public water issues - a
                major selling point!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Internet & WiFi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-purple-600" />
            Internet & WiFi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start space-x-3 cursor-pointer p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={formData.internet_included || false}
              onChange={(e) =>
                updateFormData({ internet_included: e.target.checked })
              }
              className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
            />
            <div className="flex-1">
              <span className="font-medium block">WiFi Included</span>
              <span className="text-xs text-gray-600">
                Free WiFi internet access for guests
              </span>
            </div>
          </label>

          {formData.internet_included && (
            <div className="space-y-2 pl-4 border-l-2 border-purple-200">
              <Label htmlFor="internet_speed">Internet Speed</Label>
              <Select
                value={formData.internet_speed || ""}
                onValueChange={(value) =>
                  updateFormData({ internet_speed: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select speed range" />
                </SelectTrigger>
                <SelectContent>
                  {INTERNET_SPEED_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Approximate download speed available
              </p>
            </div>
          )}

          {!formData.internet_included && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                If WiFi is not included, consider mentioning this clearly in
                your house rules. Many guests expect internet access, especially
                for remote work.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Utilities Summary */}
      <Card>
        <CardHeader>
          <CardTitle>All-Inclusive Utilities?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start space-x-3 cursor-pointer p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={formData.utilities_included || false}
              onChange={(e) =>
                updateFormData({ utilities_included: e.target.checked })
              }
              className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
            />
            <div className="flex-1">
              <span className="font-medium block">All Utilities Included</span>
              <span className="text-xs text-gray-600 block mt-1">
                Check this if electricity, water, and internet costs are all
                included in the booking price
              </span>
            </div>
          </label>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm font-medium text-purple-900 mb-2">
              What's Included in Your Price?
            </p>
            <ul className="text-xs text-purple-800 space-y-1">
              <li>
                {formData.electricity_included ? "✓" : "✗"} Electricity costs
              </li>
              <li>{formData.internet_included ? "✓" : "✗"} Internet/WiFi</li>
              <li>{formData.water_supply ? "✓" : "✗"} Water supply</li>
              <li>
                {formData.generator_available ? "✓" : "✗"} Generator backup
              </li>
            </ul>
            {!formData.utilities_included && (
              <p className="text-xs text-purple-800 mt-3 font-medium">
                ⚠️ Make sure to clearly state in your house rules what guests
                need to pay for separately
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
