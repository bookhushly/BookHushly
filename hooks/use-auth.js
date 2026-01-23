// lib/hooks/useAuth.js
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUser,
  getCurrentVendor,
  getUserWithVendor,
} from "@/lib/queries/auth";

export const authKeys = {
  user: ["auth", "user"],
  vendor: (userId) => ["auth", "vendor", userId],
  userWithVendor: ["auth", "user-with-vendor"],
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useCurrentVendor(userId) {
  return useQuery({
    queryKey: authKeys.vendor(userId),
    queryFn: () => getCurrentVendor(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAuth() {
  return useQuery({
    queryKey: authKeys.userWithVendor,
    queryFn: getUserWithVendor,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// Hook to invalidate auth queries after login/logout
export function useAuthActions() {
  const queryClient = useQueryClient();

  const invalidateAuth = () => {
    queryClient.invalidateQueries({ queryKey: ["auth"] });
  };

  const setAuthData = (data) => {
    if (data?.user) {
      queryClient.setQueryData(authKeys.user, data.user);
    }
    if (data?.vendor) {
      queryClient.setQueryData(authKeys.vendor(data.user.id), data.vendor);
    }
    queryClient.setQueryData(authKeys.userWithVendor, data);
  };

  const clearAuth = () => {
    queryClient.setQueryData(authKeys.user, null);
    queryClient.setQueryData(authKeys.userWithVendor, {
      user: null,
      vendor: null,
    });
    queryClient.removeQueries({ queryKey: ["auth", "vendor"] });
  };

  return { invalidateAuth, setAuthData, clearAuth };
}
