"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { NIGERIAN_AIRPORTS } from "@/lib/constants/airports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plane, Save, ToggleLeft, ToggleRight, Info } from "lucide-react";

/**
 * HotelAirportPricingTab
 * Lets vendors enable airport pickup and set a per-airport price.
 * Prices are stored as a JSONB map { "LOS": 15000, "ABV": 20000 } in hotels.airport_prices.
 */
export function HotelAirportPricingTab({ hotelId, hotel, onUpdate }) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(hotel?.airport_transfer_enabled ?? false);
  // Initialize prices from hotel.airport_prices or {}
  const [prices, setPrices] = useState(() => hotel?.airport_prices || {});

  const handlePriceChange = (code, value) => {
    const num = value === "" ? "" : parseFloat(value) || 0;
    setPrices((prev) => ({ ...prev, [code]: num }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Filter out airports with no price (empty string or 0)
      const cleanPrices = {};
      Object.entries(prices).forEach(([code, val]) => {
        if (val !== "" && Number(val) > 0) cleanPrices[code] = Number(val);
      });

      const { error } = await supabase
        .from("hotels")
        .update({
          airport_transfer_enabled: enabled,
          airport_prices: cleanPrices,
          // Keep legacy flat fee as the minimum configured price for backwards-compat
          airport_transfer_fee: Object.values(cleanPrices).length > 0
            ? Math.min(...Object.values(cleanPrices))
            : null,
        })
        .eq("id", hotelId);

      if (error) throw error;
      toast.success("Airport pricing saved");
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.message || "Failed to save airport pricing");
    } finally {
      setSaving(false);
    }
  };

  const configuredCount = Object.values(prices).filter((v) => Number(v) > 0).length;

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Plane className="h-4 w-4 text-purple-600" />
              Airport Pickup / Drop-off Service
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Allow guests to request transportation between your property and Nigerian airports.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEnabled((v) => !v)}
            className="ml-4 shrink-0"
            aria-label="Toggle airport transfer"
          >
            {enabled ? (
              <ToggleRight className="h-9 w-9 text-purple-600" />
            ) : (
              <ToggleLeft className="h-9 w-9 text-gray-400" />
            )}
          </button>
        </div>

        {enabled && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Set a price per trip for each airport you service. Leave blank for airports you don't cover.
              Guests pick their airport at checkout — the price is added to their total automatically.
            </p>
          </div>
        )}
      </div>

      {/* Airport price grid */}
      {enabled && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                Per-Airport Prices
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {configuredCount > 0
                  ? `${configuredCount} airport${configuredCount !== 1 ? "s" : ""} configured`
                  : "No airports configured yet"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NIGERIAN_AIRPORTS.map((airport) => (
              <div
                key={airport.code}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {airport.city} — {airport.code}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{airport.name}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">₦</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="—"
                    value={prices[airport.code] ?? ""}
                    onChange={(e) => handlePriceChange(airport.code, e.target.value)}
                    className="w-28 h-8 text-sm text-right"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
          ) : (
            <><Save className="h-4 w-4 mr-2" />Save Airport Pricing</>
          )}
        </Button>
      </div>
    </div>
  );
}
