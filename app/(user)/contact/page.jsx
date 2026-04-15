"use client";

// Client component — form state requires useState.
// Typography: font-fraunces italic for display, font-bricolage for body/UI
// Colors: #1A0D4D, #4A4665, violet-600, #EDEAF5 borders — matching landing page
// FAQ uses native <details>/<summary> — zero JS, same as landing page FAQ section
// Scroll entry: .reveal / .reveal-stagger via PageReveal

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  Clock,
  Send,
  CheckCircle,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import PageReveal from "@/components/common/page-reveal";

// ── data ──────────────────────────────────────────────────────────────────────

const CONTACT_INFO = [
  {
    Icon: Mail,
    title: "Email",
    detail: "help@bookhushly.com",
    sub: "We reply within 2–4 hours",
  },
  {
    Icon: Phone,
    title: "Phone",
    detail: "+234 814 769 5625",
    sub: "Mon–Fri, 9AM–6PM WAT",
  },
  {
    Icon: Clock,
    title: "Hours",
    detail: "Mon–Fri, 9AM–6PM",
    sub: "AI support available 24/7",
  },
];

const RESPONSE_TIMES = [
  { label: "General inquiries",  time: "2–4 hours"   },
  { label: "Technical support",  time: "1–2 hours"   },
  { label: "Vendor applications", time: "24–48 hours" },
];

const FAQS = [
  {
    q: "How do I become a verified vendor?",
    a: "Register as a vendor, complete KYC verification with your NIN and CAC documents, and wait for admin review — typically 2–3 business days. Verified vendors display a badge on their listings.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Naira via Paystack (debit card, bank transfer, USSD) and cryptocurrency via NOWPayments (BTC, ETH, USDT and more). Your BookHushly wallet balance works across all services.",
  },
  {
    q: "How do I cancel or modify a booking?",
    a: "Cancellations and modifications follow each vendor's published policy. BookHushly coordinates the communication and, where eligible, processes refunds to your wallet or original payment method.",
  },
  {
    q: "Is my payment information secure?",
    a: "Yes. All payments go through PCI DSS-compliant gateways (Paystack and NOWPayments). We never store card details on our servers.",
  },
];

