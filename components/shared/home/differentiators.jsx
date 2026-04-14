"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, LayoutGrid, CreditCard, Sparkles } from "lucide-react";

const PROOF_POINTS = [
  {
    num: "01",
    icon: ShieldCheck,
    eyebrow: "Trust infrastructure",
    headline: ["Every vendor is", "KYC-verified."],
    accentLine: 1,
    body: "NIN and CAC documents are reviewed before any listing goes live. No anonymous operators, no unverified services — every name on this platform has been checked by a human.",
    detail: "NIN · CAC · Manual review",
  },
  {
    num: "02",
    icon: LayoutGrid,
    eyebrow: "Platform depth",
    headline: ["Five services,", "one account."],
    accentLine: 0,
    body: "Hotels, serviced apartments, events, logistics, and security — one wallet, one login, one support team. No app-switching. No repeated sign-ups. Everything tracked in one place.",
    detail: "Hotels · Apartments · Events · Logistics · Security",
  },
  {
    num: "03",
    icon: CreditCard,
    eyebrow: "Payment rails",
    headline: ["Pay the", "Nigerian way."],
    accentLine: 1,
    body: "Naira cards, bank transfer, USSD, or crypto (BTC, ETH, USDT). Your internal wallet balance carries across every service and can be topped up at any time.",
    detail: "Paystack · NOWPayments · Wallet",
  },
  {
    num: "04",
    icon: Sparkles,
    eyebrow: "AI layer",
    headline: ["AI that", "understands context."],
    accentLine: 0,
    body: "Type \"₦50k apartment VI Lagos\" and every search filter is extracted automatically. Review summaries, vendor insights, and a 24/7 support assistant — built for this market.",
    detail: "Search · Summaries · Support",
  },
];

const ease = [0.22, 1, 0.36, 1];

function ProofRow({ point, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const Icon = point.icon;
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.01 }}
      className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-0 py-14 md:py-16 border-b border-[#EDEAF5] last:border-b-0"
    >
      {/* ── Architectural number — far left or far right on desktop ── */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -24 : 24 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.9, ease }}
        className={`hidden lg:flex items-center ${isEven ? "justify-start" : "justify-end order-last"}`}
      >
        <span
          className="font-bricolage font-bold text-[#1A0D4D] leading-none select-none tracking-tight"
          style={{ fontSize: "clamp(5.5rem, 9vw, 8rem)", opacity: 0.055 }}
        >
          {point.num}
        </span>
      </motion.div>

      {/* ── Divider line — desktop only ── */}
      <div className="hidden lg:flex justify-center">
        <motion.div
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ duration: 0.6, ease, delay: 0.2 }}
          className="w-px h-28 bg-[#EDEAF5] origin-top"
        />
      </div>

      {/* ── Content block ── */}
      <div className={`flex flex-col gap-5 ${isEven ? "lg:pr-16 xl:pr-24" : "lg:pl-16 xl:pl-24 lg:order-first"}`}>

        {/* Eyebrow + icon row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease, delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-violet-50 border border-violet-100/80 shrink-0">
            <Icon className="w-4 h-4 text-violet-600" strokeWidth={1.6} />
          </div>
          <span className="text-xs font-medium tracking-[0.18em] uppercase text-violet-600 font-bricolage">
            {point.eyebrow}
          </span>
          {/* Mobile number */}
          <span
            className="lg:hidden ml-auto font-bricolage font-bold text-[#1A0D4D] leading-none select-none"
            style={{ fontSize: "2.25rem", opacity: 0.08 }}
          >
            {point.num}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h3
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: 0.17 }}
          className="text-[clamp(1.75rem,3.2vw,2.6rem)] leading-[1.05] text-[#1A0D4D] font-medium"
          style={{ letterSpacing: "-0.02em" }}
        >
          {point.headline.map((line, li) =>
            li === point.accentLine ? (
              <span key={li} className="font-fraunces font-medium italic block">
                {line}
              </span>
            ) : (
              <span key={li} className="font-bricolage block">
                {line}
              </span>
            )
          )}
        </motion.h3>

        {/* Body + detail row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease, delay: 0.26 }}
          className="flex flex-col gap-4"
        >
          <p className="text-[0.9375rem] text-[#6B6987] leading-[1.72] font-bricolage max-w-[46ch]">
            {point.body}
          </p>
          <div className="inline-flex items-center gap-2 self-start">
            <span className="h-px w-5 bg-[#C4BDE0]" />
            <span className="text-[0.6875rem] font-bricolage font-medium tracking-[0.14em] uppercase text-[#9E98BB]">
              {point.detail}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Differentiators() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  return (
    <section className="bg-white py-20 md:py-32">
      <div className="container mx-auto px-6 lg:px-10">

        {/* ── Section header ── */}
        <div ref={headerRef} className="mb-0">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease }}
            className="flex items-center gap-8 mb-14 md:mb-16"
          >
            <div className="flex flex-col gap-4 max-w-lg">
              <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-violet-600 font-bricolage">
                <span className="h-px w-8 bg-violet-500" />
                What sets us apart
              </span>
              <h2
                className="text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.08] font-medium text-[#1A0D4D]"
                style={{ letterSpacing: "-0.025em" }}
              >
                <span className="font-fraunces font-medium italic">Different</span>
                <span className="font-bricolage"> by design,</span>
                <br />
                <span className="font-bricolage text-[#1A0D4D]/40">not by accident.</span>
              </h2>
            </div>

            {/* Rule line — decorative, desktop only */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={headerInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.1, ease, delay: 0.3 }}
              className="hidden md:block flex-1 h-px bg-gradient-to-r from-[#EDEAF5] to-transparent origin-left"
            />
          </motion.div>
        </div>

        {/* ── Proof point rows ── */}
        <div>
          {PROOF_POINTS.map((point, i) => (
            <ProofRow key={point.num} point={point} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
