"use client";

import { useState, useEffect, useCallback } from "react";

const DISMISSED_KEY      = "bh_pwa_dismissed";
const DISMISSED_UNTIL_KEY = "bh_pwa_dismissed_until";

/**
 * Shared PWA install prompt hook.
 * Handles the beforeinstallprompt event, standalone detection, and dismiss state.
 *
 * @returns {{
 *   canInstall: boolean,
 *   isInstalling: boolean,
 *   install: () => Promise<void>,
 *   dismiss: (permanent?: boolean) => void,
 * }}
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall]         = useState(false);
  const [isInstalling, setIsInstalling]     = useState(false);

  useEffect(() => {
    // Already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) return;

    // Snooze or permanently dismissed
    const dismissedUntil = localStorage.getItem(DISMISSED_UNTIL_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) return;
    if (localStorage.getItem(DISMISSED_KEY) === "true") return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = useCallback((permanent = false) => {
    setCanInstall(false);
    setDeferredPrompt(null);
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

  return { canInstall, isInstalling, install, dismiss };
}
