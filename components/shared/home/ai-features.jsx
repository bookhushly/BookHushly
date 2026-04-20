// Server component — no "use client", no Framer Motion.
// Redesigned for average Nigerian users — plain language, real scenarios, no jargon.
// Micro-animations (cursor blink, typing dots, live pulse) are pure CSS @keyframes.

import { MessageCircle, Search, FileText, Star, BarChart2, Sparkles } from "lucide-react";

// ── Cursor blink ───────────────────────────────────────────────────────────────
function Cursor() {
  return (
    <span
      aria-hidden="true"
      className="ai-cursor inline-block w-[1.5px] h-[0.85em] bg-[#6B6987]/50 ml-0.5 align-middle"
    />
  );
}

// ── Preview: Nora chat ─────────────────────────────────────────────────────────
function NoraChatPreview() {
  const messages = [
    { role: "user", text: "Can I pay with my GTBank card?" },
    { role: "nora", text: "Yes! We accept all Nigerian debit cards. Your payment is instant and secure." },
    { role: "user", text: "What if I want to cancel my booking?" },
  ];
  return (
    <div className="mt-5 rounded-xl overflow-hidden border border-[#EDEAF5] bg-[#F7F6FA]">
      {/* Chat header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#EDEAF5] bg-white">
        <div className="w-7 h-7 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-violet-600" strokeWidth={1.5} />
        </div>
        <div>
          <div className="font-bricolage text-sm font-semibold text-[#1A0D4D] leading-none">Nora</div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="ai-live-dot w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-bricolage text-[11px] text-emerald-700">Online now</span>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-2.5 max-h-[180px] overflow-hidden">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`font-bricolage text-[13px] leading-relaxed max-w-[85%] px-3 py-2 rounded-xl ${
                msg.role === "user"
                  ? "bg-violet-600 text-white rounded-tr-sm"
                  : "bg-white border border-[#EDEAF5] text-[#4A4665] rounded-tl-sm shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {/* Typing indicator */}
        <div className="flex justify-start">
          <div className="bg-white border border-[#EDEAF5] rounded-xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1.5 shadow-sm">
            <span className="ai-typing-dot w-1 h-1 rounded-full bg-[#C4BDD8]" style={{ animationDelay: "0s" }} />
            <span className="ai-typing-dot w-1 h-1 rounded-full bg-[#C4BDD8]" style={{ animationDelay: "0.15s" }} />
            <span className="ai-typing-dot w-1 h-1 rounded-full bg-[#C4BDD8]" style={{ animationDelay: "0.3s" }} />
          </div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 bg-white border border-[#EDEAF5] rounded-lg px-3 py-2 shadow-sm">
          <span className="flex-1 font-bricolage text-[13px] text-[#C4BDD8]">Type your question…</span>
        </div>
      </div>
    </div>
  );
}

// ── Preview: Smart search ──────────────────────────────────────────────────────
function SearchPreview() {
  const tags = [
    { label: "Type",     value: "Apartment",  color: "bg-violet-50 border-violet-200 text-violet-700" },
    { label: "City",     value: "Lagos",      color: "bg-sky-50 border-sky-200 text-sky-700" },
    { label: "Area",     value: "Lekki",      color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
    { label: "Budget",   value: "₦50,000",    color: "bg-amber-50 border-amber-200 text-amber-700" },
  ];
  return (
    <div className="mt-5 rounded-xl overflow-hidden border border-[#EDEAF5] bg-[#F7F6FA]">
      <div className="p-3">
        {/* Search input */}
        <div className="flex items-center gap-2 bg-white border border-[#EDEAF5] rounded-lg px-3 py-2.5 mb-3 shadow-sm">
          <Search className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          <span className="font-bricolage text-[13px] text-[#4A4665]">apartment in lekki lagos around 50k</span>
          <Cursor />
        </div>

        {/* Result tags */}
        <p className="font-bricolage text-[11px] text-[#9E98BB] mb-2">We understood your search as:</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map(({ label, value, color }) => (
            <span key={label} className={`flex items-center gap-1 ${color} border rounded-full font-bricolage text-[12px] px-2.5 py-0.5`}>
              <span className="opacity-60">{label}:</span>
              <span className="font-medium">{value}</span>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2.5 border-t border-[#EDEAF5]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="font-bricolage text-[13px] text-[#6B6987]">26 listings found — best matches first</span>
        </div>
      </div>
    </div>
  );
}

// ── Preview: Listing writer ────────────────────────────────────────────────────
function ListingPreview() {
  return (
    <div className="mt-5 rounded-xl overflow-hidden border border-[#EDEAF5] bg-[#F7F6FA]">
      <div className="p-3 space-y-3">
        {/* What vendor typed */}
        <div>
          <p className="font-bricolage text-[11px] font-medium text-[#9E98BB] uppercase tracking-wider mb-1.5">
            What you told us
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["Hotel", "Port Harcourt", "₦35k/night", "Pool, Wi-Fi"].map((tag) => (
              <span key={tag} className="font-bricolage text-[12px] bg-white border border-[#EDEAF5] text-[#6B6987] rounded-md px-2 py-0.5 shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Divider with arrow */}
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-violet-100 to-transparent" />
          <span className="font-bricolage text-[11px] text-violet-400">✦ written for you</span>
          <div className="h-px flex-1 bg-gradient-to-l from-violet-100 to-transparent" />
        </div>

        {/* Generated listing */}
        <div className="bg-white border border-[#EDEAF5] rounded-lg p-3 shadow-sm">
          <p className="font-bricolage text-sm font-semibold text-[#1A0D4D] mb-1.5">
            "Riverside Comfort Hotel — Your Peaceful Retreat in Port Harcourt"
          </p>
          <p className="font-bricolage text-[12px] text-[#6B6987] leading-relaxed line-clamp-2">
            Tucked away in the heart of the Garden City, Riverside Comfort Hotel offers a calm escape with modern amenities — perfect for business trips and weekend getaways alike…
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Preview: Review summary ────────────────────────────────────────────────────
function ReviewsPreview() {
  const pros = ["Clean rooms — staff were friendly and helpful", "Great location, easy to get around from here"];
  const cons = ["Parking can be tight on busy weekends"];
  return (
    <div className="mt-5 rounded-xl overflow-hidden border border-[#EDEAF5] bg-[#F7F6FA]">
      <div className="p-3">
        <p className="font-bricolage text-[11px] font-medium text-[#9E98BB] uppercase tracking-wider mb-3">
          What guests are saying
        </p>
        <div className="space-y-2">
          {pros.map((text, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-600 text-[11px]">✓</span>
              <span className="font-bricolage text-[13px] text-[#4A4665] leading-snug">{text}</span>
            </div>
          ))}
          {cons.map((text, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-amber-600 text-[11px]">!</span>
              <span className="font-bricolage text-[13px] text-[#4A4665] leading-snug">{text}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2.5 border-t border-[#EDEAF5]">
          <span className="font-bricolage text-[12px] text-[#9E98BB]">
            Summary from verified guest reviews
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Preview: Business insights ─────────────────────────────────────────────────
function InsightsPreview() {
  const metrics = [
    { val: "₦284k", lbl: "Earned this month" },
    { val: "+18%",  lbl: "More than last week" },
    { val: "38",    lbl: "Rooms booked" },
  ];
  const insights = [
    { dot: "bg-violet-500", text: "Your Abuja listing is your best performer this week — consider promoting it." },
    { dot: "bg-amber-500",  text: "6 bookings haven't been confirmed yet — confirm them before they expire." },
    { dot: "bg-emerald-500", text: "Add another event date — event listings are bringing in 60% of your revenue." },
  ];
  return (
    <div className="mt-5 rounded-xl overflow-hidden border border-[#EDEAF5] bg-[#F7F6FA]">
      <div className="p-3">
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {metrics.map(({ val, lbl }) => (
            <div key={lbl} className="bg-white border border-[#EDEAF5] rounded-lg p-2 text-center shadow-sm">
              <div className="font-bricolage text-sm font-bold text-[#1A0D4D] leading-none">{val}</div>
              <div className="font-bricolage text-[10px] text-[#9E98BB] mt-1 leading-tight">{lbl}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {insights.map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className={`mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full ${item.dot}`} />
              <span className="font-bricolage text-[12px] text-[#4A4665] leading-relaxed">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Feature data ───────────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: "nora",
    Icon: MessageCircle,
    label: "Always available",
    headline: "Get answers any time of the day.",
    body: "Have a question about your booking at midnight? Just ask Nora. She knows everything about your reservation, payment options, and how the platform works — instantly.",
    Preview: NoraChatPreview,
    span: "md:col-span-2",
    accent: { icon: "bg-violet-50 border-violet-200 text-violet-600", top: "via-violet-400" },
  },
  {
    id: "search",
    Icon: Search,
    label: "Smart search",
    headline: "Search the way you talk.",
    body: "No complicated forms or filters to figure out. Just type what you're looking for the way you'd say it to a friend, and we'll find the right matches.",
    Preview: SearchPreview,
    span: "md:col-span-1",
    accent: { icon: "bg-sky-50 border-sky-200 text-sky-600", top: "via-sky-400" },
  },
  {
    id: "listing",
    Icon: FileText,
    label: "For business owners",
    headline: "Describe it once. We write the rest.",
    body: "Not sure how to write a listing that attracts customers? Just tell us the basics — location, type, and price — and we'll write a professional description for you in seconds.",
    Preview: ListingPreview,
    span: "md:col-span-1",
    accent: { icon: "bg-amber-50 border-amber-200 text-amber-600", top: "via-amber-400" },
  },
  {
    id: "reviews",
    Icon: Star,
    label: "Review summary",
    headline: "Know what guests really think.",
    body: "Instead of reading through pages of reviews, we pull out the most important things guests liked — and what they didn't — so you can decide in seconds.",
    Preview: ReviewsPreview,
    span: "md:col-span-1",
    accent: { icon: "bg-emerald-50 border-emerald-200 text-emerald-600", top: "via-emerald-400" },
  },
  {
    id: "insights",
    Icon: BarChart2,
    label: "For business owners",
    headline: "Know exactly what's working.",
    body: "We track your bookings and tell you — in plain language — which of your listings is earning the most, what to do more of, and what needs your attention today.",
    Preview: InsightsPreview,
    span: "md:col-span-1",
    accent: { icon: "bg-rose-50 border-rose-200 text-rose-600", top: "via-rose-400" },
  },
];

// ── Feature card ───────────────────────────────────────────────────────────────
function FeatureCard({ feat, cardClass }) {
  const { Icon, Preview } = feat;
  return (
    <article
      className={`${feat.span} ${cardClass} group relative flex flex-col rounded-2xl border border-[#EDEAF5] bg-white p-5 overflow-hidden hover:shadow-[0_4px_28px_rgba(26,13,77,0.08)] transition-shadow duration-300`}
    >
      {/* Top accent on hover */}
      <div
        aria-hidden="true"
        className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent ${feat.accent.top} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Icon + label */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`p-1.5 rounded-lg border ${feat.accent.icon} flex items-center justify-center`}>
          <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
        </div>
        <span className="font-bricolage text-[12px] font-medium text-[#9E98BB] uppercase tracking-wider">
          {feat.label}
        </span>
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
        <div className="reveal mb-14 md:mb-16">

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-50 mb-7">
            <span className="ai-live-dot w-1.5 h-1.5 rounded-full bg-violet-500" />
            <span className="font-bricolage text-[13px] font-medium text-violet-700">
              Smart features built in
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-16">
            <div className="max-w-2xl">
              <h2
                className="text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.06]"
                style={{ letterSpacing: "-0.025em" }}
              >
                <span className="font-bricolage font-semibold text-[#1A0D4D] block">Tools that make</span>
                <span className="font-fraunces font-medium italic block" style={{ color: "#7C69C4" }}>
                  your life easier.
                </span>
              </h2>
            </div>

            <div className="max-w-sm lg:pb-1">
              <p className="font-bricolage text-[0.9375rem] text-[#4A4665] leading-relaxed">
                Whether you're looking for a place to stay or running a business, these features help you get more done — without the stress.
              </p>
            </div>
          </div>
        </div>

        {/*
          Bento grid:
          Row 1: [Nora — 2col] [Search — 1col]
          Row 2: [Listing — 1col] [Reviews — 1col] [Insights — 1col]
        */}
        <div className="reveal-stagger grid grid-cols-1 md:grid-cols-3 gap-3">
          <FeatureCard feat={FEATURES[0]} cardClass="ai-card-1" />
          <FeatureCard feat={FEATURES[1]} cardClass="ai-card-2" />
          <FeatureCard feat={FEATURES[2]} cardClass="ai-card-3" />
          <FeatureCard feat={FEATURES[3]} cardClass="ai-card-4" />
          <FeatureCard feat={FEATURES[4]} cardClass="ai-card-5" />
        </div>

      </div>
    </section>
  );
}
