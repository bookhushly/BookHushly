"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
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
  ChevronUp,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useState, useRef, useEffect } from "react";

const NAV = [
  {
    section: "Main",
    items: [
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
      { label: "Events", href: "/dashboard/customer/events", icon: Ticket },
    ],
  },
  {
    section: "Services",
    items: [
      {
        label: "Logistics",
        href: "/dashboard/customer/logistics",
        icon: Truck,
      },
      { label: "Security", href: "/dashboard/customer/security", icon: Shield },
    ],
  },
  {
    section: "Account",
    items: [
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
      { label: "Profile", href: "/dashboard/customer/profile", icon: User },
    ],
  },
];

// ── Tooltip for collapsed state ──────────────────────────────────────────────
function Tooltip({ label, children }) {
  return (
    <div className="relative group/tip">
      {children}
      <div
        className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
                      opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150"
      >
        <div className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </div>
      </div>
    </div>
  );
}

// ── Profile popover ──────────────────────────────────────────────────────────
function ProfilePopover({ user, initials, onLogout, onClose }) {
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
      className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl border border-gray-200
                 shadow-xl shadow-black/10 overflow-hidden z-50"
    >
      <div className="px-4 py-3 border-b border-violet-100 bg-violet-50/60">
        <p className="text-[13px] font-semibold text-gray-900 truncate">
          {user.name}
        </p>
        <p className="text-[11px] text-violet-600 font-medium truncate">
          {user.email}
        </p>
      </div>
      <div className="p-1.5">
        <Link
          href="/dashboard/customer/profile"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-700
                     hover:bg-violet-50 hover:text-violet-700 transition-colors"
        >
          <User className="h-4 w-4" /> Profile
        </Link>
        <div className="pt-1 mt-1 border-t border-violet-100">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px]
                       text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main sidebar ─────────────────────────────────────────────────────────────
export function CustomerSidebar({ user, isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CU";

  const isActive = (href, exact) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

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

        {items.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
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
              <Icon
                className={cn(
                  "shrink-0 transition-colors",
                  collapsed && !isMobile ? "h-[18px] w-[18px]" : "h-4 w-4",
                  active
                    ? "text-white"
                    : "text-gray-400 group-hover:text-violet-600",
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
      {/* ── Desktop ─────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 transition-all duration-200 ease-out",
          "border-r border-violet-100",
          w,
        )}
        style={{
          background: "linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)",
        }}
      >
        {/* Logo + collapse */}
        <div
          className={cn(
            "h-16 flex items-center border-b border-violet-100 shrink-0",
            collapsed ? "justify-center px-0" : "px-4 justify-between",
          )}
        >
          {!collapsed && (
            <Link href="/">
              <div className="relative w-28 h-8">
                <Image
                  src="/logo.png"
                  alt="BookHushly"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed((p) => !p)}
            className={cn(
              "h-6 w-6 rounded-lg flex items-center justify-center text-gray-400",
              "hover:bg-violet-50 hover:text-violet-600 transition-colors text-xs font-bold",
              collapsed && "mx-auto",
            )}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* Nav */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden py-3",
            collapsed ? "px-2" : "px-3",
          )}
        >
          {renderNav(false)}
        </nav>

        {/* Profile strip */}
        <div className="border-t border-violet-100 shrink-0 relative">
          {profileOpen && (
            <ProfilePopover
              user={user}
              initials={initials}
              onLogout={handleLogout}
              onClose={() => setProfileOpen(false)}
            />
          )}
          {collapsed ? (
            <Tooltip label={user.name}>
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="w-full flex justify-center py-3.5 hover:bg-violet-50 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={() => setProfileOpen((p) => !p)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-violet-50/60 transition-colors"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-semibold text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-gray-400 truncate">Customer</p>
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
      </aside>

      {/* Spacer */}
      <div
        className={cn(
          "hidden lg:block shrink-0 transition-all duration-200",
          w,
        )}
      />

      {/* ── Mobile Drawer ────────────────────────────────────────────────── */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          <aside
            className="fixed left-0 top-0 h-full w-[260px] z-50 lg:hidden
                            flex flex-col shadow-2xl border-r border-violet-100"
            style={{
              background: "linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)",
            }}
          >
            <div className="h-16 flex items-center justify-between px-5 border-b border-violet-100 shrink-0">
              <div className="relative w-28 h-8">
                <Image
                  src="/logo.png"
                  alt="BookHushly"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400
                           hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-3 overflow-y-auto">
              {renderNav(true)}
            </nav>

            <div className="border-t border-violet-100 shrink-0 relative">
              {profileOpen && (
                <ProfilePopover
                  user={user}
                  initials={initials}
                  onLogout={handleLogout}
                  onClose={() => setProfileOpen(false)}
                />
              )}
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-violet-50/60 transition-colors"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">Customer</p>
                </div>
                <ChevronUp
                  className={cn(
                    "h-3.5 w-3.5 text-gray-400 shrink-0 transition-transform duration-200",
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
