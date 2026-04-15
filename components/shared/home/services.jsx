import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// ── data ──────────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    id: "hotels",
    num: "01",
    label: "Hotels",
    sub: "Verified rooms across every major Nigerian city",
    href: "/services?category=hotels",
    img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900&auto=format&fit=crop&q=80",
    alt: "Grand hotel lobby with high ceilings",
    sizes: "(max-width: 768px) 100vw, 55vw",
    // grid position (desktop): col 1-2, row 1-2 — the hero tile
    span: "svc-hero",
  },
  {
    id: "serviced_apartments",
    num: "02",
    label: "Apartments",
    sub: "Furnished short-lets and extended-stay apartments",
    href: "/services?category=serviced_apartments",
    img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=700&auto=format&fit=crop&q=80",
    alt: "Modern serviced apartment interior",
    sizes: "(max-width: 768px) 100vw, 40vw",
    span: "svc-sm",
  },
  {
    id: "events",
    num: "03",
    label: "Events",
    sub: "Venues, tickets and event production services",
    href: "/services?category=events",
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&auto=format&fit=crop&q=80",
    alt: "Elegant event venue with ambient lighting",
    sizes: "(max-width: 768px) 100vw, 40vw",
    span: "svc-sm",
  },
  {
    id: "logistics",
    num: "04",
    label: "Logistics",
    sub: "Freight and delivery across all Nigerian states",
    href: "/quote-services?tab=logistics",
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=700&auto=format&fit=crop&q=80",
    alt: "Logistics and delivery vehicles on a highway",
    sizes: "(max-width: 768px) 100vw, 50vw",
    span: "svc-strip",
    quoteOnly: true,
  },
  {
    id: "security",
    num: "05",
    label: "Security",
    sub: "Vetted personnel for events and premises",
    href: "/quote-services?tab=security",
    img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=700&auto=format&fit=crop&q=80",
    alt: "Professional security team in formal wear",
    sizes: "(max-width: 768px) 100vw, 50vw",
    span: "svc-strip",
    quoteOnly: true,
  },
];

// ── tile ───────────────────────────────────────────────────────────────────────
// All hover states are pure CSS — no JS, no Framer Motion, no hydration risk.

