"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
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
  Menu,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/dashboard/customer",
    icon: LayoutDashboard,
    exact: true,
  },
  { label: "Hotel Bookings", href: "/dashboard/customer/hotels", icon: Hotel },
  {
    label: "Apartments",
    href: "/dashboard/customer/apartments",
    icon: Building2,
  },
  { label: "Events", href: "/dashboard/customer/events", icon: Ticket },
  { label: "Logistics", href: "/dashboard/customer/logistics", icon: Truck },
  { label: "Security", href: "/dashboard/customer/security", icon: Shield },
  { label: "Payments", href: "/dashboard/customer/payments", icon: CreditCard },
  { label: "Favorites", href: "/dashboard/customer/favorites", icon: Heart },
  { label: "Profile", href: "/dashboard/customer/profile", icon: User },
];

export function CustomerMobileHeader({ user }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const currentPage =
    NAV_ITEMS.find((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href),
    )?.label || "Dashboard";

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-purple-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-purple-50 text-gray-600">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-white">
            {/* <div className="px-6 py-5 border-b border-purple-100">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logos/colored.png"
                  alt="BookHushly"
                  width={140}
                  height={36}
                  className="object-contain"
                />
              </Link>
            </div> */}

            <div className="px-4 py-4 border-b border-purple-50">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                <Avatar className="h-9 w-9 border-2 border-purple-200">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-purple-600 text-white text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-purple-600 text-white"
                        : "text-gray-600 hover:bg-purple-50 hover:text-purple-700",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-white" : "text-gray-400",
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 py-4 border-t border-purple-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <Image
            src="/logos/Logo.png"
            alt="BookHushly"
            width={90}
            height={24}
            className="object-contain"
          />
          <span className="text-gray-300">·</span>
          <span className="font-semibold text-gray-900 text-sm">
            {currentPage}
          </span>
        </div>
      </div>

      <Avatar className="h-8 w-8 border-2 border-purple-200">
        <AvatarImage src={user.avatar} />
        <AvatarFallback className="bg-purple-600 text-white text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
