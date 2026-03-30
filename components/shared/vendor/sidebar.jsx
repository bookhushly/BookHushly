"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  List,
  Calendar,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  Wallet,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  X,
  Bell,
  HelpCircle,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ThemeToggle } from "@/components/common/ThemeToggle";

const NAV = [
  {
    section: "Main",
    items: [
      { label: "Overview", href: "/vendor/dashboard", icon: LayoutDashboard },
      { label: "Listings", href: "/vendor/dashboard/listings", icon: List },
      { label: "Bookings", href: "/vendor/dashboard/bookings", icon: Calendar },
    ],
  },
  {
    section: "Finance",
    items: [
      {
        label: "Analytics",
        href: "/vendor/dashboard/analytics",
        icon: TrendingUp,
      },
      { label: "Wallet", href: "/vendor/dashboard/wallet", icon: Wallet },
      {
        label: "Payments",
        href: "/vendor/dashboard/payments",
        icon: CreditCard,
      },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "KYC", href: "/vendor/dashboard/kyc", icon: ShieldCheck },
      { label: "Settings", href: "/vendor/dashboard/settings", icon: Settings },
    ],
  },
];

function Tooltip({ label, children }) {
  return (
    <div className="relative group/tip">
      {children}
      <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150">
        <div className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </div>
      </div>
    </div>
  );
}

