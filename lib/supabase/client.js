import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Singleton instance for convenience (optional)
let client = null;

export function getClient() {
  if (!client) {
    client = createClient();
  }
  return client;
}
