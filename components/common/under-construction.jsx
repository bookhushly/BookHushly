// components/under-construction.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/*
  Design direction: "Refined mechanical" —
  A pulsing orb as the hero, geometric dashed rings orbiting it,
  a single animated progress bar that breathes, and minimal type.
  White bg, purple as the only accent. Zero clutter.
  All motion is CSS-only; no JS animation loops.
*/

export default function UnderConstruction({
  title = "Coming Soon",
  description,
}) {
  // Tiny hook: randomly shift the orb glow hue between purple shades on mount
  // so every visit feels subtly different — but it's still purple.
  const [glowOpacity, setGlowOpacity] = useState(0.35);
  useEffect(() => {
    setGlowOpacity(0.3 + Math.random() * 0.15);
  }, []);

  return (
    <div className="relative min-h-screen bg-white overflow-hidden flex flex-col items-center justify-center px-4">
      {/* ── keyframes ──────────────────────────────────────────────────── */}
      <style>{`
        /* slow rotation for the dashed rings */
        @keyframes spin-slow  { to { transform: rotate(360deg); } }
        @keyframes spin-rev   { to { transform: rotate(-360deg); } }

        /* the orb's inner pulse */
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1);   opacity: 0.9; }
          50%      { transform: scale(1.08); opacity: 1;   }
        }

        /* glow ring breathe */
        @keyframes glow-breathe {
          0%, 100% { opacity: 0.25; transform: scale(1);    }
          50%      { opacity: 0.45; transform: scale(1.15);  }
        }

        /* progress bar fill oscillation — looks like it's "working" */
        @keyframes progress-work {
          0%   { width: 38%; }
          40%  { width: 62%; }
          60%  { width: 58%; }
          80%  { width: 71%; }
          100% { width: 45%; }
        }

        /* staggered text reveal */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        /* subtle float for the whole orb group */
        @keyframes float {
          0%, 100% { transform: translateY(0px);  }
          50%      { transform: translateY(-10px); }
        }

        .animate-spin-slow  { animation: spin-slow 20s linear infinite; }
        .animate-spin-rev   { animation: spin-rev 28s linear infinite; }
        .animate-orb-pulse  { animation: orb-pulse 3s ease-in-out infinite; }
        .animate-glow       { animation: glow-breathe 4s ease-in-out infinite; }
        .animate-progress   { animation: progress-work 6s ease-in-out infinite; }
        .animate-float      { animation: float 6s ease-in-out infinite; }

        .reveal-0 { animation: fadeUp .7s cubic-bezier(.22,.61,0,1) .15s both; }
        .reveal-1 { animation: fadeUp .7s cubic-bezier(.22,.61,0,1) .30s both; }
        .reveal-2 { animation: fadeUp .7s cubic-bezier(.22,.61,0,1) .50s both; }
        .reveal-3 { animation: fadeUp .7s cubic-bezier(.22,.61,0,1) .70s both; }
        .reveal-4 { animation: fadeUp .7s cubic-bezier(.22,.61,0,1) .95s both; }
      `}</style>

      {/* ── subtle background texture: a very faint grid ──────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(147,51,234,0.035) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(147,51,234,0.035) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── back link (top-left) ────────────────────────────────────── */}
      <Link
        href="/vendor/dashboard"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-purple-600 transition-colors reveal-0"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      {/* ── orb + rings composition ──────────────────────────────────── */}
      <div
        className="relative flex items-center justify-center reveal-0"
        style={{ width: 220, height: 220 }}
      >
        {/* Outer dashed ring — slowest spin */}
        <div className="absolute inset-0 animate-spin-slow">
          <svg
            width="220"
            height="220"
            viewBox="0 0 220 220"
            className="absolute inset-0"
          >
            <circle
              cx="110"
              cy="110"
              r="104"
              fill="none"
              stroke="#9333ea"
              strokeWidth="1"
              strokeDasharray="12 18"
              strokeOpacity="0.22"
            />
          </svg>
        </div>

        {/* Middle dashed ring — reverse, slightly faster */}
        <div className="absolute inset-2 animate-spin-rev">
          <svg
            width="216"
            height="216"
            viewBox="0 0 216 216"
            className="absolute inset-0"
          >
            <circle
              cx="108"
              cy="108"
              r="96"
              fill="none"
              stroke="#9333ea"
              strokeWidth="1.2"
              strokeDasharray="6 14"
              strokeOpacity="0.3"
            />
          </svg>
        </div>

        {/* Glow halo behind orb */}
        <div
          className="absolute animate-glow rounded-full"
          style={{
            width: 120,
            height: 120,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, rgba(147,51,234,${glowOpacity}) 0%, transparent 70%)`,
          }}
        />

        {/* Orb itself — float + pulse */}
        <div
          className="animate-float relative z-10"
          style={{ width: 80, height: 80 }}
        >
          <div
            className="animate-orb-pulse w-full h-full rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
              boxShadow: "0 8px 32px rgba(147,51,234,0.35)",
            }}
          >
            {/* icon inside orb: a simple wrench-like shape via SVG */}
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── copy block ────────────────────────────────────────────────── */}
      <div className="mt-10 text-center max-w-md reveal-1">
        <h1 className="text-[32px] font-bold text-gray-900 tracking-tight reveal-1">
          {title}
        </h1>
        <p className="text-[14px] text-gray-400 mt-3 leading-relaxed reveal-2">
          {description ||
            "We're building something great here. Check back soon — it'll be worth the wait."}
        </p>
      </div>

      {/* ── animated progress bar ────────────────────────────────────── */}
      <div className="mt-8 w-full max-w-xs reveal-3">
        {/* track */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          {/* fill */}
          <div
            className="h-full bg-purple-600 rounded-full animate-progress"
            style={{ minWidth: "38%" }}
          />
        </div>
        <div className="flex items-center justify-between mt-2.5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
            In Progress
          </p>
          <p className="text-[11px] font-semibold text-purple-500 uppercase tracking-widest">
            Building…
          </p>
        </div>
      </div>

      {/* ── bottom nav hint ───────────────────────────────────────────── */}
      <div className="mt-14 reveal-4">
        <Link
          href="/vendor/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
