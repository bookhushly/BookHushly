// components/shared/services/filter.jsx
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
} from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  SlidersHorizontal,
  X,
  MapPin,
  RotateCcw,
  Zap,
  Shield,
  ChevronDown,
  ChevronUp,
  Bed,
  Bath,
  Users,
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

// ── Shared atoms ──────────────────────────────────────────────────────────────

const SectionLabel = ({ children }) => (
  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-3">
    {children}
  </p>
);

// ── Dual-thumb range slider ───────────────────────────────────────────────────

const DualRangeSlider = memo(
  ({ min, max, step, minVal, maxVal, onMinChange, onMaxChange }) => {
    const toPercent = (v) => ((v - min) / (max - min)) * 100;
    const minPct = toPercent(minVal);
    const maxPct = toPercent(maxVal);

    return (
      <div className="relative mt-6 mb-1">
        {/* Track background */}
        <div className="relative h-1.5 rounded-full bg-gray-200">
          {/* Active range */}
          <div
            className="absolute h-full bg-violet-500 rounded-full"
            style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
          />
        </div>

        {/* Invisible range inputs stacked on top */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={(e) =>
            onMinChange(Math.min(Number(e.target.value), maxVal - step))
          }
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-4 -top-1.5"
          style={{ zIndex: minVal >= maxVal - step ? 5 : 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={(e) =>
            onMaxChange(Math.max(Number(e.target.value), minVal + step))
          }
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-4 -top-1.5"
          style={{ zIndex: 4 }}
        />

        {/* Visual thumbs */}
        <div
          className="absolute top-0 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-violet-500 rounded-full shadow-sm pointer-events-none"
          style={{ left: `${minPct}%` }}
        />
        <div
          className="absolute top-0 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-violet-500 rounded-full shadow-sm pointer-events-none"
          style={{ left: `${maxPct}%` }}
        />

        {/* Price labels */}
        <div className="flex justify-between mt-3 text-xs text-gray-500">
          <span>₦{minVal.toLocaleString("en-NG")}</span>
          <span>₦{maxVal.toLocaleString("en-NG")}</span>
        </div>
      </div>
    );
  },
);
DualRangeSlider.displayName = "DualRangeSlider";

// ── Price filter (now a slider) ───────────────────────────────────────────────

const PriceFilter = memo(
  ({ filters, onChange, min, max, step, label = "Price Range" }) => {
    const [localMin, setLocalMin] = useState(filters.price_min ?? min);
    const [localMax, setLocalMax] = useState(filters.price_max ?? max);
    const timer = useRef(null);

    // Sync when parent resets filters
    useEffect(() => {
      setLocalMin(filters.price_min ?? min);
      setLocalMax(filters.price_max ?? max);
    }, [filters.price_min, filters.price_max, min, max]);

    const emit = useCallback(
      (newMin, newMax) => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          onChange("price_min", newMin <= min ? "" : String(newMin));
          onChange("price_max", newMax >= max ? "" : String(newMax));
        }, 300);
      },
      [onChange, min, max],
    );

    return (
      <div>
        <SectionLabel>{label}</SectionLabel>
        <DualRangeSlider
          min={min}
          max={max}
          step={step}
          minVal={localMin}
          maxVal={localMax}
          onMinChange={(v) => {
            setLocalMin(v);
            emit(v, localMax);
          }}
          onMaxChange={(v) => {
            setLocalMax(v);
            emit(localMin, v);
          }}
        />
      </div>
    );
  },
);
PriceFilter.displayName = "PriceFilter";

// ── Other reused atoms ────────────────────────────────────────────────────────

