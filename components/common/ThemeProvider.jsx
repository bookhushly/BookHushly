"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// attribute="data-color-scheme" stores the preference without adding "dark"
// class to <html>, so public pages are never affected.
// The "dark" class is applied locally to each dashboard shell by DashboardThemeShell.
export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="data-color-scheme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
