"use client";

import { useState } from "react";
import { VendorSidebar } from "../../../components/shared/admin/sidebar";
import { VendorHeader } from "../../../components/shared/admin/header";
import { SessionProvider } from "@/components/auth/session-provider";

export function VendorLayoutClient({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-purple-50">
      <SessionProvider>
        <VendorSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col lg:ml-60 overflow-hidden">
          <VendorHeader onMenuClick={() => setIsSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto">
            <div className="p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </SessionProvider>
    </div>
  );
}
