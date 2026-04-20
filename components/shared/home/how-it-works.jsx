// Server component — no "use client", no Framer Motion.
// Dark section breaks the white/light page flow — same technique used by
// cal.com and linear.app to create visual rhythm across the landing page.
// Scroll entry: CSS animation-timeline:view() via .hiw-* classes in globals.css.

const STEPS = [
  {
    num: "01",
    label: "Browse",
    headline: ["Search and", "discover."],
    accentIdx: 1,
    body: "Type what you're looking for the way you'd say it — or use filters. Every vendor on the platform has been verified by our team before they can list.",
  },
  {
    num: "02",
    label: "Book",
    headline: ["Confirm and", "pay securely."],
    accentIdx: 1,
    body: "Select your dates, review transparent pricing, and pay instantly — Naira card, bank transfer, USSD, or crypto. Your booking is confirmed in seconds.",
  },
  {
    num: "03",
    label: "Enjoy",
    headline: ["Show up,", "sorted."],
    accentIdx: 1,
    body: "Booking confirmation goes straight to your inbox and dashboard. Our support team is on hand if anything needs attention before or during your stay.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative bg-[#0F0A28] py-24 md:py-36 overflow-hidden">

      {/*
        Subtle ambient glow — not a wide wash but a tight ellipse
        centred in the dark field, adds depth without looking like a gradient.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: "900px",
          height: "600px",
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(124,58,237,0.14) 0%, rgba(124,58,237,0.04) 55%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-10">

        {/*
          ── Header ─────────────────────────────────────────────────────────
          Left-aligned. "Three steps" in Fraunces italic (accent)
          + "to booked." in Bricolage semibold (white).
        */}
        <div className="reveal mb-20 md:mb-28 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2
              className="text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.06]"
              style={{ letterSpacing: "-0.025em" }}
            >
              <span className="font-fraunces font-medium italic block" style={{ color: "#A78BFA" }}>
                Three steps
              </span>
              <span className="font-bricolage font-semibold text-white block">
                to booked.
              </span>
            </h2>
          </div>
          <p
            className="font-bricolage text-[0.9375rem] leading-relaxed max-w-[34ch] md:text-right"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            From search to confirmation in minutes — no back-and-forth, no hidden fees.
          </p>
        </div>

        {/*
          ── Steps — desktop (3 col grid) ───────────────────────────────────
          A 1px separator spans the full width at the "node" row.
          Each column has a hollow node dot sitting on that line.
          No JS required — static structure, scroll entry via CSS.
        */}
        <div className="hidden lg:block reveal">

          {/* Connector rail + nodes */}
          <div className="relative mb-14 grid grid-cols-3">
            {/* The rail line */}
            <div
              className="absolute top-[11px] left-[11px] right-[11px] h-px"
              style={{ background: "rgba(255,255,255,0.1)" }}
              aria-hidden="true"
            />
            {/* Nodes */}
            {STEPS.map((s) => (
              <div key={s.num} className="flex items-center gap-3 first:pl-0 px-8">
                {/* Hollow dot */}
                <span
                  className="relative z-10 inline-block h-[22px] w-[22px] shrink-0 rounded-full ring-2 ring-violet-500 bg-[#0F0A28]"
                  aria-hidden="true"
                >
                  <span className="absolute inset-[4px] rounded-full bg-violet-500/50" />
                </span>
                {/* Step label */}
                <span
                  className="font-mono text-[11px] tracking-[0.22em] uppercase font-medium"
                  style={{ color: "rgba(255,255,255,0.38)" }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="grid grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`hiw-step-${i + 1} relative flex flex-col gap-5 pr-10 ${i > 0 ? "pl-8 border-l border-white/[0.07]" : ""}`}
              >
                {/* Ghost number */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none select-none absolute -top-2 right-6 font-bricolage font-bold leading-none text-white"
                  style={{ fontSize: "clamp(5rem, 8vw, 8rem)", opacity: 0.04 }}
                >
                  {step.num}
                </span>

                {/* Headline */}
                <h3
                  className="text-[clamp(1.5rem,2.4vw,1.875rem)] leading-[1.1]"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {step.headline.map((line, li) =>
                    li === step.accentIdx ? (
                      <span key={li} className="font-fraunces font-medium italic text-white block">
                        {line}
                      </span>
                    ) : (
                      <span key={li} className="font-bricolage font-semibold text-white block">
                        {line}
                      </span>
                    )
                  )}
                </h3>

                {/* Body */}
                <p
                  className="font-bricolage text-[0.9375rem] leading-[1.75] max-w-[30ch]"
                  style={{ color: "rgba(255,255,255,0.52)" }}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/*
          ── Steps — mobile (vertical timeline) ─────────────────────────────
          Left column: vertical line + node dot.
          Right column: label, headline, body.
        */}
        <div className="reveal lg:hidden flex flex-col gap-0">
          {STEPS.map((step, i) => (
            <div key={step.num} className={`hiw-step-${i + 1} flex gap-6 ${i < STEPS.length - 1 ? "pb-14" : ""}`}>

              {/* Timeline spine */}
              <div className="relative flex flex-col items-center w-5 shrink-0">
                {/* Node */}
                <span
                  className="relative z-10 inline-flex h-5 w-5 shrink-0 rounded-full ring-2 ring-violet-500 bg-[#0F0A28] mt-1"
                  aria-hidden="true"
                >
                  <span className="absolute inset-[3px] rounded-full bg-violet-500/50" />
                </span>
                {/* Line below node */}
                {i < STEPS.length - 1 && (
                  <span
                    className="flex-1 w-px mt-2"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col gap-3 pt-0.5">
                <span
                  className="font-mono text-[11px] tracking-[0.22em] uppercase font-medium"
                  style={{ color: "rgba(255,255,255,0.38)" }}
                >
                  {step.label}
                </span>

                <h3
                  className="text-[clamp(1.375rem,5vw,1.625rem)] leading-[1.12]"
                  style={{ letterSpacing: "-0.018em" }}
                >
                  {step.headline.map((line, li) =>
                    li === step.accentIdx ? (
                      <span key={li} className="font-fraunces font-medium italic text-white block">
                        {line}
                      </span>
                    ) : (
                      <span key={li} className="font-bricolage font-semibold text-white block">
                        {line}
                      </span>
                    )
                  )}
                </h3>

                <p
                  className="font-bricolage text-[0.9375rem] leading-[1.75]"
                  style={{ color: "rgba(255,255,255,0.52)" }}
                >
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
