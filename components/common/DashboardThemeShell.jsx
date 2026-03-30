"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Wraps dashboard layouts and applies the `dark` class ONLY to this div,
 * so dark mode never leaks out to public-facing pages.
 */
export function DashboardThemeShell({ children, className, style, ...props }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div
      data-theme-shell
      className={`${isDark ? "dark" : ""} ${className ?? ""}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
