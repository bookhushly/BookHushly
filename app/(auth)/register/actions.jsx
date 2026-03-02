"use server";
import { createClient } from "@/lib/supabase/server";

export async function signup({ formData }) {
  const supabase = await createClient();

  const email = formData.email.trim().toLowerCase();
  const password = formData.password;

  // Check if email already exists in users table first
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existingUser) {
    return { ok: false, code: "EMAIL_ALREADY_EXISTS" };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: formData.name,
        role: formData.role,
      },
    },
  });

  if (error) {
    if (
      error.message.includes("User already registered") ||
      error.message.includes("already been registered")
    ) {
      return { ok: false, code: "EMAIL_ALREADY_EXISTS" };
    }
    console.error("Signup auth error:", error);
    return { ok: false, code: "SIGNUP_FAILED", message: error.message };
  }

  // Supabase returns fake success for duplicate emails — check identities
  if (data?.user && data.user.identities?.length === 0) {
    return { ok: false, code: "EMAIL_ALREADY_EXISTS" };
  }

  // Manually insert into users table if no trigger handles it
  if (data?.user) {
    const { error: insertError } = await supabase.from("users").insert({
      id: data.user.id,
      email,
      name: formData.name,
      role: formData.role,
    });
    console.log(insertError);
    if (insertError) {
      if (insertError.code === "23505") {
        // duplicate key — email already in users table
        return { ok: false, code: "EMAIL_ALREADY_EXISTS" };
      }
      console.error("Failed to insert user into users table:", insertError);
      return {
        ok: false,
        code: "PROFILE_CREATION_FAILED",
        message: insertError.message,
      };
    }
  }

  return { ok: true, data };
}
