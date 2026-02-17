"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  LayoutDashboard,
  Hotel,
  Building2,
  Ticket,
  Truck,
  Shield,
  User,
  CreditCard,
  Heart,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/dashboard/customer",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Hotel Bookings",
    href: "/dashboard/customer/hotels",
    icon: Hotel,
  },
  {
    label: "Apartments",
    href: "/dashboard/customer/apartments",
    icon: Building2,
  },
  {
    label: "Events",
    href: "/dashboard/customer/events",
    icon: Ticket,
  },
  {
    label: "Logistics",
    href: "/dashboard/customer/logistics",
    icon: Truck,
  },
  {
    label: "Security",
    href: "/dashboard/customer/security",
    icon: Shield,
  },
  {
    label: "Payments",
    href: "/dashboard/customer/payments",
    icon: CreditCard,
  },
  {
    label: "Favorites",
    href: "/dashboard/customer/favorites",
    icon: Heart,
  },
  {
    label: "Profile",
    href: "/dashboard/customer/profile",
    icon: User,
  },
];

export function CustomerSidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-purple-100 hidden lg:flex flex-col">
      {/* Brand */}
      {/* <div className="px-6 py-5 border-b border-purple-100">
        <Link href="/" className="flex items-center">
          <Image
            src="/logos/colored.png"
            alt="BookHushly"
            width={160}
            height={40}
            className="object-contain"
          />
        </Link>
      </div> */}

      {/* User info */}
      <div className="px-4 py-4 border-b border-purple-50">
        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
          <Avatar className="h-9 w-9 border-2 border-purple-200">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-purple-600 text-white text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-purple-50 hover:text-purple-700",
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive
                    ? "text-white"
                    : "text-gray-400 group-hover:text-purple-600",
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="h-3.5 w-3.5 text-purple-200" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-purple-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 group"
        >
          <LogOut className="h-4 w-4 group-hover:text-red-500" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
