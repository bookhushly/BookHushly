"use client";

import { Bell, Search, User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function VendorHeader({ onMenuClick }) {
  const router = useRouter();
  const { data: authData } = useAuth();
  const logoutMutation = useLogout();

  const user = authData?.user;
  const vendor = authData?.vendor;

  const getInitials = (name) => {
    if (!name) return "VN";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName =
    vendor?.business_name ||
    user?.full_name ||
    user?.email?.split("@")[0] ||
    "Vendor";

  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200/60 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden h-9 w-9 hover:bg-gray-100"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </Button>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="h-9 pl-9 text-[14px] bg-gray-50 border-gray-200/60 focus-visible:ring-1 focus-visible:ring-purple-500 focus-visible:border-purple-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative hover:bg-gray-100"
        >
          <Bell className="h-[18px] w-[18px] text-gray-600" strokeWidth={2} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-purple-600 rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 px-2 hover:bg-gray-100 gap-2"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatar_url} alt={displayName} />
                <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-medium">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-[14px] font-medium text-gray-700">
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/vendor/profile")}
              className="cursor-pointer text-[14px] py-2"
            >
              <User className="mr-2 h-4 w-4" strokeWidth={2} />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              disabled={logoutMutation.isPending}
              className="cursor-pointer text-[14px] text-red-600 focus:text-red-600 py-2"
            >
              {logoutMutation.isPending ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" strokeWidth={2} />
                  Sign Out
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
