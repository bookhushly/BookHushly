import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getEventBookings } from "@/app/actions/customers";
import { EventBookingsClient } from "./client";

export default async function EventBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const initialData = await getEventBookings(user.id, 1, 10).catch(() => ({
    data: [],
    count: 0,
  }));

  return <EventBookingsClient userId={user.id} initialData={initialData} />;
}
