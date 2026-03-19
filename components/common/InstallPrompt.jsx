"use client";

import { useEffect, useState } from "react";
import { X, Download, Smartphone } from "lucide-react";

const DISMISSED_KEY = "bh_pwa_dismissed";
const DISMISSED_UNTIL_KEY = "bh_pwa_dismissed_until";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // for animation

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (window.navigator.standalone === true) return; // iOS standalone

    // Check if user dismissed recently (7 days)
    const dismissedUntil = localStorage.getItem(DISMISSED_UNTIL_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) return;

    // Check permanent dismiss
    if (localStorage.getItem(DISMISSED_KEY) === "true") return;

    function handleBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      // Small delay so it doesn't feel jarring on first load
      setTimeout(() => {
        setShow(true);
        requestAnimationFrame(() => setIsVisible(true));
      }, 3000);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    setIsInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      dismiss(true);
    } else {
      setIsInstalling(false);
      dismiss(false);
    }
    setDeferredPrompt(null);
  }

  function dismiss(permanent = false) {
    setIsVisible(false);
    setTimeout(() => setShow(false), 300);
    if (permanent) {
      localStorage.setItem(DISMISSED_KEY, "true");
    } else {
      // Snooze for 7 days
      localStorage.setItem(
        DISMISSED_UNTIL_KEY,
        String(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
    }
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Install BookHushly app"
      className={`
        fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe-area-inset-bottom
        transition-transform duration-300 ease-out
        ${isVisible ? "translate-y-0" : "translate-y-full"}
      `}
    >
      <div className="mx-auto max-w-md mb-4 rounded-2xl bg-white shadow-2xl shadow-black/15 border border-gray-100 overflow-hidden">
        {/* Purple accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-purple via-purple-400 to-hospitality-gold" />

        <div className="flex items-center gap-4 p-4">
          {/* App icon */}
          <div className="shrink-0 w-12 h-12 rounded-xl bg-brand-purple flex items-center justify-center shadow-sm">
            <Smartphone className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight">
              Add to Home Screen
            </p>
            <p className="text-gray-500 text-xs mt-0.5 leading-snug">
              Book faster, get offline access & notifications
            </p>
          </div>

          {/* Close */}
          <button
            onClick={() => dismiss(false)}
            aria-label="Dismiss"
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={() => dismiss(false)}
            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors active:scale-95"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-purple text-white text-sm font-semibold hover:bg-brand-purple/90 transition-all active:scale-95 disabled:opacity-70"
          >
            <Download className="w-4 h-4" />
            {isInstalling ? "Installing…" : "Install"}
          </button>
        </div>
      </div>
    </div>
  );
}
