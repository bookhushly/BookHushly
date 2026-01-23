"use server";
import { createClient } from "@/lib/supabase/server";

export async function signup({ formData }) {
  const supabase = await createClient();

  const email = formData.email.trim().toLowerCase();
  const password = formData.password;

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
    if (error.message.includes("User already registered")) {
      return { ok: false, code: "EMAIL_ALREADY_EXISTS" };
    }

    console.error("Signup failed:", error);
    return { ok: false, code: "SIGNUP_FAILED" };
  }

  return { ok: true, data };
}
