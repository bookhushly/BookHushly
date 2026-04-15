"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, LogOut, ChevronDown, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { CATEGORIES } from "@/lib/constants";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services?category=hotels" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const sheetRef = useRef(null);
  const { data: authData, isLoading } = useAuth();
  const logoutMutation = useLogout();
  const { canInstall, isInstalling, install } = useInstallPrompt();

  const user = authData?.user;
  const vendor = authData?.vendor;
  const userRole = user?.role || "customer";
  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  const dashboardHref =
    userRole === "customer" ? "/dashboard/customer" : `/${userRole}/dashboard`;
  const profileHref =
    userRole === "customer"
      ? "/dashboard/customer/profile"
      : `/${userRole}/dashboard/profile`;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;

      setScrolled(y > 60);

      if (y < 100) {
        setHidden(false);
      } else if (delta > 6) {
        setHidden(true); // scrolling down — hide
      } else if (delta < -6) {
        setHidden(false); // scrolling up — reveal
      }

      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const close = () => setIsMenuOpen(false);

  return (
    <>
      {/* ── Floating navbar ── */}
      <header
        className={`fixed top-3 left-1/2 z-50 w-[92%] max-w-6xl rounded-2xl backdrop-blur-xl nav-float
          transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out
          ${hidden ? "-translate-x-1/2 -translate-y-[calc(100%+1rem)] pointer-events-none" : "-translate-x-1/2 translate-y-0"}
          ${
            scrolled
              ? "bg-white/96 border border-[#E0DBF0] shadow-[0_4px_20px_rgba(26,13,77,0.08)]"
              : "bg-white/85 border border-[#EDEAF5] shadow-[0_2px_12px_rgba(26,13,77,0.05)]"
          }`}
      >
        <div className="flex items-center justify-between h-14 px-4 md:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center shrink-0"
            aria-label="BookHushly home"
          >
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <Image
                src="/logo.png"
                alt="BookHushly"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ name, href }) => (
              <Link
                key={name}
                href={href}
                className="relative font-bricolage text-sm font-medium text-[#4A4665] hover:text-[#1A0D4D] transition-colors duration-150 group"
              >
                {name}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-violet-600 transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {canInstall && (
              <button
                onClick={install}
                disabled={isInstalling}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 text-xs font-medium hover:bg-violet-100 transition-colors disabled:opacity-60"
              >
                <Download className="h-3.5 w-3.5" />
                {isInstalling ? "Installing…" : "Install App"}
              </button>
            )}
            {isLoading ? (
              <LoadingSpinner className="h-4 w-4 text-gray-400" />
            ) : user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="font-bricolage text-sm font-medium text-[#4A4665] hover:text-[#1A0D4D] transition-colors"
                >
                  Dashboard
                </Link>
                {userRole === "vendor" && vendor && (
                  <Link
                    href="/vendor/dashboard/listings"
                    className="font-bricolage text-sm font-medium text-[#4A4665] hover:text-[#1A0D4D] transition-colors"
                  >
                    My Listings
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors duration-150 outline-none">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={undefined} alt={displayName} />
                        <AvatarFallback className="bg-violet-600 text-white text-xs font-medium">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bricolage text-sm font-medium text-[#1A0D4D] max-w-[100px] truncate">
                        {displayName}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-52 bg-hospitality-comfort"
                  >
                    <DropdownMenuLabel>
                      <p className="text-sm font-medium truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-wide text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
                        {userRole}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href={profileHref}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <User className="h-4 w-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                      className="cursor-pointer text-red-600 focus:text-red-600 gap-2"
                    >
                      {logoutMutation.isPending ? (
                        <>
                          <LoadingSpinner className="h-4 w-4" /> Logging out…
                        </>
                      ) : (
                        <>
                          <LogOut className="h-4 w-4" /> Log out
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-bricolage text-sm font-medium text-[#4A4665] hover:text-[#1A0D4D] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="font-bricolage h-9 px-5 inline-flex items-center text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors duration-150 shadow-[0_2px_10px_rgba(124,58,237,0.3)]"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen((p) => !p)}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile bottom sheet ── */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-gray-950/75 backdrop-blur-sm"
          onClick={close}
        />

        {/* Sheet */}
        <aside
          ref={sheetRef}
          className={`absolute bottom-0 left-0 right-0 bg-[#1e1b2e] rounded-t-[2rem] flex flex-col max-h-[88vh] transition-transform duration-300 ease-out ${
            isMenuOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Sheet header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/8 shrink-0">
            <div className="relative w-44 h-28">
              <Image
                src="/logo.png"
                alt="BookHushly"
                fill
                className="object-contain object-left brightness-0 invert"
              />
            </div>
            <button
              onClick={close}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 text-white/50 hover:bg-white/15 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] space-y-5 pt-5">
            {/* Auth */}
            {isLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner className="h-5 w-5 text-white/30" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/8">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={undefined} alt={displayName} />
                  <AvatarFallback className="bg-violet-600 text-white text-xs font-medium">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-white/40 truncate">{user.email}</p>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-violet-400">
                    {userRole}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logoutMutation.mutate();
                    close();
                  }}
                  disabled={logoutMutation.isPending}
                  className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  aria-label="Log out"
                >
                  {logoutMutation.isPending ? (
                    <LoadingSpinner className="h-3.5 w-3.5" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/login"
                  onClick={close}
                  className="flex items-center justify-center h-11 rounded-xl border border-white/15 text-sm font-medium text-white/80 hover:bg-white/5 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={close}
                  className="flex items-center justify-center h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-medium text-white transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}

            {/* Install App */}
            {canInstall && (
              <button
                onClick={install}
                disabled={isInstalling}
                className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-300 text-sm font-medium hover:bg-violet-500/20 transition-colors disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                {isInstalling ? "Installing…" : "Install BookHushly App"}
              </button>
            )}

            {/* Divider */}
            <div className="h-px bg-white/8" />

            {/* Nav links */}
            <nav className="space-y-0.5">
              {NAV_LINKS.map(({ name, href }) => (
                <Link
                  key={name}
                  href={href}
                  onClick={close}
                  className="font-bricolage flex items-center h-11 px-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-colors"
                >
                  {name}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={close}
                    className="flex items-center h-11 px-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={profileHref}
                    onClick={close}
                    className="flex items-center h-11 px-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-colors"
                  >
                    Profile
                  </Link>
                  {userRole === "vendor" && vendor && (
                    <Link
                      href="/vendor/dashboard/listings"
                      onClick={close}
                      className="flex items-center h-11 px-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-colors"
                    >
                      My Listings
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* Divider */}
            <div className="h-px bg-white/8" />

            {/* Services grid */}
            <div>
              <p className="text-[11px] font-medium text-white/30 uppercase tracking-[0.15em] mb-3 px-1">
                Explore Services
              </p>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.slice(0, 6).map((cat) => (
                  <Link
                    key={cat.value}
                    href={
                      cat.value === "logistics"
                        ? "/quote-services?tab=logistics"
                        : cat.value === "security"
                          ? "/quote-services?tab=security"
                          : `/services?category=${cat.value}`
                    }
                    onClick={close}
                    className="group relative overflow-hidden rounded-2xl h-[4.5rem] border border-white/5"
                  >
                    <Image
                      src={cat.image}
                      alt={cat.alt}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-1.5 left-2 right-1">
                      <span className="text-sm block leading-none mb-0.5">
                        {cat.icon}
                      </span>
                      <span className="text-[9px] font-medium text-white leading-tight line-clamp-1 uppercase tracking-wide">
                        {cat.label}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
