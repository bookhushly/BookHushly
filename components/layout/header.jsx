"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { signOut } from "@/lib/auth";
import { CATEGORIES } from "@/lib/constants";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const menuRef = useRef(null);

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
    { name: "Services", href: "/services" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      await signOut();
      logout();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      {/* Header */}
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-6xl transition-all duration-300 rounded-2xl border border-white/20 backdrop-blur-lg ${
          scrolled
            ? "bg-white/80 shadow-xl scale-[0.985]"
            : "bg-white/60 shadow-md"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center group" aria-label="Home">
            <div className="relative w-40 h-40">
              <Image
                src="/logo.png"
                alt="Bookhushly Logo"
                fill
                className="object-contain"
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
                className="relative text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors duration-200"
              >
                {item.name}
                <span className="absolute left-0 bottom-[-2px] w-0 h-[2px] bg-purple-700 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <button
                  variant="ghost"
                  size="sm"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md hover:text-primary"
                >
                  <User className="h-4 w-4 mr-2" />
                  {user.user_metadata?.name || "Account"}
                </button>
                <Button
                  onClick={handleLogout}
                  size="sm"
                  className="bg-purple-700 hover:bg-purple-600 text-white"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-purple-700 font-medium"
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
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto backdrop-blur-sm bg-black/40"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <aside
          ref={menuRef}
          className={`absolute top-0 right-0 h-full w-[80%] sm:w-[70%] bg-white/95 backdrop-blur-xl rounded-l-2xl shadow-2xl transform transition-transform duration-500 ease-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 flex flex-col h-full justify-between">
            <div>
              {/* User Info */}
              {user ? (
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="font-medium text-gray-800">
                      Hi, {user.user_metadata?.name || "Guest"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.user_metadata?.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:text-red-600"
                    onClick={handleLogout}
                    aria-label="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-3 mb-6">
                  <Link
                    href="/login"
                    className="flex-1 text-center py-2 rounded-xl bg-purple-700 text-white font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 text-center py-2 rounded-xl border border-purple-700 text-purple-700 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-medium transition-all"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Category Showcase */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">
                  Explore Services
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.value}
                      href={`/services/${cat.value}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="group relative overflow-hidden rounded-xl border border-gray-200 hover:shadow-lg transition-all"
                    >
                      <div className="relative h-24 w-full">
                        <Image
                          src={cat.image}
                          alt={cat.alt}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-2 left-2 text-white text-sm font-medium flex items-center gap-1">
                          <span>{cat.icon}</span> {cat.label}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-gray-400 mt-8">
              © {new Date().getFullYear()} Bookhushly. All rights reserved.
            </p>
          </div>
        </aside>
      </div>

      {/* Spacer to prevent content jump */}
      <div className="h-24" />
    </>
  );
}
