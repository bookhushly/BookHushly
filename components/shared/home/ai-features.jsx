// Server component — no "use client", no Framer Motion.
// All micro-animations (cursor blink, typing dots, live pulse, bar fill)
// are pure CSS @keyframes defined in globals.css.
// Card entrance: CSS animation-timeline:view() via .ai-card-* classes.

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

// ── Cursor blink ───────────────────────────────────────────────────────────────
// .ai-cursor defined in globals.css: opacity 1→0→1 at 0.9s infinite
function Cursor() {
  return (
    <span
      aria-hidden="true"
      className="ai-cursor inline-block w-[1.5px] h-[0.85em] bg-[#6B6987]/50 ml-0.5 align-middle"
    />
  );
}

// ── Window chrome ──────────────────────────────────────────────────────────────
function CardChrome({ children, title, statusDot, className = "" }) {
  return (
    <div className={`mt-5 rounded-xl overflow-hidden border border-[#EDEAF5] bg-[#F7F6FA] ${className}`}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#EDEAF5] bg-white">
        <span className="w-2 h-2 rounded-full bg-rose-400/60" />
        <span className="w-2 h-2 rounded-full bg-amber-400/60" />
        <span className="w-2 h-2 rounded-full bg-emerald-400/60" />
        <span className="flex-1 text-center text-[12px] font-mono text-[#C4BDD8] tracking-wider">
          {title}
        </span>
        {statusDot && (
          <span className="flex items-center gap-1.5">
            {/* .ai-live-dot: opacity pulse in globals.css */}
            <span className="ai-live-dot w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[13px] font-mono text-emerald-700/70 tracking-wider">LIVE</span>
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Audience pill ──────────────────────────────────────────────────────────────
function AudiencePill({ tag }) {
  return (
    <span
      className={`text-[13px] font-semibold font-mono px-2 py-0.5 rounded-full uppercase tracking-widest border ${
        tag === "guests"
          ? "bg-violet-50 border-violet-200 text-violet-700"
          : "bg-amber-50 border-amber-200 text-amber-700"
      }`}
    >
      {tag}
    </span>
  );
}

// ── Preview: Nora chat ─────────────────────────────────────────────────────────
function NoraChatPreview() {
  const messages = [
    { role: "user", text: "Can I pay for the VI apartment with crypto?" },
    { role: "nora", text: "Yes — BTC, ETH, USDT and more via NOWPayments. Confirms automatically once the transaction settles on-chain." },
    { role: "user", text: "Which wallet do I send to?" },
  ];
  return (
    <CardChrome title="nora.bookhushly.com" statusDot>
      <div className="p-3 space-y-2.5 max-h-[200px] overflow-hidden">
        <div className="flex items-center gap-2 pb-2 border-b border-[#EDEAF5] mb-1">
          <div className="w-6 h-6 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-violet-600" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-[#1A0D4D] font-mono">Nora</div>
            <div className="text-[13px] text-emerald-700/60 font-mono tracking-wider">AI · Online</div>
          </div>
        </div>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`text-[13px] font-mono leading-relaxed max-w-[82%] px-3 py-2 rounded-xl ${
                msg.role === "user"
                  ? "bg-violet-600 text-white rounded-tr-sm"
                  : "bg-white border border-[#EDEAF5] text-[#6B6987] rounded-tl-sm shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {/* Typing indicator — .ai-typing-dot bounces via CSS in globals.css */}
        <div className="flex justify-start">
          <div className="bg-white border border-[#EDEAF5] rounded-xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1.5 shadow-sm">
            <span className="ai-typing-dot w-1 h-1 rounded-full bg-[#C4BDD8]" style={{ animationDelay: "0s" }} />
            <span className="ai-typing-dot w-1 h-1 rounded-full bg-[#C4BDD8]" style={{ animationDelay: "0.15s" }} />
            <span className="ai-typing-dot w-1 h-1 rounded-full bg-[#C4BDD8]" style={{ animationDelay: "0.3s" }} />
          </div>
        </div>
      </div>
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 bg-white border border-[#EDEAF5] rounded-lg px-2.5 py-1.5 shadow-sm">
          <span className="flex-1 text-[12px] font-mono text-[#C4BDD8]">Ask anything about your booking…</span>
          <div className="w-4 h-4 rounded bg-violet-100 border border-violet-200 flex items-center justify-center">
            <ArrowUpRight className="w-2.5 h-2.5 text-violet-600" />
          </div>
        </div>
      </div>
    </CardChrome>
  );
}

// ── Preview: Natural language search ──────────────────────────────────────────
function SearchPreview() {
  const tags = [
    { label: "type",  value: "Serviced Apt", color: "bg-violet-50 border-violet-200 text-violet-700" },
    { label: "city",  value: "Lagos",         color: "bg-sky-50 border-sky-200 text-sky-700" },
    { label: "area",  value: "VI",             color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
    { label: "max",   value: "₦50,000",       color: "bg-amber-50 border-amber-200 text-amber-700" },
  ];
  return (
    <CardChrome title="search · parse-query">
      <div className="p-3">
        <div className="flex items-center gap-2 bg-white border border-[#EDEAF5] rounded-lg px-2.5 py-2 mb-3 shadow-sm">
          <Search className="w-3 h-3 text-[#C4BDD8] shrink-0" />
          <span className="text-[13px] font-mono text-[#6B6987]">₦50k serviced apartment vi lagos</span>
          <Cursor />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-[#EDEAF5]" />
          <span className="text-[13px] font-mono text-[#C4BDD8] tracking-widest uppercase">extracted</span>
          <div className="h-px flex-1 bg-[#EDEAF5]" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map(({ label, value, color }) => (
            <span key={label} className={`flex items-center gap-1 ${color} border rounded-full text-[12px] font-mono px-2 py-0.5`}>
              <span className="opacity-60">{label}:</span>{value}
            </span>
          ))}
        </div>
        <div className="mt-3 pt-2.5 border-t border-[#EDEAF5] flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-emerald-500" />
          <span className="text-[13px] font-mono text-[#9E98BB]">23 listings matched · sorted by relevance</span>
        </div>
      </div>
    </CardChrome>
  );
}

// ── Preview: Listing generator ─────────────────────────────────────────────────
function ListingPreview() {
  return (
    <CardChrome title="listing-generator · v2">
      <div className="p-3">
        <div className="mb-2">
          <div className="text-[13px] font-mono text-[#9E98BB] tracking-widest uppercase mb-1.5">vendor input</div>
          <div className="flex flex-wrap gap-1">
            {["Hotel", "Port Harcourt", "₦35k/night", "Pool · Wi-Fi"].map((tag) => (
              <span key={tag} className="text-[12px] font-mono bg-white border border-[#EDEAF5] text-[#6B6987] rounded-md px-2 py-0.5 shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5 py-2">
          <div className="h-px flex-1 bg-gradient-to-r from-violet-100 via-violet-300/50 to-transparent" />
          <Cpu className="w-2.5 h-2.5 text-violet-400" strokeWidth={1.5} />
          <div className="h-px flex-1 bg-gradient-to-l from-violet-100 via-violet-300/50 to-transparent" />
        </div>
        <div>
          <div className="text-[13px] font-mono text-amber-600/70 tracking-widest uppercase mb-1.5">ai generated</div>
          <div className="text-[#1A0D4D] text-sm font-medium leading-snug mb-1.5">
            &ldquo;Riverside Comfort Hotel — Serene PH Retreat&rdquo;
          </div>
          <p className="text-[12px] font-mono text-[#9E98BB] leading-relaxed line-clamp-2">
            Nestled in the Garden City, this fully-managed property delivers comfort and speed — ideal for business travel and weekend escapes alike…
          </p>
        </div>
      </div>
    </CardChrome>
  );
}

// ── Preview: Review summarizer ─────────────────────────────────────────────────
function ReviewsPreview() {
  const pros = ["Spotless rooms, staff went above and beyond", "Quiet neighbourhood, easy VI access"];
  const cons = ["Parking gets tight on weekends"];
  return (
    <CardChrome title="review-summarizer · 14 sources">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Star className="w-1.5 h-1.5 text-amber-500" fill="currentColor" strokeWidth={0} />
              </div>
            ))}
          </div>
          <span className="text-[13px] font-mono text-[#9E98BB]">Distilled from 14 verified reviews</span>
        </div>
        <div className="space-y-1.5">
          {pros.map((text, i) => (
            <div key={i} className="flex items-start gap-2 text-[13px]">
              <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[11px] font-bold text-emerald-600">+</span>
              <span className="font-mono text-[#6B6987] leading-snug">{text}</span>
            </div>
          ))}
          {cons.map((text, i) => (
            <div key={i} className="flex items-start gap-2 text-[13px]">
              <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[11px] font-bold text-amber-600">−</span>
              <span className="font-mono text-[#6B6987] leading-snug">{text}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2.5 border-t border-[#EDEAF5]">
          <div className="flex items-center justify-between text-[13px] font-mono mb-1">
            <span className="text-[#C4BDD8] tracking-wider">CONFIDENCE</span>
            <span className="text-emerald-700">92%</span>
          </div>
          <div className="h-0.5 bg-[#EDEAF5] rounded-full overflow-hidden">
            {/* .ai-bar-fill: width 0→92% on scroll via animation-timeline:view() */}
            <div className="ai-bar-fill h-full bg-gradient-to-r from-emerald-400 to-emerald-500/70 rounded-full" />
          </div>
        </div>
      </div>
    </CardChrome>
  );
}

// ── Preview: Vendor insights ───────────────────────────────────────────────────
function InsightsPreview() {
  const metrics = [
    { val: "₦284k", lbl: "revenue" },
    { val: "+18%",  lbl: "vs last wk" },
    { val: "91%",   lbl: "fill rate" },
  ];
  const insights = [
    { dot: "bg-violet-500", label: "Revenue",  text: "Your Abuja listing drove 34% more revenue this week — promote it." },
    { dot: "bg-amber-500",  label: "Bookings", text: "6 pending bookings are at risk of expiry — confirm them now." },
    { dot: "bg-emerald-500",label: "Listings", text: "Event listings drive 60% of revenue. Add another date." },
  ];
  return (
    <CardChrome title="vendor-insights · weekly">
      <div className="p-3">
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {metrics.map(({ val, lbl }) => (
            <div key={lbl} className="bg-white border border-[#EDEAF5] rounded-lg p-1.5 text-center shadow-sm">
              <div className="text-[13px] font-mono font-semibold text-[#1A0D4D]">{val}</div>
              <div className="text-[13px] font-mono text-[#9E98BB] tracking-wider uppercase mt-0.5">{lbl}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {insights.map((item, i) => (
            <div key={i} className="flex gap-2 items-start text-[12px]">
              <span className={`mt-1 shrink-0 w-1.5 h-1.5 rounded-full ${item.dot}`} />
              <span className="font-mono text-[#6B6987] leading-relaxed">
                <span className="text-[#1A0D4D] font-semibold">{item.label}: </span>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </CardChrome>
  );
}

// ── Feature data ───────────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: "nora",    index: "01", Icon: MessageCircle, label: "AI Support",
    audience: ["guests", "vendors"],
    headline: "Nora knows the answer.",
    body: "Our AI assistant handles booking questions, payment options, and service details — any hour. Understands Paystack, NOWPayments, and the Nigerian hospitality landscape by design.",
    Preview: NoraChatPreview,
    span: "md:col-span-2",
    accent: { icon: "bg-violet-50 border-violet-200 text-violet-600", bar: "via-violet-400" },
  },
  {
    id: "search",  index: "02", Icon: Search,       label: "Natural Language Search",
    audience: ["guests"],
    headline: "Search the way you think.",
    body: "Type a sentence. The platform extracts category, city, price range, and neighbourhood — no dropdowns, no filters to configure.",
    Preview: SearchPreview,
    span: "md:col-span-1",
    accent: { icon: "bg-sky-50 border-sky-200 text-sky-600", bar: "via-sky-400" },
  },
  {
    id: "listing", index: "03", Icon: FileText,     label: "Listing Generator",
    audience: ["vendors"],
    headline: "Describe it once.",
    body: "Provide category, location, and price. AI drafts a polished, market-ready title and description for the Nigerian audience in seconds.",
    Preview: ListingPreview,
    span: "md:col-span-1",
    accent: { icon: "bg-amber-50 border-amber-200 text-amber-600", bar: "via-amber-400" },
  },
  {
    id: "reviews", index: "04", Icon: Star,         label: "Review Summarizer",
    audience: ["guests"],
    headline: "20 reviews, one read.",
    body: "Before you commit, get a clean pros/cons breakdown distilled from verified guest feedback — no scrolling through pages of opinions.",
    Preview: ReviewsPreview,
    span: "md:col-span-1",
    accent: { icon: "bg-emerald-50 border-emerald-200 text-emerald-600", bar: "via-emerald-400" },
  },
  {
    id: "insights",index: "05", Icon: BarChart2,    label: "Vendor Insights",
    audience: ["vendors"],
    headline: "Your data, explained.",
    body: "Revenue trends, cancellation patterns, top-earning listings — surfaced as three concrete actions you can take this week.",
    Preview: InsightsPreview,
    span: "md:col-span-1",
    accent: { icon: "bg-rose-50 border-rose-200 text-rose-600", bar: "via-rose-400" },
  },
];

const INDEX = FEATURES.map(({ index, label }) => ({ index, label }));

// ── Feature card ───────────────────────────────────────────────────────────────
function FeatureCard({ feat, cardClass }) {
  const { Icon, Preview } = feat;
  return (
    <article
      className={`${feat.span} ${cardClass} group relative flex flex-col rounded-2xl border border-[#EDEAF5] bg-white p-5 overflow-hidden hover:shadow-[0_4px_28px_rgba(26,13,77,0.08)] transition-shadow duration-400`}
    >
      {/* Top accent line on hover */}
      <div
        aria-hidden="true"
        className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent ${feat.accent.bar} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Icon + index + audience */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border ${feat.accent.icon} flex items-center justify-center`}>
            <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
          </div>
          <span className="text-[12px] font-mono text-[#C4BDD8] tracking-widest">{feat.index}</span>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {feat.audience.map((tag) => <AudiencePill key={tag} tag={tag} />)}
        </div>
      </div>

      <div className="text-[13px] uppercase tracking-[0.22em] text-[#C4BDD8] font-mono font-semibold mb-1.5">
        {feat.label}
      </div>

      <h3 className="font-fraunces font-medium italic text-[#1A0D4D] text-xl leading-snug mb-2">
        {feat.headline}
      </h3>

      <p className="font-bricolage text-[13px] text-[#4A4665] leading-relaxed">
        {feat.body}
      </p>

      <div className="flex-1 min-h-0">
        <Preview />
      </div>
    </article>
  );
}

// ── Section ────────────────────────────────────────────────────────────────────
export default function AIFeaturesSection() {
  return (
    <section className="bg-white py-24 md:py-36 border-t border-[#EDEAF5] relative overflow-hidden">

      <div className="relative mx-auto max-w-6xl px-6 lg:px-10">

        {/* ── Header ── */}
        <div className="ai-header mb-14 md:mb-16">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-50 mb-7">
            <span className="ai-live-dot w-1.5 h-1.5 rounded-full bg-violet-500" />
            <span className="text-[13px] font-mono font-medium tracking-[0.18em] uppercase text-violet-700">
              AI-Powered Platform
            </span>
          </div>

          {/* Headline + sidebar */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-16">
            <div className="max-w-2xl">
              <h2
                className="text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.06]"
                style={{ letterSpacing: "-0.025em" }}
              >
                <span className="font-bricolage font-semibold text-[#1A0D4D] block">Intelligence woven</span>
                <span className="font-fraunces font-medium italic block" style={{ color: "#7C69C4" }}>
                  into every moment.
                </span>
              </h2>
            </div>

            <div className="max-w-sm lg:pb-1 flex flex-col gap-5">
              <p className="font-bricolage text-[0.9375rem] text-[#4A4665] leading-relaxed">
                Not a chatbot bolted on. AI embedded into search, listings, reviews, and vendor tools — built around the Nigerian market.
              </p>

              {/* Feature index */}
              <ul className="space-y-1.5" aria-label="AI features list">
                {INDEX.map(({ index, label }) => (
                  <li key={index} className="flex items-center gap-2.5">
                    <span className="text-[12px] font-mono text-[#9E98BB] w-5 tabular-nums">{index}</span>
                    <span className="h-px w-3 bg-[#D4CFF0]" aria-hidden="true" />
                    <span className="font-bricolage text-[12px] text-[#6B6987]">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/*
          ── Bento grid ──────────────────────────────────────────────────────
          Row 1: [Nora — 2col] [Search — 1col]
          Row 2: [Listing — 1col] [Reviews — 1col] [Insights — 1col]
          Each card has its own .ai-card-N class for staggered scroll entry.
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FeatureCard feat={FEATURES[0]} cardClass="ai-card-1" />
          <FeatureCard feat={FEATURES[1]} cardClass="ai-card-2" />
          <FeatureCard feat={FEATURES[2]} cardClass="ai-card-3" />
          <FeatureCard feat={FEATURES[3]} cardClass="ai-card-4" />
          <FeatureCard feat={FEATURES[4]} cardClass="ai-card-5" />
        </div>

        {/* Footer note */}
        <div className="ai-footer mt-10 flex items-center gap-4">
          <div className="h-px w-8 bg-[#D4CFF0]" />
          <span className="font-bricolage text-[13px] text-[#6B6987]">
            All AI features are governed by platform feature flags — reviewed by our team before going live.
          </span>
        </div>

      </div>
    </section>
  );
}
