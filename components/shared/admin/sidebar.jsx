"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  List,
  Calendar,
  Wallet,
  Settings,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/vendor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Listings",
    href: "/vendor/dashboard/listings",
    icon: List,
  },
  {
    title: "Bookings",
    href: "/vendor/dashboard/bookings",
    icon: Calendar,
  },
  {
    title: "Wallet",
    href: "/vendor/dashboard/wallet",
    icon: Wallet,
  },
  {
    title: "Settings",
    href: "/vendor/dashboard/settings",
    icon: Settings,
  },
];

export function VendorSidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const SidebarContent = () => (
    <>
      {/* Logo Header with increased vertical spacing */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="BookHushly"
            width={160}
            height={160}
            className="object-contain"
          />
        </Link>
      </div>

      {/* Navigation with generous spacing */}
      <nav className="flex-1 py-8 px-4">
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "group flex items-center gap-3.5 px-4 py-3 rounded-lg text-[15px] font-medium transition-all duration-200",
                    isActive
                      ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-600"
                    )}
                    strokeWidth={2}
                  />
                  <span className="tracking-tight">{item.title}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 fixed left-0 top-0 h-full z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="fixed left-0 top-0 h-full w-64 bg-white z-50 lg:hidden flex flex-col border-r border-gray-100 shadow-xl">
            <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
              <Link href="/vendor" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="BookHushly"
                  width={160}
                  height={160}
                  className="object-contain"
                />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
            <nav className="flex-1 py-8 px-4">
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          "group flex items-center gap-3.5 px-4 py-3 rounded-lg text-[15px] font-medium transition-all duration-200",
                          isActive
                            ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        )}
                        onClick={onClose}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isActive
                              ? "text-white"
                              : "text-gray-400 group-hover:text-gray-600"
                          )}
                          strokeWidth={2}
                        />
                        <span className="tracking-tight">{item.title}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
