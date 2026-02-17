import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/app/actions/customers";
import { ProfileClient } from "./client";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [profileResult, stats] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, email, role, created_at")
      .eq("id", user.id)
      .single(),
    getDashboardStats(user.id).catch(() => null),
  ]);

  const profile = profileResult.data;

  return (
    <ProfileClient
      userId={user.id}
      initialProfile={{
        name: profile?.name || user.user_metadata?.name || "",
        email: user.email,
        phone: user.user_metadata?.phone || "",
        role: profile?.role || "customer",
        created_at: profile?.created_at,
        avatar: user.user_metadata?.avatar_url || null,
      }}
      stats={stats}
    />
  );
}
