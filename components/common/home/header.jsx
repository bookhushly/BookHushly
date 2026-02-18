"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, LogOut, ChevronDown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { CATEGORIES } from "@/lib/constants";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { data: authData, isLoading } = useAuth();
  const logoutMutation = useLogout();
  const menuRef = useRef(null);

  const user = authData?.user;
  const vendor = authData?.vendor;

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
  }, [isMenuOpen]);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services?category=hotels" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const userRole = user?.role || "customer";

  return (
    <>
      {/* Header */}
      <header
        className={`fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[85%] sm:w-[94%] max-w-6xl transition-all duration-300 ease-out rounded-xl sm:rounded-2xl backdrop-blur-lg ${
          scrolled
            ? "bg-white/90 border border-white/50 scale-[0.985]"
            : "bg-white/75 border border-white/60"
        }`}
        style={{
          boxShadow: scrolled
            ? "0 8px 30px rgba(0,0,0,0.12), 0 0 1px rgba(255,255,255,0.5)"
            : "0 8px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(255,255,255,0.2)",
        }}
      >
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center group" aria-label="Home">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <Image
                src="/logo.png"
                alt="Bookhushly Logo"
                fill
                className="object-contain drop-shadow-sm"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors duration-200 group"
              >
                {item.name}
                <span className="absolute left-0 bottom-[-2px] w-0 h-[2px] bg-purple-700 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoading ? (
              <LoadingSpinner className="h-5 w-5" />
            ) : user ? (
              <>
                <Link
                  href={
                    userRole === "customer"
                      ? "/dashboard/customer"
                      : `/${userRole}/dashboard`
                  }
                  className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors"
                >
                  Dashboard
                </Link>

                {userRole === "vendor" && vendor && (
                  <Link
                    href="/vendor/dashboard/listings"
                    className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors"
                  >
                    My Listings
                  </Link>
                )}

                {/* User Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 hover:bg-gray-100"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} alt={displayName} />
                        <AvatarFallback className="bg-purple-600 text-white">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{displayName}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{displayName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs text-purple-600 capitalize">
                          {userRole}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href={
                          userRole === "customer"
                            ? "/dashboard/customer/profile"
                            : `/${userRole}/dashboard/profile`
                        }
                        className="flex items-center cursor-pointer"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={
                          userRole === "customer"
                            ? "/dashboard/customer/settings"
                            : `/${userRole}/dashboard/settings`
                        }
                        className="flex items-center cursor-pointer"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      {logoutMutation.isPending ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Logging out...
                        </>
                      ) : (
                        <>
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
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
                  className="text-gray-700 hover:text-purple-700 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-purple-700 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-700 h-9 w-9"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ease-out ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto backdrop-blur-sm bg-black/40"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <aside
          ref={menuRef}
          className={`absolute top-0 right-0 h-full w-[85%] sm:w-[70%] max-w-sm bg-white/95 backdrop-blur-xl rounded-l-2xl shadow-2xl transform transition-transform duration-500 ease-out overflow-y-auto ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-4 sm:p-6 flex flex-col min-h-full justify-between pt-20">
            <div className="flex-1">
              {/* User Info */}
              {isLoading ? (
                <div className="flex justify-center mb-6">
                  <LoadingSpinner className="h-5 w-5" />
                </div>
              ) : user ? (
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3 pb-4 border-b">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url} alt={displayName} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        Hi, {displayName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-purple-600 capitalize">
                        {userRole}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 hover:text-red-600 flex-shrink-0"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      aria-label="Logout"
                    >
                      {logoutMutation.isPending ? (
                        <LoadingSpinner className="h-4 w-4" />
                      ) : (
                        <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </Button>
                  </div>

                  {/* Dashboard Links */}
                  <div className="space-y-2 mt-4">
                    <Link
                      href={
                        userRole === "customer"
                          ? "/dashboard/customer"
                          : `/${userRole}/dashboard`
                      }
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-medium transition-colors"
                    >
                      Dashboard
                    </Link>

                    {userRole === "vendor" && vendor && (
                      <Link
                        href="/vendor/dashboard/listings"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-medium transition-colors"
                      >
                        My Listings
                      </Link>
                    )}

                    <Link
                      href={`/${userRole}/dashboard/profile`}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-medium transition-colors"
                    >
                      Profile
                    </Link>

                    {/* <Link
                      href={`/${userRole}/dashboard/settings`}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-medium transition-colors"
                    >
                      Settings
                    </Link> */}
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                  <Link
                    href="/login"
                    className="flex-1 text-center py-2 text-sm rounded-xl bg-purple-700 text-white font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 text-center py-2 text-sm rounded-xl border border-purple-700 text-purple-700 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="space-y-1 sm:space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-medium transition-all duration-200 ease-out"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Category Showcase */}
              <div className="mt-6 sm:mt-8">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 sm:mb-3 px-1">
                  Explore Services
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {CATEGORIES.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.value}
                      href={`/services/${cat.value}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="group relative overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 ease-out"
                    >
                      <div className="relative h-20 sm:h-24 w-full">
                        <Image
                          src={cat.image}
                          alt={cat.alt}
                          fill
                          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 text-white text-xs sm:text-sm font-medium flex items-center gap-1">
                          <span className="text-sm sm:text-base">
                            {cat.icon}
                          </span>
                          <span className="line-clamp-1">{cat.label}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[10px] sm:text-xs text-center text-gray-400 mt-6 sm:mt-8 pt-4 border-t border-gray-100">
              © {new Date().getFullYear()} Bookhushly. All rights reserved.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
