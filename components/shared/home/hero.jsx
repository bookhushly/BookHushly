"use client";

import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, CreditCard, Sparkles } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

// ── constants ────────────────────────────────────────────────────────────────

const SERVICES = [
  { word: "Hotels",      color: "text-violet-400",        img: "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&auto=format&fit=crop&q=70", tag: "🏨 Stay" },
  { word: "Apartments",  color: "text-amber-400",          img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop&q=70", tag: "🏢 Live" },
  { word: "Events",      color: "text-emerald-400",       img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=70", tag: "🎉 Celebrate" },
  { word: "Logistics",   color: "text-sky-400",           img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=70", tag: "🚚 Move" },
  { word: "Security",    color: "text-rose-400",          img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&auto=format&fit=crop&q=70", tag: "🛡 Protect" },
];

const TRUST = [
  { icon: ShieldCheck, label: "KYC-verified vendors" },
  { icon: Zap,         label: "Instant confirmation" },
  { icon: CreditCard,  label: "NGN & crypto" },
  { icon: Sparkles,    label: "AI-powered" },
];

const TICKER_ITEMS = [
  "Lagos", "Hotels", "Abuja", "Security", "Port Harcourt",
  "Events", "Kano", "Logistics", "Ibadan", "Apartments",
  "Enugu", "Verified", "Calabar", "Nigeria",
];

const GLOW_COLORS = [
  "rgba(139,92,246,0.12)",   // violet  — Hotels
  "rgba(251,191,36,0.10)",   // amber   — Apartments
  "rgba(52,211,153,0.10)",   // emerald — Events
  "rgba(56,189,248,0.10)",   // sky     — Logistics
  "rgba(251,113,133,0.10)",  // rose    — Security
];

const EASE_EXPO = [0.16, 1, 0.3, 1];
const INTERVAL_MS = 2800;

// ── sub-components ───────────────────────────────────────────────────────────

function ServiceSlot({ active }) {
  const service = SERVICES[active];
  return (
    <span className="relative inline-block overflow-hidden align-bottom h-[1.05em]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={service.word}
          className={`inline-block font-fraunces font-medium italic ${service.color}`}
          initial={{ y: "100%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.55, ease: EASE_EXPO }}
        >
          {service.word}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function ServicePhotoStack({ active }) {
  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={active}
          className="absolute inset-0 rounded-2xl overflow-hidden"
          initial={{ clipPath: "inset(100% 0% 0% 0%)", scale: 1.06 }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)", scale: 0.97 }}
          transition={{ duration: 0.72, ease: EASE_EXPO }}
        >
          <Image
            src={SERVICES[active].img}
            alt={SERVICES[active].word}
            fill
            quality={85}
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/10 to-transparent" />

          {/* service tag */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4, ease: "easeOut" }}
            className="absolute bottom-5 left-5"
          >
            <span className="font-mono text-xs tracking-widest uppercase bg-gray-950/70 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-full border border-white/10">
              {SERVICES[active].tag}
            </span>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* dot indicators */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
        {SERVICES.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: i === active ? 20 : 4,
              backgroundColor: i === active ? "#a78bfa" : "rgba(255,255,255,0.25)",
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-[3px] rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

function HorizontalTicker() {
  return (
    <div
      aria-hidden
      className="absolute top-0 left-0 right-0 flex overflow-hidden border-b border-white/[0.06] h-8 select-none"
    >
      <motion.div
        className="flex gap-8 whitespace-nowrap shrink-0 items-center pr-8"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span
            key={i}
            className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/20"
          >
            {item}
            <span className="ml-8 text-violet-700">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function CounterBadge({ value, label }) {
  return (
    <div className="flex flex-col">
      <span className="font-fraunces font-medium italic text-2xl text-white leading-none">
        {value}
      </span>
      <span className="font-mono text-[10px] tracking-widest uppercase text-white/35 mt-0.5">
        {label}
      </span>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function Hero() {
  const [active, setActive] = useState(0);
  const containerRef = useRef(null);
  const tickRef = useRef(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const spring = { damping: 28, stiffness: 70 };
  const smoothX = useSpring(mouseX, spring);
  const smoothY = useSpring(mouseY, spring);

  const bgX = useTransform(smoothX, [0, 1], ["-1.5%", "1.5%"]);
  const bgY = useTransform(smoothY, [0, 1], ["-1.5%", "1.5%"]);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 380], [1, 0]);
  const heroY = useTransform(scrollY, [0, 380], [0, 60]);

  const handleMouseMove = useCallback(
    (e) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    },
    [mouseX, mouseY],
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    tickRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % SERVICES.length);
    }, INTERVAL_MS);
    return () => clearInterval(tickRef.current);
  }, []);

  const featuredCategories = CATEGORIES.slice(0, 5);

  // stagger animation factory
  const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 32, filter: "blur(3px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.8, ease: EASE_EXPO, delay },
  });

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col overflow-hidden bg-gray-950"
    >
      {/* ── top ticker tape ── */}
      <HorizontalTicker />

      {/* ── noise grain overlay ── */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none z-[1]"
      >
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* ── content grid ── */}
      <motion.div
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 flex-1 container mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[1fr_0.88fr] gap-8 xl:gap-12 items-center pt-20 pb-6 lg:pt-24 lg:pb-8"
      >
        {/* ── LEFT: editorial type column ── */}
        <div className="flex flex-col justify-center">

          {/* eyebrow line */}
          <motion.div {...reveal(0.05)} className="flex items-center gap-3 mb-8 lg:mb-10">
            <span className="h-px w-10 bg-violet-500/70" />
            <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-violet-400/80">
              Nigeria&apos;s booking platform
            </span>
          </motion.div>

          {/* headline — the poster */}
          <div className="space-y-1 mb-8 lg:mb-10">
            {/* line 1: huge static word */}
            <motion.div {...reveal(0.12)}>
              <h1
                className="font-bricolage font-semibold text-white leading-[0.95] tracking-tight"
                style={{ fontSize: "clamp(3.4rem, 9vw, 7.5rem)" }}
              >
                Book
              </h1>
            </motion.div>

            {/* line 2: animated service word */}
            <motion.div {...reveal(0.2)}>
              <div
                className="font-bricolage font-semibold leading-[0.95] tracking-tight"
                style={{ fontSize: "clamp(3.4rem, 9vw, 7.5rem)" }}
              >
                <ServiceSlot active={active} />
                <span className="text-white/20">.</span>
              </div>
            </motion.div>

            {/* line 3: smaller sub-statement */}
            <motion.div {...reveal(0.28)}>
              <p
                className="font-fraunces font-medium italic text-white/40 leading-[1.1] tracking-tight"
                style={{ fontSize: "clamp(1.6rem, 3.8vw, 3rem)" }}
              >
                Every vendor verified.
              </p>
            </motion.div>
          </div>

          {/* body copy */}
          <motion.p
            {...reveal(0.38)}
            className="font-bricolage text-white/50 text-base md:text-lg leading-relaxed max-w-md mb-10"
          >
            Hotels, apartments, events, logistics &amp; security —&nbsp;
            KYC-checked vendors. Pay with Naira or crypto. Powered by Claude AI.
          </motion.p>

          {/* CTAs */}
          <motion.div {...reveal(0.46)} className="flex flex-wrap items-center gap-3 mb-10 lg:mb-12">
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 h-12 px-7 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-violet-900/50 font-bricolage"
            >
              Explore services
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center h-12 px-7 border border-white/15 hover:border-white/35 text-white/65 hover:text-white text-sm font-medium rounded-xl transition-all duration-200 backdrop-blur-sm font-bricolage"
            >
              Create free account
            </Link>
          </motion.div>

          {/* stats row */}
          <motion.div {...reveal(0.54)} className="flex items-center gap-8">
            <CounterBadge value="5×" label="Services" />
            <div className="w-px h-8 bg-white/10" />
            <CounterBadge value="KYC" label="Verified" />
            <div className="w-px h-8 bg-white/10" />
            <CounterBadge value="₦ + ₿" label="Payments" />
          </motion.div>

          {/* trust pills */}
          <motion.div
            {...reveal(0.62)}
            className="flex flex-wrap gap-2 mt-8"
          >
            {TRUST.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm"
              >
                <Icon className="h-3 w-3 text-violet-400 shrink-0" strokeWidth={1.5} />
                <span className="font-mono text-[10px] tracking-widest uppercase text-white/45">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: photo stack ── */}
        <motion.div
          {...reveal(0.18)}
          className="hidden lg:block relative"
          style={{ height: "clamp(420px, 70vh, 680px)" }}
        >
          {/* subtle ambient behind the photo */}
          <div
            className="absolute inset-0 -m-8 rounded-3xl"
            style={{
              background: `radial-gradient(ellipse 70% 60% at 55% 45%, ${GLOW_COLORS[active]} 0%, transparent 70%)`,
              transition: "background 0.6s ease",
            }}
          />

          {/* main photo */}
          <ServicePhotoStack active={active} />

          {/* service index labels — editorial-style right-edge strip */}
          <div className="absolute -right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3">
            {SERVICES.map((s, i) => (
              <button
                key={s.word}
                onClick={() => {
                  clearInterval(tickRef.current);
                  setActive(i);
                  tickRef.current = setInterval(
                    () => setActive((p) => (p + 1) % SERVICES.length),
                    INTERVAL_MS,
                  );
                }}
                className="group flex items-center gap-2 cursor-pointer"
                aria-label={`Show ${s.word}`}
              >
                <motion.span
                  animate={{ opacity: i === active ? 1 : 0.3 }}
                  className="font-mono text-[9px] tracking-[0.2em] uppercase text-white hidden xl:block"
                >
                  {s.word}
                </motion.span>
                <motion.div
                  animate={{
                    width: i === active ? 20 : 4,
                    backgroundColor: i === active ? "#a78bfa" : "rgba(255,255,255,0.2)",
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-[2px] rounded-full"
                />
              </button>
            ))}
          </div>

          {/* floating "Nigeria" geography tag */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.6, ease: EASE_EXPO }}
            className="absolute -left-4 top-6 bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5"
          >
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/40 mb-0.5">
              Built for
            </p>
            <p className="font-bricolage text-sm font-semibold text-white">
              🇳🇬 Nigeria
            </p>
          </motion.div>

          {/* floating "AI-powered" tag */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.05, duration: 0.6, ease: EASE_EXPO }}
            className="absolute -left-4 bottom-8 bg-violet-950/90 backdrop-blur-md border border-violet-800/40 rounded-xl px-4 py-2.5"
          >
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-violet-400/70 mb-0.5">
              Powered by
            </p>
            <p className="font-bricolage text-sm font-semibold text-violet-300">
              ✦ Claude AI
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── mobile photo strip (portrait, full-width) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="lg:hidden relative z-10 h-48 mx-6 mb-4 rounded-2xl overflow-hidden"
      >
        <ServicePhotoStack active={active} />
      </motion.div>

      {/* ── mobile service pills ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.6 }}
        className="lg:hidden relative z-10 flex gap-2 px-6 mb-4 overflow-x-auto scrollbar-none"
      >
        {SERVICES.map((s, i) => (
          <button
            key={s.word}
            onClick={() => setActive(i)}
            className={`shrink-0 font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full border transition-all duration-200 ${
              i === active
                ? "border-violet-500/50 bg-violet-950/60 text-violet-300"
                : "border-white/10 bg-white/[0.04] text-white/40"
            }`}
          >
            {s.word}
          </button>
        ))}
      </motion.div>

      {/* ── category strip — always visible at bottom ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.72, duration: 0.7, ease: EASE_EXPO }}
        className="relative z-10 border-t border-white/[0.07] bg-gray-950/80 backdrop-blur-md"
      >
        <div className="container mx-auto px-6 lg:px-10">
          <div className="flex items-stretch divide-x divide-white/[0.07] overflow-x-auto scrollbar-none">
            {featuredCategories.map((cat, i) => (
              <Link
                key={cat.value}
                href={
                  cat.value === "logistics"
                    ? "/quote-services?tab=logistics"
                    : cat.value === "security"
                      ? "/quote-services?tab=security"
                      : `/services?category=${cat.value}`
                }
                className="group relative flex items-center gap-3 px-5 py-4 min-w-max hover:bg-white/[0.04] transition-colors duration-200"
                onMouseEnter={() => setActive(i)}
              >
                <motion.span
                  animate={{ scale: active === i ? 1.15 : 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="text-lg"
                >
                  {cat.icon}
                </motion.span>
                <span
                  className={`font-bricolage text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    active === i ? "text-white" : "text-white/45 group-hover:text-white/75"
                  }`}
                >
                  {cat.label}
                </span>
                <ArrowRight
                  className={`h-3 w-3 transition-all duration-200 ${
                    active === i
                      ? "text-violet-400 translate-x-0.5"
                      : "text-white/20 group-hover:text-white/40"
                  }`}
                />

                {/* active indicator line */}
                {active === i && (
                  <motion.div
                    layoutId="cat-underline"
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-violet-500"
                    transition={{ duration: 0.3, ease: EASE_EXPO }}
                  />
                )}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
