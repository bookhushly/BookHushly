"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
    console.error("Logout error:", error);
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
export async function signup({ formData }) {
  const supabase = await createClient();

  const email = formData.email.trim().toLowerCase();
  const password = formData.password;
  const name = formData.name.trim();
  const role = formData.role;

  // Sign up the user in auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
    },
  });

  if (error) {
    if (error.message.includes("User already registered")) {
      return {
        ok: false,
        code: "EMAIL_ALREADY_EXISTS",
        message: "This email is already registered",
      };
    }

    console.error("Signup failed:", error);
    return { ok: false, code: "SIGNUP_FAILED", message: error.message };
  }

  // Insert user into users table
  if (data.user) {
    const { error: insertError } = await supabase.from("users").insert({
      id: data.user.id,
      email: email,
      name: name,
      role: role,
    });

    if (insertError) {
      console.error("Failed to insert user into users table:", insertError);

      // Rollback: Delete the auth user if users table insert fails
      await supabase.auth.admin.deleteUser(data.user.id);

      return {
        ok: false,
        code: "USER_INSERT_FAILED",
        message: "Failed to create user profile",
      };
    }
  }

  return { ok: true, data };
}

export async function updatePassword(newPassword) {
  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters long" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Password update error:", error);
      return { error: error.message };
    }

    revalidatePath("/", "layout");
    return { success: true, user: data.user };
  } catch (error) {
    console.error("Password update error:", error);
    return { error: "Failed to update password" };
  }
}

export async function sendPasswordResetOtp(email) {
  if (!email || !email.includes("@")) {
    return { error: "Please provide a valid email address" };
  }

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
      console.error("Password reset error:", error);
      return { error: error.message };
    }

    return { success: true, message: "Password reset email sent successfully" };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "Failed to send reset email" };
  }
}

export async function verifyPasswordResetOtp(email, otp) {
  if (!email || !otp) {
    return { error: "Email and OTP are required" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "recovery",
    });

    if (error) {
      console.error("OTP verification error:", error);
      return { error: error.message };
    }

    return { success: true, session: data.session };
  } catch (error) {
    console.error("OTP verification error:", error);
    return { error: "Failed to verify OTP" };
  }
}
