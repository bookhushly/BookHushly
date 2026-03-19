"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users2,
  Users,
  Banknote,
  Truck,
  Shield,
  Settings,
  User,
  LogOut,
  ChevronUp,
  X,
  Brain,
  BarChart2,
  Bell,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useUnreadCount } from "@/hooks/use-notifications";

const NAV = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Vendors", href: "/admin/dashboard/vendors", icon: Users2 },
      { label: "Customers", href: "/admin/dashboard/customers", icon: Users },
    ],
  },
  {
    section: "Operations",
    items: [
      { label: "Payments", href: "/admin/dashboard/payments", icon: Banknote },
      {
        label: "Logistics",
        href: "/admin/dashboard/logistics-requests",
        icon: Truck,
      },
      {
        label: "Security",
        href: "/admin/dashboard/security-requests",
        icon: Shield,
      },
    ],
  },
  {
    section: "System",
    items: [
      { label: "Notifications", href: "/admin/dashboard/notifications", icon: Bell,      badge: true  },
      { label: "AI Settings",   href: "/admin/dashboard/settings",      icon: Brain                   },
      { label: "AI Analytics",  href: "/admin/dashboard/ai-analytics",  icon: BarChart2               },
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

function ProfilePopover({ admin, onLogout, onClose, isLoggingOut }) {
  const ref = useRef(null);
  const displayName =
    admin?.full_name || admin?.email?.split("@")[0] || "Admin";

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
      className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl border border-gray-200 shadow-xl shadow-black/10 overflow-hidden z-50"
    >
      <div className="px-4 py-3 border-b border-violet-100 bg-violet-50/60">
        <p className="text-[13px] font-semibold text-gray-900 truncate">
          {displayName}
        </p>
        <p className="text-[11px] text-violet-600 font-medium truncate">
          {admin?.email}
        </p>
      </div>
      <div className="p-1.5 space-y-0.5">
        <Link
          href="/admin/dashboard/profile"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
        >
          <User className="h-4 w-4" /> Profile
        </Link>
        <Link
          href="/admin/dashboard/settings"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
        >
          <Brain className="h-4 w-4" /> AI Settings
        </Link>
        <div className="pt-1 mt-1 border-t border-violet-100">
          <button
            onClick={() => {
              onClose();
              onLogout?.();
            }}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
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

export function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { data: authData } = useAuth();
  const logoutMutation = useLogout();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const unreadCount = useUnreadCount(authData?.user?.id);

  const admin = authData?.user;
  const displayName =
    admin?.full_name || admin?.email?.split("@")[0] || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  const isActive = (href) =>
    href === "/admin/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  const w = collapsed ? "w-[68px]" : "w-[220px]";

  const renderNav = (isMobile = false) =>
    NAV.map(({ section, items }) => (
      <div key={section} className="space-y-0.5">
        {(!collapsed || isMobile) && (
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 px-3 pt-3 pb-1">
            {section}
          </p>
        )}
        {collapsed && !isMobile && <div className="h-3" />}
        {items.map(({ label, href, icon: Icon, badge }) => {
          const active = isActive(href);
          const showBadge = badge && unreadCount > 0;
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
                  : "text-gray-600 hover:bg-violet-50 hover:text-violet-700",
              )}
            >
              <div className="relative shrink-0">
                <Icon
                  className={cn(
                    "transition-colors",
                    collapsed && !isMobile ? "h-[18px] w-[18px]" : "h-4 w-4",
                    active
                      ? "text-white"
                      : "text-gray-400 group-hover:text-violet-600",
                  )}
                  strokeWidth={2}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-violet-600 text-white text-[8px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              {(!collapsed || isMobile) && (
                <span className="flex-1 truncate">{label}</span>
              )}
              {(!collapsed || isMobile) && showBadge && (
                <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-violet-100 text-violet-700"}`}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
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

  const profileStrip = (isMobile = false) => (
    <div className="border-t border-violet-100 shrink-0 relative">
      {profileOpen && (
        <ProfilePopover
          admin={admin}
          onLogout={() => logoutMutation.mutate()}
          onClose={() => setProfileOpen(false)}
          isLoggingOut={logoutMutation.isPending}
        />
      )}
      {collapsed && !isMobile ? (
        <Tooltip label={displayName}>
          <button
            onClick={() => setProfileOpen((p) => !p)}
            className="w-full flex justify-center py-3.5 hover:bg-violet-200/40 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-violet-200 text-violet-800 flex items-center justify-center text-sm font-bold">
              {initial}
            </div>
          </button>
        </Tooltip>
      ) : (
        <button
          onClick={() => setProfileOpen((p) => !p)}
          className={cn(
            "w-full flex items-center gap-3 hover:bg-violet-200/40 transition-colors",
            isMobile ? "px-5 py-4" : "px-4 py-3.5",
          )}
        >
          <div className="h-8 w-8 rounded-full bg-violet-200 text-violet-800 flex items-center justify-center text-sm font-bold shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[13px] font-semibold text-gray-900 truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-violet-500 font-medium truncate">
              Administrator
            </p>
          </div>
          <ChevronUp
            className={cn(
              "h-3.5 w-3.5 text-gray-400 shrink-0 transition-transform duration-200",
              profileOpen && "rotate-180",
            )}
          />
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 transition-all duration-200 ease-out border-r border-violet-100",
          w,
        )}
        style={{
          background: "linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)",
        }}
      >
        <div
          className={cn(
            "h-16 flex items-center border-b border-violet-100 shrink-0",
            collapsed ? "justify-center px-0" : "px-4 justify-between",
          )}
        >
          {!collapsed && (
            <Link href="/">
              <div className="relative w-32 h-32">
                <Image
                  src="/logo.png"
                  alt="BookHushly"
                  fill
                  className="object-contain object-left scale-150"
                />
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed((p) => !p)}
            className={cn(
              "h-6 w-6 rounded-lg flex items-center justify-center text-gray-400 hover:bg-violet-200/50 hover:text-violet-700 transition-colors text-xs font-bold",
              collapsed && "mx-auto",
            )}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>
        <nav
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden py-3",
            collapsed ? "px-2" : "px-3",
          )}
        >
          {renderNav(false)}
        </nav>
        {profileStrip(false)}
      </aside>

      <div
        className={cn(
          "hidden lg:block shrink-0 transition-all duration-200",
          w,
        )}
      />

      {/* Mobile */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          <aside
            className="fixed left-0 top-0 h-full w-[260px] z-50 lg:hidden flex flex-col shadow-2xl border-r border-violet-100"
            style={{
              background: "linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)",
            }}
          >
            <div className="h-16 flex items-center justify-between px-5 border-b border-violet-100 shrink-0">
              <div className="relative w-32 h-32">
                <Image
                  src="/logo.png"
                  alt="BookHushly"
                  fill
                  className="object-contain object-left scale-150"
                />
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-violet-200/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-3 overflow-y-auto">
              {renderNav(true)}
            </nav>
            {profileStrip(true)}
          </aside>
        </>
      )}
    </>
  );
}
