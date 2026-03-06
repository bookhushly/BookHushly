"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const SERVICES = [
  "Hotels & Stays",
  "Serviced Apartments",
  "Event Spaces",
  "Car Rentals",
  "Logistics",
  "Security Services",
];

const PROGRESS = 73;

export default function StillBuildingPage() {
  const [lineH, setLineH] = useState(0);
  const [progress, setProgress] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    // Vertical scaffold line
    let lh = 0;
    const lineId = setInterval(() => {
      lh += 2;
      if (lh >= 100) {
        lh = 100;
        clearInterval(lineId);
      }
      setLineH(lh);
    }, 12);

    // Progress bar
    const t = setTimeout(() => {
      let p = 0;
      const pid = setInterval(() => {
        p += 0.6;
        if (p >= PROGRESS) {
          p = PROGRESS;
          clearInterval(pid);
        }
        setProgress(p);
      }, 16);
    }, 800);

    // Mouse parallax
    const onMove = (e) => {
      setMouseX((e.clientX / window.innerWidth - 0.5) * 20);
      setMouseY((e.clientY / window.innerHeight - 0.5) * 20);
    };
    window.addEventListener("mousemove", onMove);

    return () => {
      clearInterval(lineId);
      clearTimeout(t);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background: "#faf9f7",
        fontFamily: "'Bricolage Grotesque', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300;1,9..144,400&family=Bricolage+Grotesque:wght@300;400;500;600&display=swap');

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes inkDraw {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.75); }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0,0); }
          25%  { transform: translate(-1%,-2%); }
          50%  { transform: translate(2%, 1%); }
          75%  { transform: translate(-1%, 2%); }
        }

        .r1 { animation: fadeSlideUp 0.9s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
        .r2 { animation: fadeSlideUp 0.9s 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .r3 { animation: fadeSlideUp 0.9s 0.55s cubic-bezier(0.16,1,0.3,1) both; }
        .r4 { animation: fadeSlideUp 0.9s 0.75s cubic-bezier(0.16,1,0.3,1) both; }
        .r5 { animation: fadeSlideUp 0.9s 0.90s cubic-bezier(0.16,1,0.3,1) both; }
        .ink { animation: inkDraw 1.4s 1.1s cubic-bezier(0.16,1,0.3,1) both; }

        .tag { animation: fadeSlideLeft 0.5s ease both; }
        .tag:nth-child(1) { animation-delay: 1.0s; }
        .tag:nth-child(2) { animation-delay: 1.1s; }
        .tag:nth-child(3) { animation-delay: 1.2s; }
        .tag:nth-child(4) { animation-delay: 1.3s; }
        .tag:nth-child(5) { animation-delay: 1.4s; }
        .tag:nth-child(6) { animation-delay: 1.5s; }
      `}</style>

      {/* Grain */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.032]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px",
          animation: "grain 0.4s steps(1) infinite",
        }}
      />

      {/* Parallax geometry */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          transform: `translate(${mouseX * 0.25}px, ${mouseY * 0.25}px)`,
          transition: "transform 0.8s ease-out",
        }}
      >
        {/* Top-right rings */}
        {[700, 520, 360].map((size, i) => (
          <div
            key={size}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              top: -size * 0.35,
              right: -size * 0.2,
              border: `1px solid rgba(124,58,237,${0.05 - i * 0.01})`,
            }}
          />
        ))}
        {/* Bottom-left glow */}
        <div
          className="absolute rounded-full"
          style={{
            width: 500,
            height: 500,
            bottom: -200,
            left: -120,
            background:
              "radial-gradient(circle, rgba(237,233,254,0.55) 0%, transparent 70%)",
          }}
        />
        {/* Subtle diagonal rule */}
        <div
          className="absolute"
          style={{
            width: 1,
            height: 260,
            bottom: "18%",
            right: "20%",
            background:
              "linear-gradient(180deg, transparent, rgba(124,58,237,0.1), transparent)",
            transform: "rotate(20deg)",
          }}
        />
      </div>

      {/* Vertical scaffold line */}
      <div
        className="fixed left-7 top-0 w-px z-20 origin-top"
        style={{
          height: `${lineH}vh`,
          background:
            "linear-gradient(180deg, transparent, rgba(124,58,237,0.25) 15%, rgba(124,58,237,0.12) 100%)",
          transition: "height 0.04s linear",
        }}
      />
      {[25, 50, 75].map((pos) => (
        <div
          key={pos}
          className="fixed z-20 transition-opacity duration-500"
          style={{
            left: 20,
            top: `${pos}vh`,
            width: 10,
            height: 1,
            background: "rgba(124,58,237,0.2)",
            opacity: lineH > pos ? 1 : 0,
          }}
        />
      ))}

      {/* ── Page layout ─────────────────────────────────────────────────── */}
      <div className="min-h-screen flex flex-col px-10 sm:px-16 lg:px-28 pt-10 pb-10">
        {/* Top bar */}
        <header className="r1 flex items-center justify-between">
          <div className="relative w-44 h-14">
            <Image
              src="/logo.png"
              alt="BookHushly"
              fill
              className="object-contain object-left"
            />
          </div>

          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{
              background: "rgba(124,58,237,0.07)",
              color: "#7c3aed",
              border: "1px solid rgba(124,58,237,0.14)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#7c3aed",
                animation: "pulse-dot 2s ease-in-out infinite",
              }}
            />
            Building
          </div>
        </header>

        {/* Centre content */}
        <main className="flex-1 flex flex-col justify-center max-w-5xl py-20">
          {/* Eyebrow */}
          <div className="r2 flex items-center gap-3 mb-7">
            <div className="w-7 h-px" style={{ background: "#7c3aed" }} />
            <span
              className="text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: "#7c3aed" }}
            >
              Nigeria's booking platform
            </span>
          </div>

          {/* Headline — 3 lines, oversized */}
          <div className="r3">
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: "clamp(2.8rem, 8.5vw, 7rem)",
                fontWeight: 300,
                lineHeight: 1.02,
                color: "#160e2b",
                letterSpacing: "-0.025em",
              }}
            >
              We're crafting
            </h1>
          </div>

          <div className="r3" style={{ animationDelay: "0.6s" }}>
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: "clamp(2.8rem, 8.5vw, 7rem)",
                fontWeight: 300,
                lineHeight: 1.02,
                color: "#160e2b",
                letterSpacing: "-0.025em",
                fontStyle: "italic",
              }}
            >
              <span style={{ color: "#7c3aed" }}>something</span> worth
            </h1>
          </div>

          {/* Third line + ink underline */}
          <div
            className="r3 relative inline-block"
            style={{ animationDelay: "0.65s" }}
          >
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: "clamp(2.8rem, 8.5vw, 7rem)",
                fontWeight: 300,
                lineHeight: 1.02,
                color: "#160e2b",
                letterSpacing: "-0.025em",
              }}
            >
              waiting for.
            </h1>
            <div
              className="ink absolute rounded-full"
              style={{
                bottom: 2,
                left: 0,
                height: 2,
                width: "55%",
                background: "linear-gradient(90deg, #7c3aed 0%, #ddd6fe 100%)",
                transformOrigin: "left",
              }}
            />
          </div>

          {/* Body */}
          <p
            className="r4 mt-9 max-w-md text-[15px] leading-[1.75]"
            style={{ color: "#8b7da0" }}
          >
            Hotels, serviced apartments, events, logistics, and security — all
            in one place. Built with care for Nigeria, launching very soon.
          </p>

          {/* Progress */}
          <div className="r5 mt-10 max-w-xs">
            <div className="flex items-baseline justify-between mb-2">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: "#c4b5fd" }}
              >
                Build progress
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: "#7c3aed", fontVariantNumeric: "tabular-nums" }}
              >
                {Math.round(progress)}%
              </span>
            </div>
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: 3, background: "rgba(124,58,237,0.09)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #6d28d9, #a78bfa)",
                  boxShadow: "0 0 10px rgba(124,58,237,0.35)",
                  transition: "width 0.08s linear",
                }}
              />
            </div>
          </div>
        </main>

        {/* Footer row */}
        <footer className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5">
          {/* Service tags */}
          <div className="flex flex-wrap gap-1.5">
            {SERVICES.map((s, i) => (
              <span
                key={s}
                className="tag px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background:
                    i === 0 ? "rgba(124,58,237,0.08)" : "rgba(0,0,0,0.04)",
                  color: i === 0 ? "#7c3aed" : "#9ca3af",
                  border: `1px solid ${i === 0 ? "rgba(124,58,237,0.16)" : "rgba(0,0,0,0.06)"}`,
                }}
              >
                {s}
              </span>
            ))}
          </div>

          {/* Copyright */}
          <p
            className="r5 text-[11px] shrink-0 leading-relaxed text-right"
            style={{ color: "#d1d5db" }}
          >
            © {new Date().getFullYear()} BookHushly
            <br />
            <span style={{ color: "#e5e7eb" }}>Longman Vicky & Co Ltd</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
