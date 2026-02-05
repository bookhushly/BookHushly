// components/shared/services/filter.jsx
"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  SlidersHorizontal,
  X,
  DollarSign,
  Bed,
  Bath,
  Users,
  MapPin,
  RotateCcw,
  Zap,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { NIGERIAN_STATES } from "@/lib/constants";
import {
  AMENITY_ICONS,
  APARTMENT_TYPES,
  WATER_SUPPLY_OPTIONS,
  SECURITY_FEATURES,
  PRICE_RANGES,
  NUMBER_RANGES,
  BED_SIZES,
} from "@/lib/constants/filters";

const FilterPanel = memo(
  ({ category, filters, onFiltersChange, isOpen, onToggle, isMobile }) => {
    const [localFilters, setLocalFilters] = useState(filters);
    const [hasChanges, setHasChanges] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
      amenities: true,
      bedSizes: false,
      power: false,
      security: false,
    });

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

    const handleArrayToggle = useCallback((key, value) => {
      setLocalFilters((prev) => {
        const current = prev[key] || [];
        const updated = { ...prev };
        if (current.includes(value)) {
          updated[key] = current.filter((item) => item !== value);
          if (updated[key].length === 0) delete updated[key];
        } else {
          updated[key] = [...current, value];
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

    const toggleSection = useCallback((section) => {
      setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    }, []);

    const activeFilterCount = Object.keys(localFilters).filter(
      (key) => key !== "state" && key !== "city",
    ).length;

    const priceRange = PRICE_RANGES[category] || PRICE_RANGES.events;

    const renderFilters = () => {
      switch (category) {
        case "hotels":
          return (
            <>
              <PriceFilter
                filters={localFilters}
                onChange={handleLocalChange}
                {...priceRange}
                label="Price per Night"
              />
              <Separator />
              <LocationFilters
                filters={localFilters}
                onChange={handleLocalChange}
              />
              <Separator />

              <div className="space-y-4">
                <Label className="text-sm font-medium">Room Preferences</Label>

                <NumberSelectFilter
                  label="Max Occupancy"
                  icon={<Users className="h-4 w-4" />}
                  value={localFilters.max_occupancy}
                  onChange={(value) =>
                    handleLocalChange("max_occupancy", value)
                  }
                  {...NUMBER_RANGES.max_occupancy}
                  suffix="guest"
                />

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Floor Preference
                  </Label>
                  <Select
                    value={localFilters.floor?.toString() || "all"}
                    onValueChange={(value) =>
                      handleLocalChange(
                        "floor",
                        value === "all" ? null : parseInt(value),
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any Floor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Floor</SelectItem>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(
                        (floor) => (
                          <SelectItem key={floor} value={floor.toString()}>
                            Floor {floor}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <CollapsibleSection
                title="Bed Sizes"
                icon={<Bed className="h-4 w-4 text-purple-600" />}
                expanded={expandedSections.bedSizes || false}
                onToggle={() => toggleSection("bedSizes")}
                count={(localFilters.bed_sizes || []).length}
              >
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {BED_SIZES.map((bedSize) => {
                    const isSelected = (localFilters.bed_sizes || []).includes(
                      bedSize.value,
                    );
                    return (
                      <button
                        key={bedSize.value}
                        onClick={() =>
                          handleArrayToggle("bed_sizes", bedSize.value)
                        }
                        className={`flex items-center justify-center gap-2 p-2 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-purple-50 border-purple-600 text-purple-900"
                            : "bg-white border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <Bed className="h-4 w-4 flex-shrink-0" />
                        <span className="text-xs font-medium">
                          {bedSize.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CollapsibleSection>

              <Separator />

              <AmenitiesFilter
                filters={localFilters}
                onToggle={handleArrayToggle}
                expanded={expandedSections.amenities}
                onToggleExpand={() => toggleSection("amenities")}
              />
            </>
          );

        case "serviced_apartments":
          return (
            <>
              <PriceFilter
                filters={localFilters}
                onChange={handleLocalChange}
                {...priceRange}
                label="Price per Night"
              />
              <Separator />
              <LocationFilters
                filters={localFilters}
                onChange={handleLocalChange}
              />
              <Separator />

              <div className="space-y-4">
                <Label className="text-sm font-medium">Apartment Details</Label>

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
                    <SelectValue placeholder="Apartment Type" />
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

                <NumberSelectFilter
                  label="Bedrooms"
                  icon={<Bed className="h-4 w-4" />}
                  value={localFilters.bedrooms}
                  onChange={(value) => handleLocalChange("bedrooms", value)}
                  {...NUMBER_RANGES.bedrooms}
                  suffix="bed"
                />

                <NumberSelectFilter
                  label="Bathrooms"
                  icon={<Bath className="h-4 w-4" />}
                  value={localFilters.bathrooms}
                  onChange={(value) => handleLocalChange("bathrooms", value)}
                  {...NUMBER_RANGES.bathrooms}
                  suffix="bath"
                />

                <NumberSelectFilter
                  label="Max Guests"
                  icon={<Users className="h-4 w-4" />}
                  value={localFilters.max_guests}
                  onChange={(value) => handleLocalChange("max_guests", value)}
                  {...NUMBER_RANGES.max_guests}
                  suffix="guest"
                />

                <NumberSelectFilter
                  label="Parking Spaces"
                  icon={
                    LucideIcons.Car && <LucideIcons.Car className="h-4 w-4" />
                  }
                  value={localFilters.parking_spaces}
                  onChange={(value) =>
                    handleLocalChange("parking_spaces", value)
                  }
                  {...NUMBER_RANGES.parking_spaces}
                  suffix="space"
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium">Property Features</Label>

                <BooleanFilter
                  label="Furnished"
                  checked={localFilters.furnished}
                  onChange={(value) => handleLocalChange("furnished", value)}
                />

                <BooleanFilter
                  label="Utilities Included"
                  checked={localFilters.utilities_included}
                  onChange={(value) =>
                    handleLocalChange("utilities_included", value)
                  }
                />

                <BooleanFilter
                  label="Internet Included"
                  checked={localFilters.internet_included}
                  onChange={(value) =>
                    handleLocalChange("internet_included", value)
                  }
                />

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Water Supply
                  </Label>
                  <Select
                    value={localFilters.water_supply || "all"}
                    onValueChange={(value) =>
                      handleLocalChange(
                        "water_supply",
                        value === "all" ? null : value,
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      {WATER_SUPPLY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <CollapsibleSection
                title="Power Supply"
                icon={<Zap className="h-4 w-4 text-purple-600" />}
                expanded={expandedSections.power}
                onToggle={() => toggleSection("power")}
              >
                <div className="space-y-2 pt-2">
                  <CheckboxItem
                    label="Generator"
                    checked={localFilters.generator_available || false}
                    onChange={(checked) =>
                      handleLocalChange("generator_available", checked || null)
                    }
                  />
                  <CheckboxItem
                    label="Inverter"
                    checked={localFilters.inverter_available || false}
                    onChange={(checked) =>
                      handleLocalChange("inverter_available", checked || null)
                    }
                  />
                  <CheckboxItem
                    label="Solar Power"
                    checked={localFilters.solar_power || false}
                    onChange={(checked) =>
                      handleLocalChange("solar_power", checked || null)
                    }
                  />
                </div>
              </CollapsibleSection>

              <Separator />

              <CollapsibleSection
                title="Security Features"
                icon={<Shield className="h-4 w-4 text-purple-600" />}
                expanded={expandedSections.security}
                onToggle={() => toggleSection("security")}
              >
                <div className="space-y-2 pt-2">
                  {SECURITY_FEATURES.map((feature) => (
                    <CheckboxItem
                      key={feature.value}
                      label={feature.label}
                      checked={
                        (localFilters.security_features || []).includes(
                          feature.value,
                        ) || false
                      }
                      onChange={(checked) => {
                        if (checked) {
                          handleArrayToggle("security_features", feature.value);
                        } else {
                          handleArrayToggle("security_features", feature.value);
                        }
                      }}
                    />
                  ))}
                </div>
              </CollapsibleSection>

              <Separator />

              <AmenitiesFilter
                filters={localFilters}
                onToggle={handleArrayToggle}
                expanded={expandedSections.amenities}
                onToggleExpand={() => toggleSection("amenities")}
              />
            </>
          );

        case "events":
          return (
            <>
              <PriceFilter
                filters={localFilters}
                onChange={handleLocalChange}
                {...priceRange}
                label="Price"
              />
              <Separator />
              <NumberSelectFilter
                label="Minimum Capacity"
                icon={<Users className="h-4 w-4" />}
                value={localFilters.capacity}
                onChange={(value) => handleLocalChange("capacity", value)}
                {...NUMBER_RANGES.capacity}
                suffix="people"
              />
              <Separator />
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
              <Separator />
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

        {(isOpen || !isMobile) && (
          <>
            {isMobile && (
              <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onToggle}
              />
            )}

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

// ==================== SUB-COMPONENTS ====================

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

const LocationFilters = memo(({ filters, onChange }) => {
  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium flex items-center gap-2">
        <MapPin className="h-4 w-4 text-purple-600" />
        Location
      </Label>
      <div className="space-y-3">
        <Select
          value={filters.state || "all"}
          onValueChange={(value) => {
            onChange("state", value === "all" ? null : value);
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
  );
});

const AmenitiesFilter = memo(
  ({ filters, onToggle, expanded, onToggleExpand }) => {
    const selectedAmenities = filters.amenities || [];

    return (
      <CollapsibleSection
        title="Amenities"
        icon={
          LucideIcons.Sparkles && (
            <LucideIcons.Sparkles className="h-4 w-4 text-purple-600" />
          )
        }
        expanded={expanded}
        onToggle={onToggleExpand}
        count={selectedAmenities.length}
      >
        <div className="grid grid-cols-2 gap-2 pt-2">
          {AMENITY_ICONS.map((amenity) => {
            const Icon = LucideIcons[amenity.icon];
            const isSelected = selectedAmenities.includes(amenity.value);
            return (
              <button
                key={amenity.value}
                onClick={() => onToggle("amenities", amenity.value)}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                  isSelected
                    ? "bg-purple-50 border-purple-600 text-purple-900"
                    : "bg-white border-gray-200 hover:border-purple-300"
                }`}
              >
                {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                <span className="text-xs font-medium truncate">
                  {amenity.label}
                </span>
              </button>
            );
          })}
        </div>
      </CollapsibleSection>
    );
  },
);

const CollapsibleSection = memo(
  ({ title, icon, expanded, onToggle, count, children }) => {
    return (
      <div>
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium">{title}</span>
            {count > 0 && (
              <Badge variant="secondary" className="ml-1">
                {count}
              </Badge>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
        {expanded && <div className="mt-2">{children}</div>}
      </div>
    );
  },
);

const CheckboxItem = memo(({ label, checked, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={label}
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
      />
      <Label
        htmlFor={label}
        className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </Label>
    </div>
  );
});

const BooleanFilter = memo(({ label, checked, onChange }) => {
  return (
    <Select
      value={checked === true ? "true" : checked === false ? "false" : "all"}
      onValueChange={(value) => {
        if (value === "all") onChange(null);
        else onChange(value === "true");
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Any</SelectItem>
        <SelectItem value="true">Yes</SelectItem>
        <SelectItem value="false">No</SelectItem>
      </SelectContent>
    </Select>
  );
});

PriceFilter.displayName = "PriceFilter";
NumberSelectFilter.displayName = "NumberSelectFilter";
LocationFilters.displayName = "LocationFilters";
AmenitiesFilter.displayName = "AmenitiesFilter";
CollapsibleSection.displayName = "CollapsibleSection";
CheckboxItem.displayName = "CheckboxItem";
BooleanFilter.displayName = "BooleanFilter";
FilterPanel.displayName = "FilterPanel";

export default FilterPanel;
