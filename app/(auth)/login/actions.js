"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function login(formData) {
  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Revalidate to clear any cached data
  revalidatePath("/", "layout");

  // Return success with role for client-side redirect
  const role = data.user.user_metadata?.role || "customer";
  const redirectPath =
    role === "customer" ? "/dashboard/customer" : `/${role}/dashboard`;

  return { success: true, redirectPath };
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
