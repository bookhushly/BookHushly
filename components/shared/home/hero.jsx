import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, MapPin, CreditCard } from "lucide-react";

// ── constants ─────────────────────────────────────────────────────────────────

const TRUST = [
  { Icon: ShieldCheck, label: "Every vendor verified before listing" },
  { Icon: MapPin,      label: "All 36 states covered" },
  { Icon: CreditCard,  label: "Pay in Naira or crypto" },
];

// These appear as real listing thumbnails inside the product preview card.
// Showing actual content (not a blank form) is what makes the preview feel
// like a real product rather than a marketing mockup.
const THUMBS = [
  {
    img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=480&auto=format&fit=crop&q=70",
    alt: "Warmly lit luxury hotel lounge",
    label: "Hotel",
    city: "Lagos",
    from: "₦45,000",
  },
  {
    img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=480&auto=format&fit=crop&q=70",
    alt: "Modern serviced apartment interior",
    label: "Apartment",
    city: "Abuja",
    from: "₦28,000",
  },
  {
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=480&auto=format&fit=crop&q=70",
    alt: "Elegant event venue with ambient lighting",
    label: "Event",
    city: "Port Harcourt",
    from: "₦95,000",
  },
  {
    img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=480&auto=format&fit=crop&q=70",
    alt: "Luxury resort pool and architecture",
    label: "Hotel",
    city: "Enugu",
    from: "₦62,000",
  },
];

const TABS = ["Hotels", "Apartments", "Events", "Logistics", "Security"];

// ── component ─────────────────────────────────────────────────────────────────
// Server component — no "use client" needed.
// All motion is pure CSS via .hero-slide-up / .hero-fade-up in globals.css,
// wrapped in @media (prefers-reduced-motion: no-preference).

