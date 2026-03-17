import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VendorProfileClient from "./client";

export const metadata = {
  title: "Vendor Profile",
  robots: { index: false, follow: false },
};

async function getVendorProfile(userId) {
  const supabase = await createClient();

  const [{ data: userRow }, { data: vendor }] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, email, created_at")
      .eq("id", userId)
      .single(),
    supabase
      .from("vendors")
      .select(
        "id, business_name, business_description, business_address, business_category, phone_number, website_url, years_in_operation, bank_account_name, bank_account_number, bank_name, approved, status, created_at"
      )
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return { userRow, vendor };
}

export default async function VendorProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { userRow, vendor } = await getVendorProfile(user.id);

  return (
    <VendorProfileClient
      userId={user.id}
      email={user.email}
      userRow={userRow}
      vendor={vendor}
    />
  );
}
