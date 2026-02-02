// components/shared/services/filter.jsx
"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SlidersHorizontal,
  X,
  DollarSign,
  Bed,
  Bath,
  Users,
  MapPin,
  RotateCcw,
} from "lucide-react";
import { NIGERIAN_STATES } from "@/lib/constants";

const APARTMENT_TYPES = [
  { value: "studio", label: "Studio" },
  { value: "1_bedroom", label: "1 Bedroom" },
  { value: "2_bedroom", label: "2 Bedroom" },
  { value: "3_bedroom", label: "3 Bedroom" },
  { value: "penthouse", label: "Penthouse" },
];

const FilterPanel = memo(
  ({ category, filters, onFiltersChange, isOpen, onToggle, isMobile }) => {
    const [localFilters, setLocalFilters] = useState(filters);
    const [hasChanges, setHasChanges] = useState(false);

    // Sync local filters with prop changes
    useEffect(() => {
      setLocalFilters(filters);
      setHasChanges(false);
    }, [filters]);

    const handleLocalChange = useCallback((key, value) => {
      setLocalFilters((prev) => {
        const updated = { ...prev };
        if (value === "all" || value === null || value === undefined) {
          delete updated[key];
        } else {
          updated[key] = value;
        }
        return updated;
      });
      setHasChanges(true);
    }, []);

    const applyFilters = useCallback(() => {
      onFiltersChange(localFilters);
      setHasChanges(false);
      if (isMobile) onToggle();
    }, [localFilters, onFiltersChange, isMobile, onToggle]);

    const clearFilters = useCallback(() => {
      setLocalFilters({});
      onFiltersChange({});
      setHasChanges(false);
    }, [onFiltersChange]);

    const activeFilterCount = Object.keys(localFilters).length;

    // Filter configurations based on category
    const renderFilters = () => {
      switch (category) {
        case "hotels":
          return (
            <>
              <PriceFilter
                filters={localFilters}
                onChange={handleLocalChange}
                min={5000}
                max={500000}
                step={5000}
                label="Price per Night"
              />
              <LocationFilters
                filters={localFilters}
                onChange={handleLocalChange}
              />
            </>
          );

        case "serviced_apartments":
          return (
            <>
              <PriceFilter
                filters={localFilters}
                onChange={handleLocalChange}
                min={10000}
                max={1000000}
                step={10000}
                label="Price per Night"
              />
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Apartment Type
                  </Label>
                  <Select
                    value={localFilters.apartment_type || "all"}
                    onValueChange={(value) =>
                      handleLocalChange(
                        "apartment_type",
                        value === "all" ? null : value,
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {APARTMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <NumberSelectFilter
                  label="Bedrooms"
                  icon={<Bed className="h-4 w-4" />}
                  value={localFilters.bedrooms}
                  onChange={(value) => handleLocalChange("bedrooms", value)}
                  min={1}
                  max={10}
                  suffix="bed"
                />

                <NumberSelectFilter
                  label="Bathrooms"
                  icon={<Bath className="h-4 w-4" />}
                  value={localFilters.bathrooms}
                  onChange={(value) => handleLocalChange("bathrooms", value)}
                  min={1}
                  max={6}
                  suffix="bath"
                />

                <NumberSelectFilter
                  label="Max Guests"
                  icon={<Users className="h-4 w-4" />}
                  value={localFilters.max_guests}
                  onChange={(value) => handleLocalChange("max_guests", value)}
                  min={1}
                  max={20}
                  suffix="guest"
                />
              </div>
              <LocationFilters
                filters={localFilters}
                onChange={handleLocalChange}
              />
            </>
          );

        case "events":
          return (
            <>
              <PriceFilter
                filters={localFilters}
                onChange={handleLocalChange}
                min={1000}
                max={10000000}
                step={10000}
                label="Price"
              />
              <NumberSelectFilter
                label="Minimum Capacity"
                icon={<Users className="h-4 w-4" />}
                value={localFilters.capacity}
                onChange={(value) => handleLocalChange("capacity", value)}
                min={10}
                max={5000}
                step={50}
                suffix="people"
              />
              <LocationFilters
                filters={localFilters}
                onChange={handleLocalChange}
              />
            </>
          );

        default:
          return (
            <>
              <PriceFilter
                filters={localFilters}
                onChange={handleLocalChange}
                min={1000}
                max={1000000}
                step={1000}
              />
              <LocationFilters
                filters={localFilters}
                onChange={handleLocalChange}
              />
            </>
          );
      }
    };

    return (
      <>
        {/* Mobile Filter Button */}
        {isMobile && (
          <div className="sticky top-0 z-10 bg-white border-b p-4 mb-4">
            <Button
              onClick={onToggle}
              variant="outline"
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </span>
            </Button>
          </div>
        )}

        {/* Filter Panel */}
        {(isOpen || !isMobile) && (
          <>
            {/* Backdrop for mobile */}
            {isMobile && (
              <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onToggle}
              />
            )}

            {/* Panel Content */}
            <div
              className={
                isMobile
                  ? "fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-white shadow-2xl overflow-y-auto"
                  : "sticky top-4"
              }
            >
              <Card className={isMobile ? "border-0 rounded-none h-full" : ""}>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <SlidersHorizontal className="h-5 w-5 text-purple-600" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </CardTitle>
                    {isMobile && (
                      <Button onClick={onToggle} variant="ghost" size="sm">
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 p-4 md:p-6">
                  {renderFilters()}

                  {/* Action Buttons */}
                  <div className="pt-4 border-t space-y-3">
                    {hasChanges && (
                      <Button
                        onClick={applyFilters}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        Apply Filters
                      </Button>
                    )}
                    {activeFilterCount > 0 && (
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        className="w-full"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </>
    );
  },
);

// Price Filter Component with manual inputs
const PriceFilter = memo(
  ({ filters, onChange, min, max, step, label = "Price Range" }) => {
    const minPrice = filters.price_min || min;
    const maxPrice = filters.price_max || max;

    const formatPrice = (value) => {
      return new Intl.NumberFormat("en-NG").format(value);
    };

    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-purple-600" />
          {label}
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label
              htmlFor="min-price"
              className="text-xs text-gray-600 mb-1 block"
            >
              Minimum
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                ₦
              </span>
              <Input
                id="min-price"
                type="number"
                min={min}
                max={maxPrice}
                step={step}
                value={minPrice}
                onChange={(e) =>
                  onChange("price_min", parseInt(e.target.value) || min)
                }
                className="pl-7"
                placeholder={formatPrice(min)}
              />
            </div>
          </div>
          <div>
            <Label
              htmlFor="max-price"
              className="text-xs text-gray-600 mb-1 block"
            >
              Maximum
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                ₦
              </span>
              <Input
                id="max-price"
                type="number"
                min={minPrice}
                max={max}
                step={step}
                value={maxPrice}
                onChange={(e) =>
                  onChange("price_max", parseInt(e.target.value) || max)
                }
                className="pl-7"
                placeholder={formatPrice(max)}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>₦{formatPrice(minPrice)}</span>
          <span>₦{formatPrice(maxPrice)}</span>
        </div>
      </div>
    );
  },
);

// Number Select Filter Component
const NumberSelectFilter = memo(
  ({ label, icon, value, onChange, min, max, step = 1, suffix = "" }) => {
    const options = [];
    for (let i = min; i <= max; i += step) {
      options.push(i);
    }

    return (
      <div>
        <Label className="text-sm font-medium mb-2 flex items-center gap-2">
          {icon}
          {label}
        </Label>
        <Select
          value={value?.toString() || "all"}
          onValueChange={(val) =>
            onChange(val === "all" ? null : parseInt(val))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Any ${suffix}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any {suffix}</SelectItem>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt.toString()}>
                {opt}+ {suffix}
                {opt > 1 && suffix ? "s" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  },
);

// Location Filters Component
const LocationFilters = memo(({ filters, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-purple-600" />
          Location
        </Label>
        <div className="space-y-3">
          <Select
            value={filters.state || "all"}
            onValueChange={(value) => {
              onChange("state", value === "all" ? null : value);
              // Clear city when state changes
              if (filters.city) onChange("city", null);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {NIGERIAN_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="City (e.g., Lagos, Abuja)"
            value={filters.city || ""}
            onChange={(e) => onChange("city", e.target.value || null)}
          />
        </div>
      </div>
    </div>
  );
});

PriceFilter.displayName = "PriceFilter";
NumberSelectFilter.displayName = "NumberSelectFilter";
LocationFilters.displayName = "LocationFilters";
FilterPanel.displayName = "FilterPanel";

export default FilterPanel;
