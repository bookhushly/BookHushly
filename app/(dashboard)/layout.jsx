import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
// ✅ Remove: import { cookies } from "next/headers" — no longer needed here
import { CustomerSidebar } from "@/components/shared/customer/sidebar";
import { CustomerMobileHeader } from "@/components/shared/customer/mobile-header";

export default async function CustomerDashboardLayout({ children }) {
  const supabase = await createClient(); // ✅ await it, pass no args

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

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
    <div className="flex min-h-screen bg-[#F8F7FF]">
      <CustomerSidebar user={userProfile} />
      <div className="flex-1 flex flex-col lg:ml-64">
        <CustomerMobileHeader user={userProfile} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
