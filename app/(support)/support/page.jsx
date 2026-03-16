import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SupportDashboard from "@/components/support/SupportDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Support Inbox — BookHushly",
};

export default async function SupportPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "support"].includes(profile.role)) {
    redirect("/");
  }

  // Fetch initial conversation counts by status
  const [pendingResult, activeResult, resolvedResult] = await Promise.all([
    supabase
      .from("support_conversations")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_human"),
    supabase
      .from("support_conversations")
      .select("id", { count: "exact", head: true })
      .eq("status", "active_human"),
    supabase
      .from("support_conversations")
      .select("id", { count: "exact", head: true })
      .eq("status", "resolved"),
  ]);

  const initialCounts = {
    pending: pendingResult.count || 0,
    active: activeResult.count || 0,
    resolved: resolvedResult.count || 0,
  };

  const currentAgent = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
  };

  return (
    <SupportDashboard
      currentAgent={currentAgent}
      initialCounts={initialCounts}
    />
  );
}
