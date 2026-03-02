import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardStats, getRecentActivity } from "@/app/actions/customers";
import { DashboardOverviewClient } from "./client";

export default async function CustomerDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [stats, activity, profileResult] = await Promise.all([
    getDashboardStats(user.id, user.email).catch((e) => {
      console.error("getDashboardStats error:", e);
      return null;
    }),
    getRecentActivity(user.id).catch(() => []),
    supabase
      .from("users")
      .select("name, created_at")
      .eq("id", user.id)
      .single(),
  ]);
  const profile = profileResult?.data;

  return (
    <DashboardOverviewClient
      userId={user.id}
      userEmail={user.email}
      userName={profile?.name || user.user_metadata?.name || "there"}
      initialStats={stats}
      initialActivity={activity}
      memberSince={profile?.created_at}
    />
  );
}
