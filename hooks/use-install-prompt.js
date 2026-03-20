"use client";

import { useState, useEffect, useCallback } from "react";

const DISMISSED_KEY       = "bh_pwa_dismissed";
const DISMISSED_UNTIL_KEY = "bh_pwa_dismissed_until";

/**
 * Shared PWA install prompt hook.
 *
 * canInstall      – true when we should show the banner
 * hasNativePrompt – true when the browser gave us beforeinstallprompt
 *                   (we can trigger the native dialog)
 *                   false = show manual "Add to Home Screen" instructions
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall]         = useState(false);
  const [hasNativePrompt, setHasNativePrompt] = useState(false);
  const [isInstalling, setIsInstalling]     = useState(false);

  useEffect(() => {
    // Already running as installed PWA — never show
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) return;

    // Permanently dismissed
    if (localStorage.getItem(DISMISSED_KEY) === "true") return;

    // Snoozed
    const dismissedUntil = localStorage.getItem(DISMISSED_UNTIL_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) return;

    // Listen for the native prompt (may never fire if browser blocked it)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setHasNativePrompt(true);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Fallback: show the banner anyway after 1 s even without native prompt.
    // This covers browsers that suppressed beforeinstallprompt (denied earlier,
    // PWA uninstalled, cooldown period, etc.). We'll display manual instructions.
    const fallbackTimer = setTimeout(() => {
      setCanInstall((prev) => {
        if (!prev) return true; // native prompt hasn't fired yet → use fallback
        return prev;
      });
    }, 1000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const dismiss = useCallback((permanent = false) => {
    setCanInstall(false);
    setDeferredPrompt(null);
    setHasNativePrompt(false);
    if (permanent) {
      localStorage.setItem(DISMISSED_KEY, "true");
    } else {
      localStorage.setItem(
        DISMISSED_UNTIL_KEY,
        String(Date.now() + 7 * 24 * 60 * 60 * 1000),
      );
    }
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    setIsInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    dismiss(outcome === "accepted");
    setIsInstalling(false);
    setDeferredPrompt(null);
  }, [deferredPrompt, dismiss]);

  return { canInstall, hasNativePrompt, isInstalling, install, dismiss };
}
