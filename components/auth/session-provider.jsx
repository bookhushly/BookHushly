// /components/auth/session-provider.jsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

export function SessionProvider({ children }) {
  const { setUser, setVendor, setLoading, loading } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    const initializeAuth = async () => {
      setLoading(true);

      try {
        // Force refresh to ensure we have valid session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        console.log("Session check:", { session, error });

        if (error) {
          console.error("Session error:", error);
          setUser(null);
          setVendor(null);
          return;
        }

        if (session?.user) {
          setUser(session.user);

          const role = session.user.user_metadata?.role || "customer";

          if (role === "vendor") {
            const { data: vendorData, error: vendorError } = await supabase
              .from("vendors")
              .select("*")
              .eq("user_id", session.user.id)
              .maybeSingle();

            if (vendorError) {
              console.error("Vendor fetch error:", vendorError);
            }

            setVendor(vendorData);
          }
        } else {
          setUser(null);
          setVendor(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
        setVendor(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);

        const role = session.user.user_metadata?.role || "customer";

        if (role === "vendor") {
          const { data: vendorData } = await supabase
            .from("vendors")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();
          setVendor(vendorData);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setVendor(null);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setVendor, setLoading]);

  // ✅ ADD THIS: Show loading screen while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
