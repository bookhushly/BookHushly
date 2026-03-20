"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

export default function InstallPrompt() {
  const { canInstall, isInstalling, install, dismiss } = useInstallPrompt();
  const [visible, setVisible] = useState(false); // animate in

  useEffect(() => {
    if (!canInstall) return;
    const t = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(t);
  }, [canInstall]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => dismiss(false), 300);
  };

  if (!canInstall) return null;

  return (
    <div
      role="dialog"
      aria-label="Install BookHushly app"
      className={`fixed bottom-0 left-0 right-0 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]
        transition-transform duration-300 ease-out
        ${visible ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="mx-auto max-w-md mb-4 rounded-2xl bg-white shadow-2xl shadow-black/15 border border-gray-100 overflow-hidden">
        <div className="h-[3px] w-full bg-gradient-to-r from-violet-600 via-purple-400 to-amber-400" />

        <div className="flex items-center gap-4 p-4">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm">
            <Smartphone className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">Add to Home Screen</p>
            <p className="text-gray-500 text-xs mt-0.5 leading-snug">
              Book faster · Offline access · Notifications
            </p>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Not now
          </button>
          <button
            onClick={install}
            disabled={isInstalling}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-all active:scale-95 disabled:opacity-70"
          >
            <Download className="w-4 h-4" />
            {isInstalling ? "Installing…" : "Install"}
          </button>
        </div>
      </div>
    </div>
  );
}
