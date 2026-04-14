"use client";

import { motion } from "framer-motion";
import Link from "next/link";

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
    body: "Describe your service in plain language. Our AI generates professional, SEO-optimised listing copy that converts browsers into bookers.",
  },
  {
    index: "04",
    title: "One dashboard, every service",
    body: "Hotels, apartments, events, logistics, security — manage them all from a single vendor dashboard with unified analytics.",
  },
];

const STATS = [
  { label: "Earned this month", value: "₦1,240,000", delta: "+18%", positive: true },
  { label: "New bookings", value: "47", delta: "+12 this week", positive: true },
  { label: "Average rating", value: "4.9 ★", delta: "98% satisfaction", positive: true },
];

const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan"];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const fadeRight = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function VendorOnboardingSection() {
  return (
    <section className="relative bg-gray-950 py-20 md:py-32 overflow-hidden">
      {/* Subtle noise texture overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Accent glow — top-right, very subtle */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 w-[520px] h-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(124,58,237,0.13) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] gap-16 xl:gap-24 items-start">

          {/* ── LEFT COLUMN ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="flex flex-col"
          >
            {/* Eyebrow */}
            <motion.span
              variants={fadeRight}
              className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-violet-400 mb-6"
            >
              <span className="h-px w-8 bg-violet-500" />
              For vendors
            </motion.span>

            {/* Headline */}
            <motion.h2
              variants={fadeRight}
              className="text-[clamp(2.1rem,4.8vw,3.5rem)] leading-[1.07] font-medium text-white mb-6"
            >
              <span className="font-fraunces font-medium italic text-violet-300">
                Your business.
              </span>
              <br />
              <span className="font-bricolage text-white">More customers.</span>
              <br />
              <span className="font-bricolage text-white/30">Less friction.</span>
            </motion.h2>

            {/* Sub-copy */}
            <motion.p
              variants={fadeRight}
              className="font-bricolage text-base md:text-lg text-white/50 max-w-[480px] leading-relaxed mb-12"
            >
              Bookhushly connects verified Nigerian businesses to guests and
              clients across{" "}
              <span className="text-white/75">
                {CITIES.join(", ")} and beyond
              </span>
              . One application. One dashboard. Real revenue.
            </motion.p>

            {/* Numbered benefits */}
            <motion.ol
              variants={containerVariants}
              className="space-y-0 mb-12 border-t border-white/[0.07]"
            >
              {BENEFITS.map((benefit) => (
                <motion.li
                  key={benefit.index}
                  variants={fadeRight}
                  className="grid grid-cols-[3rem_1fr] gap-4 py-6 border-b border-white/[0.07] group"
                >
                  <span className="font-mono text-xs text-violet-500 pt-[3px] tabular-nums">
                    {benefit.index}
                  </span>
                  <div>
                    <p className="font-bricolage font-medium text-white text-base mb-1 group-hover:text-violet-300 transition-colors duration-200">
                      {benefit.title}
                    </p>
                    <p className="font-bricolage text-sm text-white/40 leading-relaxed">
                      {benefit.body}
                    </p>
                  </div>
                </motion.li>
              ))}
            </motion.ol>

            {/* CTA row */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bricolage font-medium text-sm px-7 py-3.5 rounded-full transition-colors duration-200"
              >
                Apply as a vendor
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <span className="font-bricolage text-xs text-white/30 tracking-wide">
                Free to join · No listing fees
              </span>
            </motion.div>
          </motion.div>

          {/* ── RIGHT COLUMN — Dashboard mockup ── */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="lg:sticky lg:top-28 flex flex-col gap-3"
          >
            {/* Main dashboard card */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.03]">
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <span className="ml-3 font-mono text-[10px] text-white/20 tracking-wider">
                  bookhushly.com/vendor/dashboard
                </span>
              </div>

              <div className="p-5">
                {/* Vendor identity row */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-violet-600/30 flex items-center justify-center text-violet-300 text-sm font-mono font-bold">
                    LK
                  </div>
                  <div>
                    <p className="font-bricolage font-medium text-white/90 text-sm leading-none mb-0.5">
                      Lakeview Hotel & Suites
                    </p>
                    <div className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="font-bricolage text-[10px] text-emerald-400/80 tracking-wide">
                        Verified vendor
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-1 gap-2 mb-5">
                  {STATS.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.35 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                      className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.05]"
                    >
                      <span className="font-bricolage text-xs text-white/40">
                        {stat.label}
                      </span>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-semibold text-white tabular-nums">
                          {stat.value}
                        </span>
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md tabular-nums ${
                            stat.positive
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {stat.delta}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Mini revenue bar chart */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bricolage text-[11px] text-white/30 uppercase tracking-widest">
                      Revenue — last 7 days
                    </span>
                    <span className="font-mono text-[10px] text-violet-400">
                      ₦ NGN
                    </span>
                  </div>
                  <div className="flex items-end gap-1.5 h-14">
                    {[42, 61, 38, 74, 55, 88, 100].map((pct, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t-sm bg-violet-600/30"
                        style={{ height: `${pct}%` }}
                        initial={{ scaleY: 0, originY: 1 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: 0.5 + i * 0.06,
                          duration: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        {i === 6 && (
                          <div className="w-full h-full rounded-t-sm bg-violet-500/70" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1.5">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <span
                        key={d}
                        className="flex-1 text-center font-mono text-[9px] text-white/20"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recent booking row */}
                <div>
                  <span className="font-bricolage text-[11px] text-white/30 uppercase tracking-widest block mb-2.5">
                    Recent bookings
                  </span>
                  <div className="space-y-2">
                    {[
                      { guest: "Adaeze O.", room: "Deluxe Suite · 3 nights", amount: "₦87,000", status: "Confirmed" },
                      { guest: "Emeka T.", room: "Standard Room · 1 night", amount: "₦24,500", status: "Checked in" },
                    ].map((booking, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]"
                      >
                        <div>
                          <p className="font-bricolage text-xs font-medium text-white/75 leading-none mb-0.5">
                            {booking.guest}
                          </p>
                          <p className="font-bricolage text-[10px] text-white/30">
                            {booking.room}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xs text-white/80 leading-none mb-0.5">
                            {booking.amount}
                          </p>
                          <span className="font-bricolage text-[9px] text-emerald-400/70">
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI listing pill — floats below the card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-violet-500/20 bg-violet-500/[0.06]"
            >
              <div className="w-7 h-7 shrink-0 rounded-lg bg-violet-600/25 flex items-center justify-center mt-0.5">
                <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div>
                <p className="font-bricolage text-xs font-medium text-violet-300 leading-none mb-1">
                  AI listing generated
                </p>
                <p className="font-bricolage text-[11px] text-white/35 leading-snug">
                  "Lakeview Deluxe Suite" — professional copy written in 8 seconds.
                </p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
