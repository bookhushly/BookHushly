"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function generateSecurePassword() {
  const length = 16;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export async function getHotelStaff(hotelId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hotel_staff")
    .select(
      `
      *,
      users:user_id (
        email,
        name
      )
    `
    )
    .eq("hotel_id", hotelId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createReceptionist(hotelId, email, name) {
  const adminClient = createAdminClient();
  const password = generateSecurePassword();

  // Create auth user
  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
        role: "receptionist",
        hotel_id: hotelId,
      },
    });

  if (authError) throw authError;

  // Insert into users table
  const { error: userError } = await adminClient.from("users").insert({
    id: authData.user.id,
    email: email.trim(),
    name: name.trim(),
    role: "receptionist",
  });

  if (userError) {
    await adminClient.auth.admin.deleteUser(authData.user.id);
    throw userError;
  }

  // Add to hotel_staff table
  const { error: staffError } = await adminClient.from("hotel_staff").insert({
    hotel_id: hotelId,
    user_id: authData.user.id,
    role: "receptionist",
  });

  if (staffError) {
    await adminClient.from("users").delete().eq("id", authData.user.id);
    await adminClient.auth.admin.deleteUser(authData.user.id);
    throw staffError;
  }

  return { userId: authData.user.id, email, password };
}

export async function resetReceptionistPassword(userId) {
  const adminClient = createAdminClient();
  const newPassword = generateSecurePassword();

  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) throw error;

  return { password: newPassword };
}

export async function deleteReceptionist(staffId, userId) {
  const adminClient = createAdminClient();
  const supabase = await createClient();

  // Delete from hotel_staff table
  const { error: staffError } = await supabase
    .from("hotel_staff")
    .delete()
    .eq("id", staffId);

  if (staffError) throw staffError;

  // Delete auth user (admin operation)
  const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

  if (authError) {
    console.error("Error deleting auth user:", authError);
  }

  return true;
}