export default function Hero() {
  return (
    <header className="relative flex min-h-[100svh] flex-col overflow-hidden bg-white">

      {/*
        A single tightly focused glow — not a wide ambient blur but a sharp
        ellipse directly behind the headline. The narrowness creates depth
        without polluting the white field around it.
        No dot grid: the confidence to use pure white IS the premium signal.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{
          top: "-60px",
          width: "680px",
          height: "520px",
          background:
            "radial-gradient(ellipse 60% 55% at 50% 28%, rgba(124,58,237,0.11) 0%, rgba(124,58,237,0.04) 55%, transparent 100%)",
        }}
      />

      {/* ── Centered copy ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-12 pt-28 text-center">

        {/*
          Headline — the typographic statement that defines the hero.

          "Nigeria's services,"    ← normal weight, comma creates a pause
          "every vendor verified." ← bold, <em> gives "verified." violet italic

          The weight swing (normal → bold) and the colour accent on the
          resolution word do the work without needing any decorative elements.
          Size: clamp(3.25rem → 5.5rem), larger than the previous version.
        */}
        <h1
          className="mb-7 font-fraunces text-[#1A0D4D]"
          style={{ fontSize: "clamp(3.25rem, 6vw, 5.5rem)", lineHeight: 1.06 }}
        >
          <div className="overflow-hidden">
            <span
              className="hero-slide-up block font-normal"
              style={{ animationDelay: "0.05s" }}
            >
              Five services. One platform.
            </span>
          </div>
          <div className="overflow-hidden">
            <span
              className="hero-slide-up block font-bold"
              style={{ animationDelay: "0.2s" }}
            >
              Every vendor,{" "}
              <em className="text-violet-600">verified.</em>
            </span>
          </div>
        </h1>

        <p
          className="hero-fade-up mb-10 max-w-[480px] font-bricolage text-[1.0625rem] leading-relaxed text-[#6B6987]"
          style={{ animationDelay: "0.34s" }}
        >
          Hotels, serviced apartments, events, logistics and security —
          all on one platform. AI-powered search finds exactly what you
          need. Every vendor is vetted before they can list. Book
          anywhere in Nigeria. Pay in Naira or crypto.
        </p>

        {/* Single CTA */}
        <div
          className="hero-fade-up mb-9"
          style={{ animationDelay: "0.46s" }}
        >
          <Link
            href="/services"
            className="group inline-flex h-[3.375rem] items-center gap-2.5 rounded-xl bg-violet-600 px-9 font-bricolage text-[0.9375rem] font-semibold text-white shadow-[0_4px_24px_rgba(124,58,237,0.35),0_1px_2px_rgba(124,58,237,0.2)] transition-all duration-200 hover:bg-violet-700 hover:shadow-[0_8px_40px_rgba(124,58,237,0.45)]"
          >
            Explore services
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Trust — separated by a subtle mid-dot, no redundant icons */}
        <ul
          className="hero-fade-up flex flex-wrap items-center justify-center gap-y-2"
          style={{ animationDelay: "0.58s", columnGap: "1.5rem" }}
          aria-label="Platform guarantees"
        >
          {TRUST.map(({ Icon, label }, i) => (
            <li key={label} className="flex items-center gap-1.5 text-[#7B75A1]">
              {i > 0 && (
                <span className="mr-2.5 inline-block h-1 w-1 rounded-full bg-[#D4CFF0]" aria-hidden="true" />
              )}
              <Icon className="h-3.5 w-3.5 shrink-0 text-violet-500" strokeWidth={1.75} aria-hidden="true" />
              <span className="font-bricolage text-sm">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/*
        ── Product preview ──────────────────────────────────────────────────
        The dark card at the bottom shows REAL content — listing thumbnails
        with images, categories, cities, and starting prices. This is the key
        difference from the previous version (which showed an empty search form).

        cal.com shows a real calendar. Clerk shows a real auth widget.
        We show real listings. The product proof is in the content, not the chrome.

        The card is rounded-t-2xl with no bottom radius — it bleeds past the
        viewport edge, inviting the scroll. The upward shadow reinforces depth.
      */}
      <div
        className="hero-fade-in relative z-10 mx-auto mt-auto w-full max-w-3xl px-4 sm:px-6"
        style={{ animationDelay: "0.72s" }}
      >
        <Link
          href="/services"
          className="group block"
          aria-label="Browse available listings on BookHushly"
        >
          <div className="rounded-t-2xl bg-[#130B33] px-5 pt-5 pb-8 shadow-[0_-20px_80px_rgba(19,11,51,0.18)] ring-1 ring-white/[0.06]">

            {/* Service tabs — shows platform scope immediately */}
            <div
              className="mb-5 flex gap-1.5 overflow-x-auto scrollbar-none"
              role="tablist"
              aria-label="Service categories"
            >
              {TABS.map((tab, i) => (
                <span
                  key={tab}
                  role="tab"
                  aria-selected={i === 0}
                  className={[
                    "shrink-0 rounded-lg px-3.5 py-1.5 font-bricolage text-xs font-medium transition-colors duration-150",
                    i === 0
                      ? "bg-violet-600 text-white"
                      : "text-white/45 hover:text-white/70",
                  ].join(" ")}
                >
                  {tab}
                </span>
              ))}
            </div>

            {/*
              4-column listing thumbnail grid.
              Each thumbnail: real image + gradient overlay + category chip +
              city + starting price. This is what actual search results look like.
            */}
            <div
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
              role="list"
              aria-label="Sample listings"
            >
              {THUMBS.map((t) => (
                <div
                  key={t.city + t.label}
                  role="listitem"
                  className="overflow-hidden rounded-xl ring-1 ring-white/[0.07] transition-transform duration-300 group-hover:scale-[1.01]"
                >
                  {/* Image with bottom gradient for text legibility */}
                  <div className="relative aspect-[3/2]">
                    <Image
                      src={t.img}
                      alt={t.alt}
                      fill
                      quality={70}
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                    {/* Category chip — top left */}
                    <span className="absolute left-2.5 top-2.5 rounded-md bg-white/15 px-2 py-0.5 font-mono text-[8px] tracking-[0.18em] uppercase text-white/80 backdrop-blur-sm">
                      {t.label}
                    </span>

                    {/* City + price — bottom left */}
                    <div className="absolute bottom-2.5 left-2.5">
                      <p className="font-bricolage text-[11px] font-semibold leading-tight text-white">
                        {t.city}
                      </p>
                      <p className="font-bricolage text-[10px] leading-tight text-white/60">
                        from {t.from}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
