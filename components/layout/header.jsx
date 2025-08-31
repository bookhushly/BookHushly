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
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const menuRef = useRef(null);

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
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm shadow-sm border-b px-3 sm:px-4">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center">
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
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              {item.name}
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
                    className="relative text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  >
                    <Bell className="h-4 w-4" />
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0 flex items-center justify-center rounded-full bg-red-500 text-white transition-transform duration-150 hover:scale-110"
                    >
                      3
                    </Badge>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 p-0">
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
                    className="text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  >
                    <User className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {user.user_metadata?.name || "Account"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/dashboard/${user.user_metadata?.role || "customer"}`}
                      className="flex items-center text-sm"
                    >
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center text-sm"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                size="sm"
                className="bg-purple-700 hover:bg-purple-600 text-white text-sm font-medium transition-colors duration-150"
                asChild
              >
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="md:hidden absolute top-14 left-0 w-full bg-white border-b shadow-md transform transition-all duration-200 ease-in-out translate-y-0 opacity-100"
          style={{
            transform: isMenuOpen ? "translateY(0)" : "translateY(-10px)",
            opacity: isMenuOpen ? 1 : 0,
          }}
        >
          <div className="px-3 pt-3 pb-4 space-y-2 sm:px-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-150 rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-3 border-t">
              {user ? (
                <>
                  <Link
                    href={`/dashboard/${user.user_metadata?.role || "customer"}`}
                    className="block px-3 py-2 text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-150 rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-150 rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-150 rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-150 rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
