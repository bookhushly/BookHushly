"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

export function SessionProvider({ children }) {
  const { setUser, setVendor } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    // Load the current user (middleware already ensures session validity)
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data?.user || null;
      setUser(user);

      if (user?.user_metadata?.role === "vendor") {
        const { data: vendor } = await supabase
          .from("vendors")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        setVendor(vendor || null);
        console.log(`vendor log`, vendor);
      }
    });

    // Listen for real-time auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);

        if (session.user.user_metadata?.role === "vendor") {
          const { data: vendor } = await supabase
            .from("vendors")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();

          setVendor(vendor || null);
        }
      } else {
        setUser(null);
        setVendor(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
