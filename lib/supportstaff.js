"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function generateSecurePassword() {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/** Verify the caller is an admin */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Admin access required");
  return supabase;
}

/**
 * List all support staff accounts.
 */
export async function getSupportStaff() {
  await requireAdmin();
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("users")
    .select("id, name, email, created_at, last_sign_in_at")
    .eq("role", "support")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Create a new support staff account.
 * Returns the generated password so the admin can share it.
 */
export async function createSupportStaff(email, name) {
  await requireAdmin();
  const adminClient = createAdminClient();
  const password = generateSecurePassword();

  // Create Supabase auth user
  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
        role: "support",
      },
    });

  if (authError) throw authError;

  // Insert into public users table
  const { error: userError } = await adminClient.from("users").insert({
    id: authData.user.id,
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role: "support",
  });

  if (userError) {
    // Roll back auth user creation
    await adminClient.auth.admin.deleteUser(authData.user.id);
    throw userError;
  }

  return { userId: authData.user.id, email: email.trim().toLowerCase(), name: name.trim(), password };
}

/**
 * Reset a support staff member's password.
 * Returns the new generated password.
 */
export async function resetSupportStaffPassword(userId) {
  await requireAdmin();
  const adminClient = createAdminClient();
  const newPassword = generateSecurePassword();

  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) throw error;
  return { password: newPassword };
}

/**
 * Update a support staff member's name.
 */
export async function updateSupportStaffName(userId, name) {
  await requireAdmin();
  const adminClient = createAdminClient();

  const { error: authError } = await adminClient.auth.admin.updateUserById(
    userId,
    { user_metadata: { name: name.trim() } },
  );
  if (authError) throw authError;

  const { error: dbError } = await adminClient
    .from("users")
    .update({ name: name.trim() })
    .eq("id", userId);

  if (dbError) throw dbError;
  return true;
}

/**
 * Delete a support staff account entirely.
 */
export async function deleteSupportStaff(userId) {
  await requireAdmin();
  const adminClient = createAdminClient();

  // Remove from users table first
  const { error: dbError } = await adminClient
    .from("users")
    .delete()
    .eq("id", userId)
    .eq("role", "support"); // guard: only delete support role

  if (dbError) throw dbError;

  // Remove auth user
  const { error: authError } = await adminClient.auth.admin.deleteUser(userId);
  if (authError) console.error("Auth user deletion error:", authError);

  return true;
}
