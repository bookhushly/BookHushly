"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, FileText, Calendar, AlertCircle } from "lucide-react";
import RichTextEditor from "@/components/common/rich-text-editor";

const CANCELLATION_TEMPLATES = [
  {
    value: "flexible",
    label: "Flexible",
    description:
      "Full refund if cancelled 24 hours before check-in. 50% refund if cancelled within 24 hours.",
  },
  {
    value: "moderate",
    label: "Moderate",
    description:
      "Full refund if cancelled 5 days before check-in. 50% refund if cancelled within 5 days.",
  },
  {
    value: "strict",
    label: "Strict",
    description:
      "Full refund if cancelled 7 days before check-in. 50% refund if cancelled within 7 days. No refund within 48 hours.",
  },
  {
    value: "custom",
    label: "Custom Policy",
    description: "Write your own cancellation policy",
  },
];

const HOUSE_RULES_TEMPLATE = `• No smoking inside the apartment
• No parties or events
• Respect quiet hours (10 PM - 8 AM)
• Maximum number of guests as specified
• Guests are responsible for any damages
• No illegal activities
• Report any issues immediately to the host`;

export default function Step7Policies({ formData, updateFormData }) {
  const selectedPolicy = CANCELLATION_TEMPLATES.find(
    (t) => t.value === formData.cancellation_policy_type
  );

  return (
    <div className="space-y-6">
      {/* Check-in/Check-out Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Check-in & Check-out Times
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check_in_time">Check-in Time</Label>
              <Input
                id="check_in_time"
                type="time"
                value={formData.check_in_time || "14:00"}
                onChange={(e) =>
                  updateFormData({ check_in_time: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                Standard check-in is 2:00 PM
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="check_out_time">Check-out Time</Label>
              <Input
                id="check_out_time"
                type="time"
                value={formData.check_out_time || "12:00"}
                onChange={(e) =>
                  updateFormData({ check_out_time: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                Standard check-out is 12:00 PM
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-1">
              Flexible Check-in/Check-out
            </p>
            <p className="text-xs text-blue-800">
              Being flexible with times can make your listing more attractive.
              Consider offering early check-in or late check-out for an
              additional fee if feasible.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Instant Booking */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start space-x-3 cursor-pointer p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={formData.instant_booking !== false}
              onChange={(e) =>
                updateFormData({ instant_booking: e.target.checked })
              }
              className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
            />
            <div className="flex-1">
              <span className="font-medium block">Enable Instant Booking</span>
              <span className="text-xs text-gray-600 mt-1 block">
                Guests can book immediately without waiting for approval. This
                increases your booking rate by up to 30%.
              </span>
            </div>
          </label>

          {!formData.instant_booking && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <strong>Manual Approval Mode:</strong> You'll need to review and
                approve each booking request. This gives you more control but
                may reduce booking conversion.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancellation Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Cancellation Policy
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Set clear expectations for cancellations
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {CANCELLATION_TEMPLATES.map((template) => (
              <label
                key={template.value}
                className={`flex items-start space-x-3 cursor-pointer p-4 border-2 rounded-lg transition-all ${
                  formData.cancellation_policy_type === template.value
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="cancellation_policy_type"
                  value={template.value}
                  checked={formData.cancellation_policy_type === template.value}
                  onChange={(e) =>
                    updateFormData({
                      cancellation_policy_type: e.target.value,
                      cancellation_policy:
                        template.value !== "custom" ? template.description : "",
                    })
                  }
                  className="h-4 w-4 text-purple-600 mt-0.5"
                />
                <div className="flex-1">
                  <span className="font-medium block">{template.label}</span>
                  <span className="text-xs text-gray-600 mt-1 block">
                    {template.description}
                  </span>
                </div>
              </label>
            ))}
          </div>

          {formData.cancellation_policy_type === "custom" && (
            <div className="space-y-2 pl-4 border-l-2 border-purple-200">
              <Label htmlFor="cancellation_policy">Custom Policy</Label>
              <Textarea
                id="cancellation_policy"
                rows={4}
                placeholder="Describe your cancellation policy in detail..."
                value={formData.cancellation_policy || ""}
                onChange={(e) =>
                  updateFormData({ cancellation_policy: e.target.value })
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* House Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            House Rules
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Set clear expectations for guest behavior
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="house_rules">Your House Rules</Label>
              {!formData.house_rules && (
                <button
                  type="button"
                  onClick={() =>
                    updateFormData({ house_rules: HOUSE_RULES_TEMPLATE })
                  }
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Use Template
                </button>
              )}
            </div>
            <RichTextEditor
              content={formData.house_rules || ""}
              onChange={(html) => updateFormData({ house_rules: html })}
              placeholder="List your house rules here..."
              minHeight="200px"
            />
            <p className="text-xs text-gray-500">
              Be specific about smoking, parties, noise, pets, and any other
              important rules
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm font-medium text-purple-900 mb-2">
              Common Nigerian House Rules:
            </p>
            <ul className="text-xs text-purple-800 space-y-1">
              <li>• Security: Gate closes at specific time (e.g., 11 PM)</li>
              <li>• Guests must provide valid ID at check-in</li>
              <li>• Noise restrictions for residential estates</li>
              <li>• Proper waste disposal guidelines</li>
              <li>• Generator usage protocols (if cost not included)</li>
              <li>• Visitor policy and guest limits</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Availability Dates (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle>Availability Period (Optional)</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Set specific dates when your apartment is available for booking
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="available_from">Available From</Label>
              <Input
                id="available_from"
                type="date"
                value={formData.available_from || ""}
                onChange={(e) =>
                  updateFormData({ available_from: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                Leave empty if available now
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="available_until">Available Until</Label>
              <Input
                id="available_until"
                type="date"
                value={formData.available_until || ""}
                onChange={(e) =>
                  updateFormData({ available_until: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                Leave empty if no end date
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Setting availability dates is useful if
                  you're only renting out for a specific period or if the
                  apartment is still under construction.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
