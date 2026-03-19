"use client";

import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);

  function handleRetry() {
    setIsRetrying(true);
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      {/* Brand strip */}
      <div className="mb-10">
        <span className="text-brand-purple font-fraunces text-2xl font-bold tracking-tight">
          Book<span className="text-hospitality-gold">Hushly</span>
        </span>
      </div>

      {/* Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-brand-purple/10 flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-brand-purple" strokeWidth={1.5} />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center border-2 border-white">
          <span className="text-sm">📶</span>
        </div>
      </div>

      {/* Copy */}
      <h1 className="font-fraunces text-3xl font-bold text-gray-900 mb-3">
        You&apos;re offline
      </h1>
      <p className="text-gray-500 text-base max-w-xs leading-relaxed mb-10">
        No internet connection right now. Check your network and try again — your bookings are safely saved.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-brand-purple text-white font-semibold text-sm transition-all hover:bg-brand-purple/90 active:scale-95 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
          {isRetrying ? "Connecting…" : "Try again"}
        </button>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm transition-all hover:bg-gray-50 active:scale-95"
        >
          <Home className="w-4 h-4" />
          Go home
        </Link>
      </div>

      {/* Footer hint */}
      <p className="mt-12 text-xs text-gray-400">
        Previously visited pages may still be available below
      </p>
    </div>
  );
}
