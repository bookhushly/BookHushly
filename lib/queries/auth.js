// lib/queries/auth.js
"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getCurrentVendor(userId) {
  if (!userId) return null;

  const supabase = await createClient();

  const { data: vendor, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching vendor:", error);
    return null;
  }

  return vendor;
}

export async function getUserWithVendor() {
  const user = await getCurrentUser();

  if (!user) {
    return { user: null, vendor: null };
  }

  const role = user.user_metadata?.role;
  let vendor = null;

  if (role === "vendor") {
    vendor = await getCurrentVendor(user.id);
  }

  return { user, vendor };
}
