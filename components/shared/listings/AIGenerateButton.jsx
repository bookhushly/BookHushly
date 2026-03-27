"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

/**
 * AIGenerateButton
 * Sits beneath the description textarea on listing create/edit forms.
 * On click it calls /api/vendor/generate-listing and fills title + description.
 *
 * Props:
 *  - category: string
 *  - formData: object (existing form values used as context)
 *  - onGenerated: ({ title, description }) => void
 */
export function AIGenerateButton({ category, formData, onGenerated }) {
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState("");
  const [showHint, setShowHint] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/generate-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          context: {
            title: formData?.title,
            location: formData?.location || formData?.city || formData?.state,
            price: formData?.price || formData?.price_per_night,
            capacity: formData?.capacity || formData?.max_guests,
            amenities: formData?.amenities,
          },
          hint: hint.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Failed to generate content.");
        return;
      }

      onGenerated(json.data);
      toast.success("Listing content generated!");
      setHint("");
      setShowHint(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Pencil className="h-3.5 w-3.5 text-violet-600" />
          <span className="text-xs font-semibold text-violet-700">
            Generate with AI
          </span>
          <span className="text-xs text-violet-400">
            — writes your title &amp; description automatically
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowHint((p) => !p)}
          className="text-violet-500 hover:text-violet-700 transition-colors"
          aria-label="Toggle hint input"
        >
          {showHint ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {showHint && (
        <textarea
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder="Optional: add a quick note to guide the AI, e.g. '3-bedroom apartment in Lekki with rooftop pool'"
          rows={2}
          maxLength={200}
          className="w-full text-xs rounded-lg border border-violet-200 bg-white px-3 py-2 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none"
        />
      )}

      <Button
        type="button"
        size="sm"
        onClick={generate}
        disabled={loading}
        className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8 px-4 gap-1.5"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Pencil className="h-3.5 w-3.5" />
            Generate
          </>
        )}
      </Button>
    </div>
  );
}
