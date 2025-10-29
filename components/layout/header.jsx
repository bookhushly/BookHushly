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
import { CATEGORIES } from "@/lib/constants"; // import your categories here

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Prevent body scroll
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
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-6xl transition-all duration-300 rounded-2xl backdrop-blur-lg border border-white/20 ${
          scrolled
            ? "bg-white/70 shadow-xl scale-[0.98]"
            : "bg-white/60 shadow-md"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-40 h-40">
              <Image
                src="/logo.png"
                alt="Bookhushly Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-sm font-medium text-gray-600 hover:text-purple-700 transition-all duration-200"
              >
                {item.name}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-purple-700 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative p-2 hover:bg-purple-100 text-gray-700"
                >
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white h-4 w-4 text-[10px] p-0 flex items-center justify-center">
                    3
                  </Badge>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-purple-700"
                >
                  <User className="h-4 w-4 mr-2" />
                  {user.user_metadata?.name || "Account"}
                </Button>
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

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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
            ? "opacity-100 pointer-events-auto backdrop-blur-sm bg-black/30"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
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
                    <p className="text-xs text-gray-500">
                      {user.user_metadata?.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:text-red-600"
                    onClick={handleLogout}
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
              <nav className="space-y-3">
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

              {/* Categories Showcase */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">
                  Explore Services
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.value}
                      href={`/services/${cat.value}`}
                      className="group relative overflow-hidden rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all"
                      onClick={() => setIsMenuOpen(false)}
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
        </div>
      </div>

      <div className="h-24" />
    </>
  );
}
