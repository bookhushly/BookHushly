"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuthStore } from "@/lib/store";
import { signOut } from "@/lib/auth";
import { Menu, X, User, LogOut, Bell } from "lucide-react";
import { NotificationCenter } from "@/components/notifications/notification-center";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const menuRef = useRef(null);

  // Handle scroll effect for header blur
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
      logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsMenuOpen(false);
    }
  };

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ease-out ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50"
            : "bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200/30"
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center group transition-transform duration-200 hover:scale-105"
          >
            <div className="w-28 h-28 relative">
              <Image
                src="/logo.png"
                alt="Bookhushly Logo"
                fill
                className="object-contain scale-125"
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
                className="relative text-sm font-medium text-gray-600 hover:text-purple-700 transition-all duration-200 ease-out group"
              >
                <span className="relative z-10">{item.name}</span>
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-purple-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out origin-left"></span>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                {/* Notifications */}
                <Popover
                  open={showNotifications}
                  onOpenChange={setShowNotifications}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative p-2 text-gray-600 hover:text-purple-700 hover:bg-purple-50/80 transition-all duration-200 rounded-xl group"
                    >
                      <Bell className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center rounded-full bg-red-500 text-white transition-all duration-200 group-hover:scale-110 animate-pulse"
                      >
                        3
                      </Badge>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-72 p-0 border-0 shadow-xl rounded-2xl bg-white/95 backdrop-blur-sm"
                  >
                    <NotificationCenter
                      userId={user.id}
                      onClose={() => setShowNotifications(false)}
                    />
                  </PopoverContent>
                </Popover>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-3 py-2 text-gray-600 hover:text-purple-700 hover:bg-purple-50/80 transition-all duration-200 rounded-xl group"
                    >
                      <User className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
                      <span className="text-sm font-medium">
                        {user.user_metadata?.name || "Account"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 border-0 shadow-xl rounded-2xl bg-white/95 backdrop-blur-sm"
                  >
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/${user.user_metadata?.role || "customer"}`}
                        className="flex items-center text-sm transition-colors duration-200 rounded-xl"
                      >
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center text-sm transition-colors duration-200 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-4 py-2 text-gray-600 hover:text-purple-700 hover:bg-purple-50/80 transition-all duration-200 rounded-xl font-medium"
                  asChild
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  size="sm"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white font-medium transition-all duration-200 rounded-xl hover:shadow-lg hover:shadow-purple-700/25 hover:-translate-y-0.5"
                  asChild
                >
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 text-gray-600 hover:text-purple-700 hover:bg-purple-50/80 transition-all duration-200 rounded-xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="relative w-5 h-5">
              <Menu
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                  isMenuOpen ? "rotate-180 opacity-0" : "rotate-0 opacity-100"
                }`}
              />
              <X
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                  isMenuOpen ? "rotate-0 opacity-100" : "-rotate-180 opacity-0"
                }`}
              />
            </div>
          </Button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          ref={menuRef}
          className={`absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-xl transition-all duration-300 ease-out ${
            isMenuOpen
              ? "transform translate-y-0 opacity-100"
              : "transform -translate-y-4 opacity-0"
          }`}
        >
          <div className="px-4 py-6 space-y-1">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-3 text-gray-600 hover:text-purple-700 hover:bg-purple-50/80 transition-all duration-200 rounded-xl font-medium transform transition-all duration-300 ${
                  isMenuOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-gray-200/50">
              {user ? (
                <div className="space-y-1">
                  <Link
                    href={`/dashboard/${user.user_metadata?.role || "customer"}`}
                    className={`block px-4 py-3 text-gray-600 hover:text-purple-700 hover:bg-purple-50/80 transition-all duration-200 rounded-xl font-medium transform transition-all duration-300 ${
                      isMenuOpen
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-4 opacity-0"
                    }`}
                    style={{ transitionDelay: `${navigation.length * 50}ms` }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`block w-full text-left px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50/80 transition-all duration-200 rounded-xl font-medium transform transition-all duration-300 ${
                      isMenuOpen
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-4 opacity-0"
                    }`}
                    style={{
                      transitionDelay: `${(navigation.length + 1) * 50}ms`,
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    href="/login"
                    className={`block px-4 py-3 text-gray-600 hover:text-purple-700 hover:bg-purple-50/80 transition-all duration-200 rounded-xl font-medium transform transition-all duration-300 ${
                      isMenuOpen
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-4 opacity-0"
                    }`}
                    style={{ transitionDelay: `${navigation.length * 50}ms` }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className={`block px-4 py-3 text-purple-700 hover:text-purple-800 hover:bg-purple-50/80 transition-all duration-200 rounded-xl font-medium transform transition-all duration-300 ${
                      isMenuOpen
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-4 opacity-0"
                    }`}
                    style={{
                      transitionDelay: `${(navigation.length + 1) * 50}ms`,
                    }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden under fixed header */}
      <div className="h-20" />
    </>
  );
}
