"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getCurrentUser,
  getCurrentVendor,
  getUserWithVendor,
} from "@/lib/queries/auth";
import { logout } from "@/app/actions/auth";
import { toast } from "sonner";

export const authKeys = {
  all: ["auth"],
  user: ["auth", "user"],
  vendor: (userId) => ["auth", "vendor", userId],
  userWithVendor: ["auth", "user-with-vendor"],
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });
}

export function useCurrentVendor(userId) {
  return useQuery({
    queryKey: authKeys.vendor(userId),
    queryFn: () => getCurrentVendor(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useAuth() {
  return useQuery({
    queryKey: authKeys.userWithVendor,
    queryFn: getUserWithVendor,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });
}

// Hook to invalidate auth queries after login/logout
export function useAuthActions() {
  const queryClient = useQueryClient();

  const invalidateAuth = async () => {
    await queryClient.invalidateQueries({ queryKey: authKeys.all });
  };

  const setAuthData = (data) => {
    if (data?.user) {
      queryClient.setQueryData(authKeys.user, data.user);

      if (data.user.role === "vendor" && data?.vendor) {
        queryClient.setQueryData(authKeys.vendor(data.user.id), data.vendor);
      }
    }

    queryClient.setQueryData(authKeys.userWithVendor, {
      user: data?.user || null,
      vendor: data?.vendor || null,
    });
  };

  const clearAuth = () => {
    queryClient.setQueryData(authKeys.user, null);
    queryClient.setQueryData(authKeys.userWithVendor, {
      user: null,
      vendor: null,
    });
    queryClient.removeQueries({ queryKey: authKeys.all });
  };

  return { invalidateAuth, setAuthData, clearAuth };
}

// Logout mutation hook
export function useLogout() {
  const { clearAuth } = useAuthActions();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAuth();
      toast.success("Logged out successfully");
      window.location.href = "/";
    },
    onError: (error) => {
      toast.error("Logout failed", {
        description: error.message,
      });
    },
  });
}

// Helper hook to check if user has specific role
export function useHasRole(requiredRole) {
  const { data: user } = useCurrentUser();

  if (!user) return false;

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }

  return user.role === requiredRole;
}

// Helper hook to get current user role
export function useUserRole() {
  const { data: user } = useCurrentUser();
  return user?.role || null;
}
