import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getPaymentHistory } from "@/app/actions/customers";
import { PaymentsClient } from "./client";

export default async function PaymentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const initialData = await getPaymentHistory(user.id, 1, 20).catch(() => ({
    data: [],
    count: 0,
  }));

  return <PaymentsClient userId={user.id} initialData={initialData} />;
}