// ── component ─────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "general",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSubmitted(true);
      toast.success("Message sent!", {
        description: "We'll be in touch within 24 hours.",
      });
    } catch {
      toast.error("Failed to send", {
        description: "Please try again or email us directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6 pt-20">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-7 h-7 text-emerald-500" strokeWidth={1.5} />
          </div>
          <h2
            className="font-fraunces italic text-[#1A0D4D] mb-3"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)" }}
          >
            Message sent.
          </h2>
          <p className="font-bricolage text-[#4A4665] leading-relaxed mb-8">
            We&apos;ll get back to you at{" "}
            <span className="font-medium text-[#1A0D4D]">{formData.email}</span>{" "}
            within 24 hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="font-bricolage text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors inline-flex items-center gap-1.5"
          >
            Send another message
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageReveal />
      <div className="flex flex-col">

        {/* ── 1. Hero ───────────────────────────────────────────────────── */}
        <section className="relative bg-white overflow-hidden pt-32 pb-16 md:pt-44 md:pb-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)",
            }}
          />

          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <div className="reveal">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-violet-500 mb-8">
                Support
              </p>
              <h1
                className="leading-[1.04] tracking-tight text-balance mb-6"
                style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)" }}
              >
                <span className="font-bricolage font-semibold text-[#1A0D4D] block">
                  We&apos;re here
                </span>
                <span
                  className="font-fraunces font-medium italic block"
                  style={{ color: "#7C3AED" }}
                >
                  to help.
                </span>
              </h1>
              <p className="font-bricolage text-[1.0625rem] text-[#4A4665] max-w-[44ch] mx-auto leading-relaxed">
                Have a question, a problem, or just want to say hello? Our team
                responds fast.
              </p>
            </div>
          </div>
        </section>

        {/* ── 2. Form + Info ────────────────────────────────────────────── */}
        <section className="bg-white py-16 md:py-24 border-t border-[#EDEAF5]">
          <div className="mx-auto max-w-5xl px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16 xl:gap-20">

              {/* ── Form ── */}
              <div className="reveal">
                <h2 className="font-bricolage font-semibold text-[#1A0D4D] text-xl mb-8">
                  Send us a message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name + Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="name"
                        className="font-bricolage text-sm font-medium text-[#1A0D4D]"
                      >
                        Full name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="font-bricolage border-[#EDEAF5] focus-visible:ring-violet-400/30 focus-visible:border-violet-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="email"
                        className="font-bricolage text-sm font-medium text-[#1A0D4D]"
                      >
                        Email address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="font-bricolage border-[#EDEAF5] focus-visible:ring-violet-400/30 focus-visible:border-violet-400"
                      />
                    </div>
                  </div>

                  {/* Type */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="type"
                      className="font-bricolage text-sm font-medium text-[#1A0D4D]"
                    >
                      Type
                    </Label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-[#EDEAF5] bg-white rounded-lg font-bricolage text-sm text-[#1A0D4D] focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-colors"
                    >
                      <option value="general">General inquiry</option>
                      <option value="support">Technical support</option>
                      <option value="vendor">Vendor application</option>
                      <option value="partnership">Partnership</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="subject"
                      className="font-bricolage text-sm font-medium text-[#1A0D4D]"
                    >
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="font-bricolage border-[#EDEAF5] focus-visible:ring-violet-400/30 focus-visible:border-violet-400"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="message"
                      className="font-bricolage text-sm font-medium text-[#1A0D4D]"
                    >
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us how we can help..."
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      required
                      className="font-bricolage border-[#EDEAF5] focus-visible:ring-violet-400/30 focus-visible:border-violet-400 resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group inline-flex items-center gap-2.5 h-[3.25rem] px-8 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bricolage font-semibold text-[0.9375rem] rounded-xl transition-colors duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.3)]"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner className="h-4 w-4" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send message
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* ── Info sidebar ── */}
              <div className="reveal reveal-right lg:sticky lg:top-32 space-y-4">

                {/* Contact details */}
                <div className="rounded-2xl border border-[#EDEAF5] bg-[#F8F7FB] overflow-hidden">
                  {CONTACT_INFO.map(({ Icon, title, detail, sub }, i) => (
                    <div
                      key={title}
                      className={`flex items-start gap-3.5 px-5 py-5 ${
                        i < CONTACT_INFO.length - 1 ? "border-b border-[#EDEAF5]" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-violet-600" strokeWidth={1.6} />
                      </div>
                      <div>
                        <p className="font-bricolage text-[11px] font-medium text-[#9E98BB] uppercase tracking-wider mb-0.5">
                          {title}
                        </p>
                        <p className="font-bricolage text-sm font-semibold text-[#1A0D4D]">
                          {detail}
                        </p>
                        <p className="font-bricolage text-xs text-[#6B6987]">
                          {sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Response times */}
                <div className="rounded-2xl border border-[#EDEAF5] bg-white overflow-hidden">
                  <div className="px-5 pt-5 pb-1">
                    <p className="font-bricolage text-[11px] font-medium text-[#9E98BB] uppercase tracking-wider mb-3">
                      Response times
                    </p>
                  </div>
                  {RESPONSE_TIMES.map(({ label, time }, i) => (
                    <div
                      key={label}
                      className={`flex items-center justify-between px-5 py-3.5 ${
                        i < RESPONSE_TIMES.length - 1 ? "border-b border-[#EDEAF5]" : "pb-5"
                      }`}
                    >
                      <span className="font-bricolage text-sm text-[#4A4665]">
                        {label}
                      </span>
                      <span className="font-mono text-xs text-violet-600 font-medium">
                        {time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. FAQ ────────────────────────────────────────────────────── */}
        {/*
          Native <details>/<summary> accordion — zero JS.
          Chevron rotation and answer reveal animation: globals.css .faq-chevron + .faq-answer
        */}
        <section className="bg-[#F8F7FB] py-24 md:py-36 border-t border-[#EDEAF5]">
          <div className="mx-auto max-w-5xl px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.7fr] gap-16 lg:gap-24 items-start">

              {/* Left — sticky header */}
              <div className="reveal lg:sticky lg:top-32">
                <h2
                  className="text-[clamp(2rem,3.8vw,2.75rem)] leading-[1.08] mb-6"
                  style={{ letterSpacing: "-0.025em" }}
                >
                  <span className="font-bricolage font-semibold text-[#1A0D4D] block">
                    Quick answers,
                  </span>
                  <span
                    className="font-fraunces font-medium italic block"
                    style={{ color: "#7C69C4" }}
                  >
                    no waiting.
                  </span>
                </h2>
                <p className="font-bricolage text-[0.9375rem] text-[#4A4665] leading-relaxed max-w-[34ch]">
                  Common questions about bookings, payments, and how BookHushly
                  works.
                </p>
              </div>

              {/* Right — accordion */}
              <div className="reveal-stagger border-t border-[#EDEAF5]">
                {FAQS.map(({ q, a }, i) => (
                  <details
                    key={i}
                    className={`faq-item-${i + 1} group border-b border-[#EDEAF5]`}
                  >
                    <summary className="flex items-start justify-between w-full py-6 cursor-pointer select-none list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 rounded-sm">
                      <div className="flex items-start gap-4 pr-6">
                        <span className="shrink-0 font-mono text-[12px] text-[#C4BDD8] mt-[0.3em] tabular-nums select-none">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-fraunces italic font-medium text-[#1A0D4D] text-[1rem] md:text-[1.0625rem] leading-snug group-hover:text-violet-700 transition-colors duration-200">
                          {q}
                        </span>
                      </div>
                      <ChevronDown
                        className="faq-chevron shrink-0 mt-0.5 w-[18px] h-[18px] text-[#6B6987] group-hover:text-violet-600 transition-colors duration-200"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="faq-answer font-bricolage text-[0.9375rem] text-[#4A4665] leading-[1.75] pb-6 pl-10">
                      {a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
