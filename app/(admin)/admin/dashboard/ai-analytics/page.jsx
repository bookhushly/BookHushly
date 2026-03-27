"use client";

import { useState } from "react";
import { useAIAnalytics } from "@/hooks/use-ai-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  Zap,
  Users,
  TrendingUp,
  AlertCircle,
  MessageCircle,
  PenLine,
  Star,
  MessagesSquare,
  BarChart2,
  Search,
  FileText,
} from "lucide-react";
import { AdminAIEvaluator } from "@/components/shared/admin/AdminAIEvaluator";

const FEATURE_META = {
  support_chat:            { icon: MessageCircle, color: "#3b82f6", label: "Support Chat" },
  listing_generator:       { icon: PenLine,       color: "#7c3aed", label: "Listing Generator" },
  review_summarizer:       { icon: Star,          color: "#f59e0b", label: "Review Summarizer" },
  quote_assistant:         { icon: MessagesSquare,color: "#10b981", label: "Quote Assistant" },
  vendor_insights:         { icon: BarChart2,     color: "#6366f1", label: "Vendor Insights" },
  natural_language_search: { icon: Search,        color: "#ef4444", label: "NL Search" },
  quote_drafting:          { icon: FileText,      color: "#14b8a6", label: "Quote Drafting" },
};

function StatCard({ icon: Icon, label, value, sub, color = "text-violet-600" }) {
  return (
    <Card className="border border-gray-100">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {label}
            </p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
          </div>
          <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center">
            <Icon className="h-5 w-5 text-violet-500" strokeWidth={1.75} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureRow({ feature }) {
  const meta = FEATURE_META[feature.feature_key];
  const Icon = meta?.icon ?? BarChart3;
  const color = meta?.color ?? "#7c3aed";
  const pct = feature.total > 0 ? 100 : 0;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
      <div
        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: color + "15" }}
      >
        <Icon className="h-4 w-4" style={{ color }} strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-800 truncate">
            {feature.feature_name}
          </p>
          <Badge
            variant="outline"
            className={
              feature.enabled
                ? "text-emerald-700 border-emerald-200 bg-emerald-50 text-[10px] py-0"
                : "text-gray-400 border-gray-200 bg-gray-50 text-[10px] py-0"
            }
          >
            {feature.enabled ? "Active" : "Off"}
          </Badge>
        </div>
        <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-gray-800">{feature.total.toLocaleString()}</p>
        <p className="text-[11px] text-gray-400">{feature.unique_users} users</p>
      </div>
    </div>
  );
}

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-3 text-xs">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-medium text-gray-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AIAnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading, error } = useAIAnalytics(days);

  const activeFeatures = (data?.features ?? []).filter((f) => f.total > 0);
  const allFeatures = data?.features ?? [];

  // Sort features by total desc for bar chart
  const barData = [...allFeatures]
    .sort((a, b) => b.total - a.total)
    .map((f) => ({
      name: FEATURE_META[f.feature_key]?.label ?? f.feature_name,
      calls: f.total,
      users: f.unique_users,
    }));

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-5 w-5 text-violet-600" strokeWidth={1.75} />
              <h1 className="text-2xl font-bold text-gray-900">AI Analytics</h1>
            </div>
            <p className="text-sm text-gray-500">
              Usage statistics across all AI features on the platform.
            </p>
          </div>
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <LoadingSpinner className="h-6 w-6 text-violet-600" />
          </div>
        )}

        {error && !isLoading && (
          <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-red-50 border border-red-100">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">
              Failed to load analytics. Please refresh the page.
            </p>
          </div>
        )}

        {/* ── AI Platform Evaluator (always visible) ── */}
        <AdminAIEvaluator />

        {!isLoading && !error && data && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Zap}
                label="Total Requests"
                value={data.summary.total_calls.toLocaleString()}
                sub={`Last ${days} days`}
              />
              <StatCard
                icon={Users}
                label="Unique Users"
                value={data.summary.unique_users.toLocaleString()}
                color="text-blue-600"
              />
              <StatCard
                icon={TrendingUp}
                label="Most Used"
                value={data.summary.most_used}
                color="text-emerald-600"
              />
              <StatCard
                icon={BarChart3}
                label="Active Features"
                value={`${activeFeatures.length} / ${allFeatures.length}`}
                color="text-amber-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily trend chart */}
              <Card className="lg:col-span-2 border border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700">
                    Daily Requests — All Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.daily_trend.every((d) => d.total === 0) ? (
                    <div className="flex items-center justify-center h-48 text-sm text-gray-400">
                      No usage data yet in this period.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={data.daily_trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: "#9ca3af" }}
                          tickFormatter={(v) =>
                            new Date(v).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })
                          }
                          interval={Math.floor(data.daily_trend.length / 6)}
                        />
                        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
                        <Tooltip content={<CUSTOM_TOOLTIP />} />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#7c3aed"
                          strokeWidth={2}
                          dot={false}
                          name="Total"
                        />
                        {allFeatures
                          .filter((f) => f.total > 0)
                          .map((f) => (
                            <Line
                              key={f.feature_key}
                              type="monotone"
                              dataKey={f.feature_key}
                              stroke={FEATURE_META[f.feature_key]?.color ?? "#ccc"}
                              strokeWidth={1.5}
                              dot={false}
                              name={FEATURE_META[f.feature_key]?.label ?? f.feature_name}
                            />
                          ))}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Feature breakdown list */}
              <Card className="border border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700">
                    Feature Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {allFeatures.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4">No features found.</p>
                  ) : (
                    allFeatures
                      .slice()
                      .sort((a, b) => b.total - a.total)
                      .map((f) => <FeatureRow key={f.feature_key} feature={f} />)
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bar chart — calls vs users per feature */}
            {barData.some((d) => d.calls > 0) && (
              <Card className="border border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700">
                    Requests vs Unique Users by Feature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
                      <Tooltip content={<CUSTOM_TOOLTIP />} />
                      <Legend
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        iconType="circle"
                        iconSize={8}
                      />
                      <Bar dataKey="calls" name="Total Calls" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="users" name="Unique Users" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
