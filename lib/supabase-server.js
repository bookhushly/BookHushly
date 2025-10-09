import { createClient } from "../lib/supabase/server";
export async function supabase() {
  const supabase = await createClient();
}
