import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getHotelBookings } from "@/app/actions/customers";
import { HotelBookingsClient } from "./client";

export default async function HotelBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const initialData = await getHotelBookings(user.id, 1, 10).catch(() => ({
    data: [],
    count: 0,
  }));

  return <HotelBookingsClient userId={user.id} initialData={initialData} />;
}
