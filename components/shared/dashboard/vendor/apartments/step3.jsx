"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, TrendingDown, Calendar, AlertCircle } from "lucide-react";

export default function Step3Pricing({ formData, updateFormData, errors }) {
  // Calculate suggested weekly/monthly rates
  const nightlyRate = parseFloat(formData.price_per_night) || 0;
  const suggestedWeekly =
    nightlyRate > 0 ? Math.floor(nightlyRate * 7 * 0.9) : 0; // 10% discount
  const suggestedMonthly =
    nightlyRate > 0 ? Math.floor(nightlyRate * 30 * 0.77) : 0; // ~23% discount

  return (
    <div className="space-y-6">
      {/* Pricing Strategy Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-2">
                Nigerian Short-Let Pricing Strategy
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>
                  • <strong>Daily Rate:</strong> For short stays (1-6 nights)
                </li>
                <li>
                  • <strong>Weekly Rate:</strong> Offer 10-15% discount to
                  attract longer stays
                </li>
                <li>
                  • <strong>Monthly Rate:</strong> Popular for corporate
                  bookings, offer 20-25% discount
                </li>
                <li>• Consider your location and competition when pricing</li>
                <li>• Include or clearly state what utilities are covered</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nightly Rate (Required) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            Base Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price_per_night">
              Price Per Night (₦) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₦
              </span>
              <Input
                id="price_per_night"
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
                className={`pl-8 ${errors?.price_per_night ? "border-red-500" : ""}`}
              />
            </div>
            {errors?.price_per_night && (
              <p className="text-sm text-red-500">{errors.price_per_night}</p>
            )}
            <p className="text-xs text-gray-500">
              Your base rate for single-night bookings
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimum_stay">Minimum Stay (Nights)</Label>
            <Input
              id="minimum_stay"
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
            <p className="text-xs text-gray-500">
              Minimum number of nights required for booking (default: 1)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Discounted Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-green-600" />
            Discounted Rates (Optional)
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Attract longer stays with discounted weekly and monthly rates
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price_per_week">Weekly Rate (₦)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₦
              </span>
              <Input
                id="price_per_week"
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
            <p className="text-xs text-gray-500">
              Total price for 7 nights (leave empty if not offering)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price_per_month">Monthly Rate (₦)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₦
              </span>
              <Input
                id="price_per_month"
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
            <p className="text-xs text-gray-500">
              Total price for 30 nights - popular with corporate clients
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Deposit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Security & Deposits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="caution_deposit">
              Caution/Security Deposit (₦)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₦
              </span>
              <Input
                id="caution_deposit"
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

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900 mb-2">
              Deposit Guidelines
            </p>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>
                • Typical range: ₦50,000 - ₦200,000 depending on apartment value
              </li>
              <li>• Clearly state refund conditions in your house rules</li>
              <li>• Usually refunded within 7-14 days after checkout</li>
              <li>• Deductions only for documented damages</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      {formData.price_per_night > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-lg">Pricing Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Per Night:</span>
                <span className="font-semibold text-gray-900">
                  ₦{parseFloat(formData.price_per_night).toLocaleString()}
                </span>
              </div>
              {formData.price_per_week && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Per Week:</span>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">
                      ₦{parseFloat(formData.price_per_week).toLocaleString()}
                    </span>
                    <span className="block text-xs text-green-600">
                      Save ₦
                      {(
                        formData.price_per_night * 7 -
                        formData.price_per_week
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              {formData.price_per_month && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Per Month:</span>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">
                      ₦{parseFloat(formData.price_per_month).toLocaleString()}
                    </span>
                    <span className="block text-xs text-green-600">
                      Save ₦
                      {(
                        formData.price_per_night * 30 -
                        formData.price_per_month
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              {formData.caution_deposit && (
                <div className="flex justify-between items-center pt-3 border-t border-purple-200">
                  <span className="text-sm text-gray-700">
                    Security Deposit:
                  </span>
                  <span className="font-semibold text-gray-900">
                    ₦{parseFloat(formData.caution_deposit).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
