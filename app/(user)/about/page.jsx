// Server Component — no "use client"
// Typography: font-fraunces italic for expressive lines, font-bricolage for body/UI
// Colors: #1A0D4D (deep navy), #4A4665 (muted), violet-600 accent, #EDEAF5 borders
// Sections alternate: white → #F8F7FB → white → #F8F7FB → dark CTA
// Scroll entry: .reveal / .reveal-stagger via PageReveal (IntersectionObserver, fire-once)

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Shield,
  Users,
  Zap,
  Heart,
  CheckCircle,
} from "lucide-react";
import PageReveal from "@/components/common/page-reveal";

export const metadata = {
  title: "About BookHushly — Nigeria's #1 Hospitality Platform",
  description:
    "The story behind BookHushly — Nigeria's leading platform to book hotels, apartments, events, logistics and security services. Our mission, values, and the team behind it all.",
  alternates: { canonical: "https://bookhushly.com/about" },
  openGraph: {
    title: "About BookHushly",
    description:
      "The story behind Nigeria's leading hospitality and services booking platform.",
    url: "https://bookhushly.com/about",
  },
};

// ── data ──────────────────────────────────────────────────────────────────────


const VALUES = [
  {
    index: "01",
    Icon: Shield,
    title: "Trust & Verification",
    body: "Every vendor submits NIN and CAC documents before their listing goes live. No anonymous operators — only verified Nigerian businesses.",
  },
  {
    index: "02",
    Icon: Users,
    title: "Community First",
    body: "We exist to connect Nigerian businesses with the people who need them. Not to extract value from either side — just to make the match.",
  },
  {
    index: "03",
    Icon: Zap,
    title: "Built for Nigeria",
    body: "Naira payments, local addresses, Nigerian phone numbers. Every product decision starts with what actually works here, not a Western template.",
  },
  {
    index: "04",
    Icon: Heart,
    title: "Relentless Quality",
    body: "Ratings and reviews keep vendors accountable. Low-performing listings are reviewed and removed. Standards only go up.",
  },
];

const TEAM = [
  {
    initials: "AS",
    name: "Adebanjo Samson",
    role: "CEO & Founder",
    image: "/team/ceo.jpg",
    bio: "Passionate about connecting African businesses with the customers they deserve, through technology built for the continent.",
  },
  {
    initials: "DA",
    name: "Aboderin Daniel",
    role: "Software Architect",
    image: "/team/daniel.jpeg",
    bio: "Built BookHushly from scratch — every line of code, every system, every integration. Passionate about crafting software that solves real problems for real people.",
  },
];

const CHECKLIST = [
  "KYC-verified vendors on every listing",
  "Naira & cryptocurrency payments",
  "Hotels, apartments, events, logistics, security",
  "AI-generated listing copy",
  "24/7 support chatbot",
];

