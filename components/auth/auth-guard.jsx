"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function AuthGuard({
  children,
  requiredRole = null, // existing support
  requiredRoles = null, // new support
  allowUnauthenticated = false, // allow guests
}) {
  const { user, loading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const userRole = user?.user_metadata?.role;
      const allowedRoles =
        requiredRoles || (requiredRole ? [requiredRole] : []);

      // ✅ CASE 1: Unauthenticated access is allowed AND user is not logged in
      if (!user && allowUnauthenticated) {
        setIsChecking(false);
        return;
      }

      // ❌ CASE 2: Unauthenticated and not allowed
      if (!user && !allowUnauthenticated) {
        router.push("/login");
        return;
      }

      // ✅ CASE 3: Authenticated user with no role restrictions
      if (allowedRoles.length === 0) {
        setIsChecking(false);
        return;
      }

      // ✅ CASE 4: Authenticated user with allowed role
      if (allowedRoles.includes(userRole)) {
        setIsChecking(false);
        return;
      }

      // ❌ CASE 5: Authenticated but role is not allowed
      router.push("/unauthorized");
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [user, router, requiredRole, requiredRoles, allowUnauthenticated]);

  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return <>{children}</>;
}
