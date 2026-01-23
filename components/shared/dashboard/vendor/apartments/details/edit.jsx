// Simple wrapper components that reuse the creation form step components
// These are minimal edit forms for section-level editing

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const APARTMENT_TYPES = [
  { value: "studio", label: "Studio Apartment" },
  { value: "1_bedroom", label: "1 Bedroom" },
  { value: "2_bedroom", label: "2 Bedrooms" },
  { value: "3_bedroom", label: "3 Bedrooms" },
  { value: "penthouse", label: "Penthouse" },
];

export default function EditBasicInfo({ formData, updateFormData }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Apartment Name</Label>
        <Input
          id="name"
          value={formData.name || ""}
          onChange={(e) => updateFormData({ name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="apartment_type">Apartment Type</Label>
        <Select
          value={formData.apartment_type || ""}
          onValueChange={(value) => updateFormData({ apartment_type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {APARTMENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            min="1"
            value={formData.bedrooms || ""}
            onChange={(e) =>
              updateFormData({ bedrooms: parseInt(e.target.value) || "" })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            min="1"
            step="0.5"
            value={formData.bathrooms || ""}
            onChange={(e) =>
              updateFormData({ bathrooms: parseFloat(e.target.value) || "" })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_guests">Max Guests</Label>
          <Input
            id="max_guests"
            type="number"
            min="1"
            value={formData.max_guests || ""}
            onChange={(e) =>
              updateFormData({ max_guests: parseInt(e.target.value) || "" })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="square_meters">Size (m²)</Label>
          <Input
            id="square_meters"
            type="number"
            value={formData.square_meters || ""}
            onChange={(e) =>
              updateFormData({
                square_meters: parseFloat(e.target.value) || "",
              })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.furnished || false}
            onChange={(e) => updateFormData({ furnished: e.target.checked })}
            className="h-4 w-4 text-purple-600 rounded"
          />
          <span className="text-sm">Fully Furnished</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.kitchen_equipped || false}
            onChange={(e) =>
              updateFormData({ kitchen_equipped: e.target.checked })
            }
            className="h-4 w-4 text-purple-600 rounded"
          />
          <span className="text-sm">Kitchen Equipped</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.has_balcony || false}
            onChange={(e) => updateFormData({ has_balcony: e.target.checked })}
            className="h-4 w-4 text-purple-600 rounded"
          />
          <span className="text-sm">Has Balcony</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.has_terrace || false}
            onChange={(e) => updateFormData({ has_terrace: e.target.checked })}
            className="h-4 w-4 text-purple-600 rounded"
          />
          <span className="text-sm">Has Terrace</span>
        </label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="parking_spaces">Parking Spaces</Label>
        <Input
          id="parking_spaces"
          type="number"
          min="0"
          value={formData.parking_spaces || 0}
          onChange={(e) =>
            updateFormData({ parking_spaces: parseInt(e.target.value) || 0 })
          }
        />
      </div>
    </div>
  );
}
