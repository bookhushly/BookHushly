// app/vendor/dashboard/analytics/page.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useVendorAnalytics } from "@/hooks/use-vendor-analytics";
import { useAuth } from "@/hooks/use-auth";

// ─── constants ───────────────────────────────────────────────────────────────
const RANGE_OPTIONS = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "3 Months" },
  { value: "1y", label: "1 Year" },
];

const SERVICE_COLORS = {
  event: "#9333ea", // purple-600
  hotel: "#3b82f6", // blue-500
  apartment: "#6366f1", // indigo-500
  logistics: "#f59e0b", // amber-500
  security: "#ef4444", // red-500
};

const STATUS_COLORS = {
  confirmed: "#22c55e",
  completed: "#3b82f6",
  pending: "#f59e0b",
  cancelled: "#ef4444",
};

const SERVICE_LABELS = {
  event: "Events",
  hotel: "Hotels",
  apartment: "Apartments",
  logistics: "Logistics",
  security: "Security",
};

const STATUS_LABELS = {
  confirmed: "Confirmed",
  completed: "Completed",
  pending: "Pending",
  cancelled: "Cancelled",
};

// ─── animated counter (KPI numbers count up on mount) ────────────────────────
function useCounter(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    startRef.current = null;
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [target, duration]);

  return value;
}

// ─── staggered reveal wrapper ────────────────────────────────────────────────
// Each child gets progressively delayed fade+slide.  We inject style via
// cloneElement so the parent stays declarative.
function StaggerIn({ children, baseDelay = 80, stagger = 100 }) {
  return (
    <>
      {React.Children.map(children, (child, i) => {
        if (!child) return null;
        const delay = `${baseDelay + i * stagger}ms`;
        return (
          <div
            style={{
              animation: `analyticsSlideUp 420ms cubic-bezier(.22,.61,0,1) ${delay} both`,
            }}
          >
            {child}
          </div>
        );
      })}
    </>
  );
}

