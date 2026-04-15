// Server component — no "use client", no Framer Motion.
// Accordion uses native <details>/<summary> — zero JS, browser-native toggle.
// Open animation: CSS @starting-style (Chrome 117+, Firefox 129+, Safari 17.5+).
// Browsers without @starting-style see answers appear instantly — graceful.
// Chevron rotation: CSS `details[open] summary .faq-chevron` selector.
// Scroll entry: animation-timeline:view() via .faq-* classes in globals.css.

import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How does vendor verification work?",
    a: "Every vendor submits NIN and CAC documents before their listing goes live. Our team reviews each application manually. Verified vendors display a badge — there are no anonymous operators on BookHushly.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept Naira via Paystack (debit card, bank transfer, USSD) and cryptocurrency via NOWPayments (BTC, ETH, USDT and more). Your BookHushly wallet balance carries across all services.",
  },
  {
    q: "Can I cancel or modify a booking?",
    a: "Yes — cancellations and modifications follow each vendor's published policy. BookHushly coordinates the communication and, where eligible, processes refunds to your wallet or original payment method.",
  },
  {
    q: "How do logistics and security services work?",
    a: "Unlike instant-book services, logistics and security run on a quote model. Submit your requirements, receive a detailed breakdown, review it, and pay only after approving the quote.",
  },
  {
    q: "Is there a fee to use the platform?",
    a: "Browsing and booking is completely free for customers. Vendors pay a small commission per confirmed booking — no upfront listing fees, no hidden charges.",
  },
];

export default function FAQSection() {
  return (
    <section className="bg-white py-24 md:py-36 border-t border-[#EDEAF5]">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.7fr] gap-16 lg:gap-24 items-start">

          {/*
            ── Left — sticky header ──────────────────────────────────────────
            No eyebrow label. Headline carries the section identity.
          */}
          <div className="faq-header lg:sticky lg:top-32">
            <h2
              className="text-[clamp(2rem,3.8vw,2.75rem)] leading-[1.08] mb-6"
              style={{ letterSpacing: "-0.025em" }}
            >
              <span className="font-bricolage font-semibold text-[#1A0D4D] block">
                Common questions,
              </span>
              <span className="font-fraunces font-medium italic block" style={{ color: "#7C69C4" }}>
                straight answers.
              </span>
            </h2>

            <p className="font-bricolage text-[0.9375rem] text-[#4A4665] leading-relaxed mb-8 max-w-[34ch]">
              Everything you need to know about bookings, payments, and how BookHushly works.
            </p>

            <Link
              href="/support"
              className="group inline-flex items-center gap-1.5 font-bricolage text-[0.9375rem] font-medium text-violet-600 hover:text-violet-700 transition-colors"
            >
              Visit the support centre
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/*
            ── Right — accordion (native <details>/<summary>) ───────────────
            No JS needed. The browser toggles [open] attribute natively.
            CSS in globals.css handles:
              - answer reveal animation via @starting-style
              - chevron rotation via details[open] selector
              - scroll entry via .faq-item-N
          */}
          <div className="border-t border-[#EDEAF5]">
            {FAQS.map(({ q, a }, i) => (
              <details
                key={i}
                className={`faq-item-${i + 1} group border-b border-[#EDEAF5]`}
              >
                <summary className="flex items-start justify-between w-full py-6 cursor-pointer select-none list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 rounded-sm">
                  {/* Number + question */}
                  <div className="flex items-start gap-4 pr-6">
                    <span className="shrink-0 font-mono text-[12px] text-[#C4BDD8] mt-[0.3em] tabular-nums select-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-fraunces italic font-medium text-[#1A0D4D] text-[1rem] md:text-[1.0625rem] leading-snug group-hover:text-violet-700 transition-colors duration-200">
                      {q}
                    </span>
                  </div>

                  {/* Chevron — rotates via CSS details[open] selector */}
                  <ChevronDown
                    className="faq-chevron shrink-0 mt-0.5 w-[18px] h-[18px] text-[#6B6987] group-hover:text-violet-600 transition-colors duration-200"
                    aria-hidden="true"
                  />
                </summary>

                {/* Answer — animates open via @starting-style in globals.css */}
                <p className="faq-answer font-bricolage text-[0.9375rem] text-[#4A4665] leading-[1.75] pb-6 pl-10">
                  {a}
                </p>
              </details>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
