// components/shared/services/smart-questions.jsx
"use client";

import { memo, useState } from "react";
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react";

const QUESTIONS = {
  hotels: [
    {
      id: "purpose",
      question: "What's your stay for?",
      filterKeys: ["amenities", "max_occupancy"],
      options: [
        { label: "💼 Business",  value: "business", filters: { amenities: ["wifi", "briefcase"] } },
        { label: "🏖️ Leisure",   value: "leisure",  filters: {} },
        { label: "👨‍👩‍👧 Family",  value: "family",   filters: { max_occupancy: 3 } },
      ],
    },
    {
      id: "power",
      question: "Power backup needed?",
      filterKeys: ["hotel_has_generator"],
      options: [
        { label: "⚡ Essential",     value: "essential", filters: { hotel_has_generator: true } },
        { label: "✅ Nice to have",  value: "nice",      filters: {} },
        { label: "🤷 No preference", value: "any",       filters: {} },
      ],
    },
    {
      id: "breakfast",
      question: "Breakfast preference?",
      filterKeys: ["breakfast_offered"],
      options: [
        { label: "🍳 Must be included",   value: "included", filters: { breakfast_offered: "included" } },
        { label: "💰 Happy to pay extra", value: "paid",     filters: { breakfast_offered: "paid" } },
        { label: "🤷 No preference",      value: "any",      filters: {} },
      ],
    },
  ],
  serviced_apartments: [
    {
      id: "group",
      question: "Who's coming with you?",
      filterKeys: ["max_guests"],
      options: [
        { label: "🙋 Just me",    value: "solo",   filters: { max_guests: 1 } },
        { label: "💑 Couple",     value: "couple", filters: { max_guests: 2 } },
        { label: "👨‍👩‍👧 Family",  value: "family", filters: { max_guests: 4 } },
        { label: "👥 Group (6+)", value: "group",  filters: { max_guests: 6 } },
      ],
    },
    {
      id: "power",
      question: "Constant power important?",
      filterKeys: ["generator_available", "inverter_available"],
      options: [
        { label: "⚡ Must have generator", value: "generator", filters: { generator_available: true } },
        { label: "🔋 Inverter is fine",    value: "inverter",  filters: { inverter_available: true } },
        { label: "🤷 No preference",       value: "any",       filters: {} },
      ],
    },
    {
      id: "utilities",
      question: "Utilities preference?",
      filterKeys: ["utilities_included", "internet_included"],
      options: [
        { label: "✅ All included",  value: "all",      filters: { utilities_included: true } },
        { label: "🌐 At least WiFi", value: "internet", filters: { internet_included: true } },
        { label: "🤷 No preference", value: "any",      filters: {} },
      ],
    },
  ],
  events: [
    {
      id: "occasion",
      question: "What's the occasion?",
      filterKeys: ["capacity"],
      options: [
        { label: "💒 Wedding",          value: "wedding",    filters: { capacity: 100 } },
        { label: "🏢 Corporate",        value: "corporate",  filters: { capacity: 50 } },
        { label: "🎉 Birthday / Party", value: "party",      filters: { capacity: 30 } },
        { label: "🎤 Conference",       value: "conference", filters: { capacity: 200 } },
      ],
    },
    {
      id: "budget",
      question: "What's your budget?",
      filterKeys: ["price_min", "price_max"],
      options: [
        { label: "💚 Under ₦100k",   value: "budget",  filters: { price_max: 100000 } },
        { label: "💛 ₦100k–₦500k",  value: "mid",     filters: { price_min: 100000, price_max: 500000 } },
        { label: "💜 ₦500k+",       value: "premium", filters: { price_min: 500000 } },
      ],
    },
  ],
};

function getActiveValue(question, filters) {
  return (
    question.options.find((opt) => {
      const entries = Object.entries(opt.filters);
      if (!entries.length) return false;
      return entries.every(([k, v]) => {
        if (Array.isArray(v)) return v.every((item) => (filters[k] || []).includes(item));
        return filters[k] === v;
      });
    })?.value ?? null
  );
}

const SmartQuestions = memo(function SmartQuestions({ category, filters, onFiltersChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const questions = QUESTIONS[category];
  if (!questions) return null;

  const activeCount = questions.filter((q) => getActiveValue(q, filters) !== null).length;

  const handleSelect = (question, option) => {
    const currentActive = getActiveValue(question, filters);
    const next = { ...filters };

    // Remove all filter keys this question controls
    question.filterKeys.forEach((k) => delete next[k]);

    // Apply new option unless toggling off
    if (currentActive !== option.value) {
      Object.entries(option.filters).forEach(([k, v]) => {
        if (v === undefined) return;
        if (Array.isArray(v)) {
          next[k] = [...new Set([...(next[k] || []), ...v])];
        } else {
          next[k] = v;
        }
      });
    }

    onFiltersChange(next);
  };

  return (
    <div className="mb-5 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white overflow-hidden">
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-violet-50/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Lightbulb className="h-4 w-4 text-violet-500" />
          <span className="text-sm font-semibold text-violet-900">Tell us what you need</span>
          {activeCount > 0 && (
            <span className="text-[10px] font-bold bg-violet-600 text-white px-1.5 py-0.5 rounded-full">
              {activeCount} set
            </span>
          )}
        </div>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-violet-400" />
        ) : (
          <ChevronUp className="h-4 w-4 text-violet-400" />
        )}
      </button>

      {!collapsed && (
        <div className="px-5 pb-5 space-y-4 border-t border-violet-100/60">
          {questions.map((q) => {
            const active = getActiveValue(q, filters);
            return (
              <div key={q.id} className="pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2.5">
                  {q.question}
                </p>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(q, opt)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                        active === opt.value
                          ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default SmartQuestions;
