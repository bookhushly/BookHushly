// app/reset-password/actions.js
"use server";

import { createClient } from "@/lib/supabase/server";

export async function updatePassword(newPassword) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error("Password update error:", error);
    return { error: "Failed to update password" };
  }
}
