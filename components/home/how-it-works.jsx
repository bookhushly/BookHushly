"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Search, CreditCard, CheckCircle } from "lucide-react";

const steps = [
  {
    title: "Browse Verified Services",
    desc: "Discover trusted hotels, event planners, caterers, and logistics — all vetted with KYC and real reviews.",
    icon: Search,
  },
  {
    title: "Book & Pay Securely",
    desc: "Choose your provider, see transparent pricing, and confirm instantly with encrypted payments.",
    icon: CreditCard,
  },
  {
    title: "Experience Excellence",
    desc: "Relax as professionals deliver on time. Full support and satisfaction guaranteed.",
    icon: CheckCircle,
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Smooth progress line growth
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative py-32 bg-[#FAF9FC] overflow-hidden">
      {/* Floating Background Orbs – Subtle & Static */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#1A0D4D]/3 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-[#D94F2C]/5 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative z-10 container mx-auto px-6 max-w-5xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-28"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A0D4D] mb-4">
            How It Works
          </h2>
          <p className="text-lg text-[#5F5F7A] max-w-2xl mx-auto leading-relaxed">
            Three simple steps to seamless hospitality across Africa.
          </p>
        </motion.div>

        {/* Scroll Timeline */}
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-[#E4E1ED] h-full hidden md:block" />
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-[#1A0D4D] origin-top hidden md:block"
          />

          <div className="space-y-32">
            {steps.map((step, i) => (
              <StepCard key={i} step={step} index={i} total={steps.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Extracted Step Component for Clarity
function StepCard({ step, index, total }) {
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.2,
        type: "spring",
        stiffness: 90,
      }}
      className={`relative flex flex-col md:flex-row items-center gap-12 ${
        isLeft ? "" : "md:flex-row-reverse"
      }`}
    >
      {/* Step Number Circle (on timeline) */}
      <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: index * 0.2 + 0.3,
            type: "spring",
            stiffness: 200,
          }}
          className="w-14 h-14 rounded-full bg-white border-4 border-[#1A0D4D] flex items-center justify-center shadow-lg z-20"
        >
          <span className="text-xl font-bold text-[#1A0D4D]">{index + 1}</span>
        </motion.div>
      </div>

      {/* Content Card */}
      <div
        className={`w-full md:w-1/2 ${isLeft ? "md:pr-20" : "md:pl-20"} ${
          isLeft ? "md:text-right" : "md:text-left"
        }`}
      >
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-[#E4E1ED] hover:shadow-xl transition-shadow"
        >
          <div
            className={`flex items-start gap-4 ${!isLeft && "md:flex-row-reverse"}`}
          >
            <div
              className={`p-3 rounded-xl ${isLeft ? "bg-[#D94F2C]/10" : "bg-[#1A0D4D]/10"}`}
            >
              <step.icon
                className={`h-6 w-6 ${isLeft ? "text-[#D94F2C]" : "text-[#1A0D4D]"}`}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-[#1A0D4D] mb-2">
                {step.title}
              </h3>
              <p className="text-[#5F5F7A] leading-relaxed">{step.desc}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Empty spacer for alignment */}
      <div className="w-full md:w-1/2" />
    </motion.div>
  );
}
