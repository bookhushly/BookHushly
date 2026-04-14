"use client";

import { motion } from "framer-motion";
import {
  MessageCircle,
  Search,
  FileText,
  Star,
  BarChart2,
  Sparkles,
  ArrowUpRight,
  Cpu,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Utility: typing cursor blink
// ─────────────────────────────────────────────────────────────────────────────

function Cursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      className="inline-block w-[1.5px] h-[0.85em] bg-white/50 ml-0.5 align-middle"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mini UI: Card chrome wrapper — gives every preview a "real product" feel
// ─────────────────────────────────────────────────────────────────────────────

function CardChrome({ children, title, statusDot, className = "" }) {
  return (
    <div
      className={`mt-6 rounded-xl overflow-hidden border border-white/[0.07] bg-gray-900/70 ${className}`}
    >
      {/* Window title bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06] bg-white/[0.02]">
        <span className="w-2 h-2 rounded-full bg-rose-500/50" />
        <span className="w-2 h-2 rounded-full bg-amber-500/50" />
        <span className="w-2 h-2 rounded-full bg-emerald-500/50" />
        <span className="flex-1 text-center text-[9px] font-mono text-white/20 tracking-wider">
          {title}
        </span>
        {statusDot && (
          <span className="flex items-center gap-1.5">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            />
            <span className="text-[8px] font-mono text-emerald-400/60 tracking-wider">
              LIVE
            </span>
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mini UI previews
// ─────────────────────────────────────────────────────────────────────────────

function NoraChatPreview() {
  const messages = [
    {
      role: "user",
      text: "Can I pay for the VI apartment with crypto?",
    },
    {
      role: "nora",
      text: "Yes — BTC, ETH, USDT and more via NOWPayments. Confirms automatically once the transaction settles on-chain. Usually 10–30 min.",
    },
    {
      role: "user",
      text: "Which wallet do I send to?",
    },
  ];

  return (
    <CardChrome title="nora.bookhushly.com" statusDot>
      <div className="p-3 space-y-2.5 max-h-[200px] overflow-hidden">
        {/* Nora header strip */}
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.05] mb-1">
          <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/25 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-violet-400" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-white/70 font-mono">
              Nora
            </div>
            <div className="text-[8px] text-emerald-400/60 font-mono tracking-wider">
              AI · Online
            </div>
          </div>
        </div>

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`text-[10px] font-mono leading-relaxed max-w-[82%] px-3 py-2 rounded-xl ${
                msg.role === "user"
                  ? "bg-violet-600/20 border border-violet-500/20 text-violet-100 rounded-tr-sm"
                  : "bg-white/[0.05] border border-white/[0.07] text-white/55 rounded-tl-sm"
              }`}
            >
              {msg.text}
              {msg.role === "nora" && i === messages.length - 2 && (
                <span className="ml-1 opacity-50">[typing…]</span>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        <div className="flex justify-start">
          <div className="bg-white/[0.05] border border-white/[0.07] rounded-xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1.5">
            {[0, 0.15, 0.3].map((delay, i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay }}
                className="w-1 h-1 rounded-full bg-white/30"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1.5">
          <span className="flex-1 text-[9px] font-mono text-white/20">
            Ask anything about your booking…
          </span>
          <div className="w-4 h-4 rounded bg-violet-500/20 border border-violet-500/25 flex items-center justify-center">
            <ArrowUpRight className="w-2.5 h-2.5 text-violet-400" />
          </div>
        </div>
      </div>
    </CardChrome>
  );
}

function SearchPreview() {
  return (
    <CardChrome title="search · parse-query">
      <div className="p-3">
        {/* Search input mockup */}
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-lg px-2.5 py-2 mb-3">
          <Search className="w-3 h-3 text-white/25 shrink-0" />
          <span className="text-[10px] font-mono text-white/45">
            ₦50k serviced apartment vi lagos
          </span>
          <Cursor />
        </div>

        {/* Arrow separator */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[8px] font-mono text-white/20 tracking-widest uppercase">
            extracted
          </span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        {/* Parsed tags */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "type", value: "Serviced Apt", color: "violet" },
            { label: "city", value: "Lagos", color: "sky" },
            { label: "area", value: "VI", color: "emerald" },
            { label: "max", value: "₦50,000", color: "amber" },
          ].map(({ label, value, color }) => {
            const colors = {
              violet:
                "bg-violet-500/10 border-violet-500/20 text-violet-300",
              sky: "bg-sky-500/10 border-sky-500/20 text-sky-300",
              emerald:
                "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
              amber: "bg-amber-500/10 border-amber-500/20 text-amber-300",
            };
            return (
              <span
                key={label}
                className={`flex items-center gap-1 ${colors[color]} border rounded-full text-[9px] font-mono px-2 py-0.5`}
              >
                <span className="opacity-50">{label}:</span>
                {value}
              </span>
            );
          })}
        </div>

        {/* Result count */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.05] flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-emerald-400" />
          <span className="text-[8px] font-mono text-white/25">
            23 listings matched · sorted by relevance
          </span>
        </div>
      </div>
    </CardChrome>
  );
}

function ListingPreview() {
  return (
    <CardChrome title="listing-generator · v2">
      <div className="p-3">
        {/* Input section */}
        <div className="mb-2">
          <div className="text-[8px] font-mono text-white/20 tracking-widest uppercase mb-1.5">
            vendor input
          </div>
          <div className="flex flex-wrap gap-1">
            {["Hotel", "Port Harcourt", "₦35k/night", "Pool · Wi-Fi"].map(
              (tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-mono bg-white/[0.04] border border-white/[0.07] text-white/35 rounded-md px-2 py-0.5"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>

        {/* Processing bar */}
        <div className="flex items-center gap-1.5 py-2">
          <div className="h-px flex-1 bg-gradient-to-r from-violet-500/20 via-violet-400/40 to-transparent" />
          <Cpu className="w-2.5 h-2.5 text-violet-400/50" strokeWidth={1.5} />
          <div className="h-px flex-1 bg-gradient-to-l from-violet-500/20 via-violet-400/40 to-transparent" />
        </div>

        {/* Output */}
        <div>
          <div className="text-[8px] font-mono text-amber-400/50 tracking-widest uppercase mb-1.5">
            ai generated
          </div>
          <div className="text-white/80 text-sm font-medium leading-snug mb-1.5">
            &ldquo;Riverside Comfort Hotel — Serene PH Retreat&rdquo;
          </div>
          <p className="text-[9px] font-mono text-white/25 leading-relaxed line-clamp-2">
            Nestled in the Garden City, this fully-managed property delivers
            comfort and speed — ideal for business travel and weekend
            escapes alike…
          </p>
        </div>
      </div>
    </CardChrome>
  );
}

function ReviewsPreview() {
  const pros = [
    "Spotless rooms, staff went above and beyond",
    "Quiet neighbourhood, easy VI access",
  ];
  const cons = ["Parking gets tight on weekends"];

  return (
    <CardChrome title="review-summarizer · 14 sources">
      <div className="p-3">
        {/* Source count bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center"
              >
                <Star
                  className="w-1.5 h-1.5 text-amber-400/60"
                  fill="currentColor"
                  strokeWidth={0}
                />
              </div>
            ))}
          </div>
          <span className="text-[8px] font-mono text-white/25">
            Distilled from 14 verified reviews
          </span>
        </div>

        <div className="space-y-1.5">
          {pros.map((text, i) => (
            <div key={i} className="flex items-start gap-2 text-[10px]">
              <span className="mt-0.5 shrink-0 w-3.5 h-3.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-[8px] font-bold text-emerald-400">
                +
              </span>
              <span className="font-mono text-white/45 leading-snug">
                {text}
              </span>
            </div>
          ))}
          {cons.map((text, i) => (
            <div key={i} className="flex items-start gap-2 text-[10px]">
              <span className="mt-0.5 shrink-0 w-3.5 h-3.5 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-[8px] font-bold text-amber-400">
                −
              </span>
              <span className="font-mono text-white/45 leading-snug">
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* Confidence bar */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.05]">
          <div className="flex items-center justify-between text-[8px] font-mono mb-1">
            <span className="text-white/20 tracking-wider">CONFIDENCE</span>
            <span className="text-emerald-400/60">92%</span>
          </div>
          <div className="h-0.5 bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "92%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
              className="h-full bg-gradient-to-r from-emerald-500/60 to-emerald-400/40 rounded-full"
            />
          </div>
        </div>
      </div>
    </CardChrome>
  );
}

function InsightsPreview() {
  const insights = [
    {
      dot: "bg-violet-400",
      label: "Revenue",
      text: "Your Abuja listing drove 34% more revenue this week — promote it.",
    },
    {
      dot: "bg-amber-400",
      label: "Bookings",
      text: "6 pending bookings are at risk of expiry — confirm them now.",
    },
    {
      dot: "bg-emerald-400",
      label: "Listings",
      text: "Event listings drive 60% of revenue. Add another date.",
    },
  ];

  return (
    <CardChrome title="vendor-insights · weekly">
      <div className="p-3">
        {/* Mini metric row */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {[
            { val: "₦284k", lbl: "revenue" },
            { val: "+18%", lbl: "vs last wk" },
            { val: "91%", lbl: "fill rate" },
          ].map(({ val, lbl }) => (
            <div
              key={lbl}
              className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-1.5 text-center"
            >
              <div className="text-[11px] font-mono font-semibold text-white/70">
                {val}
              </div>
              <div className="text-[7px] font-mono text-white/20 tracking-wider uppercase mt-0.5">
                {lbl}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {insights.map((item, i) => (
            <div key={i} className="flex gap-2 items-start text-[9px]">
              <span
                className={`mt-1 shrink-0 w-1.5 h-1.5 rounded-full ${item.dot}`}
              />
              <span className="font-mono text-white/40 leading-relaxed">
                <span className="text-white/60 font-semibold">
                  {item.label}:{" "}
                </span>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </CardChrome>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Audience pill
// ─────────────────────────────────────────────────────────────────────────────

function AudiencePill({ tag }) {
  const isGuest = tag === "guests";
  return (
    <span
      className={`text-[8px] font-semibold font-mono px-2 py-0.5 rounded-full uppercase tracking-widest border ${
        isGuest
          ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
      }`}
    >
      {isGuest ? "guests" : "vendors"}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature index strip (above grid)
// ─────────────────────────────────────────────────────────────────────────────

const INDEX_ITEMS = [
  { n: "01", label: "Nora · AI Support" },
  { n: "02", label: "Natural Language Search" },
  { n: "03", label: "Listing Generator" },
  { n: "04", label: "Review Summarizer" },
  { n: "05", label: "Vendor Insights" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Feature cards data
// ─────────────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    id: "nora",
    index: "01",
    icon: MessageCircle,
    label: "AI Support",
    audience: ["guests", "vendors"],
    headline: "Nora knows the answer.",
    body: "Our AI assistant handles booking questions, payment options, and service details — any hour. She understands Paystack, NOWPayments crypto flows, and the Nigerian hospitality landscape by design.",
    Preview: NoraChatPreview,
    gridClass: "md:col-span-2 md:row-span-1",
    accentColor: "violet",
  },
  {
    id: "search",
    index: "02",
    icon: Search,
    label: "Natural Language Search",
    audience: ["guests"],
    headline: "Search the way you think.",
    body: "Type a sentence. The platform extracts category, city, price range, and area — no dropdowns, no filters to configure.",
    Preview: SearchPreview,
    gridClass: "md:col-span-1 md:row-span-1",
    accentColor: "sky",
  },
  {
    id: "listing",
    index: "03",
    icon: FileText,
    label: "Listing Generator",
    audience: ["vendors"],
    headline: "Describe it once.",
    body: "Provide category, location, and price. AI drafts a polished, market-ready title and description for the Nigerian audience in seconds.",
    Preview: ListingPreview,
    gridClass: "md:col-span-1 md:row-span-1",
    accentColor: "amber",
  },
  {
    id: "reviews",
    index: "04",
    icon: Star,
    label: "Review Summarizer",
    audience: ["guests"],
    headline: "20 reviews, one read.",
    body: "Before you commit, get a clean pros and cons breakdown distilled from verified guest feedback — no scrolling through pages of opinions.",
    Preview: ReviewsPreview,
    gridClass: "md:col-span-1 md:row-span-1",
    accentColor: "emerald",
  },
  {
    id: "insights",
    index: "05",
    icon: BarChart2,
    label: "Vendor Insights",
    audience: ["vendors"],
    headline: "Your data, explained.",
    body: "Revenue trends, cancellation patterns, top-earning listings — surfaced as three concrete actions you can take this week.",
    Preview: InsightsPreview,
    gridClass: "md:col-span-1 md:row-span-1",
    accentColor: "rose",
  },
];

// Accent classes per feature
const ACCENT = {
  violet: {
    glow: "before:from-violet-600/[0.06]",
    border: "group-hover:border-violet-500/20",
    line: "via-violet-500/40",
    icon: "bg-violet-500/10 border-violet-500/15 text-violet-400",
  },
  sky: {
    glow: "before:from-sky-600/[0.06]",
    border: "group-hover:border-sky-500/20",
    line: "via-sky-500/40",
    icon: "bg-sky-500/10 border-sky-500/15 text-sky-400",
  },
  amber: {
    glow: "before:from-amber-600/[0.06]",
    border: "group-hover:border-amber-500/20",
    line: "via-amber-500/40",
    icon: "bg-amber-500/10 border-amber-500/15 text-amber-400",
  },
  emerald: {
    glow: "before:from-emerald-600/[0.06]",
    border: "group-hover:border-emerald-500/20",
    line: "via-emerald-500/40",
    icon: "bg-emerald-500/10 border-emerald-500/15 text-emerald-400",
  },
  rose: {
    glow: "before:from-rose-600/[0.06]",
    border: "group-hover:border-rose-500/20",
    line: "via-rose-500/40",
    icon: "bg-rose-500/10 border-rose-500/15 text-rose-400",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Individual feature card
// ─────────────────────────────────────────────────────────────────────────────

function FeatureCard({ feat, delay }) {
  const Icon = feat.icon;
  const { Preview } = feat;
  const accent = ACCENT[feat.accentColor];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      className={`${feat.gridClass} group relative flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.04] transition-colors duration-500 overflow-hidden p-5`}
    >
      {/* Subtle corner gradient on hover */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-gradient-to-br ${accent.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
      />

      {/* Top row: icon + index + audience */}
      <div className="relative flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-lg border ${accent.icon} flex items-center justify-center`}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
          </div>
          <span className="text-[9px] font-mono text-white/20 tracking-widest">
            {feat.index}
          </span>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {feat.audience.map((tag) => (
            <AudiencePill key={tag} tag={tag} />
          ))}
        </div>
      </div>

      {/* Label */}
      <div className="relative text-[8px] uppercase tracking-[0.22em] text-white/20 font-mono font-semibold mb-1.5">
        {feat.label}
      </div>

      {/* Headline */}
      <h3 className="relative font-fraunces font-medium italic text-white text-xl md:text-[1.35rem] leading-snug mb-2">
        {feat.headline}
      </h3>

      {/* Body */}
      <p className="relative text-[13px] text-white/38 leading-relaxed">
        {feat.body}
      </p>

      {/* Preview — fills remaining vertical space */}
      <div className="relative flex-1 min-h-0">
        <Preview />
      </div>

      {/* Hover accent line at bottom */}
      <div
        aria-hidden
        className={`absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent ${accent.line} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-600`}
      />
    </motion.article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────────────────────────────────────

export default function AIFeaturesSection() {
  return (
    <section className="bg-gray-950 py-20 md:py-32 relative overflow-hidden">
      {/* Noise grain — matches hero */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="ai-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.72"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ai-grain)" />
      </svg>

      {/* Fine dot grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.018] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Top edge separator */}
      <div
        aria-hidden
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
      />

      <div className="relative z-10 container mx-auto px-6 lg:px-10">
        {/* ── Header block ── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 md:mb-16"
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-7">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/[0.07]">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-violet-400"
              />
              <span className="text-[10px] font-mono font-medium tracking-[0.18em] uppercase text-violet-400">
                Powered by Claude AI
              </span>
            </div>
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-violet-500/20 to-transparent" />
          </div>

          {/* Headline + description split layout */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-16">
            <div className="max-w-2xl">
              <h2 className="text-[clamp(2rem,5vw,3.5rem)] leading-[1.06] tracking-tight">
                <span className="font-fraunces font-medium italic text-white">
                  Intelligence
                </span>
                <span className="font-bricolage font-light text-white">
                  {" "}woven into
                </span>
                <br />
                <span className="font-bricolage font-light text-white/40">
                  every booking moment.
                </span>
              </h2>
            </div>

            <div className="max-w-sm lg:pb-1">
              <p className="text-[13px] md:text-sm text-white/38 leading-relaxed">
                Not a chatbot bolted on after the fact. AI embedded into
                search, listings, reviews, and vendor tools — built around
                the Nigerian market.
              </p>

              {/* Feature index strip */}
              <div className="mt-5 space-y-1">
                {INDEX_ITEMS.map(({ n, label }, i) => (
                  <motion.div
                    key={n}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      ease: "easeOut",
                      delay: 0.1 + i * 0.06,
                    }}
                    className="flex items-center gap-2.5"
                  >
                    <span className="text-[8px] font-mono text-white/15 w-5 tabular-nums">
                      {n}
                    </span>
                    <div className="w-3 h-px bg-white/[0.1]" />
                    <span className="text-[11px] font-mono text-white/30">
                      {label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Bento grid ── */}
        {/*
          Row 1: [Nora — 2col] [Search — 1col]
          Row 2: [Listing — 1col] [Reviews — 1col] [Insights — 1col]
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 auto-rows-auto">
          {/* Nora — spans 2 columns */}
          <FeatureCard feat={FEATURES[0]} delay={0} />

          {/* Search */}
          <FeatureCard feat={FEATURES[1]} delay={0.08} />

          {/* Listing Generator */}
          <FeatureCard feat={FEATURES[2]} delay={0.12} />

          {/* Review Summarizer */}
          <FeatureCard feat={FEATURES[3]} delay={0.16} />

          {/* Vendor Insights */}
          <FeatureCard feat={FEATURES[4]} delay={0.2} />
        </div>

        {/* ── Footer line ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-10 flex items-center gap-4 text-white/18"
        >
          <div className="h-px w-8 bg-white/[0.08]" />
          <span className="text-[10px] font-mono tracking-wide">
            All AI features are governed by platform feature flags — off by
            default until reviewed by our team.
          </span>
        </motion.div>
      </div>
    </section>
  );
}
