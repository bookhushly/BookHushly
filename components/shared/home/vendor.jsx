// Server component — no "use client", no Framer Motion.
// Left: benefits list + CTA. Right: sticky vendor dashboard mockup.
// Bar chart bars animate via CSS scaleY on scroll (animation-timeline:view()).
// Scroll entry: .vendor-left, .vendor-right, .vendor-stat-N, .vendor-bar-N classes.

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

// ── data ──────────────────────────────────────────────────────────────────────

const BENEFITS = [
  {
    index: "01",
    title: "Submit once, go live fast",
    body: "Complete KYC verification in one sitting. Upload your documents, get reviewed, and your listing is live — no back-and-forth.",
  },
  {
    index: "02",
    title: "Get paid when they book",
    body: "Every confirmed booking triggers an instant credit to your wallet. No waiting periods, no manual invoicing.",
  },
  {
    index: "03",
    title: "AI writes your listing copy",
    body: "Describe your service in plain language. Our AI generates polished, market-ready copy that turns browsers into bookers.",
  },
  {
    index: "04",
    title: "One dashboard, every service",
    body: "Hotels, apartments, events, logistics, security — manage them all from one place with unified analytics.",
  },
];

const STATS = [
  { label: "Earned this month", value: "₦1,240,000", delta: "+18%", positive: true },
  { label: "New bookings",      value: "47",          delta: "+12 this week", positive: true },
  { label: "Average rating",    value: "4.9 ★",       delta: "98% satisfaction", positive: true },
];

const BARS = [42, 61, 38, 74, 55, 88, 100];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const BOOKINGS = [
  { guest: "Adaeze O.", room: "Deluxe Suite · 3 nights",  amount: "₦87,000",  status: "Confirmed" },
  { guest: "Emeka T.",  room: "Standard Room · 1 night",  amount: "₦24,500",  status: "Checked in" },
];

// ── component ─────────────────────────────────────────────────────────────────

