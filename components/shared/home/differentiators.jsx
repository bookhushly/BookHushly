import { ShieldCheck, LayoutGrid, CreditCard, Sparkles } from "lucide-react";

// ── constants ─────────────────────────────────────────────────────────────────

const POINTS = [
  {
    num: "01",
    Icon: ShieldCheck,
    label: "Trust",
    headline: ["Every vendor is", "verified by us."],
    accentIdx: 1,
    body: "Before any vendor can list on BookHushly, we check their government ID and business registration. No strangers, no fake listings — only real, confirmed businesses.",
    tags: ["ID checked", "Business verified", "Human review"],
  },
  {
    num: "02",
    Icon: LayoutGrid,
    label: "Platform",
    headline: ["Five services,", "one account."],
    accentIdx: 0,
    body: "Hotels, serviced apartments, events, logistics, and security — one wallet, one login, one support team. No app-switching. No repeated sign-ups.",
    tags: ["Hotels", "Apartments", "Events", "Logistics", "Security"],
  },
  {
    num: "03",
    Icon: CreditCard,
    label: "Payments",
    headline: ["Pay exactly", "how you want."],
    accentIdx: 1,
    body: "Pay with your Nigerian debit card, bank transfer, USSD — or even cryptocurrency. Your wallet balance carries across every service you book.",
    tags: ["Debit card", "Bank transfer", "USSD", "Crypto"],
  },
  {
    num: "04",
    Icon: Sparkles,
    label: "Smart Features",
    headline: ["Tools that make", "booking easier."],
    accentIdx: 1,
    body: "Just type what you're looking for the way you'd say it. See a quick summary of what guests thought. Get answers to your questions at any time of the day.",
    tags: ["Smart search", "Review summary", "24/7 help"],
  },
];

// ── component ─────────────────────────────────────────────────────────────────
// Server component — no "use client".
// Scroll entrance: CSS animation-timeline:view() in globals.css (.diff-card).
// Browsers without animation-timeline see elements at full opacity (graceful).

export default function Differentiators() {
  return (
    <section className="bg-white py-24 md:py-36 border-t border-[#F0EDF8]">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">

        {/*
          Section header — left-aligned, minimal.
          Two-tone headline: "Built for trust," (dark) + "not for show." (muted)
          No eyebrow label — the context from the hero makes it unnecessary.
        */}
        <div className="diff-header reveal mb-16 md:mb-20 max-w-xl">
          <h2
            className="text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.06] text-[#1A0D4D]"
            style={{ letterSpacing: "-0.025em" }}
          >
            <span className="font-bricolage font-semibold block">Built for trust,</span>
            <span
              className="font-fraunces font-medium italic block"
              style={{ color: "#7C69C4" }}
            >
              not for show.
            </span>
          </h2>
          <p className="mt-5 font-bricolage text-[1rem] leading-relaxed text-[#7B75A1] max-w-[42ch]">
            Four decisions baked into the platform before a single booking is made.
          </p>
        </div>

        {/*
          2 × 2 grid of proof-point cards.
          Each card uses .diff-card for scroll-driven entry animation.
          nth-child delay offsets create a natural stagger without JS.
        */}
        <div className="reveal-stagger grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#F0EDF8] rounded-2xl overflow-hidden ring-1 ring-[#F0EDF8]">
          {POINTS.map(({ num, Icon, label, headline, accentIdx, body, tags }, i) => (
            <div
              key={num}
              className={`diff-card diff-card-${i + 1} relative bg-white p-8 md:p-10 flex flex-col gap-6`}
            >
              {/* Ghost number — background decoration */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-6 top-4 font-bricolage font-bold text-[#1A0D4D] leading-none select-none"
                style={{ fontSize: "clamp(4rem, 7vw, 6rem)", opacity: 0.13 }}
              >
                {num}
              </span>

              {/* Icon + label */}
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 ring-1 ring-violet-100">
                  <Icon className="h-[1.125rem] w-[1.125rem] text-violet-600" strokeWidth={1.6} aria-hidden="true" />
                </span>
                <span className="font-bricolage text-xs font-medium tracking-[0.16em] uppercase text-violet-600">
                  {label}
                </span>
              </div>

              {/* Headline — two lines, accent line in Fraunces italic */}
              <h3
                className="text-[clamp(1.625rem,2.8vw,2.25rem)] leading-[1.08] text-[#1A0D4D]"
                style={{ letterSpacing: "-0.02em" }}
              >
                {headline.map((line, li) =>
                  li === accentIdx ? (
                    <span key={li} className="font-fraunces font-medium italic block">
                      {line}
                    </span>
                  ) : (
                    <span key={li} className="font-bricolage font-semibold block">
                      {line}
                    </span>
                  )
                )}
              </h3>

              {/* Body */}
              <p className="font-bricolage text-[0.9375rem] leading-[1.75] text-[#4A4665] flex-1">
                {body}
              </p>

              {/* Tag pills */}
              <div className="flex flex-wrap gap-1.5" aria-label="Key details">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[#E8E3F4] bg-[#F8F6FF] px-3 py-1 font-bricolage text-[0.6875rem] font-medium tracking-[0.1em] uppercase text-[#7B75A1]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
