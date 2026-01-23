"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitSecurityRequest } from "../../../app/actions/security";
import { NIGERIAN_STATES } from "@/lib/constants";

import { Card } from "@/components/ui/card";

export default function SecurityQuestionnaire({ onSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service_type: "residential",
    full_name: "",
    phone: "",
    email: "",
    service_address: "",
    landmark: "",
    lga: "",
    state: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    duration_type: "daily",
    number_of_guards: 1,
    guard_type: "unarmed",
    requires_canine: false,
    requires_vehicle: false,
    shift_pattern: "day",
    event_type: "",
    expected_attendance: "",
    event_duration_hours: "",
    vip_protection: false,
    property_type: "residential",
    property_size: "",
    number_of_entrances: 1,
    has_cctv: false,
    has_alarm_system: false,
    risk_level: "medium",
    specific_threats: "",
    previous_incidents: false,
    incident_details: "",
    requires_background_check: true,
    requires_uniform: true,
    requires_communication_device: true,
    additional_equipment: "",
    special_instructions: "",
  });

  const mutation = useMutation({
    mutationFn: submitSecurityRequest,
    onSuccess: (result) => {
      if (result.success) {
        onSuccess?.();
      }
    },
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (mutation.isSuccess) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold mb-2">
          Request Submitted Successfully
        </h3>
        <p className="text-gray-600 mb-6">
          Thank you for your security service request. Our team will review your
          requirements and get back to you with a detailed quote within 24
          hours.
        </p>
        <p className="text-sm text-gray-500">
          You'll receive an email confirmation shortly with your request
          details.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  s <= step
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {s}
              </div>
              {s < 5 && (
                <div
                  className={`flex-1 h-1 mx-2 ${s < step ? "bg-purple-600" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600 px-2">
          <span>Service</span>
          <span>Contact</span>
          <span>Location</span>
          <span>Requirements</span>
          <span>Details</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          {/* Step 1: Service Type */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Select Security Service</h2>

              <div>
                <Label>What type of security service do you need?</Label>
                <RadioGroup
                  value={formData.service_type}
                  onValueChange={(v) => updateField("service_type", v)}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="residential" id="residential" />
                    <Label
                      htmlFor="residential"
                      className="cursor-pointer flex-1"
                    >
                      <div className="font-medium">Residential Security</div>
                      <div className="text-sm text-gray-600">
                        Home, estate, or apartment security
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="corporate" id="corporate" />
                    <Label
                      htmlFor="corporate"
                      className="cursor-pointer flex-1"
                    >
                      <div className="font-medium">Corporate Security</div>
                      <div className="text-sm text-gray-600">
                        Office buildings and business premises
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem
                      value="event_security"
                      id="event_security"
                    />
                    <Label
                      htmlFor="event_security"
                      className="cursor-pointer flex-1"
                    >
                      <div className="font-medium">Event Security</div>
                      <div className="text-sm text-gray-600">
                        Weddings, parties, conferences, concerts
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem
                      value="personal_security"
                      id="personal_security"
                    />
                    <Label
                      htmlFor="personal_security"
                      className="cursor-pointer flex-1"
                    >
                      <div className="font-medium">Personal Security</div>
                      <div className="text-sm text-gray-600">
                        Personal bodyguard and close protection
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="escort" id="escort" />
                    <Label htmlFor="escort" className="cursor-pointer flex-1">
                      <div className="font-medium">Escort Service</div>
                      <div className="text-sm text-gray-600">
                        Armed/unarmed escort for cash or valuable transport
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Contact Information</h2>

              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="080XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Location & Schedule */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Location & Schedule</h2>

              <div>
                <Label htmlFor="service_address">Service Address *</Label>
                <Textarea
                  id="service_address"
                  placeholder="Enter full address where security is needed"
                  value={formData.service_address}
                  onChange={(e) =>
                    updateField("service_address", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="landmark">Nearest Landmark</Label>
                <Input
                  id="landmark"
                  placeholder="e.g., Police Station, Shopping Mall"
                  value={formData.landmark}
                  onChange={(e) => updateField("landmark", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lga">Local Government Area</Label>
                  <Input
                    id="lga"
                    value={formData.lga}
                    onChange={(e) => updateField("lga", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(v) => updateField("state", v)}
                  >
                    <SelectTrigger>
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
                </div>
              </div>

              <div>
                <Label htmlFor="duration_type">Service Duration *</Label>
                <Select
                  value={formData.duration_type}
                  onValueChange={(v) => updateField("duration_type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly (By the hour)</SelectItem>
                    <SelectItem value="daily">Daily (1-7 days)</SelectItem>
                    <SelectItem value="weekly">Weekly (1-4 weeks)</SelectItem>
                    <SelectItem value="monthly">Monthly (1+ months)</SelectItem>
                    <SelectItem value="one_time">One-time Event</SelectItem>
                    <SelectItem value="ongoing">Ongoing Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => updateField("start_date", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date (if applicable)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => updateField("end_date", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => updateField("start_time", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => updateField("end_time", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="shift_pattern">Shift Pattern *</Label>
                <Select
                  value={formData.shift_pattern}
                  onValueChange={(v) => updateField("shift_pattern", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day Shift (6am - 6pm)</SelectItem>
                    <SelectItem value="night">
                      Night Shift (6pm - 6am)
                    </SelectItem>
                    <SelectItem value="24_hours">24 Hours Coverage</SelectItem>
                    <SelectItem value="rotating">Rotating Shifts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 4: Security Requirements */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Security Requirements</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="number_of_guards">
                    Number of Guards Required *
                  </Label>
                  <Input
                    id="number_of_guards"
                    type="number"
                    min="1"
                    value={formData.number_of_guards}
                    onChange={(e) =>
                      updateField("number_of_guards", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="guard_type">Guard Type *</Label>
                  <Select
                    value={formData.guard_type}
                    onValueChange={(v) => updateField("guard_type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unarmed">Unarmed Guards</SelectItem>
                      <SelectItem value="armed">Armed Guards</SelectItem>
                      <SelectItem value="both">Both Armed & Unarmed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Additional Security Assets</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requires_canine"
                    checked={formData.requires_canine}
                    onCheckedChange={(checked) =>
                      updateField("requires_canine", checked)
                    }
                  />
                  <Label htmlFor="requires_canine" className="cursor-pointer">
                    K9 Unit (Guard Dog)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requires_vehicle"
                    checked={formData.requires_vehicle}
                    onCheckedChange={(checked) =>
                      updateField("requires_vehicle", checked)
                    }
                  />
                  <Label htmlFor="requires_vehicle" className="cursor-pointer">
                    Security Vehicle/Patrol Car
                  </Label>
                </div>
              </div>

              {formData.service_type === "event_security" && (
                <>
                  <div>
                    <Label htmlFor="event_type">Event Type</Label>
                    <Input
                      id="event_type"
                      placeholder="e.g., Wedding, Concert, Conference"
                      value={formData.event_type}
                      onChange={(e) =>
                        updateField("event_type", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expected_attendance">
                        Expected Attendance
                      </Label>
                      <Input
                        id="expected_attendance"
                        type="number"
                        placeholder="Number of guests"
                        value={formData.expected_attendance}
                        onChange={(e) =>
                          updateField("expected_attendance", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="event_duration_hours">
                        Event Duration (hours)
                      </Label>
                      <Input
                        id="event_duration_hours"
                        type="number"
                        placeholder="e.g., 6"
                        value={formData.event_duration_hours}
                        onChange={(e) =>
                          updateField("event_duration_hours", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vip_protection"
                      checked={formData.vip_protection}
                      onCheckedChange={(checked) =>
                        updateField("vip_protection", checked)
                      }
                    />
                    <Label htmlFor="vip_protection" className="cursor-pointer">
                      VIP Protection Required
                    </Label>
                  </div>
                </>
              )}

              {(formData.service_type === "residential" ||
                formData.service_type === "corporate") && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="property_type">Property Type</Label>
                      <Select
                        value={formData.property_type}
                        onValueChange={(v) => updateField("property_type", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">
                            Residential
                          </SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="industrial">Industrial</SelectItem>
                          <SelectItem value="mixed">Mixed Use</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="property_size">Property Size</Label>
                      <Select
                        value={formData.property_size}
                        onValueChange={(v) => updateField("property_size", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">
                            Small (1-2 rooms/units)
                          </SelectItem>
                          <SelectItem value="medium">
                            Medium (3-5 rooms/units)
                          </SelectItem>
                          <SelectItem value="large">
                            Large (6+ rooms/units)
                          </SelectItem>
                          <SelectItem value="estate">Estate/Complex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="number_of_entrances">
                      Number of Entry Points
                    </Label>
                    <Input
                      id="number_of_entrances"
                      type="number"
                      min="1"
                      value={formData.number_of_entrances}
                      onChange={(e) =>
                        updateField("number_of_entrances", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Existing Security Systems</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_cctv"
                        checked={formData.has_cctv}
                        onCheckedChange={(checked) =>
                          updateField("has_cctv", checked)
                        }
                      />
                      <Label htmlFor="has_cctv" className="cursor-pointer">
                        CCTV Cameras Installed
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_alarm_system"
                        checked={formData.has_alarm_system}
                        onCheckedChange={(checked) =>
                          updateField("has_alarm_system", checked)
                        }
                      />
                      <Label
                        htmlFor="has_alarm_system"
                        className="cursor-pointer"
                      >
                        Alarm System Installed
                      </Label>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 5: Risk Assessment & Final Details */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                Risk Assessment & Requirements
              </h2>

              <div>
                <Label htmlFor="risk_level">Perceived Risk Level *</Label>
                <Select
                  value={formData.risk_level}
                  onValueChange={(v) => updateField("risk_level", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      Low - General deterrence
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium - Standard security concerns
                    </SelectItem>
                    <SelectItem value="high">
                      High - Known threats exist
                    </SelectItem>
                    <SelectItem value="critical">
                      Critical - Immediate danger
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="specific_threats">
                  Specific Threats or Concerns
                </Label>
                <Textarea
                  id="specific_threats"
                  placeholder="Describe any specific security concerns or threats"
                  value={formData.specific_threats}
                  onChange={(e) =>
                    updateField("specific_threats", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id="previous_incidents"
                    checked={formData.previous_incidents}
                    onCheckedChange={(checked) =>
                      updateField("previous_incidents", checked)
                    }
                  />
                  <Label
                    htmlFor="previous_incidents"
                    className="cursor-pointer"
                  >
                    Previous Security Incidents
                  </Label>
                </div>

                {formData.previous_incidents && (
                  <Textarea
                    id="incident_details"
                    placeholder="Please describe previous incidents"
                    value={formData.incident_details}
                    onChange={(e) =>
                      updateField("incident_details", e.target.value)
                    }
                    rows={3}
                  />
                )}
              </div>

              <div className="space-y-3">
                <Label>Guard Requirements</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requires_background_check"
                    checked={formData.requires_background_check}
                    onCheckedChange={(checked) =>
                      updateField("requires_background_check", checked)
                    }
                  />
                  <Label
                    htmlFor="requires_background_check"
                    className="cursor-pointer"
                  >
                    Verified Background Check
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requires_uniform"
                    checked={formData.requires_uniform}
                    onCheckedChange={(checked) =>
                      updateField("requires_uniform", checked)
                    }
                  />
                  <Label htmlFor="requires_uniform" className="cursor-pointer">
                    Professional Uniform
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requires_communication_device"
                    checked={formData.requires_communication_device}
                    onCheckedChange={(checked) =>
                      updateField("requires_communication_device", checked)
                    }
                  />
                  <Label
                    htmlFor="requires_communication_device"
                    className="cursor-pointer"
                  >
                    Communication Device (Radio/Phone)
                  </Label>
                </div>
              </div>

              <div>
                <Label htmlFor="additional_equipment">
                  Additional Equipment Needed
                </Label>
                <Textarea
                  id="additional_equipment"
                  placeholder="e.g., Metal detectors, flashlights, batons"
                  value={formData.additional_equipment}
                  onChange={(e) =>
                    updateField("additional_equipment", e.target.value)
                  }
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="special_instructions">
                  Special Instructions
                </Label>
                <Textarea
                  id="special_instructions"
                  placeholder="Any other requirements or special instructions"
                  value={formData.special_instructions}
                  onChange={(e) =>
                    updateField("special_instructions", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}
            {step < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="ml-auto bg-purple-600 hover:bg-purple-700"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="ml-auto bg-purple-600 hover:bg-purple-700"
              >
                {mutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            )}
          </div>

          {mutation.isError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {mutation.error?.message || "Failed to submit request"}
            </div>
          )}
        </Card>
      </form>
    </div>
  );
}