function Tile({ svc }) {
  return (
    <Link
      href={svc.href}
      className="svc-tile group relative block h-full w-full overflow-hidden rounded-2xl bg-[#100C28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
      aria-label={`Explore ${svc.label}`}
    >
      {/* ── Image ── */}
      <Image
        src={svc.img}
        alt={svc.alt}
        fill
        quality={80}
        className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.05]"
        sizes={svc.sizes}
      />

      {/*
        Permanent gradient — top vignette (numbers legible)
        + bottom vignette (label legible). Not too heavy — image stays visible.
      */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

      {/*
        Hover gradient — extra depth on hover so the text pops.
        Separate layer so transition is isolated.
      */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#100C28]/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* ── Number — top left, monospaced, faint ── */}
      <span
        aria-hidden="true"
        className="absolute left-4 top-4 font-mono text-[10px] tracking-[0.3em] text-white/35 select-none"
      >
        {svc.num}
      </span>

      {/* ── Arrow button — top right ── */}
      <span
        aria-hidden="true"
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:border-white group-hover:bg-white group-hover:scale-110"
      >
        <ArrowUpRight className="h-3.5 w-3.5 text-white group-hover:text-[#1A0D4D] transition-colors duration-300" />
      </span>

      {/* ── Bottom content ── */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-12 md:px-6 md:pb-6">

        {/* Label */}
        <h3
          className="font-fraunces font-medium italic text-white leading-none mb-0 transition-transform duration-500 ease-out group-hover:-translate-y-1"
          style={{ fontSize: "clamp(1.5rem, 2.8vw, 2rem)" }}
        >
          {svc.label}
        </h3>

        {/*
          Description — hidden by default, slides up on hover.
          max-h transition avoids layout shift.
        */}
        <div className="overflow-hidden max-h-0 group-hover:max-h-16 transition-all duration-500 ease-out">
          <p className="font-bricolage text-[0.8125rem] leading-snug text-white/70 mt-2">
            {svc.sub}
          </p>
        </div>

        {/* Quote-only badge (Logistics / Security) */}
        {svc.quoteOnly && (
          <span className="mt-3 inline-flex items-center gap-1.5 font-bricolage text-[0.6875rem] font-medium tracking-[0.14em] uppercase text-violet-300 opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-100">
            Get a quote
            <span className="inline-block h-px w-6 bg-violet-400/60 transition-all duration-300 group-hover:w-10" />
          </span>
        )}

        {/* Animated underline — always from left on hover */}
        <div className="mt-3 h-px w-full origin-left scale-x-0 bg-white/25 transition-transform duration-500 ease-out delay-75 group-hover:scale-x-100" />
      </div>
    </Link>
  );
}

// ── component ─────────────────────────────────────────────────────────────────
// Server component — no "use client".
// Scroll entrance: .svc-tile uses animation-timeline:view() from globals.css.
// Layout:
//   Upper grid (3 col × 2 row on desktop):
//     [Hotels 2×2] [Apartments] [Events]
//   Lower grid (2 col):
//     [Logistics] [Security]

export default function Services() {
  const [hotels, apartments, events, logistics, security] = SERVICES;

  return (
    <section className="bg-[#F8F7FB] py-24 md:py-36 border-t border-[#EDEAF5]">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">

        {/*
          ── Header ──────────────────────────────────────────────────────────
          Left-aligned. Headline uses the same Bricolage + Fraunces italic
          pattern established in the hero and differentiators.
        */}
        <div className="reveal mb-14 md:mb-18 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2
              className="text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.06] text-[#1A0D4D]"
              style={{ letterSpacing: "-0.025em" }}
            >
              <span className="font-bricolage font-semibold block">Five ways to book.</span>
              <span className="font-fraunces font-medium italic block" style={{ color: "#7C69C4" }}>
                One platform.
              </span>
            </h2>
          </div>
          <p className="font-bricolage text-[0.9375rem] leading-relaxed text-[#7B75A1] max-w-[34ch] md:text-right">
            Hotels, apartments, events, logistics, and security — all verified, all in one account.
          </p>
        </div>

        {/*
          ── Upper grid ──────────────────────────────────────────────────────
          Desktop: Hotels spans 2 columns × 2 rows. Apartments and Events
          sit in the right column, each taking 1 row.
          Mobile: Stacked single column. Hotels is taller (360px).
        */}
        <div
          className="
            reveal-stagger
            grid gap-3
            grid-cols-1
            md:grid-cols-3
            md:grid-rows-[300px_300px]
            mb-3
          "
        >
          {/* Hotels — hero tile */}
          <div className="svc-tile-1 min-h-[320px] md:min-h-0 md:col-span-2 md:row-span-2">
            <Tile svc={hotels} />
          </div>

          {/* Apartments */}
          <div className="svc-tile-2 min-h-[220px] md:min-h-0">
            <Tile svc={apartments} />
          </div>

          {/* Events */}
          <div className="svc-tile-3 min-h-[220px] md:min-h-0">
            <Tile svc={events} />
          </div>
        </div>

        {/*
          ── Lower row ───────────────────────────────────────────────────────
          Logistics + Security — wide cinematic landscape tiles.
          Quote-only services get a "Get a quote" hover label instead of
          a booking CTA, to set expectations clearly.
        */}
        <div className="reveal-stagger grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="svc-tile-4 h-[200px] md:h-[220px]">
            <Tile svc={logistics} />
          </div>
          <div className="svc-tile-5 h-[200px] md:h-[220px]">
            <Tile svc={security} />
          </div>
        </div>

      </div>
    </section>
  );
}
