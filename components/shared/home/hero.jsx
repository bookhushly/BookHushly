"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Calendar } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

// ── Animation variants ──────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.9, ease: "easeOut", delay },
});

// ── Trust strip ──────────────────────────────────────────────────────────────
const TRUST = [
  { icon: CheckCircle2, label: "Verified vendors" },
  { icon: Calendar, label: "Instant confirmation" },
  { icon: Shield, label: "Secure payments" },
];

// ── Hero ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const spring = { damping: 30, stiffness: 80 };
  const smoothX = useSpring(mouseX, spring);
  const smoothY = useSpring(mouseY, spring);

  // Parallax — applied only to the bg image layer, subtle depth
  const bgX = useTransform(smoothX, [0, 1], ["-2%", "2%"]);
  const bgY = useTransform(smoothY, [0, 1], ["-2%", "2%"]);

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

  const featuredCategories = CATEGORIES.slice(0, 5);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-end overflow-hidden bg-gray-950"
    >
      {/* ── Background image with parallax ── */}
      <motion.div className="absolute inset-[-4%]" style={{ x: bgX, y: bgY }}>
        <Image
          src="/book2.jpg"
          alt=""
          fill
          priority
          quality={90}
          className="object-cover"
        />
        {/* Layered overlays for depth */}
        <div className="absolute inset-0 bg-gray-950/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/60 via-transparent to-transparent" />
      </motion.div>

      {/* ── Noise grain overlay ── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="hero-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-noise)" />
      </svg>

      {/* ── Main content ── */}
      <div className="relative z-10 container mx-auto px-6 lg:px-10 pb-20 pt-32 md:pt-40">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <motion.div {...fadeUp(0.1)} className="mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-violet-400">
              <span className="h-px w-8 bg-violet-500" />
              Nigeria&apos;s booking platform
            </span>
          </motion.div>

          {/* Headline — mixed Fraunces + Bricolage */}
          <motion.h1
            {...fadeUp(0.25)}
            className="text-[clamp(2.75rem,7vw,5.5rem)] leading-[1.05] font-medium text-white mb-6"
          >
            <span className="font-fraunces font-medium italic">
              Everything
            </span>
            <span className="font-bricolage"> you need,</span>
            <br />
            <span className="font-bricolage text-white/60">booked in </span>
            <span className="font-fraunces font-medium italic text-violet-400">
              seconds.
            </span>
          </motion.h1>

          {/* Subline */}
          <motion.p
            {...fadeUp(0.4)}
            className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed mb-10"
          >
            Hotels, serviced apartments, events, logistics, and security — all
            in one place. Built for Nigeria.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...fadeUp(0.52)}
            className="flex flex-wrap items-center gap-4 mb-16"
          >
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 h-12 px-6 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-violet-900/40"
            >
              Explore services
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 h-12 px-6 border border-white/20 hover:border-white/40 text-white/80 hover:text-white text-sm font-medium rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              Create free account
            </Link>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            {...fadeIn(0.65)}
            className="flex flex-wrap items-center gap-6"
          >
            {TRUST.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-white/50"
              >
                <Icon className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Category strip — bottom of screen ── */}
      <motion.div
        {...fadeIn(0.8)}
        className="relative z-10 border-t border-white/10 bg-gray-950/60 backdrop-blur-md"
      >
        <div className="container mx-auto px-6 lg:px-10">
          <div className="flex items-stretch divide-x divide-white/10 overflow-x-auto scrollbar-none">
            {featuredCategories.map((cat) => (
              <Link
                key={cat.value}
                href={
                  cat.value === "logistics"
                    ? "/quote-services?tab=logistics"
                    : cat.value === "security"
                      ? "/quote-services?tab=security"
                      : `/services?category=${cat.value}`
                }
                className="group flex items-center gap-3 px-6 py-4 min-w-max hover:bg-white/5 transition-colors duration-200"
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors duration-200 whitespace-nowrap">
                  {cat.label}
                </span>
                <ArrowRight className="h-3 w-3 text-white/20 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all duration-200" />
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
