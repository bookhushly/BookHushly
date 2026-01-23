// app/forgot-password/actions.js
"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendPasswordResetOtp(email) {
  try {
    const supabase = await createClient();

    const redirectTo =
      process.env.NODE_ENV === "production"
        ? "https://www.bookhushly.com/reset-password"
        : "http://localhost:3000/reset-password";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "Failed to send reset email" };
  }
}

export async function verifyPasswordResetOtp(email, otp) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "recovery",
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true, session: data.session };
  } catch (error) {
    console.error("OTP verification error:", error);
    return { error: "Failed to verify OTP" };
  }
}
