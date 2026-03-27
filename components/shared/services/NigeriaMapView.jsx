"use client";

/**
 * NigeriaMapView
 * Shows hotels grouped by state as a geographic tile grid.
 * Clicking a state applies it as the active state filter.
 * No geocoding or third-party map library needed.
 */

import { useMemo } from "react";
import { MapPin } from "lucide-react";

// Approximate geographic layout of Nigerian states (row, col) on a 10×9 grid
// Based on actual geography so the layout feels intuitive
const STATE_GRID = [
  // row 0 — far north
  { state: "Sokoto",    row: 0, col: 0 },
  { state: "Kebbi",     row: 0, col: 1 },
  { state: "Zamfara",   row: 0, col: 2 },
  { state: "Katsina",   row: 0, col: 3 },
  { state: "Kano",      row: 0, col: 4 },
  { state: "Jigawa",    row: 0, col: 5 },
  { state: "Yobe",      row: 0, col: 6 },
  { state: "Borno",     row: 0, col: 7 },
  // row 1
  { state: "Niger",     row: 1, col: 1 },
  { state: "Kaduna",    row: 1, col: 3 },
  { state: "Bauchi",    row: 1, col: 5 },
  { state: "Gombe",     row: 1, col: 6 },
  { state: "Adamawa",   row: 1, col: 7 },
  // row 2
  { state: "Kwara",     row: 2, col: 1 },
  { state: "Kogi",      row: 2, col: 2 },
  { state: "Abuja",     row: 2, col: 3 },
  { state: "Nasarawa",  row: 2, col: 4 },
  { state: "Plateau",   row: 2, col: 5 },
  { state: "Taraba",    row: 2, col: 6 },
  // row 3
  { state: "Oyo",       row: 3, col: 0 },
  { state: "Osun",      row: 3, col: 1 },
  { state: "Ekiti",     row: 3, col: 2 },
  { state: "Benue",     row: 3, col: 4 },
  { state: "Cross River", row: 3, col: 6 },
  // row 4
  { state: "Ogun",      row: 4, col: 0 },
  { state: "Lagos",     row: 4, col: 1 },
  { state: "Ondo",      row: 4, col: 2 },
  { state: "Edo",       row: 4, col: 3 },
  { state: "Anambra",   row: 4, col: 4 },
  { state: "Enugu",     row: 4, col: 5 },
  { state: "Ebonyi",    row: 4, col: 6 },
  // row 5
  { state: "Delta",     row: 5, col: 2 },
  { state: "Imo",       row: 5, col: 4 },
  { state: "Abia",      row: 5, col: 5 },
  { state: "Akwa Ibom", row: 5, col: 6 },
  // row 6
  { state: "Bayelsa",   row: 6, col: 2 },
  { state: "Rivers",    row: 6, col: 3 },
  { state: "Anambra",   row: 6, col: 4 }, // duplicate removed below
];

// Deduplicate
const STATES = STATE_GRID.filter(
  (s, i, arr) => arr.findIndex((x) => x.state === s.state) === i
);

const COLS = Math.max(...STATES.map((s) => s.col)) + 1;
const ROWS = Math.max(...STATES.map((s) => s.row)) + 1;

function getColor(count) {
  if (!count) return { bg: "bg-gray-100", text: "text-gray-400", border: "border-gray-200" };
  if (count >= 10) return { bg: "bg-violet-600", text: "text-white", border: "border-violet-700" };
  if (count >= 5)  return { bg: "bg-violet-400", text: "text-white", border: "border-violet-500" };
  if (count >= 2)  return { bg: "bg-violet-200", text: "text-violet-900", border: "border-violet-300" };
  return { bg: "bg-violet-100", text: "text-violet-800", border: "border-violet-200" };
}

export default function NigeriaMapView({ listings, activeState, onStateClick }) {
  const countByState = useMemo(() => {
    const map = {};
    for (const l of listings) {
      const s = l.state;
      if (s) map[s] = (map[s] || 0) + 1;
    }
    return map;
  }, [listings]);

  // Build grid cells
  const grid = useMemo(() => {
    const cells = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    for (const s of STATES) cells[s.row][s.col] = s.state;
    return cells;
  }, []);

  const totalHotels = listings.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-900">{totalHotels}</span>{" "}
          hotel{totalHotels !== 1 ? "s" : ""} across Nigeria
          {activeState && (
            <span className="ml-2 text-violet-600 font-medium">
              · Showing {activeState}
            </span>
          )}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-violet-100 border border-violet-200" />
            1–2
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-violet-400 border border-violet-500" />
            5+
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-violet-600 border border-violet-700" />
            10+
          </span>
        </div>
      </div>

      {/* Map grid */}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {grid.map((row, ri) =>
          row.map((stateName, ci) => {
            if (!stateName) {
              return <div key={`${ri}-${ci}`} className="aspect-square" />;
            }
            const count = countByState[stateName] || 0;
            const { bg, text, border } = getColor(count);
            const isActive = activeState === stateName;

            return (
              <button
                key={stateName}
                onClick={() => onStateClick(isActive ? null : stateName)}
                title={`${stateName}: ${count} hotel${count !== 1 ? "s" : ""}`}
                className={`
                  aspect-square rounded-lg border-2 flex flex-col items-center justify-center
                  transition-all duration-150 hover:scale-105 hover:shadow-md
                  ${bg} ${text} ${border}
                  ${isActive ? "ring-2 ring-violet-600 ring-offset-1 scale-105 shadow-md" : ""}
                  ${!count ? "cursor-default opacity-60" : "cursor-pointer"}
                `}
              >
                <span className="text-[9px] sm:text-[10px] font-medium leading-tight text-center px-0.5 line-clamp-2">
                  {stateName.length > 7 ? stateName.slice(0, 6) + "…" : stateName}
                </span>
                {count > 0 && (
                  <span className="text-[8px] sm:text-[9px] font-medium opacity-80 mt-0.5">
                    {count}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Active state listing summary */}
      {activeState && (
        <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-200 rounded-xl">
          <MapPin className="h-4 w-4 text-violet-600 shrink-0" />
          <p className="text-sm text-violet-800 flex-1">
            Showing <span className="font-medium">{countByState[activeState] || 0}</span> hotel{(countByState[activeState] || 0) !== 1 ? "s" : ""} in{" "}
            <span className="font-medium">{activeState}</span>
          </p>
          <button
            onClick={() => onStateClick(null)}
            className="text-xs text-violet-600 hover:text-violet-900 font-medium"
          >
            Clear ×
          </button>
        </div>
      )}
    </div>
  );
}
