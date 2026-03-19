"use client";

import { useState } from "react";
import { VendorSidebar } from "@/components/shared/vendor/sidebar";
import { VendorHeader } from "@/components/shared/vendor/header";

export function VendorLayoutClient({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/60 flex">
      <VendorSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main column — pushed right by the sidebar spacer rendered inside VendorSidebar */}
      <div className="flex-1 flex flex-col min-w-0">
        <VendorHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-3 sm:px-5 py-4 sm:py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
