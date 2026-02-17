import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSecurityRequests } from "@/app/actions/customers";
import { SecurityClient } from "./client";

export default async function SecurityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const initialData = await getSecurityRequests(user.id, 1, 10).catch(() => ({
    data: [],
    count: 0,
  }));

  return <SecurityClient userId={user.id} initialData={initialData} />;
}
