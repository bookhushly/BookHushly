"use client";

import { useEffect, useState } from "react";
import { AlignLeft, ThumbsUp, AlertCircle, Star } from "lucide-react";

/**
 * ReviewSummary
 * Fetches reviews for a listing, then asks Claude to summarise them.
 * Shows nothing if fewer than 3 reviews exist.
 *
 * Props:
 *  - listingId: string
 *  - listingType: 'hotel' | 'apartment' | 'event' | 'listing'
 */
export function ReviewSummary({ listingId, listingType = "hotel" }) {
  const [state, setState] = useState("idle"); // idle | loading | done | error | insufficient
  const [summary, setSummary] = useState(null);
  const [avgRating, setAvgRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    if (!listingId) return;

    let cancelled = false;
    setState("loading");

    (async () => {
      try {
        // 1. Fetch reviews
        const reviewsRes = await fetch(
          `/api/reviews/${listingId}?type=${listingType}`
        );
        const reviewsJson = await reviewsRes.json();

        if (cancelled) return;

        const reviews = reviewsJson.data?.reviews ?? [];
        const stats = reviewsJson.data?.stats;

        if (stats) {
          setAvgRating(stats.average);
          setTotalReviews(stats.total);
        }

        if (reviews.length < 3) {
          setState("insufficient");
          return;
        }

        // 2. Get AI summary
        const sumRes = await fetch("/api/reviews/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId, listingType, reviews }),
        });

        if (cancelled) return;

        if (!sumRes.ok) {
          setState("error");
          return;
        }

        const sumJson = await sumRes.json();
        setSummary(sumJson.data);
        setState("done");
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => { cancelled = true; };
  }, [listingId, listingType]);

  if (state === "idle" || state === "insufficient" || state === "error") {
    return null;
  }

  if (state === "loading") {
    return (
      <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-5 mb-8 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <AlignLeft className="h-4 w-4 text-violet-400" />
          <div className="h-3.5 w-36 bg-violet-200/60 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-violet-100 rounded-full" />
          <div className="h-3 w-4/5 bg-violet-100 rounded-full" />
        </div>
      </div>
    );
  }

  if (state === "done" && summary) {
    return (
      <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/60 to-white p-5 mb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-violet-100 flex items-center justify-center">
              <AlignLeft className="h-3.5 w-3.5 text-violet-600" />
            </div>
            <span className="text-[13px] font-medium text-violet-700">
              AI Review Summary
            </span>
          </div>
          {avgRating && (
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-gray-800">{avgRating}</span>
              <span className="text-xs text-gray-400">({totalReviews} reviews)</span>
            </div>
          )}
        </div>

        {/* Summary sentence */}
        {summary.summary && (
          <p className="text-[13px] text-gray-600 italic mb-4 leading-relaxed">
            "{summary.summary}"
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Pros */}
          {summary.pros?.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 mb-2">
                <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                  Guests loved
                </span>
              </div>
              {summary.pros.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <p className="text-[12.5px] text-gray-700">{p}</p>
                </div>
              ))}
            </div>
          )}

          {/* Cons */}
          {summary.cons?.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">
                  Watch out for
                </span>
              </div>
              {summary.cons.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <p className="text-[12.5px] text-gray-700">{c}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-[10px] text-violet-400 mt-3">
          Summarised by AI from {totalReviews} verified reviews
        </p>
      </div>
    );
  }

  return null;
}
