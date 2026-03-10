"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomerSidebar } from "@/components/shared/customer/sidebar";

const PAGE_TITLES = {
  "/dashboard/customer": "Overview",
  "/dashboard/customer/hotels": "Hotel Bookings",
  "/dashboard/customer/apartments": "Apartments",
  "/dashboard/customer/events": "Events",
  "/dashboard/customer/logistics": "Logistics",
  "/dashboard/customer/security": "Security",
  "/dashboard/customer/payments": "Payments",
  "/dashboard/customer/favorites": "Favourites",
  "/dashboard/customer/profile": "Profile",
};

function CustomerHeader({ user, onMenuClick }) {
  const pathname = usePathname();
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CU";

  const pageTitle =
    Object.entries(PAGE_TITLES)
      .sort(([a], [b]) => b.length - a.length)
      .find(
        ([href]) => pathname === href || pathname.startsWith(href + "/"),
      )?.[1] || "Dashboard";

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5 sticky top-0 z-30 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Mobile: logo + current page */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="relative w-32 h-32">
            <Image
              src="/logo.png"
              alt="BookHushly"
              fill
              className="object-contain object-left scale-150"
            />
          </div>
          <span className="text-gray-300 text-sm">·</span>
          <span className="text-[13px] font-semibold text-gray-800">
            {pageTitle}
          </span>
        </div>

        {/* Desktop: just the page title */}
        <h1 className="hidden lg:block text-[15px] font-semibold text-gray-900">
          {pageTitle}
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <button className="relative h-8 w-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="h-4 w-4" strokeWidth={2} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-violet-600" />
        </button>

        <Link
          href="/dashboard/customer/profile"
          className="flex items-center gap-2 h-8 pl-1.5 pr-2.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-violet-100 text-violet-700 text-[10px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-[13px] font-medium text-gray-700">
            {user.name}
          </span>
        </Link>
      </div>
    </header>
  );
}

export function CustomerLayoutClient({ user, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "linear-gradient(160deg, #f5f3ff 0%, #fdf8ff 45%, #faf5ff 100%)",
      }}
    >
      <CustomerSidebar
        user={user}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <CustomerHeader user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-5 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
