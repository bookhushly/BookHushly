"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Building,
  BarChart2,
  CreditCard,
  RefreshCw,
} from "lucide-react";

const FOCUS_OPTIONS = [
  { value: "overview",  label: "Platform Overview", icon: Brain,     description: "Overall health & key metrics" },
  { value: "vendors",   label: "Vendors",            icon: Building,  description: "Vendor ecosystem & KYC pipeline" },
  { value: "listings",  label: "Listings",           icon: BarChart2, description: "Listing traffic & conversions" },
  { value: "payments",  label: "Payments",           icon: CreditCard,description: "Revenue trends & payment health" },
];

const PRIORITY_CONFIG = {
  high:   { color: "bg-red-50 border-red-100 text-red-700",     dot: "bg-red-500" },
  medium: { color: "bg-amber-50 border-amber-100 text-amber-700", dot: "bg-amber-500" },
  low:    { color: "bg-gray-50 border-gray-100 text-gray-600",  dot: "bg-gray-400" },
};

const TYPE_CONFIG = {
  positive: { icon: CheckCircle2, color: "text-emerald-600" },
  warning:  { icon: AlertTriangle, color: "text-amber-600" },
  action:   { icon: Zap,           color: "text-violet-600" },
};

function ScoreRing({ score }) {
  const color = score >= 70 ? "#22c55e" : score >= 45 ? "#f59e0b" : "#ef4444";
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={84} height={84} viewBox="0 0 84 84" className="-rotate-90">
        <circle cx={42} cy={42} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={8} />
        <circle
          cx={42} cy={42} r={radius} fill="none"
          stroke={color} strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-gray-900">{score}</span>
        <span className="text-[10px] text-gray-400 font-medium">/100</span>
      </div>
    </div>
  );
}

export function AdminAIEvaluator() {
  const [focus, setFocus]     = useState("overview");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [meta, setMeta]       = useState(null);
  const [error, setError]     = useState(null);

  async function runEvaluation() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ai-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Evaluation failed");
      setResult(json.data);
      setMeta(json.meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedFocus = FOCUS_OPTIONS.find((f) => f.value === focus);

  return (
    <Card className="border border-violet-100">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <Brain className="h-5 w-5 text-violet-600" strokeWidth={1.75} />
          AI Platform Evaluator
        </CardTitle>
        <p className="text-xs text-gray-400 mt-0.5">
          Claude analyses your live platform data and returns actionable insights.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Focus selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FOCUS_OPTIONS.map(({ value, label, icon: Icon, description }) => (
            <button
              key={value}
              onClick={() => { setFocus(value); setResult(null); }}
              className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                focus === value
                  ? "border-violet-300 bg-violet-50 shadow-sm shadow-violet-100"
                  : "border-gray-100 hover:border-violet-200 hover:bg-gray-50"
              }`}
            >
              <Icon className={`h-4 w-4 ${focus === value ? "text-violet-600" : "text-gray-400"}`} strokeWidth={1.75} />
              <span className={`text-[12px] font-semibold ${focus === value ? "text-violet-700" : "text-gray-700"}`}>
                {label}
              </span>
              <span className="text-[10px] text-gray-400 leading-tight">{description}</span>
            </button>
          ))}
        </div>

        {/* Run button */}
        <Button
          onClick={runEvaluation}
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white"
        >
          {loading ? (
            <><LoadingSpinner className="h-4 w-4 mr-2" /> Analysing platform data…</>
          ) : result ? (
            <><RefreshCw className="h-4 w-4 mr-2" /> Re-run {selectedFocus?.label} Evaluation</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" /> Evaluate {selectedFocus?.label}</>
          )}
        </Button>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && meta && (
          <div className="space-y-5">
            {/* Score + summary */}
            <div className="flex items-center gap-5 p-4 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100">
              <div className="relative shrink-0">
                <ScoreRing score={result.score} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-gray-900">Platform Health Score</p>
                  <Badge
                    variant="outline"
                    className={
                      result.score >= 70
                        ? "text-emerald-700 border-emerald-200 bg-emerald-50 text-[10px]"
                        : result.score >= 45
                        ? "text-amber-700 border-amber-200 bg-amber-50 text-[10px]"
                        : "text-red-700 border-red-200 bg-red-50 text-[10px]"
                    }
                  >
                    {result.score >= 70 ? "Healthy" : result.score >= 45 ? "Needs Attention" : "Critical"}
                  </Badge>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed">{result.summary}</p>

                {/* Quick meta stats */}
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-800">{meta.totalVendors}</span> vendors
                    ({meta.approvedVendors} approved)
                  </span>
                  <span className="text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-800">{meta.totalListings}</span> active listings
                  </span>
                  <span className="text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-800">
                      ₦{(meta.totalRevenue30d || 0).toLocaleString()}
                    </span> revenue (30d)
                  </span>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <TrendingUp className={`h-3 w-3 ${meta.revenueGrowth >= 0 ? "text-emerald-500" : "text-red-500"}`} />
                    <span className={`font-semibold ${meta.revenueGrowth >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                      {meta.revenueGrowth >= 0 ? "+" : ""}{meta.revenueGrowth}%
                    </span>
                    <span>7d change</span>
                  </span>
                  <span className="text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-800">{meta.paymentSuccessRate ?? "—"}%</span> payment success
                  </span>
                  <span className="text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-800">{meta.confirmedCount}/{meta.totalBookings}</span> bookings confirmed
                  </span>
                  <span className="text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-800">{meta.totalViews}</span> listing views (30d)
                  </span>
                </div>
              </div>
            </div>

            {/* Insight cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(result.insights ?? []).map((insight, i) => {
                const priorityConf = PRIORITY_CONFIG[insight.priority] ?? PRIORITY_CONFIG.low;
                const typeConf = TYPE_CONFIG[insight.type] ?? TYPE_CONFIG.action;
                const TypeIcon = typeConf.icon;

                return (
                  <div
                    key={i}
                    className={`relative p-4 rounded-xl border ${priorityConf.color}`}
                  >
                    <div className="flex items-start gap-3">
                      <TypeIcon className={`h-4 w-4 shrink-0 mt-0.5 ${typeConf.color}`} strokeWidth={2} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[12px] font-bold text-gray-900 leading-tight">
                            {insight.title}
                          </p>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityConf.dot}`} />
                        </div>
                        <p className="text-[12px] leading-relaxed text-gray-700">
                          {insight.body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-gray-400 text-right">
              Analysis for: {selectedFocus?.label} · Powered by Claude
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
