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
import { NIGERIAN_STATES } from "@/lib/constants";

const NIGERIAN_STATES = NIGERIAN_STATES.sort();

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

export default function EditLocation({ formData, updateFormData }) {
  const selectedState = formData.state || "";
  const areasForState = POPULAR_AREAS[selectedState] || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-state">State</Label>
          <Select
            value={formData.state || ""}
            onValueChange={(value) => {
              updateFormData({ state: value, area: "" });
            }}
          >
            <SelectTrigger id="edit-state">
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

        <div className="space-y-2">
          <Label htmlFor="edit-city">City</Label>
          <Input
            id="edit-city"
            placeholder="e.g., Lagos, Abuja"
            value={formData.city || ""}
            onChange={(e) => updateFormData({ city: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-area">Area/Neighborhood</Label>
        {areasForState.length > 0 ? (
          <Select
            value={formData.area || ""}
            onValueChange={(value) => updateFormData({ area: value })}
          >
            <SelectTrigger id="edit-area">
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
            id="edit-area"
            placeholder="e.g., Lekki Phase 1, Wuse 2"
            value={formData.area || ""}
            onChange={(e) => updateFormData({ area: e.target.value })}
          />
        )}
      </div>

      {formData.area === "custom" && (
        <div className="space-y-2">
          <Label htmlFor="edit-custom-area">Custom Area Name</Label>
          <Input
            id="edit-custom-area"
            placeholder="Enter area name"
            onChange={(e) => updateFormData({ area: e.target.value })}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="edit-address">Street Address</Label>
        <Textarea
          id="edit-address"
          placeholder="Full street address"
          rows={3}
          value={formData.address || ""}
          onChange={(e) => updateFormData({ address: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-landmark">Nearby Landmarks</Label>
        <Textarea
          id="edit-landmark"
          placeholder="e.g., Opposite Mega Chicken, Near Shoprite Lekki"
          rows={3}
          value={formData.landmark || ""}
          onChange={(e) => updateFormData({ landmark: e.target.value })}
        />
      </div>
    </div>
  );
}