const NumberSelect = memo(
  ({ label, icon, value, onChange, min, max, step = 1, suffix = "" }) => {
    const opts = Array.from(
      { length: Math.floor((max - min) / step) + 1 },
      (_, i) => min + i * step,
    );
    return (
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          {icon && <span className="text-gray-400">{icon}</span>}
          <p className="text-xs font-medium text-gray-700">{label}</p>
        </div>
        <Select
          value={value?.toString() || "all"}
          onValueChange={(v) => onChange(v === "all" ? null : parseInt(v))}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder={`Any ${suffix}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            {opts.map((o) => (
              <SelectItem key={o} value={o.toString()}>
                {o}+ {suffix}
                {o > 1 ? "s" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  },
);
NumberSelect.displayName = "NumberSelect";

const LocationFilter = memo(({ filters, onChange, onLocationChange }) => (
  <div className="space-y-2">
    <SectionLabel>
      <MapPin className="h-3 w-3 inline mr-1" />
      Location
    </SectionLabel>
    <Select
      value={filters.state || "all"}
      onValueChange={(v) => {
        onChange("state", v === "all" ? null : v);
        if (filters.city) onChange("city", null);
        onLocationChange?.();
      }}
    >
      <SelectTrigger className="h-9 text-sm">
        <SelectValue placeholder="All States" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All States</SelectItem>
        {NIGERIAN_STATES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Input
      className="h-9 text-sm"
      type="text"
      placeholder="City (e.g., Lagos)"
      value={filters.city || ""}
      onChange={(e) => {
        onChange("city", e.target.value || null);
        onLocationChange?.();
      }}
    />
  </div>
));
LocationFilter.displayName = "LocationFilter";

const BooleanSelect = memo(({ label, checked, onChange }) => (
  <div>
    <p className="text-xs font-medium text-gray-700 mb-1.5">{label}</p>
    <Select
      value={
        checked === true ? "true" : checked === false ? "false" : "all"
      }
      onValueChange={(v) => onChange(v === "all" ? null : v === "true")}
    >
      <SelectTrigger className="h-9 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Any</SelectItem>
        <SelectItem value="true">Yes</SelectItem>
        <SelectItem value="false">No</SelectItem>
      </SelectContent>
    </Select>
  </div>
));
BooleanSelect.displayName = "BooleanSelect";

const CheckItem = memo(({ label, checked, onChange }) => (
  <div className="flex items-center gap-2">
    <Checkbox
      id={label}
      checked={checked}
      onCheckedChange={onChange}
      className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600 h-4 w-4"
    />
    <Label
      htmlFor={label}
      className="text-sm text-gray-600 font-normal cursor-pointer"
    >
      {label}
    </Label>
  </div>
));
CheckItem.displayName = "CheckItem";

const Collapsible = memo(
  ({ title, icon, expanded, onToggle, count, children }) => (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 px-1 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-semibold text-gray-700">{title}</span>
          {count > 0 && (
            <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        )}
      </button>
      {expanded && <div className="mt-2 pl-1">{children}</div>}
    </div>
  ),
);
Collapsible.displayName = "Collapsible";

const AmenitiesSection = memo(
  ({ filters, onToggle, expanded, onToggleExpand }) => {
    const selected = filters.amenities || [];
    return (
      <Collapsible
        title="Amenities"
        expanded={expanded}
        onToggle={onToggleExpand}
        count={selected.length}
        icon={
          LucideIcons.Sparkles ? (
            <LucideIcons.Sparkles className="h-3.5 w-3.5 text-violet-500" />
          ) : null
        }
      >
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {AMENITY_ICONS.map((a) => {
            const Icon = LucideIcons[a.icon];
            const isOn = selected.includes(a.value);
            return (
              <button
                key={a.value}
                onClick={() => onToggle("amenities", a.value)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                  isOn
                    ? "bg-violet-50 border-violet-300 text-violet-800"
                    : "bg-white border-gray-200 text-gray-600 hover:border-violet-200"
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                <span className="truncate">{a.label}</span>
              </button>
            );
          })}
        </div>
      </Collapsible>
    );
  },
);
AmenitiesSection.displayName = "AmenitiesSection";

// ── Main panel ────────────────────────────────────────────────────────────────

const FilterPanel = memo(
  ({
    category,
    filters,
    onFiltersChange,
    onLocationChange,
    isOpen,
    onToggle,
    isMobile,
    totalCount,
  }) => {
    const localRef = useRef(filters);
    const [local, setLocal] = useState(filters);
    const priceTimer = useRef(null);
    const [sections, setSections] = useState({
      amenities: true,
      bedSizes: false,
      power: true,
      security: false,
    });

    // Sync from parent (near-me, quick chips, smart questions)
    useEffect(() => {
      localRef.current = filters;
      setLocal(filters);
    }, [filters]);

    // Instant emit for selects / checkboxes / toggle buttons
    const set = useCallback(
      (key, value) => {
        const next = { ...localRef.current };
        if (value === "all" || value === null || value === undefined)
          delete next[key];
        else next[key] = value;
        localRef.current = next;
        setLocal(next);
        onFiltersChange(next);
      },
      [onFiltersChange],
    );

    // Debounced emit for price slider (300 ms — comes from PriceFilter)
    const setPrice = useCallback(
      (key, rawValue) => {
        const next = { ...localRef.current };
        const parsed = parseInt(String(rawValue).replace(/,/g, ""), 10);
        if (!parsed || isNaN(parsed)) delete next[key];
        else next[key] = parsed;
        localRef.current = next;
        setLocal(next);
        clearTimeout(priceTimer.current);
        priceTimer.current = setTimeout(() => onFiltersChange(next), 300);
      },
      [onFiltersChange],
    );

    const toggle = useCallback(
      (key, value) => {
        const cur = localRef.current[key] || [];
        const next = { ...localRef.current };
        if (cur.includes(value)) {
          next[key] = cur.filter((v) => v !== value);
          if (!next[key].length) delete next[key];
        } else {
          next[key] = [...cur, value];
        }
        localRef.current = next;
        setLocal(next);
        onFiltersChange(next);
      },
      [onFiltersChange],
    );

    const clear = useCallback(() => {
      localRef.current = {};
      setLocal({});
      onFiltersChange({});
      onLocationChange?.();
    }, [onFiltersChange, onLocationChange]);

    const toggleSection = (s) =>
      setSections((p) => ({ ...p, [s]: !p[s] }));

    const pr = PRICE_RANGES[category] || PRICE_RANGES.events;
    const activeCount = Object.keys(local).filter(
      (k) => k !== "state" && k !== "city" && k !== "nearMe",
    ).length;

    const body = (
      <div className="space-y-5">
        {/* Price slider */}
        <PriceFilter
          filters={local}
          onChange={setPrice}
          min={pr.min}
          max={pr.max}
          step={pr.step}
        />

        {/* Location */}
        <Separator />
        <LocationFilter
          filters={local}
          onChange={set}
          onLocationChange={onLocationChange}
        />

        {/* ── Hotels ───────────────────────────────────────────────── */}
        {category === "hotels" && (
          <>
            <Separator />
            <SectionLabel>Room</SectionLabel>
            <NumberSelect
              label="Occupancy"
              icon={<Users className="h-3.5 w-3.5" />}
              value={local.max_occupancy}
              onChange={(v) => set("max_occupancy", v)}
              {...NUMBER_RANGES.max_occupancy}
              suffix="guest"
            />

            <Separator />
            <Collapsible
              title="Bed Sizes"
              icon={<Bed className="h-3.5 w-3.5 text-violet-500" />}
              expanded={sections.bedSizes}
              onToggle={() => toggleSection("bedSizes")}
              count={(local.bed_sizes || []).length}
            >
              <div className="grid grid-cols-2 gap-1.5">
                {BED_SIZES.map((b) => {
                  const on = (local.bed_sizes || []).includes(b.value);
                  return (
                    <button
                      key={b.value}
                      onClick={() => toggle("bed_sizes", b.value)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                        on
                          ? "bg-violet-50 border-violet-300 text-violet-800"
                          : "bg-white border-gray-200 text-gray-600 hover:border-violet-200"
                      }`}
                    >
                      <Bed className="h-3.5 w-3.5" />
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </Collapsible>

            <Separator />
            <SectionLabel>Nigerian Essentials</SectionLabel>
            <CheckItem
              label="Has Generator / Power Backup"
              checked={local.hotel_has_generator || false}
              onChange={(c) => set("hotel_has_generator", c || null)}
            />
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1.5">
                Breakfast
              </p>
              <Select
                value={local.breakfast_offered || "all"}
                onValueChange={(v) =>
                  set("breakfast_offered", v === "all" ? null : v)
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="included">Included in price</SelectItem>
                  <SelectItem value="paid">Available (extra cost)</SelectItem>
                  <SelectItem value="none">Not offered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />
            <AmenitiesSection
              filters={local}
              onToggle={toggle}
              expanded={sections.amenities}
              onToggleExpand={() => toggleSection("amenities")}
            />
          </>
        )}

        {/* ── Serviced Apartments ───────────────────────────────────── */}
        {category === "serviced_apartments" && (
          <>
            <Separator />
            <SectionLabel>Apartment</SectionLabel>
            <Select
              value={local.apartment_type || "all"}
              onValueChange={(v) =>
                set("apartment_type", v === "all" ? null : v)
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {APARTMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <NumberSelect
              label="Bedrooms"
              icon={<Bed className="h-3.5 w-3.5" />}
              value={local.bedrooms}
              onChange={(v) => set("bedrooms", v)}
              {...NUMBER_RANGES.bedrooms}
              suffix="bed"
            />
            <NumberSelect
              label="Bathrooms"
              icon={<Bath className="h-3.5 w-3.5" />}
              value={local.bathrooms}
              onChange={(v) => set("bathrooms", v)}
              {...NUMBER_RANGES.bathrooms}
              suffix="bath"
            />
            <NumberSelect
              label="Max Guests"
              icon={<Users className="h-3.5 w-3.5" />}
              value={local.max_guests}
              onChange={(v) => set("max_guests", v)}
              {...NUMBER_RANGES.max_guests}
              suffix="guest"
            />

            <Separator />
            <SectionLabel>Features</SectionLabel>
            <BooleanSelect
              label="Furnished"
              checked={local.furnished}
              onChange={(v) => set("furnished", v)}
            />
            <BooleanSelect
              label="Utilities Included"
              checked={local.utilities_included}
              onChange={(v) => set("utilities_included", v)}
            />
            <BooleanSelect
              label="Internet Included"
              checked={local.internet_included}
              onChange={(v) => set("internet_included", v)}
            />
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1.5">
                Water Supply
              </p>
              <Select
                value={local.water_supply || "all"}
                onValueChange={(v) =>
                  set("water_supply", v === "all" ? null : v)
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  {WATER_SUPPLY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />
            <Collapsible
              title="Power Supply"
              icon={<Zap className="h-3.5 w-3.5 text-amber-500" />}
              expanded={sections.power}
              onToggle={() => toggleSection("power")}
            >
              <div className="space-y-2">
                <CheckItem
                  label="Generator"
                  checked={local.generator_available || false}
                  onChange={(c) => set("generator_available", c || null)}
                />
                <CheckItem
                  label="Inverter"
                  checked={local.inverter_available || false}
                  onChange={(c) => set("inverter_available", c || null)}
                />
                <CheckItem
                  label="Solar"
                  checked={local.solar_power || false}
                  onChange={(c) => set("solar_power", c || null)}
                />
              </div>
            </Collapsible>

            <Separator />
            <Collapsible
              title="Security Features"
              icon={<Shield className="h-3.5 w-3.5 text-violet-500" />}
              expanded={sections.security}
              onToggle={() => toggleSection("security")}
              count={(local.security_features || []).length}
            >
              <div className="space-y-2">
                {SECURITY_FEATURES.map((f) => (
                  <CheckItem
                    key={f.value}
                    label={f.label}
                    checked={(local.security_features || []).includes(f.value)}
                    onChange={() => toggle("security_features", f.value)}
                  />
                ))}
              </div>
            </Collapsible>

            <Separator />
            <AmenitiesSection
              filters={local}
              onToggle={toggle}
              expanded={sections.amenities}
              onToggleExpand={() => toggleSection("amenities")}
            />
          </>
        )}

        {/* ── Events ───────────────────────────────────────────────── */}
        {category === "events" && (
          <>
            <Separator />
            <NumberSelect
              label="Minimum Capacity"
              icon={<Users className="h-3.5 w-3.5" />}
              value={local.capacity}
              onChange={(v) => set("capacity", v)}
              {...NUMBER_RANGES.capacity}
              suffix="people"
            />
          </>
        )}

        {/* Clear all */}
        {activeCount > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={clear}
              className="w-full flex items-center justify-center gap-2 h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-violet-300 hover:text-violet-700 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear all
            </button>
          </div>
        )}
      </div>
    );

    // ── Desktop sidebar ──────────────────────────────────────────────────────
    if (!isMobile) {
      return (
        <div className="sticky top-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-100/60 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-900">
                Filters
              </span>
              {activeCount > 0 && (
                <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">
                  {activeCount}
                </span>
              )}
            </div>
          </div>
          {body}
        </div>
      );
    }

    // ── Mobile trigger + bottom sheet ────────────────────────────────────────
    return (
      <>
        {/* Trigger button */}
        <button
          onClick={onToggle}
          className="flex items-center gap-2 h-9 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-violet-300 hover:text-violet-700 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 text-[10px] font-bold bg-violet-600 text-white px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </button>

        {/* Bottom sheet overlay + panel */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={onToggle}
            />

            {/* Sheet */}
            <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-2xl shadow-2xl max-h-[88vh]">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                <span className="font-semibold text-gray-900">Filters</span>
                <button
                  onClick={onToggle}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable filter body */}
              <div className="flex-1 overflow-y-auto px-5 py-4">{body}</div>

              {/* Footer — "Show results" button */}
              <div className="shrink-0 px-5 py-4 border-t border-gray-100 bg-white">
                <button
                  onClick={onToggle}
                  className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-colors"
                >
                  {totalCount != null
                    ? `Show ${totalCount.toLocaleString()} result${totalCount !== 1 ? "s" : ""}`
                    : "Show results"}
                </button>
              </div>
            </div>
          </>
        )}
      </>
    );
  },
);

FilterPanel.displayName = "FilterPanel";
export default FilterPanel;
