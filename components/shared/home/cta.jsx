"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

// Stagger container variant
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function CTA() {
  const sectionRef = useRef(null);

  // Subtle vertical drift on the decorative line as you scroll through
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const lineY = useTransform(scrollYProgress, [0, 1], ["-6px", "6px"]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-gray-950 overflow-hidden py-28 md:py-40 lg:py-48"
    >
      {/* Ambient glow — violet bloom top-left, muted so type stays primary */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full bg-violet-600/10 blur-[120px]"
      />
      {/* Secondary accent — right side */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-violet-500/8 blur-[100px]"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 lg:px-12">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >

          {/* Eyebrow label */}
          <motion.p
            variants={fadeUp}
            className="font-bricolage text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-10"
          >
            Nigeria&rsquo;s all-in-one booking platform
          </motion.p>

          {/* The big line — this is the moment */}
          <motion.h2
            variants={fadeUp}
            className="font-fraunces italic text-white leading-[1.05] tracking-tight text-balance"
            style={{
              fontSize: "clamp(2.8rem, 7.5vw, 6.5rem)",
            }}
          >
            Book anything.{" "}
            <span className="text-violet-400">Anywhere</span>
            <br className="hidden sm:block" /> in Nigeria.
          </motion.h2>

          {/* Divider — animated line that separates declaration from action */}
          <motion.div variants={fadeUp} className="mt-12 mb-12">
            <motion.div
              style={{ y: lineY }}
              className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent"
            />
          </motion.div>

          {/* Sub-message + CTAs — two-column on wider screens */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10"
          >
            {/* Left: the sub-message */}
            <p className="font-bricolage text-white/50 text-base md:text-lg max-w-md leading-relaxed">
              Hotels, serviced apartments, events, logistics, security —
              every vendor KYC-verified. Pay in naira or crypto.
              AI support on standby around the clock.
            </p>

            {/* Right: CTAs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              {/* Primary */}
              <Link
                href="/services"
                className="group inline-flex items-center gap-2 h-12 px-7 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium font-bricolage rounded-xl transition-all duration-200"
              >
                Explore services
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              {/* Secondary */}
              <Link
                href="/register"
                className="inline-flex items-center h-12 px-7 border border-white/20 hover:border-white/40 text-white/75 hover:text-white text-sm font-medium font-bricolage rounded-xl transition-all duration-200"
              >
                List your business
              </Link>
            </div>
          </motion.div>

          {/* Trust signals — restrained, typographic, not iconographic */}
          <motion.div
            variants={fadeIn}
            className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3"
          >
            {[
              "KYC-verified vendors",
              "Naira & crypto accepted",
              "AI support, 24 / 7",
            ].map((signal, i) => (
              <span
                key={signal}
                className="flex items-center gap-2.5 font-bricolage text-xs text-white/30 uppercase tracking-widest"
              >
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="hidden sm:block w-1 h-1 rounded-full bg-white/20"
                  />
                )}
                {signal}
              </span>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
