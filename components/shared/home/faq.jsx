"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "How does vendor verification work?",
    answer:
      "Every vendor submits NIN and CAC documents before their listing goes live. Our team reviews each application manually. Verified vendors display a badge — there are no anonymous operators on Bookhushly.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept Naira via Paystack (debit card, bank transfer, USSD) and cryptocurrency via NOWPayments (BTC, ETH, USDT and more). Your Bookhushly wallet balance carries across all services.",
  },
  {
    question: "Can I cancel or modify a booking?",
    answer:
      "Yes — cancellations and modifications are handled based on each vendor's published policy. Bookhushly coordinates the communication and, where eligible, the refund to your wallet or original payment method.",
  },
  {
    question: "How do logistics and security services work?",
    answer:
      "Unlike instant-book services, logistics and security run on a quote model. Submit your requirements, receive a detailed breakdown, review it, and pay only after approving the quote.",
  },
  {
    question: "Is there a fee to use the platform?",
    answer:
      "Browsing and booking is free for customers. Vendors pay a small commission per successful booking — no upfront listing fees, no hidden charges.",
  },
];

const EASE = [0.22, 1, 0.36, 1];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="bg-white py-20 md:py-32">
      <div className="container mx-auto px-6 lg:px-10 max-w-5xl">

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-16 lg:gap-24 items-start">

          {/* ── Left: header column ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            className="lg:sticky lg:top-32"
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-violet-600 mb-6">
              <span className="h-px w-8 bg-violet-500" />
              FAQ
            </span>

            <h2 className="text-[clamp(1.9rem,3.8vw,2.75rem)] leading-[1.1] font-medium text-[#1A0D4D] mb-6">
              <span className="font-fraunces font-medium italic">Common questions,</span>
              <br />
              <span className="font-bricolage text-[#1A0D4D]/45">straight answers.</span>
            </h2>

            <p className="text-sm text-[#6B6987] leading-relaxed mb-8 max-w-xs">
              Everything you need to know about bookings, payments, and how Bookhushly works.
            </p>

            <Link
              href="/support"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors group"
            >
              Visit the support center
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>

          {/* ── Right: accordion column ── */}
          <div>
            {/* Top border */}
            <div className="border-t border-gray-100" />

            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const num = String(index + 1).padStart(2, "0");

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, ease: EASE, delay: index * 0.07 }}
                  className="border-b border-gray-100"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="group flex items-start justify-between w-full py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 rounded-sm"
                    aria-expanded={isOpen}
                  >
                    {/* Number + question */}
                    <div className="flex items-start gap-4 pr-6">
                      <span className="shrink-0 font-mono text-[11px] text-[#1A0D4D]/25 mt-[0.35em] select-none tracking-tight">
                        {num}
                      </span>
                      <span className="font-fraunces italic text-base md:text-[1.05rem] font-medium text-[#1A0D4D] leading-snug group-hover:text-violet-700 transition-colors duration-200">
                        {faq.question}
                      </span>
                    </div>

                    {/* Chevron */}
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.28, ease: EASE }}
                      className="shrink-0 mt-0.5"
                    >
                      <ChevronDown
                        className={`w-[18px] h-[18px] transition-colors duration-200 ${
                          isOpen ? "text-violet-600" : "text-[#1A0D4D]/30 group-hover:text-violet-400"
                        }`}
                      />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="font-bricolage text-[0.9375rem] text-[#6B6987] leading-[1.75] pb-6 pl-10">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
