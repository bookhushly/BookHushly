"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "./supabase/client";

const supabase = createClient();

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

export const resetPassword = async (email) => {
  try {
    const redirectTo =
      process.env.NODE_ENV === "production"
        ? "https://www.bookhushly.com/verify-otp"
        : "http://localhost:3000/verify-otp";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const verifyOtpAndRedirect = async (email, otp) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "recovery",
    });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const fetchVendor = async ({ queryKey }) => {
  const [, , userId] = queryKey;

  if (!userId) return null;

  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return data;
};
