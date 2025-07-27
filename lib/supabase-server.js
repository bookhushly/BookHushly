import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createServerClients() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll(); // ✅ returns all cookies
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options); // ✅ set cookies correctly
            });
          } catch (err) {
            // Safe to ignore in server environments where set isn't supported
          }
        },
      },
    }
  );
}
