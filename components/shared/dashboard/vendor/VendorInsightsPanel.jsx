"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, RefreshCw, Loader2, Lightbulb } from "lucide-react";

/**
 * VendorInsightsPanel
 * Shows 3 AI-generated plain-English business insights based on the vendor's analytics data.
 *
 * Props:
 *  - analytics: object  — the full analytics payload from useVendorAnalytics
 *  - range: string      — '7d' | '30d' | '90d' | '1y'
 */
export function VendorInsightsPanel({ analytics, range }) {
  const [insights, setInsights] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error

  const generate = useCallback(async () => {
    if (!analytics) return;
    setStatus("loading");
    setInsights([]);
    try {
      const res = await fetch("/api/vendor/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analytics, range }),
      });
      const json = await res.json();
      if (!res.ok || !json.data?.insights) {
        setStatus("error");
        return;
      }
      setInsights(json.data.insights);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }, [analytics, range]);

  // Auto-generate when analytics data arrives
  useEffect(() => {
    if (analytics && analytics.totalBookings > 0 && status === "idle") {
      generate();
    }
  }, [analytics, status, generate]);

  // Re-generate when range changes
  useEffect(() => {
    if (analytics && analytics.totalBookings > 0) {
      setStatus("idle");
    }
  }, [range]);

  if (!analytics || analytics.totalBookings === 0) return null;

  return (
    <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/70 to-white p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-violet-100 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">AI Business Insights</p>
            <p className="text-[11px] text-gray-400">Based on your {range} performance</p>
          </div>
        </div>
        <button
          onClick={generate}
          disabled={status === "loading"}
          className="flex items-center gap-1.5 text-[11px] font-medium text-violet-600 hover:text-violet-800 disabled:opacity-40 transition-colors"
        >
          {status === "loading" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Refresh
        </button>
      </div>

      {/* Loading skeleton */}
      {status === "loading" && (
        <div className="space-y-3">
          {[80, 65, 72].map((w, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-5 w-5 rounded-full bg-violet-100 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 rounded-full bg-violet-100" style={{ width: `${w}%` }} />
                <div className="h-3 rounded-full bg-violet-50" style={{ width: `${w - 15}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <p className="text-xs text-gray-400 text-center py-4">
          Could not generate insights right now.{" "}
          <button onClick={generate} className="text-violet-600 underline">
            Try again
          </button>
        </p>
      )}

      {/* Insights */}
      {status === "done" && insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="h-3 w-3 text-violet-600" />
              </div>
              <p className="text-[13px] text-gray-700 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