function ProfilePopover({ vendor, onLogout, onClose, isLoggingOut }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700
                 shadow-xl shadow-black/10 overflow-hidden z-50"
    >
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-violet-50/60 dark:bg-violet-900/20">
        <p className="text-[13px] font-medium text-gray-900 dark:text-gray-100 truncate">
          {vendor?.business_name || "Vendor"}
        </p>
        <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium truncate capitalize">
          {vendor?.business_category?.replace(/_/g, " ") || "Vendor Account"}
        </p>
      </div>
      <div className="p-1.5 space-y-0.5">
        <Link
          href="/vendor/dashboard/settings"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-700 dark:text-gray-300
                     hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-400 transition-colors"
        >
          <Settings className="h-4 w-4" /> Settings
        </Link>
        <Link
          href="/vendor/dashboard/profile"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-700 dark:text-gray-300
                     hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-400 transition-colors"
        >
          <User className="h-4 w-4" /> Profile
        </Link>
        <div className="pt-1 mt-1 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => {
              onClose();
              onLogout?.();
            }}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px]
                       text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? (
              <>
                <LoadingSpinner className="h-4 w-4" /> Signing out…
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" /> Sign out
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function VendorSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { data: authData } = useAuth();
  const logoutMutation = useLogout();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const vendor = authData?.vendor;
  const initial = (vendor?.business_name || "V").charAt(0).toUpperCase();

  const isActive = (href) =>
    href === "/vendor/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  const w = collapsed ? "w-[68px]" : "w-[220px]";

  const renderNav = (isMobile = false) =>
    NAV.map(({ section, items }) => (
      <div key={section} className="space-y-0.5">
        {(!collapsed || isMobile) && (
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500 px-3 pt-3 pb-1">
            {section}
          </p>
        )}
        {collapsed && !isMobile && <div className="h-3" />}
        {items.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          const link = (
            <Link
              key={href}
              href={href}
              onClick={isMobile ? onClose : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl text-[13.5px] font-medium transition-all duration-150 group",
                collapsed && !isMobile
                  ? "justify-center h-10 w-10 mx-auto"
                  : "h-9 px-3 w-full",
                active
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-600/25"
                  : "text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-400",
              )}
            >
              <Icon
                className={cn(
                  "shrink-0 transition-colors",
                  collapsed && !isMobile ? "h-[18px] w-[18px]" : "h-4 w-4",
                  active
                    ? "text-white"
                    : "text-gray-400 dark:text-gray-500 group-hover:text-violet-600 dark:group-hover:text-violet-400",
                )}
                strokeWidth={2}
              />
              {(!collapsed || isMobile) && (
                <span className="truncate">{label}</span>
              )}
            </Link>
          );
          return collapsed && !isMobile ? (
            <Tooltip key={href} label={label}>
              {link}
            </Tooltip>
          ) : (
            <div key={href}>{link}</div>
          );
        })}
      </div>
    ));

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 transition-all duration-200 ease-out",
          "bg-white dark:bg-[hsl(244,25%,11%)] border-r border-gray-100 dark:border-gray-800",
          w,
        )}
      >
        <div
          className={cn(
            "h-16 flex items-center border-b border-gray-100 dark:border-gray-800 shrink-0 relative",
            collapsed ? "justify-center px-0" : "px-4 justify-between",
          )}
        >
          {!collapsed && (
            <Link href="/" className="flex items-center">
              <div className="relative w-32 h-32">
                <Image
                  src="/logo.png"
                  alt="BookHushly"
                  fill
                  className="object-contain object-left scale-150 pointer-events-none dark:brightness-0 dark:invert"
                />
              </div>
            </Link>
          )}
          <div className={cn("flex items-center gap-1", collapsed && "mx-auto")}>
            {!collapsed && <ThemeToggle />}
            <button
              onClick={() => setCollapsed((p) => !p)}
              className="h-6 w-6 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <nav
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden py-3",
            collapsed ? "px-2" : "px-3",
          )}
        >
          {renderNav(false)}
        </nav>

        <div className="border-t border-gray-100 dark:border-gray-800 shrink-0 relative">
          {profileOpen && (
            <ProfilePopover
              vendor={vendor}
              onLogout={() => logoutMutation.mutate()}
              onClose={() => setProfileOpen(false)}
              isLoggingOut={logoutMutation.isPending}
            />
          )}
          {collapsed ? (
            <Tooltip label={vendor?.business_name || "Vendor"}>
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="w-full flex justify-center py-3.5 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400 flex items-center justify-center text-sm font-medium shrink-0">
                  {initial}
                </div>
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={() => setProfileOpen((p) => !p)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-violet-50/60 dark:hover:bg-violet-900/30 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400 flex items-center justify-center text-sm font-medium shrink-0">
                {initial}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-medium text-gray-900 dark:text-gray-100 truncate">
                  {vendor?.business_name || "Vendor"}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                  Vendor account
                </p>
              </div>
              <ChevronUp
                className={cn(
                  "h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0 transition-transform duration-200",
                  profileOpen && "rotate-180",
                )}
              />
            </button>
          )}
        </div>
      </aside>

      <div
        className={cn(
          "hidden lg:block shrink-0 transition-all duration-200",
          w,
        )}
      />

      {/* ── Mobile Drawer ── */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          <aside className="fixed left-0 top-0 h-full w-[260px] bg-white dark:bg-[hsl(244,25%,11%)] z-50 lg:hidden flex flex-col shadow-2xl border-r border-gray-100 dark:border-gray-800">
            <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="relative w-32 h-32">
                <Image
                  src="/logo.png"
                  alt="BookHushly"
                  fill
                  className="object-contain object-left scale-150 dark:brightness-0 dark:invert"
                />
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0">
              {renderNav(true)}
            </nav>
            <div className="border-t border-gray-100 dark:border-gray-800 shrink-0 relative">
              {profileOpen && (
                <ProfilePopover
                  vendor={vendor}
                  onLogout={() => logoutMutation.mutate()}
                  onClose={() => setProfileOpen(false)}
                  isLoggingOut={logoutMutation.isPending}
                />
              )}
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-violet-50/60 dark:hover:bg-violet-900/30 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400 flex items-center justify-center text-sm font-medium shrink-0">
                  {initial}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] font-medium text-gray-900 dark:text-gray-100 truncate">
                    {vendor?.business_name || "Vendor"}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                    Vendor account
                  </p>
                </div>
                <ChevronUp
                  className={cn(
                    "h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0 transition-transform duration-200",
                    profileOpen && "rotate-180",
                  )}
                />
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
