// app/(customer)/dashboard/customer/layout.jsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CustomerLayoutClient } from "./client";

export const metadata = {
  robots: { index: false, follow: false },
};

export const metadata = {
  title: "My Dashboard — BookHushly",
  description: "Manage your bookings, payments, and favourites on BookHushly.",
};

export default async function CustomerDashboardLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, email, role, created_at")
    .eq("id", user.id)
    .single();

  if (profile?.role && profile.role !== "customer") {
    redirect(`/dashboard/${profile.role}`);
  }

  const userProfile = {
    id: user.id,
    name: profile?.name || user.user_metadata?.name || "Customer",
    email: user.email,
    role: profile?.role || "customer",
    created_at: profile?.created_at,
    avatar: user.user_metadata?.avatar_url || null,
  };

  return (
    <CustomerLayoutClient user={userProfile}>{children}</CustomerLayoutClient>
  );
}
