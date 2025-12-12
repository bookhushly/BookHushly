// components/auth/auth-guard.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function AuthGuard({ children }) {
  const { user, loading } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  // Wait for Zustand to hydrate from cookies/localStorage
  useEffect(() => {
    if (!loading) setHasHydrated(true);
  }, [loading]);

  // Show nothing or spinner until we're sure
  if (loading || !hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <LoadingSpinner className="h-10 w-10 text-purple-600" />
      </div>
    );
  }

  // At this point: middleware already guaranteed that:
  // - User is authenticated (for protected routes)
  // - User has correct role
  // So we can safely render children
  return <>{children}</>;
}
