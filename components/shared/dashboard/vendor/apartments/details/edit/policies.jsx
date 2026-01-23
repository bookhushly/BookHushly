import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

export default function EditPolicies({ formData, updateFormData }) {
  return (
    <div className="space-y-4">
      {/* Check-in/Check-out Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-checkin">Check-in Time</Label>
          <Input
            id="edit-checkin"
            type="time"
            value={formData.check_in_time || "14:00"}
            onChange={(e) => updateFormData({ check_in_time: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-checkout">Check-out Time</Label>
          <Input
            id="edit-checkout"
            type="time"
            value={formData.check_out_time || "12:00"}
            onChange={(e) => updateFormData({ check_out_time: e.target.value })}
          />
        </div>
      </div>

      {/* Instant Booking */}
      <div className="space-y-2">
        <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
          <input
            type="checkbox"
            checked={formData.instant_booking !== false}
            onChange={(e) =>
              updateFormData({ instant_booking: e.target.checked })
            }
            className="h-4 w-4 text-purple-600 rounded"
          />
          <div>
            <span className="font-medium text-sm">Enable Instant Booking</span>
            <p className="text-xs text-gray-600">
              Guests can book immediately without approval
            </p>
          </div>
        </label>
      </div>

      {/* Cancellation Policy */}
      <div className="space-y-3">
        <Label>Cancellation Policy</Label>
        <div className="space-y-2">
          {CANCELLATION_TEMPLATES.map((template) => (
            <label
              key={template.value}
              className={`flex items-start space-x-3 cursor-pointer p-3 border-2 rounded-lg transition-all ${
                formData.cancellation_policy_type === template.value
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="edit-cancellation-policy"
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
                <span className="font-medium text-sm block">
                  {template.label}
                </span>
                <span className="text-xs text-gray-600 block mt-1">
                  {template.description}
                </span>
              </div>
            </label>
          ))}
        </div>

        {formData.cancellation_policy_type === "custom" && (
          <div className="space-y-2 pl-4 border-l-2 border-purple-200">
            <Label htmlFor="edit-custom-policy">Custom Policy Details</Label>
            <Textarea
              id="edit-custom-policy"
              rows={4}
              placeholder="Describe your cancellation policy..."
              value={formData.cancellation_policy || ""}
              onChange={(e) =>
                updateFormData({ cancellation_policy: e.target.value })
              }
            />
          </div>
        )}
      </div>

      {/* House Rules */}
      <div className="space-y-2">
        <Label htmlFor="edit-house-rules">House Rules</Label>
        <Textarea
          id="edit-house-rules"
          rows={6}
          placeholder="List your house rules here..."
          value={formData.house_rules || ""}
          onChange={(e) => updateFormData({ house_rules: e.target.value })}
        />
        <p className="text-xs text-gray-500">
          Be specific about smoking, parties, noise, pets, and other important
          rules
        </p>
      </div>

      {/* Availability Dates */}
      <div className="space-y-3 pt-4 border-t">
        <Label>Availability Period (Optional)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-available-from">Available From</Label>
            <Input
              id="edit-available-from"
              type="date"
              value={formData.available_from || ""}
              onChange={(e) =>
                updateFormData({ available_from: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-available-until">Available Until</Label>
            <Input
              id="edit-available-until"
              type="date"
              value={formData.available_until || ""}
              onChange={(e) =>
                updateFormData({ available_until: e.target.value })
              }
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Leave empty if apartment is available indefinitely
        </p>
      </div>
    </div>
  );
}
