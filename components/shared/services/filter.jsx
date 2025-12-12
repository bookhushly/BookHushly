"use client";

import React, { useState, useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, X } from "lucide-react";
import { debounce } from "lodash";
import { FILTER_CONFIGS } from "@/lib/filter-configs";

const FilterPanel = memo(
  ({ category, filters, onFiltersChange, isOpen, onToggle, isMobile }) => {
    const config = FILTER_CONFIGS[category];
    const [priceRange, setPriceRange] = useState([
      config?.priceRange?.min || 0,
      config?.priceRange?.max || 1000000,
    ]);

    const handlePriceChange = useMemo(
      () =>
        debounce((values) => {
          setPriceRange(values);
          onFiltersChange({
            ...filters,
            price_min: values[0],
            price_max: values[1],
          });
        }, 400),
      [filters, onFiltersChange]
    );

    if (!config) return null;

    const hasPriceRange = config.priceRange !== undefined;

    return (
      <>
        {isMobile && (
          <div className="sticky top-0 z-10 bg-white border-b p-4">
            <Button onClick={onToggle} variant="outline" className="w-full">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        )}

        {(isOpen || !isMobile) && (
          <div
            className={
              isMobile
                ? "fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl overflow-y-auto"
                : "sticky top-4"
            }
          >
            <div className="p-4 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                {isMobile && (
                  <Button onClick={onToggle} variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {hasPriceRange && (
                <div className="space-y-3">
                  <h4 className="font-medium">Price Range</h4>
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    min={config.priceRange.min}
                    max={config.priceRange.max}
                    step={config.priceRange.step}
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₦{priceRange[0].toLocaleString()}</span>
                    <span>₦{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              )}

              {config.filters?.map((filter) => (
                <div key={filter.key} className="space-y-3">
                  <h4 className="font-medium">{filter.label}</h4>
                  {filter.type === "range" && (
                    <Slider
                      value={
                        filters[filter.key]
                          ? [filters[filter.key]]
                          : [filter.min]
                      }
                      onValueChange={(values) =>
                        onFiltersChange({ ...filters, [filter.key]: values[0] })
                      }
                      min={filter.min}
                      max={filter.max}
                      step={filter.step}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isMobile && isOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={onToggle} />
        )}
      </>
    );
  }
);

FilterPanel.displayName = "FilterPanel";

export default FilterPanel;
