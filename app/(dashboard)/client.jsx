"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ChevronDown, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { NotificationBell } from "@/components/shared/notifications/NotificationBell";
import { CustomerSidebar } from "@/components/shared/customer/sidebar";
import { useLogout } from "@/hooks/use-auth";

const PAGE_TITLES = {
  "/dashboard/customer": "Overview",
  "/dashboard/customer/hotels": "Hotel Bookings",
  "/dashboard/customer/apartments": "Apartments",
  "/dashboard/customer/events": "Events",
  "/dashboard/customer/logistics": "Logistics",
  "/dashboard/customer/security": "Security",
  "/dashboard/customer/payments": "Payments",
  "/dashboard/customer/favorites": "Favourites",
  "/dashboard/customer/notifications": "Notifications",
  "/dashboard/customer/profile": "Profile",
};

function CustomerHeader({ user, onMenuClick }) {
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();

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

        {/* Desktop: page title (left-aligned) */}
        <h1 className="hidden lg:block text-[15px] font-semibold text-gray-900">
          {pageTitle}
        </h1>
      </div>

      {/* Mobile: page title (absolutely centered) */}
      <span className="lg:hidden absolute left-1/2 -translate-x-1/2 text-[13px] font-semibold text-gray-800 pointer-events-none">
        {pageTitle}
      </span>

      {/* Right — notifications + user */}
      <div className="flex items-center gap-1.5">
        <NotificationBell userId={user.id} align="right" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 h-8 pl-1.5 pr-2.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-violet-100 text-violet-700 text-[10px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-[13px] font-medium text-gray-700">
                {user.name}
              </span>
              <ChevronDown className="hidden sm:inline h-3 w-3 text-gray-400" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 shadow-lg bg-white shadow-black/10">
            <DropdownMenuLabel className="pb-2">
              <p className="text-[13px] font-semibold text-gray-900">{user.name}</p>
              <p className="text-[11px] font-normal text-gray-400 mt-0.5">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/customer/profile")}
              className="text-[13px] gap-2.5 cursor-pointer"
            >
              <User className="h-3.5 w-3.5 text-gray-400" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="text-[13px] gap-2.5 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              {logoutMutation.isPending ? (
                <>
                  <LoadingSpinner className="h-3.5 w-3.5" /> Signing out…
                </>
              ) : (
                <>
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function CustomerLayoutClient({ user, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/60 flex">
      <CustomerSidebar
        user={user}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <CustomerHeader user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-3 sm:px-5 py-4 sm:py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