export default function VendorOnboardingSection() {
  return (
    <section className="relative bg-[#F8F7FB] py-24 md:py-36 overflow-hidden border-t border-[#EDEAF5]">

      {/* Ambient glow — top right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 w-[560px] h-[560px] rounded-full"
        style={{
          background: "radial-gradient(circle at 70% 30%, rgba(124,58,237,0.07) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_480px] gap-16 xl:gap-24 items-start">

          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="vendor-left flex flex-col">

            {/* Headline */}
            <h2
              className="text-[clamp(2.25rem,4.8vw,3.5rem)] leading-[1.06] mb-6"
              style={{ letterSpacing: "-0.025em" }}
            >
              <span className="font-fraunces font-medium italic block" style={{ color: "#7C3AED" }}>
                Your business.
              </span>
              <span className="font-bricolage font-semibold text-[#1A0D4D] block">
                More customers.
              </span>
              <span className="font-bricolage font-semibold block" style={{ color: "#7B75A1" }}>
                Less friction.
              </span>
            </h2>

            {/* Sub-copy */}
            <p className="font-bricolage text-[1rem] md:text-[1.0625rem] text-[#4A4665] max-w-[46ch] leading-relaxed mb-12">
              BookHushly connects verified Nigerian businesses to guests and
              clients across{" "}
              <span className="text-[#1A0D4D] font-medium">
                Lagos, Abuja, Port Harcourt, Kano, Ibadan and beyond
              </span>
              . One application. One dashboard. Real revenue.
            </p>

            {/* Numbered benefits */}
            <ol className="mb-12 border-t border-[#EDEAF5]" aria-label="Vendor benefits">
              {BENEFITS.map((b, i) => (
                <li
                  key={b.index}
                  className={`vendor-benefit-${i + 1} grid grid-cols-[3rem_1fr] gap-4 py-6 border-b border-[#EDEAF5] group`}
                >
                  <span className="font-mono text-[12px] text-violet-500 pt-[3px] tabular-nums">
                    {b.index}
                  </span>
                  <div>
                    <p className="font-bricolage font-semibold text-[#1A0D4D] text-[0.9375rem] mb-1 group-hover:text-violet-700 transition-colors duration-200">
                      {b.title}
                    </p>
                    <p className="font-bricolage text-[0.875rem] text-[#4A4665] leading-relaxed">
                      {b.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bricolage font-semibold text-[0.9375rem] px-8 py-3.5 rounded-xl transition-colors duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.3)]"
              >
                Apply as a vendor
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <span className="font-bricolage text-[0.8125rem] text-[#7B75A1]">
                Free to join · No listing fees
              </span>
            </div>
          </div>

          {/* ── RIGHT COLUMN — Dashboard mockup ─────────────────────────── */}
          <div className="vendor-right lg:sticky lg:top-28 flex flex-col gap-3">

            {/* Main dashboard card */}
            <div className="rounded-2xl border border-[#EDEAF5] bg-white shadow-[0_4px_32px_rgba(26,13,77,0.08)] overflow-hidden">

              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#EDEAF5] bg-[#F7F6FA]">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                <span className="ml-3 font-mono text-[11px] text-[#C4BDD8] tracking-wider">
                  bookhushly.com/vendor/dashboard
                </span>
              </div>

              <div className="p-5">

                {/* Vendor identity */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center text-violet-700 text-sm font-mono font-bold shrink-0">
                    LK
                  </div>
                  <div>
                    <p className="font-bricolage font-semibold text-[#1A0D4D] text-sm leading-none mb-1">
                      Lakeview Hotel &amp; Suites
                    </p>
                    <div className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-bricolage text-[11px] text-emerald-700 tracking-wide">
                        Verified vendor
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-2 mb-5">
                  {STATS.map((stat, i) => (
                    <div
                      key={stat.label}
                      className={`vendor-stat-${i + 1} flex items-center justify-between px-4 py-3.5 rounded-xl bg-[#F7F6FA] border border-[#EDEAF5]`}
                    >
                      <span className="font-bricolage text-[13px] text-[#6B6987]">{stat.label}</span>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-semibold text-[#1A0D4D] tabular-nums">
                          {stat.value}
                        </span>
                        <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded-md tabular-nums ${stat.positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                          {stat.delta}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Revenue bar chart */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bricolage text-[11px] text-[#9E98BB] uppercase tracking-widest">
                      Revenue — last 7 days
                    </span>
                    <span className="font-mono text-[11px] text-violet-600">₦ NGN</span>
                  </div>

                  {/*
                    Bars use CSS scaleY animation via .vendor-bar-N classes.
                    transform-origin: bottom — set inline to avoid Tailwind purging.
                    animation-timeline:view() in globals.css drives the grow-up effect.
                  */}
                  <div className="flex items-end gap-1.5 h-14">
                    {BARS.map((pct, i) => (
                      <div
                        key={i}
                        className={`vendor-bar-${i + 1} flex-1 rounded-t-sm ${i === 6 ? "bg-violet-600" : "bg-violet-200"}`}
                        style={{ height: `${pct}%`, transformOrigin: "bottom" }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  <div className="flex justify-between mt-1.5">
                    {DAYS.map((d) => (
                      <span key={d} className="flex-1 text-center font-mono text-[10px] text-[#C4BDD8]">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recent bookings */}
                <div>
                  <span className="font-bricolage text-[11px] text-[#9E98BB] uppercase tracking-widest block mb-2.5">
                    Recent bookings
                  </span>
                  <div className="space-y-2">
                    {BOOKINGS.map((booking, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#F7F6FA] border border-[#EDEAF5]"
                      >
                        <div>
                          <p className="font-bricolage text-[13px] font-semibold text-[#1A0D4D] leading-none mb-0.5">
                            {booking.guest}
                          </p>
                          <p className="font-bricolage text-[11px] text-[#9E98BB]">{booking.room}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-[13px] font-semibold text-[#1A0D4D] leading-none mb-0.5">
                            {booking.amount}
                          </p>
                          <span className="font-bricolage text-[11px] text-emerald-700">
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* AI listing pill */}
            <div className="vendor-pill flex items-start gap-3 px-4 py-3.5 rounded-xl border border-violet-200 bg-violet-50">
              <div className="w-7 h-7 shrink-0 rounded-lg bg-violet-100 flex items-center justify-center mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" strokeWidth={1.6} />
              </div>
              <div>
                <p className="font-bricolage text-[13px] font-semibold text-violet-700 leading-none mb-1">
                  AI listing generated
                </p>
                <p className="font-bricolage text-[12px] text-[#6B6987] leading-snug">
                  "Lakeview Deluxe Suite" — professional copy written in 8 seconds.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
