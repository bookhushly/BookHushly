import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function EditUtilities({ formData, updateFormData }) {
  return (
    <div className="space-y-4">
      {/* Power Supply Options */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">
          Power Supply & Backup
        </p>

        <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
          <input
            type="checkbox"
            checked={formData.electricity_included || false}
            onChange={(e) =>
              updateFormData({ electricity_included: e.target.checked })
            }
            className="h-4 w-4 text-purple-600 rounded"
          />
          <div>
            <span className="font-medium text-sm">
              Electricity Cost Included
            </span>
            <p className="text-xs text-gray-600">
              All electricity costs covered in price
            </p>
          </div>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
          <input
            type="checkbox"
            checked={formData.generator_available || false}
            onChange={(e) =>
              updateFormData({ generator_available: e.target.checked })
            }
            className="h-4 w-4 text-purple-600 rounded"
          />
          <div>
            <span className="font-medium text-sm">Generator Available</span>
            <p className="text-xs text-gray-600">
              Backup generator for power outages
            </p>
          </div>
        </label>

        {formData.generator_available && (
          <div className="space-y-2 pl-4 border-l-2 border-purple-200">
            <Label htmlFor="edit-gen-hours">Generator Availability</Label>
            <Select
              value={formData.generator_hours || ""}
              onValueChange={(value) =>
                updateFormData({ generator_hours: value })
              }
            >
              <SelectTrigger id="edit-gen-hours">
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
          </div>
        )}

        <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
          <input
            type="checkbox"
            checked={formData.inverter_available || false}
            onChange={(e) =>
              updateFormData({ inverter_available: e.target.checked })
            }
            className="h-4 w-4 text-purple-600 rounded"
          />
          <div>
            <span className="font-medium text-sm">Inverter Backup</span>
            <p className="text-xs text-gray-600">
              Inverter system for silent power
            </p>
          </div>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
          <input
            type="checkbox"
            checked={formData.solar_power || false}
            onChange={(e) => updateFormData({ solar_power: e.target.checked })}
            className="h-4 w-4 text-purple-600 rounded"
          />
          <div>
            <span className="font-medium text-sm">Solar Power System</span>
            <p className="text-xs text-gray-600">
              Solar panels for sustainable power
            </p>
          </div>
        </label>
      </div>

      {/* Water Supply */}
      <div className="space-y-2">
        <Label htmlFor="edit-water">Water Supply Source</Label>
        <Select
          value={formData.water_supply || ""}
          onValueChange={(value) => updateFormData({ water_supply: value })}
        >
          <SelectTrigger id="edit-water">
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
      </div>

      {/* Internet */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Internet & WiFi</p>

        <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
          <input
            type="checkbox"
            checked={formData.internet_included || false}
            onChange={(e) =>
              updateFormData({ internet_included: e.target.checked })
            }
            className="h-4 w-4 text-purple-600 rounded"
          />
          <div>
            <span className="font-medium text-sm">WiFi Included</span>
            <p className="text-xs text-gray-600">
              Free WiFi internet for guests
            </p>
          </div>
        </label>

        {formData.internet_included && (
          <div className="space-y-2 pl-4 border-l-2 border-purple-200">
            <Label htmlFor="edit-internet-speed">Internet Speed</Label>
            <Select
              value={formData.internet_speed || ""}
              onValueChange={(value) =>
                updateFormData({ internet_speed: value })
              }
            >
              <SelectTrigger id="edit-internet-speed">
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
          </div>
        )}
      </div>

      {/* All-Inclusive Toggle */}
      <div className="pt-4 border-t">
        <label className="flex items-center space-x-3 cursor-pointer p-3 border-2 border-purple-200 rounded-lg hover:bg-purple-50">
          <input
            type="checkbox"
            checked={formData.utilities_included || false}
            onChange={(e) =>
              updateFormData({ utilities_included: e.target.checked })
            }
            className="h-4 w-4 text-purple-600 rounded"
          />
          <div>
            <span className="font-medium text-sm">All Utilities Included</span>
            <p className="text-xs text-gray-600">
              Electricity, water, and internet all included in booking price
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
