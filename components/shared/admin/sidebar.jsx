"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  List,
  Calendar,
  Truck,
  Users,
  Settings,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Listings",
    href: "/admin/dashboard/listings",
    icon: List,
  },
  {
    title: "Bookings",
    href: "/admin/dashboard/bookings",
    icon: Calendar,
  },
  {
    title: "Logistics Requests",
    href: "/admin/dashboard/logistics-requests",
    icon: Truck,
  },
  {
    title: "Security Requests",
    href: "/admin/dashboard/security-requests",
    icon: Users,
  },
];

const bottomNavItems = [
  {
    title: "Settings",
    href: "/admin/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Profile",
    href: "/admin/dashboard/profile",
    icon: User,
  },
];

export function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const NavLink = ({ item, onClick }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;

    return (
      <Link href={item.href}>
        <div
          className={cn(
            "group flex items-center gap-3.5 px-4 py-3.5 rounded-lg text-[15px] font-medium transition-all duration-200",
            isActive
              ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20"
              : "text-white hover:bg-white/10 hover:text-white",
          )}
          onClick={onClick}
        >
          <Icon
            className={cn(
              "h-5 w-5 transition-colors",
              isActive ? "text-white" : "text-white/80 group-hover:text-white",
            )}
            strokeWidth={2}
          />
          <span className="tracking-tight">{item.title}</span>
        </div>
      </Link>
    );
  };

  const MobileNavLink = ({ item, onClick }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;

    return (
      <Link href={item.href}>
        <div
          className={cn(
            "group flex items-center gap-3.5 px-4 py-3.5 rounded-lg text-[15px] font-medium transition-all duration-200",
            isActive
              ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
          )}
          onClick={onClick}
        >
          <Icon
            className={cn(
              "h-5 w-5 transition-colors",
              isActive
                ? "text-white"
                : "text-gray-400 group-hover:text-gray-600",
            )}
            strokeWidth={2}
          />
          <span className="tracking-tight">{item.title}</span>
        </div>
      </Link>
    );
  };

  const SidebarContent = ({ isMobile = false }) => (
    <>
      {/* Logo Header */}
      <div className="h-20 flex items-center px-6 border-b border-white/10">
        <Link href="/" className="flex items-center">
          <Image
            src="/logos/logo.png"
            alt="BookHushly"
            width={160}
            height={160}
            className="object-contain"
          />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-8 px-4 overflow-y-auto">
        <div className="space-y-2">
          {navItems.map((item) =>
            isMobile ? (
              <MobileNavLink key={item.href} item={item} onClick={onClose} />
            ) : (
              <NavLink key={item.href} item={item} />
            ),
          )}
        </div>
      </nav>

      {/* Bottom Navigation - Fixed */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="space-y-2">
          {bottomNavItems.map((item) =>
            isMobile ? (
              <MobileNavLink key={item.href} item={item} onClick={onClose} />
            ) : (
              <NavLink key={item.href} item={item} />
            ),
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-purple-900 border-r border-white/10 fixed left-0 top-0 h-full z-40">
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
              <Link href="/admin" className="flex items-center">
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
            <SidebarContent isMobile={true} />
          </aside>
        </>
      )}
    </>
  );
}