// ─── shared tooltip ─────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg shadow-black/8 p-3.5">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {label}
      </p>
      {payload.map((p, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 text-[13px]"
        >
          <span className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: p.color }}
            />
            <span className="text-gray-600">{p.name}</span>
          </span>
          <span className="font-semibold text-gray-900">
            {formatter ? formatter(p.value, p.name) : p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── currency formatter ──────────────────────────────────────────────────────
function fmt(n) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

function fmtShort(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

// ─── KPI card ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, isCurrency, trend, trendLabel }) {
  const animated = useCounter(value, 1000);
  const displayVal = isCurrency ? fmt(animated) : animated.toLocaleString();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-200 transition-colors">
      <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-[28px] font-bold text-gray-900 mt-2 leading-tight">
        {displayVal}
      </p>
      <div className="flex items-center gap-2 mt-2">
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              trend >= 0
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {trend >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
        {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

// ─── chart wrapper (title + optional sub, consistent chrome) ─────────────────
function ChartCard({ title, sub, children, className = "" }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-200 transition-colors ${className}`}
    >
      <div className="mb-5">
        <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
        {sub && <p className="text-[12px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── donut label ─────────────────────────────────────────────────────────────
function DonutLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}) {
  if (percent < 0.06) return null; // skip tiny slices
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────
export default function VendorAnalyticsPage() {
  const { data: authData } = useAuth();
  const vendorId = authData?.vendor?.id;
  const [range, setRange] = useState("30d");

  const { analytics, isLoading } = useVendorAnalytics(vendorId, range);

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen ">
      {/* inject keyframes once */}
      <style>{`
        @keyframes analyticsSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-0 sm:px-2 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">
              Track growth, revenue and booking trends
            </p>
          </div>
          {/* Range switcher */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {RANGE_OPTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  range === r.value
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="max-w-8xl mx-auto px-0 sm:px-2 py-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-9 h-9 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            {/* ── KPI row ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StaggerIn baseDelay={60} stagger={80}>
                <KpiCard
                  label="Total Revenue"
                  value={analytics.growth.current}
                  isCurrency
                  trend={analytics.growth.growthPercent}
                  sub="vs previous period"
                />
                <KpiCard
                  label="Total Bookings"
                  value={analytics.totalBookings}
                  sub="across all services"
                />
                <KpiCard
                  label="Avg. Booking Value"
                  value={
                    analytics.totalBookings > 0
                      ? Math.round(
                          analytics.growth.current / analytics.totalBookings,
                        )
                      : 0
                  }
                  isCurrency
                  sub="per transaction"
                />
                <KpiCard
                  label="Successful Payments"
                  value={analytics.byService.reduce((s, d) => s + d.value, 0)}
                  isCurrency
                  sub="completed"
                />
              </StaggerIn>
            </div>

            {/* ── Revenue Over Time + Bookings vs Revenue ───────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <StaggerIn baseDelay={200} stagger={140}>
                <ChartCard
                  title="Revenue Over Time"
                  sub="Earned revenue trend across the selected period"
                >
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={analytics.timeline}>
                      <defs>
                        <linearGradient
                          id="revenueGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#9333ea"
                            stopOpacity={0.18}
                          />
                          <stop
                            offset="100%"
                            stopColor="#9333ea"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        tickFormatter={fmtShort}
                      />
                      <Tooltip
                        content={<ChartTooltip formatter={(v) => fmt(v)} />}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#9333ea"
                        strokeWidth={2.5}
                        fill="url(#revenueGrad)"
                        animationBegin={300}
                        animationDuration={1200}
                        dot={false}
                        activeDot={{
                          r: 5,
                          fill: "#9333ea",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title="Bookings vs Revenue"
                  sub="Volume and value side by side"
                >
                  <ResponsiveContainer width="100%" height={260}>
                    <ComposedChart data={analytics.timeline}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                      />
                      <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        tickFormatter={fmtShort}
                      />
                      <Tooltip
                        content={
                          <ChartTooltip
                            formatter={(v, n) =>
                              n === "Revenue" ? fmt(v) : v.toLocaleString()
                            }
                          />
                        }
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="bookings"
                        name="Bookings"
                        fill="#e0e7ff"
                        radius={[4, 4, 0, 0]}
                        animationBegin={300}
                        animationDuration={1000}
                        barSize={28}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#9333ea"
                        strokeWidth={2.5}
                        dot={false}
                        animationBegin={600}
                        animationDuration={1200}
                        activeDot={{
                          r: 4,
                          fill: "#9333ea",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartCard>
              </StaggerIn>
            </div>

            {/* ── Bottom row: 3 charts ─────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StaggerIn baseDelay={380} stagger={120}>
                <ChartCard
                  title="Revenue by Service"
                  sub="Which services earn the most"
                >
                  {analytics.byService.length === 0 ? (
                    <p className="text-[13px] text-gray-400 text-center py-12">
                      No revenue data yet
                    </p>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={analytics.byService}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={52}
                            outerRadius={82}
                            stroke="none"
                            animationBegin={400}
                            animationDuration={900}
                            label={DonutLabel}
                            labelLine={false}
                          >
                            {analytics.byService.map((entry) => (
                              <Cell
                                key={entry.name}
                                fill={SERVICE_COLORS[entry.name] || "#6b7280"}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            content={<ChartTooltip formatter={(v) => fmt(v)} />}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                        {analytics.byService.map((d) => (
                          <span
                            key={d.name}
                            className="flex items-center gap-1.5 text-[12px] text-gray-500"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ background: SERVICE_COLORS[d.name] }}
                            />
                            {SERVICE_LABELS[d.name]}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </ChartCard>

                <ChartCard
                  title="Payment Providers"
                  sub="Paystack vs Crypto earnings"
                >
                  {analytics.providerSplit.length === 0 ? (
                    <p className="text-[13px] text-gray-400 text-center py-12">
                      No provider data yet
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.providerSplit} barSize={20}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f0f0f0"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#9ca3af" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#9ca3af" }}
                          tickFormatter={fmtShort}
                        />
                        <Tooltip
                          content={<ChartTooltip formatter={(v) => fmt(v)} />}
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                        />
                        <Bar
                          dataKey="Paystack"
                          fill="#22c55e"
                          radius={[4, 4, 0, 0]}
                          animationBegin={500}
                          animationDuration={900}
                        />
                        <Bar
                          dataKey="Crypto"
                          fill="#f59e0b"
                          radius={[4, 4, 0, 0]}
                          animationBegin={700}
                          animationDuration={900}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>

                <ChartCard
                  title="Booking Status"
                  sub="Across all service types"
                >
                  {analytics.statusBreakdown.every((d) => d.value === 0) ? (
                    <p className="text-[13px] text-gray-400 text-center py-12">
                      No bookings yet
                    </p>
                  ) : (
                    <>
                      <div className="space-y-3.5 mt-1">
                        {analytics.statusBreakdown
                          .filter((d) => d.value > 0)
                          .sort((a, b) => b.value - a.value)
                          .map((item) => {
                            const total = analytics.statusBreakdown.reduce(
                              (s, d) => s + d.value,
                              0,
                            );
                            const pct =
                              total > 0 ? (item.value / total) * 100 : 0;
                            return (
                              <div key={item.name}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="flex items-center gap-2">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full"
                                      style={{
                                        background: STATUS_COLORS[item.name],
                                      }}
                                    />
                                    <span className="text-[13px] font-medium text-gray-700">
                                      {STATUS_LABELS[item.name]}
                                    </span>
                                  </span>
                                  <span className="text-[13px] font-bold text-gray-900">
                                    {item.value}
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                      width: `${pct}%`,
                                      background: STATUS_COLORS[item.name],
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                      <div className="flex justify-center gap-5 mt-5 pt-4 border-t border-gray-100">
                        {analytics.statusBreakdown
                          .filter((d) => d.value > 0)
                          .map((item) => (
                            <div key={item.name} className="text-center">
                              <p className="text-[18px] font-bold text-gray-900">
                                {item.value}
                              </p>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">
                                {STATUS_LABELS[item.name]}
                              </p>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </ChartCard>
              </StaggerIn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
