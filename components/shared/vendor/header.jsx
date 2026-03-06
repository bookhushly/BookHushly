"use client";

import {
  Bell,
  Search,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function VendorHeader({ onMenuClick }) {
  const router = useRouter();
  const { data: authData } = useAuth();
  const logoutMutation = useLogout();

  const user = authData?.user;
  const vendor = authData?.vendor;

  const displayName =
    vendor?.business_name ||
    user?.full_name ||
    user?.email?.split("@")[0] ||
    "Vendor";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="h-14 bg-white border-b border-gray-100 flex items-center justify-between
                       px-5 sticky top-0 z-30 shrink-0"
    >
      {/* Left — mobile menu + search */}
      <div className="flex items-center gap-3 flex-1 max-w-sm">
        <button
          onClick={onMenuClick}
          className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg
                     text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        <div className="relative flex-1 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="search"
            placeholder="Search listings, bookings…"
            className="w-full h-8 pl-8 pr-3 text-[13px] bg-gray-50 border border-gray-200
                       rounded-lg text-gray-700 placeholder:text-gray-400
                       focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400
                       transition-colors"
          />
        </div>
      </div>

      {/* Right — notifications + user */}
      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <button
          className="relative h-8 w-8 flex items-center justify-center rounded-lg
                           text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Bell className="h-4 w-4" strokeWidth={2} />
          {/* Unread dot */}
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-violet-600" />
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 h-8 pl-1.5 pr-2.5 rounded-lg
                               hover:bg-gray-100 transition-colors"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.avatar_url} alt={displayName} />
                <AvatarFallback className="bg-violet-100 text-violet-700 text-[10px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-[13px] font-medium text-gray-700">
                {displayName}
              </span>
              <ChevronDown className="hidden sm:inline h-3 w-3 text-gray-400" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-52 shadow-lg shadow-black/10"
          >
            <DropdownMenuLabel className="pb-2">
              <p className="text-[13px] font-semibold text-gray-900">
                {displayName}
              </p>
              <p className="text-[11px] font-normal text-gray-400 mt-0.5">
                {user?.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/vendor/dashboard/profile")}
              className="text-[13px] gap-2.5 cursor-pointer"
            >
              <User className="h-3.5 w-3.5 text-gray-400" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/vendor/dashboard/settings")}
              className="text-[13px] gap-2.5 cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5 text-gray-400" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="text-[13px] gap-2.5 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              {logoutMutation.isPending ? (
                <>
                  <LoadingSpinner className="h-3.5 w-3.5" /> Signing out…
                </>
              ) : (
                <>
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
