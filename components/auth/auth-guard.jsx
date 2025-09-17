"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function AuthGuard({ children, requiredRole = null }) {
  const { user, loading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simple auth check without async operations
    const checkAuth = () => {
      // if (!user) {
      //   router.push('/login')
      //   return
      // }

      if (requiredRole && user?.user_metadata?.role !== requiredRole) {
        router.push("/unauthorized");
        return;
      }

      setIsChecking(false);
    };

    // Add a small delay to prevent flash
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [user, router, requiredRole]);

  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
