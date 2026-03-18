"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Navigation, Phone } from "lucide-react";
import { NIGERIAN_STATES as STATES } from "@/lib/constants";

const NIGERIAN_STATES = STATES.sort();

const POPULAR_AREAS = {
  Lagos: [
    "Lekki Phase 1",
    "Lekki Phase 2",
    "Victoria Island",
    "Ikoyi",
    "Ikeja GRA",
    "Ikeja",
    "Ajah",
    "Yaba",
    "Surulere",
    "Maryland",
    "Gbagada",
    "Magodo",
    "Banana Island",
    "Oniru",
  ],
  "Abuja FCT": [
    "Maitama",
    "Asokoro",
    "Wuse 2",
    "Wuse",
    "Garki",
    "Gwarinpa",
    "Jabi",
    "Utako",
    "Katampe",
    "Apo",
    "Lugbe",
    "Kuje",
  ],
};

export default function Step2Location({ formData, updateFormData, errors }) {
  const selectedState = formData.state || "";
  const areasForState = POPULAR_AREAS[selectedState] || [];

  return (
    <div className="space-y-6">
      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            Location Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">
                State <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.state || ""}
                onValueChange={(value) => {
                  updateFormData({ state: value, area: "" }); // Reset area when state changes
                }}
              >
                <SelectTrigger
                  className={errors?.state ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {NIGERIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors?.state && (
                <p className="text-sm text-red-500">{errors.state}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                placeholder="e.g., Lagos, Abuja"
                value={formData.city || ""}
                onChange={(e) => updateFormData({ city: e.target.value })}
                className={errors?.city ? "border-red-500" : ""}
              />
              {errors?.city && (
                <p className="text-sm text-red-500">{errors.city}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Area/Neighborhood</Label>
            {areasForState.length > 0 ? (
              <Select
                value={formData.area || ""}
                onValueChange={(value) => updateFormData({ area: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select area or type custom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Type custom area...</SelectItem>
                  {areasForState.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="area"
                placeholder="e.g., Lekki Phase 1, Wuse 2"
                value={formData.area || ""}
                onChange={(e) => updateFormData({ area: e.target.value })}
              />
            )}
            <p className="text-xs text-gray-500">
              Specific area within the city helps guests find your location
              easily
            </p>
          </div>

          {formData.area === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="custom_area">Custom Area Name</Label>
              <Input
                id="custom_area"
                placeholder="Enter area name"
                onChange={(e) => updateFormData({ area: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Textarea
              id="address"
              placeholder="e.g., 15 Admiralty Way&#10;Block B, Flat 3"
              rows={3}
              value={formData.address || ""}
              onChange={(e) => updateFormData({ address: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Full address shared only after booking confirmation
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Landmarks & Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-purple-600" />
            Landmarks & Navigation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="landmark">Nearby Landmarks</Label>
            <Textarea
              id="landmark"
              placeholder="e.g., Opposite Mega Chicken, Near Shoprite Lekki, After Circle Mall roundabout"
              rows={3}
              value={formData.landmark || ""}
              onChange={(e) => updateFormData({ landmark: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Help guests find you using familiar landmarks - very important
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Location Tips for Nigerian Context
                </p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Mention major roads or expressways nearby</li>
                  <li>
                    • Include popular landmarks (banks, malls, restaurants)
                  </li>
                  <li>• Specify if it's inside an estate (and estate name)</li>
                  <li>• Mention proximity to bus stops or train stations</li>
                  <li>
                    • Note traffic-free routes if available (very attractive!)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Caretaker & Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-purple-600" />
            Contact & Caretaker Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <Input
                id="whatsapp_number"
                type="tel"
                placeholder="+2348012345678"
                value={formData.whatsapp_number || ""}
                onChange={(e) =>
                  updateFormData({ whatsapp_number: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                Guests can reach you directly on WhatsApp
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="caretaker_name">Caretaker Name</Label>
              <Input
                id="caretaker_name"
                placeholder="e.g., Mr. Emeka"
                value={formData.caretaker_name || ""}
                onChange={(e) =>
                  updateFormData({ caretaker_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caretaker_phone">Caretaker Phone</Label>
              <Input
                id="caretaker_phone"
                type="tel"
                placeholder="+2348012345678"
                value={formData.caretaker_phone || ""}
                onChange={(e) =>
                  updateFormData({ caretaker_phone: e.target.value })
                }
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">Agent / Agency Fee</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent_fee_applies">Agency Fee Applies?</Label>
                <select
                  id="agent_fee_applies"
                  value={formData.agent_fee_applies || "no"}
                  onChange={(e) =>
                    updateFormData({ agent_fee_applies: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="no">No agency fee</option>
                  <option value="yes">Yes — fee applies</option>
                </select>
              </div>
              {formData.agent_fee_applies === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="agent_fee_amount">Agent Fee (₦)</Label>
                  <Input
                    id="agent_fee_amount"
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 50000"
                    value={formData.agent_fee_amount || ""}
                    onChange={(e) =>
                      updateFormData({ agent_fee_amount: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500">
                    One-time fee paid separately to the agent
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
