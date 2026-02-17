import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLogisticsRequests } from "@/app/actions/customers";
import { LogisticsClient } from "./client";

export default async function LogisticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const initialData = await getLogisticsRequests(user.id, 1, 10).catch(() => ({
    data: [],
    count: 0,
  }));

  return <LogisticsClient userId={user.id} initialData={initialData} />;
}
