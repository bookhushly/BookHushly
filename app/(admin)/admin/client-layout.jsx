"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/shared/admin/sidebar";
import { AdminHeader } from "@/components/shared/admin/header";

export function AdminLayoutClient({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      data-theme-shell
      className="min-h-screen flex"
      style={{ background: "var(--shell-bg)" }}
    >
      <AdminSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-5 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
