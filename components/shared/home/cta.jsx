// Server component — no "use client", no Framer Motion.
// Dark section — mirrors How It Works to bookend the page visually.
// Centered layout (every other section is left-aligned — this deliberate
// shift signals "end of page, time to act").
// Scroll entry: animation-timeline:view() via .cta-* classes in globals.css.

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const TRUST = [
  "KYC-verified vendors",
  "Naira & crypto accepted",
  "AI support 24 / 7",
];

export default function CTA() {
  return (
    <section className="relative bg-[#0F0A28] overflow-hidden py-28 md:py-40 lg:py-48">

      {/*
        Two tight violet glows — left and right — not a wide ambient wash.
        They add depth without turning the section into a gradient background.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 65%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 w-[440px] h-[440px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 sm:px-10 text-center">

        {/*
          ── Headline ───────────────────────────────────────────────────────
          All Fraunces italic — this is the one place on the page where the
          full headline is in Fraunces, not split. The closing statement
          deserves the most expressive type treatment.
          "Anywhere" in violet so the geographic claim lands with emphasis.
        */}
        <div className="cta-headline">
          <h2
            className="font-fraunces italic text-white leading-[1.04] tracking-tight text-balance"
            style={{ fontSize: "clamp(2.8rem, 7.5vw, 6.5rem)" }}
          >
            Book anything.{" "}
            <span style={{ color: "#A78BFA" }}>Anywhere</span>
            <br className="hidden sm:block" />
            {" "}in Nigeria.
          </h2>
        </div>

        {/* Divider */}
        <div
          className="cta-divider mx-auto mt-12 mb-12 h-px max-w-xs"
          style={{ background: "rgba(255,255,255,0.08)" }}
          aria-hidden="true"
        />

        {/*
          ── Sub-copy ───────────────────────────────────────────────────────
          Single sentence. Everything the user needs to know at this point
          has already been covered above — this just confirms the decision.
        */}
        <p className="cta-body font-bricolage text-[1rem] md:text-[1.0625rem] leading-relaxed max-w-[44ch] mx-auto mb-10" style={{ color: "rgba(255,255,255,0.55)" }}>
          Hotels, serviced apartments, events, logistics, security — every vendor verified. Pay in Naira or crypto.
        </p>

        {/* ── CTAs ─────────────────────────────────────────────────────── */}
        <div className="cta-buttons flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
          <Link
            href="/services"
            className="group inline-flex items-center gap-2.5 h-[3.375rem] px-9 bg-violet-600 hover:bg-violet-500 text-white font-bricolage font-semibold text-[0.9375rem] rounded-xl transition-all duration-200 shadow-[0_4px_24px_rgba(124,58,237,0.4)]"
          >
            Explore services
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center h-[3.375rem] px-9 font-bricolage font-semibold text-[0.9375rem] rounded-xl transition-all duration-200"
            style={{
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.75)",
            }}
            onMouseEnter={undefined}
          >
            List your business
          </Link>
        </div>

        {/* ── Trust signals ─────────────────────────────────────────────── */}
        <ul
          className="cta-trust flex flex-wrap items-center justify-center gap-y-2"
          style={{ columnGap: "1.75rem" }}
          aria-label="Platform guarantees"
        >
          {TRUST.map((signal, i) => (
            <li
              key={signal}
              className="flex items-center gap-2 font-bricolage text-[0.8125rem] uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="hidden sm:inline-block w-1 h-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                />
              )}
              {signal}
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
