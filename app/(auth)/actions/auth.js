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

  // Fetch vendor data if vendor role
  const role = data.user.user_metadata?.role || "customer";
  let vendorData = null;

  if (role === "vendor") {
    const { data: vendor } = await supabase
      .from("vendors")
      .select("*")
      .eq("user_id", data.user.id)
      .maybeSingle();

    vendorData = vendor;
  }

  revalidatePath("/", "layout");
  redirect(`${role === "vendor" ? "/vendor/dashboard" : `/dashboard/${role}`}`);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