// ── component ─────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <PageReveal />
      <div className="flex flex-col">

        {/* ── 1. Hero ───────────────────────────────────────────────────── */}
        <section className="relative bg-white overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
          {/* Ambient violet glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)",
            }}
          />

          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <div className="reveal">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-violet-500 mb-8">
                Made in Nigeria · Built for Africa
              </p>
              <h1
                className="leading-[1.04] tracking-tight text-balance mb-6"
                style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)" }}
              >
                <span className="font-fraunces font-medium italic block" style={{ color: "#7C3AED" }}>
                  One platform
                </span>
                <span className="font-bricolage font-semibold text-[#1A0D4D] block">
                  for every service
                </span>
                <span className="font-bricolage font-semibold block" style={{ color: "#7B75A1" }}>
                  in Nigeria.
                </span>
              </h1>
              <p className="font-bricolage text-[1.0625rem] text-[#4A4665] max-w-[52ch] mx-auto leading-relaxed">
                BookHushly connects travelers and customers with verified hotels,
                apartments, event organizers, logistics operators, and security
                providers across Nigeria.
              </p>
            </div>
          </div>
        </section>

        {/* ── 2. Mission ────────────────────────────────────────────────── */}
        <section className="bg-white py-24 md:py-36 border-b border-[#EDEAF5]">
          <div className="mx-auto max-w-5xl px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

              {/* Left — copy */}
              <div className="reveal reveal-left">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-violet-500 mb-6">
                  Our Mission
                </p>
                <h2
                  className="leading-[1.06] mb-6"
                  style={{
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    letterSpacing: "-0.025em",
                  }}
                >
                  <span className="font-bricolage font-semibold text-[#1A0D4D] block">
                    Simplifying service
                  </span>
                  <span
                    className="font-fraunces font-medium italic block"
                    style={{ color: "#7C69C4" }}
                  >
                    discovery in Nigeria.
                  </span>
                </h2>
                <p className="font-bricolage text-[1rem] text-[#4A4665] leading-relaxed mb-5 max-w-[46ch]">
                  Finding quality, reliable services in Nigeria was unnecessarily
                  hard. BookHushly exists to change that — one verified vendor
                  at a time.
                </p>
                <p className="font-bricolage text-[0.9375rem] text-[#4A4665] leading-relaxed max-w-[46ch]">
                  Every Nigerian business deserves to reach customers beyond their
                  street. Every customer deserves to find what they need without
                  the guesswork.
                </p>
              </div>

              {/* Right — feature checklist */}
              <div className="reveal reveal-right">
                <div className="rounded-2xl border border-[#EDEAF5] bg-[#F8F7FB] overflow-hidden">
                  {CHECKLIST.map((item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-4 px-6 py-5 ${
                        i < CHECKLIST.length - 1 ? "border-b border-[#EDEAF5]" : ""
                      }`}
                    >
                      <CheckCircle
                        className="w-4 h-4 text-emerald-500 shrink-0"
                        strokeWidth={2}
                      />
                      <span className="font-bricolage text-[0.9375rem] text-[#1A0D4D]">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Values ─────────────────────────────────────────────────── */}
        <section className="bg-[#F8F7FB] py-24 md:py-36 border-b border-[#EDEAF5]">
          <div className="mx-auto max-w-5xl px-6 lg:px-10">

            {/* Header */}
            <div className="reveal mb-14">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-violet-500 mb-4">
                What we stand for
              </p>
              <h2
                className="leading-[1.06]"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  letterSpacing: "-0.025em",
                }}
              >
                <span className="font-bricolage font-semibold text-[#1A0D4D] block">
                  Our values —
                </span>
                <span
                  className="font-fraunces font-medium italic block"
                  style={{ color: "#7C69C4" }}
                >
                  not just words.
                </span>
              </h2>
            </div>

            {/* 2×2 card grid — window-pane separator */}
            <div className="reveal-stagger grid grid-cols-1 md:grid-cols-2 gap-px bg-[#E0DBF0]">
              {VALUES.map((v) => (
                <div key={v.index} className="relative bg-[#F8F7FB] p-8 md:p-10 group">
                  {/* Ghost index */}
                  <span
                    className="absolute top-6 right-8 font-mono font-bold leading-none select-none"
                    style={{
                      fontSize: "clamp(3rem, 5vw, 4.5rem)",
                      color: "rgba(124,58,237,0.10)",
                    }}
                    aria-hidden="true"
                  >
                    {v.index}
                  </span>

                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center mb-5">
                    <v.Icon className="w-4 h-4 text-violet-600" strokeWidth={1.6} />
                  </div>

                  <p className="font-bricolage font-semibold text-[#1A0D4D] text-[1.0625rem] mb-2.5 group-hover:text-violet-700 transition-colors duration-200">
                    {v.title}
                  </p>
                  <p className="font-bricolage text-[0.875rem] text-[#4A4665] leading-relaxed max-w-[36ch]">
                    {v.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. Team ───────────────────────────────────────────────────── */}
        <section className="bg-white py-24 md:py-36 border-b border-[#EDEAF5]">
          <div className="mx-auto max-w-5xl px-6 lg:px-10">
            <div className="reveal mb-14">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-violet-500 mb-4">
                The team
              </p>
              <h2
                className="leading-[1.06]"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  letterSpacing: "-0.025em",
                }}
              >
                <span className="font-bricolage font-semibold text-[#1A0D4D] block">
                  People behind
                </span>
                <span
                  className="font-fraunces font-medium italic block"
                  style={{ color: "#7C69C4" }}
                >
                  BookHushly.
                </span>
              </h2>
            </div>

            <div className="reveal-stagger grid grid-cols-1 sm:grid-cols-2 gap-5">
              {TEAM.map((member) => (
                <div
                  key={member.name}
                  className="rounded-2xl border border-[#EDEAF5] bg-[#F8F7FB] overflow-hidden group"
                >
                  {/* Full-bleed portrait */}
                  <div className="relative w-full aspect-[3/4] bg-violet-100">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    {/* Initials fallback sits behind the photo */}
                    <span className="absolute inset-0 flex items-center justify-center text-violet-300 font-mono font-bold text-5xl select-none -z-10">
                      {member.initials}
                    </span>
                    {/* Subtle bottom gradient so text below doesn't clash */}
                    <div
                      className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(248,247,251,0.6) 0%, transparent 100%)",
                      }}
                    />
                  </div>

                  {/* Text block */}
                  <div className="px-6 py-5">
                    <p className="font-bricolage font-semibold text-[#1A0D4D] mb-0.5">
                      {member.name}
                    </p>
                    <p className="font-bricolage text-sm text-violet-600 mb-3">
                      {member.role}
                    </p>
                    <p className="font-bricolage text-[0.875rem] text-[#4A4665] leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. Story ──────────────────────────────────────────────────── */}
        <section className="bg-[#F8F7FB] py-24 md:py-36 border-b border-[#EDEAF5]">
          <div className="mx-auto max-w-4xl px-6 lg:px-10">
            <div className="reveal">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-violet-500 mb-6">
                Our story
              </p>
              <h2
                className="leading-[1.06] mb-12"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  letterSpacing: "-0.025em",
                }}
              >
                <span className="font-bricolage font-semibold text-[#1A0D4D] block">
                  How we started —
                </span>
                <span
                  className="font-fraunces font-medium italic block"
                  style={{ color: "#7C69C4" }}
                >
                  and where we're going.
                </span>
              </h2>

              <div className="space-y-6 max-w-[60ch]">
                <p className="font-bricolage text-[1rem] text-[#4A4665] leading-[1.9]">
                  BookHushly was born from a simple frustration: finding quality,
                  reliable services in Nigeria was unnecessarily hard. Hotels,
                  event caterers, security firms — the process was fragmented,
                  unreliable, and exhausting.
                </p>
                <p className="font-bricolage text-[1rem] text-[#4A4665] leading-[1.9]">
                  Our founders experienced this firsthand and decided to build the
                  platform they wished existed — one where every vendor is
                  verified, every booking is frictionless, and every Nigerian
                  city is covered.
                </p>
                <p className="font-bricolage text-[1rem] text-[#4A4665] leading-[1.9]">
                  Today, BookHushly serves thousands of customers and hundreds of
                  verified vendors across Nigeria, with plans to expand across
                  Africa. We're not just a booking platform — we're infrastructure
                  for African hospitality.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. CTA ────────────────────────────────────────────────────── */}
        {/* Dark section — mirrors landing page CTA exactly */}
        <section className="relative bg-[#0F0A28] overflow-hidden py-28 md:py-44">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 65%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -right-32 w-[440px] h-[440px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 65%)",
            }}
          />

          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <div className="reveal-stagger">
              <h2
                className="font-fraunces italic text-white leading-[1.04] tracking-tight text-balance"
                style={{ fontSize: "clamp(2.8rem, 7.5vw, 6rem)" }}
              >
                Join our{" "}
                <span style={{ color: "#A78BFA" }}>mission.</span>
              </h2>

              <div
                className="mx-auto mt-12 mb-12 h-px max-w-xs"
                style={{ background: "rgba(255,255,255,0.08)" }}
                aria-hidden="true"
              />

              <p
                className="font-bricolage text-[1rem] leading-relaxed max-w-[44ch] mx-auto mb-10"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Whether you're a customer looking for quality services or a
                business ready to grow — BookHushly is built for you.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2.5 h-[3.375rem] px-9 bg-violet-600 hover:bg-violet-500 text-white font-bricolage font-semibold text-[0.9375rem] rounded-xl transition-all duration-200 shadow-[0_4px_24px_rgba(124,58,237,0.4)]"
                >
                  Get started free
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center h-[3.375rem] px-9 font-bricolage font-semibold text-[0.9375rem] rounded-xl transition-all duration-200"
                  style={{
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
