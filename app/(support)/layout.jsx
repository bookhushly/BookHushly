import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupportLayoutClient } from "./client-layout";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Support Inbox — BookHushly",
  description: "BookHushly support agent portal.",
};

export default async function SupportLayout({ children }) {
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

  const agent = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
  };

  return (
    <>
      <SupportLayoutClient agent={agent}>{children}</SupportLayoutClient>
      <Toaster />
    </>
  );
}
