import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditPricing({ formData, updateFormData }) {
  const nightlyRate = parseFloat(formData.price_per_night) || 0;
  const suggestedWeekly =
    nightlyRate > 0 ? Math.floor(nightlyRate * 7 * 0.9) : 0;
  const suggestedMonthly =
    nightlyRate > 0 ? Math.floor(nightlyRate * 30 * 0.77) : 0;

  return (
    <div className="space-y-4">
      {/* Nightly Rate */}
      <div className="space-y-2">
        <Label htmlFor="edit-price-night">Price Per Night (₦)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            ₦
          </span>
          <Input
            id="edit-price-night"
            type="number"
            min="1000"
            step="1000"
            placeholder="e.g., 35000"
            value={formData.price_per_night || ""}
            onChange={(e) =>
              updateFormData({
                price_per_night: parseFloat(e.target.value) || "",
              })
            }
            className="pl-8"
          />
        </div>
      </div>

      {/* Weekly Rate */}
      <div className="space-y-2">
        <Label htmlFor="edit-price-week">Weekly Rate (₦)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            ₦
          </span>
          <Input
            id="edit-price-week"
            type="number"
            min="1000"
            step="1000"
            placeholder={
              suggestedWeekly > 0
                ? `Suggested: ${suggestedWeekly.toLocaleString()}`
                : "e.g., 210000"
            }
            value={formData.price_per_week || ""}
            onChange={(e) =>
              updateFormData({
                price_per_week: parseFloat(e.target.value) || "",
              })
            }
            className="pl-8"
          />
        </div>
        {suggestedWeekly > 0 && !formData.price_per_week && (
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500">
              Suggested: ₦{suggestedWeekly.toLocaleString()} (10% off)
            </p>
            <button
              type="button"
              onClick={() =>
                updateFormData({ price_per_week: suggestedWeekly })
              }
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              Use
            </button>
          </div>
        )}
      </div>

      {/* Monthly Rate */}
      <div className="space-y-2">
        <Label htmlFor="edit-price-month">Monthly Rate (₦)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            ₦
          </span>
          <Input
            id="edit-price-month"
            type="number"
            min="1000"
            step="1000"
            placeholder={
              suggestedMonthly > 0
                ? `Suggested: ${suggestedMonthly.toLocaleString()}`
                : "e.g., 800000"
            }
            value={formData.price_per_month || ""}
            onChange={(e) =>
              updateFormData({
                price_per_month: parseFloat(e.target.value) || "",
              })
            }
            className="pl-8"
          />
        </div>
        {suggestedMonthly > 0 && !formData.price_per_month && (
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500">
              Suggested: ₦{suggestedMonthly.toLocaleString()} (~23% off)
            </p>
            <button
              type="button"
              onClick={() =>
                updateFormData({ price_per_month: suggestedMonthly })
              }
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              Use
            </button>
          </div>
        )}
      </div>

      {/* Minimum Stay */}
      <div className="space-y-2">
        <Label htmlFor="edit-min-stay">Minimum Stay (Nights)</Label>
        <Input
          id="edit-min-stay"
          type="number"
          min="1"
          max="30"
          placeholder="e.g., 1"
          value={formData.minimum_stay || 1}
          onChange={(e) =>
            updateFormData({
              minimum_stay: parseInt(e.target.value) || 1,
            })
          }
        />
      </div>

      {/* Caution Deposit */}
      <div className="space-y-2">
        <Label htmlFor="edit-deposit">Caution/Security Deposit (₦)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            ₦
          </span>
          <Input
            id="edit-deposit"
            type="number"
            min="0"
            step="10000"
            placeholder="e.g., 100000"
            value={formData.caution_deposit || ""}
            onChange={(e) =>
              updateFormData({
                caution_deposit: parseFloat(e.target.value) || "",
              })
            }
            className="pl-8"
          />
        </div>
        <p className="text-xs text-gray-500">
          Refundable deposit held for damages
        </p>
      </div>
    </div>
  );
}
