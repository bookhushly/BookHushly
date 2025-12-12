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

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-32 bg-[#FAF9FC] overflow-hidden"
    >
      {/* Subtle background orbs – scaled for mobile */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-4 w-64 h-64 md:w-96 md:h-96 bg-[#1A0D4D]/5 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-24 right-4 w-56 h-56 md:w-80 md:h-80 bg-[#D94F2C]/5 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-[#1A0D4D] mb-3">
            How It Works
          </h2>
          <p className="text-base md:text-lg text-[#5F5F7A] max-w-2xl mx-auto leading-relaxed">
            Three simple steps to seamless hospitality across Africa.
          </p>
        </motion.div>

        {/* Responsive Timeline */}
        <div className="relative">
          {/* Vertical Line – Desktop Only */}
          <div className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-[#E4E1ED] h-full hidden lg:block" />
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-[#1A0D4D] origin-top hidden lg:block"
          />

          <div className="space-y-16 md:space-y-32">
            {steps.map((step, i) => (
              <StepCard key={i} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Responsive Step Card
function StepCard({ step, index }) {
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        type: "spring",
        stiffness: 100,
      }}
      className="relative"
    >
      {/* Mobile: Step Number Badge (above card) */}
      <div className="flex justify-center mb-6 lg:hidden">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2, type: "spring", stiffness: 200 }}
          className="w-12 h-12 rounded-full bg-white border-3 border-[#1A0D4D] flex items-center justify-center shadow-md"
        >
          <span className="text-lg font-bold text-[#1A0D4D]">{index + 1}</span>
        </motion.div>
      </div>

      {/* Desktop: Timeline Circle */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center justify-center -top-8">
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

      {/* Card Container */}
      <div
        className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-12 ${isLeft ? "" : "lg:flex-row-reverse"}`}
      >
        {/* Content Card */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <motion.div
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#E4E1ED] hover:shadow-xl transition-shadow w-full max-w-md"
          >
            <div
              className={`flex items-start gap-4 ${!isLeft && "lg:flex-row-reverse"}`}
            >
              <div
                className={`p-3 rounded-xl flex-shrink-0 ${
                  isLeft ? "bg-[#D94F2C]/10" : "bg-[#1A0D4D]/10"
                }`}
              >
                <step.icon
                  className={`h-6 w-6 ${isLeft ? "text-[#D94F2C]" : "text-[#1A0D4D]"}`}
                />
              </div>
              <div className="flex-1 text-left lg:text-left">
                <h3 className="text-xl md:text-2xl font-semibold text-[#1A0D4D] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm md:text-base text-[#5F5F7A] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Spacer – only on desktop */}
        <div className="hidden lg:block lg:w-1/2" />
      </div>
    </motion.div>
  );
}
