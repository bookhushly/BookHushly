"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState } from "react";

const steps = [
  {
    num: "01",
    label: "Browse",
    headline: "Browse verified\nservices",
    body: "Discover hotels, apartments, event venues, and more — every provider has passed our KYC process.",
    accent: "#7C3AED",
  },
  {
    num: "02",
    label: "Book",
    headline: "Book and pay\nsecurely",
    body: "Select your dates, review transparent pricing, and pay instantly with Naira or crypto.",
    accent: "#1A0D4D",
  },
  {
    num: "03",
    label: "Enjoy",
    headline: "Show up\nand enjoy",
    body: "Your booking is confirmed immediately. Our support team is available if anything needs attention.",
    accent: "#0F766E",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const [activeStep, setActiveStep] = useState(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "end 0.4"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  });

  // Progress line width (desktop horizontal)
  const lineScaleX = useTransform(smoothProgress, [0, 1], [0, 1]);
  // Progress line height (mobile vertical)
  const lineScaleY = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-32 bg-[#FAF9FC] overflow-hidden"
    >
      <div className="container mx-auto px-6 lg:px-10">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 md:mb-28 max-w-xl"
        >
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-violet-600 mb-5">
            <span className="h-px w-8 bg-violet-500" />
            How it works
          </span>
          <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.08] font-medium text-[#1A0D4D]">
            <span className="font-fraunces font-medium italic">Three steps</span>
            <span className="font-bricolage"> to booked.</span>
          </h2>
        </motion.div>

        {/* ── Desktop Layout ── */}
        <div className="hidden lg:block">

          {/* Animated connector line */}
          <div className="relative mb-0">
            {/* Track */}
            <div className="absolute top-[3.25rem] left-[calc(16.666%+1px)] right-[calc(16.666%+1px)] h-px bg-[#E2DFF0]" />
            {/* Fill */}
            <motion.div
              style={{ scaleX: lineScaleX }}
              className="absolute top-[3.25rem] left-[calc(16.666%+1px)] right-[calc(16.666%+1px)] h-px bg-[#1A0D4D] origin-left"
            />
          </div>

          {/* Three columns */}
          <div className="grid grid-cols-3 gap-0">
            {steps.map((step, i) => (
              <DesktopStep
                key={step.num}
                step={step}
                index={i}
                isActive={activeStep === i}
                onHover={setActiveStep}
                scrollProgress={smoothProgress}
              />
            ))}
          </div>
        </div>

        {/* ── Mobile Layout ── */}
        <div className="lg:hidden">
          {/* Vertical track */}
          <div className="relative flex">
            <div className="relative flex flex-col items-center mr-8 flex-shrink-0">
              {/* Track */}
              <div className="absolute top-6 bottom-6 left-1/2 -translate-x-1/2 w-px bg-[#E2DFF0]" />
              {/* Fill */}
              <motion.div
                style={{ scaleY: lineScaleY }}
                className="absolute top-6 bottom-6 left-1/2 -translate-x-1/2 w-px bg-[#1A0D4D] origin-top"
              />
            </div>
            <div className="flex-1" />
          </div>

          <div className="space-y-0">
            {steps.map((step, i) => (
              <MobileStep key={step.num} step={step} index={i} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

/* ─── Desktop Step ─────────────────────────────────────── */
function DesktopStep({ step, index, isActive, onHover, scrollProgress }) {
  const stepRef = useRef(null);

  // Each step activates at a different scroll threshold
  const thresholds = [
    [0, 0.33],
    [0.28, 0.66],
    [0.6, 1],
  ];
  const [lo, hi] = thresholds[index];

  const opacity = useTransform(scrollProgress, [lo, lo + 0.12, hi], [0.35, 1, 1]);
  const ghostOpacity = useTransform(scrollProgress, [lo, lo + 0.15], [0.04, 0.1]);

  // Node dot pulse
  const nodeScale = useTransform(
    scrollProgress,
    [lo, lo + 0.08, lo + 0.16],
    [0.6, 1.15, 1]
  );

  return (
    <motion.div
      ref={stepRef}
      style={{ opacity }}
      className="relative px-8 pt-0 pb-12 group cursor-default first:pl-0 last:pr-0"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Node on the line */}
      <div className="relative flex items-center mb-10">
        <motion.div
          style={{ scale: nodeScale }}
          className="w-[1.625rem] h-[1.625rem] rounded-full border-2 border-[#1A0D4D] bg-[#FAF9FC] z-10 flex items-center justify-center"
        >
          <motion.div
            animate={isActive ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]"
          />
        </motion.div>

        {/* Step label */}
        <span
          className="ml-3 font-mono text-[0.625rem] tracking-[0.22em] uppercase font-medium"
          style={{ color: step.accent }}
        >
          {step.label}
        </span>
      </div>

      {/* Ghost number */}
      <motion.div
        aria-hidden="true"
        className="absolute -top-2 right-4 font-mono font-bold text-[#1A0D4D] leading-none select-none pointer-events-none"
        style={{ fontSize: "clamp(5rem, 8vw, 9rem)", opacity: ghostOpacity }}
      >
        {step.num}
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        <motion.h3
          className="font-fraunces font-medium italic text-[#1A0D4D] leading-[1.12] mb-4 whitespace-pre-line"
          style={{ fontSize: "clamp(1.4rem, 2vw, 1.875rem)" }}
          animate={isActive ? { x: 4 } : { x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {step.headline}
        </motion.h3>
        <p className="font-bricolage text-[0.9375rem] text-[#5C5875] leading-[1.7] max-w-[22ch]">
          {step.body}
        </p>
      </div>

      {/* Bottom accent bar — grows on hover/active */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] rounded-full"
        style={{ backgroundColor: step.accent }}
        animate={isActive ? { width: "40%", opacity: 1 } : { width: "0%", opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  );
}

/* ─── Mobile Step ──────────────────────────────────────── */
function MobileStep({ step, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.65,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative flex gap-6 pb-14 last:pb-0"
    >
      {/* Left column: dot + vertical line segment */}
      <div className="relative flex flex-col items-center flex-shrink-0 w-6">
        <div className="relative z-10 w-6 h-6 rounded-full border-2 border-[#1A0D4D] bg-[#FAF9FC] flex items-center justify-center mt-0.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: step.accent }}
          />
        </div>
        {index < 2 && (
          <div className="flex-1 w-px bg-[#E2DFF0] mt-2" />
        )}
      </div>

      {/* Right column: content */}
      <div className="flex-1 pb-2">
        {/* Mono label + number */}
        <div className="flex items-baseline gap-3 mb-3">
          <span
            className="font-mono text-[0.6rem] tracking-[0.2em] uppercase font-medium"
            style={{ color: step.accent }}
          >
            {step.label}
          </span>
          <span className="font-mono text-[0.6rem] text-[#C4BDD8] tracking-widest">
            {step.num}
          </span>
        </div>

        <h3
          className="font-fraunces font-medium italic text-[#1A0D4D] leading-[1.15] mb-3 whitespace-pre-line"
          style={{ fontSize: "clamp(1.25rem, 5vw, 1.5rem)" }}
        >
          {step.headline}
        </h3>
        <p className="font-bricolage text-[0.9rem] text-[#5C5875] leading-[1.72]">
          {step.body}
        </p>
      </div>
    </motion.div>
  );
}
