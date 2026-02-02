// lib/queries/auth.js
"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  console.log("Current User:", user);

  if (error || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return null;
  }

  return {
    ...profile,
    role: profile.role || user.user_metadata?.role || null,
  };
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
  const profile = await getCurrentUser();
  console.log("Profile in getUserWithVendor:", profile);

  if (!profile) {
    return { user: null, vendor: null };
  }

  let vendor = null;

  if (profile.role === "vendor") {
    vendor = await getCurrentVendor(profile.id);
  }

  return { user: profile, vendor };
}
