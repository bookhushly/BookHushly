"use client";

// Root loading screen — CSS-only, zero JS deps (no framer-motion).
// This keeps the loading chunk small so it doesn't delay FCP.

// Inline spinner: used without importing anything heavy
function Spinner() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        border: "3px solid rgba(255,255,255,0.3)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "spin 0.75s linear infinite",
      }}
    />
  );
}

export const SmartLoadingWrapper = ({ isLoading, children }) =>
  isLoading ? <Loading /> : children;

export const SkeletonLoader = ({ lines = 3, className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-4 bg-gray-200 rounded mb-3" style={{ width: `${60 + (i % 4) * 10}%` }} />
    ))}
  </div>
);

export default function Loading() {
  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes float-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .bh-loading-icon {
          animation: float-up 0.25s ease forwards;
        }
        .bh-loading-icon:nth-child(1) { animation-delay: 0ms; }
        .bh-loading-icon:nth-child(2) { animation-delay: 60ms; }
        .bh-loading-icon:nth-child(3) { animation-delay: 120ms; }
        .bh-loading-icon:nth-child(4) { animation-delay: 180ms; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #4c1d95 0%, #5b21b6 50%, #3730a3 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          animation: "fade-in 0.2s ease",
        }}
      >
        {/* Wordmark */}
        <h1
          style={{
            fontSize: "clamp(2rem, 6vw, 3rem)",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "1.5rem",
            letterSpacing: "-0.02em",
          }}
        >
          Book<span style={{ color: "#c4b5fd" }}>Hushly</span>
        </h1>

        {/* Service icons */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          {["🏨", "🏠", "🎉", "🚛"].map((icon, i) => (
            <span key={i} className="bh-loading-icon" style={{ fontSize: "1.5rem" }}>
              {icon}
            </span>
          ))}
        </div>

        {/* Spinner */}
        <Spinner />

        <p
          style={{
            marginTop: "1rem",
            color: "#c4b5fd",
            fontSize: "0.875rem",
          }}
        >
          Preparing your experience…
        </p>
      </div>
    </>
  );
}
