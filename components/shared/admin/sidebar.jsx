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
  X,
  User,
  ChevronUp,
  LogOut,
  Banknote,
  Users2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Nav structure (mirrors vendor sidebar's sectioned pattern) ──────────────
const navSections = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Listings", href: "/admin/dashboard/listings", icon: List },
      { title: "Vendors", href: "/admin/dashboard/vendors", icon: Users2 },
      { title: "Customers", href: "/admin/dashboard/customers", icon: Users2 },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Payments", href: "/admin/dashboard/payments", icon: Banknote },
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
    ],
  },
];

// ─── Profile Popover (identical API to vendor sidebar) ──────────────────────
function ProfilePopover({ admin, onLogout, onClose }) {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target))
        onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl border border-gray-200 shadow-lg shadow-black/10 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {admin?.name || "Admin"}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {admin?.email || "Administrator"}
        </p>
      </div>
      <div className="p-1.5">
        <Link
          href="/admin/dashboard/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <Link
          href="/admin/dashboard/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
        >
          <User className="h-4 w-4" />
          Profile
        </Link>
        <button
          onClick={() => {
            onClose();
            onLogout?.();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-gray-100 pt-3"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );
}

// ─── Bottom Profile Strip ────────────────────────────────────────────────────
function BottomProfile({ admin, isDark }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    console.log("logout");
  };

  const initial = (admin?.name || "A").charAt(0).toUpperCase();

  return (
    <div className="relative">
      {isOpen && (
        <ProfilePopover
          admin={admin}
          onLogout={handleLogout}
          onClose={() => setIsOpen(false)}
        />
      )}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3.5 transition-colors",
          isDark ? "hover:bg-purple-800" : "hover:bg-gray-50",
        )}
      >
        <div
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
            isDark
              ? "bg-purple-700 text-white"
              : "bg-purple-100 text-purple-700",
          )}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p
            className={cn(
              "text-[13px] font-semibold truncate",
              isDark ? "text-white" : "text-gray-900",
            )}
          >
            {admin?.name || "Admin"}
          </p>
          <p
            className={cn(
              "text-[11px] truncate",
              isDark ? "text-purple-300" : "text-gray-500",
            )}
          >
            Administrator
          </p>
        </div>
        <ChevronUp
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isDark ? "text-purple-300" : "text-gray-400",
            isOpen && "rotate-180",
          )}
        />
      </button>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  // wire to your actual admin auth hook — e.g. useAdmin() or useAuth()
  const admin = null; // replace with real admin data

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + "/admin/dashboard");

  // ── Sectioned nav (reused desktop & mobile) ─────────────────────────────
  const NavLinks = ({ isDark }) => (
    <div className="space-y-5">
      {navSections.map((section) => (
        <div key={section.label}>
          <p
            className={cn(
              "text-[10px] font-semibold uppercase tracking-widest px-4 mb-1.5",
              isDark ? "text-purple-400" : "text-gray-400",
            )}
          >
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "group flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150",
                      active
                        ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20"
                        : isDark
                          ? "text-purple-200 hover:bg-purple-800 hover:text-white"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    )}
                    onClick={!isDark ? onClose : undefined}
                  >
                    <Icon
                      className={cn(
                        "h-4.5 w-4.5 transition-colors",
                        active
                          ? "text-white"
                          : isDark
                            ? "text-purple-400 group-hover:text-purple-200"
                            : "text-gray-400 group-hover:text-gray-600",
                      )}
                      strokeWidth={2}
                    />
                    <span className="tracking-tight">{item.title}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* ── Desktop ─────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 bg-purple-900 fixed left-0 top-0 h-full z-40">
        <div className="h-20 flex items-center px-6 border-b border-purple-800 shrink-0">
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

        <nav className="flex-1 flex flex-col justify-start pt-6 px-4 overflow-y-auto">
          <NavLinks isDark={true} />
        </nav>

        <div className="border-t border-purple-800 shrink-0">
          <BottomProfile admin={admin} isDark={true} />
        </div>
      </aside>

      {/* ── Mobile ──────────────────────────────────────────────────────── */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="fixed left-0 top-0 h-full w-64 bg-white z-50 lg:hidden flex flex-col shadow-xl">
            <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
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

            <nav className="flex-1 pt-6 px-4 overflow-y-auto">
              <NavLinks isDark={false} />
            </nav>

            <div className="border-t border-gray-100 shrink-0">
              <BottomProfile admin={admin} isDark={false} />
            </div>
          </aside>
        </>
      )}
    </>
  );
}
