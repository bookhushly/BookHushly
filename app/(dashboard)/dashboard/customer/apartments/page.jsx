import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getApartmentBookings } from "@/app/actions/customers";
import { ApartmentBookingsClient } from "./client";

export default async function ApartmentBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const initialData = await getApartmentBookings(user.id, 1, 10).catch(() => ({
    data: [],
    count: 0,
  }));

  return <ApartmentBookingsClient userId={user.id} initialData={initialData} />;
}
