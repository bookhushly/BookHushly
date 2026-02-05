"use server";

import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

// Cache user fetches within a request to avoid duplicate queries
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

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
    // Return basic user data if profile doesn't exist yet
    return {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || "customer",
      created_at: user.created_at,
    };
  }

  // Merge profile with auth metadata
  return {
    ...user,
    ...profile,
    role: profile.role || user.user_metadata?.role || "customer",
  };
});

export const getCurrentVendor = cache(async (userId) => {
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
});

export const getUserWithVendor = cache(async () => {
  const profile = await getCurrentUser();

  if (!profile) {
    return { user: null, vendor: null };
  }

  let vendor = null;

  if (profile.role === "vendor") {
    vendor = await getCurrentVendor(profile.id);
  }

  return { user: profile, vendor };
});

// Helper to check if user has specific role
export async function checkUserRole(requiredRole) {
  const user = await getCurrentUser();
  if (!user) return false;

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }

  return user.role === requiredRole;
}

// Helper to get user role
export async function getUserRole() {
  const user = await getCurrentUser();
  return user?.role || null;
}
