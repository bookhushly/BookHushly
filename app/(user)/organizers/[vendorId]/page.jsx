import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import OrganizerProfileClient from "./client";

export async function generateMetadata({ params }) {
  const { vendorId } = await params;
  const admin = createAdminClient();
  const { data: vendor } = await admin
    .from("vendors")
    .select("business_name")
    .eq("id", vendorId)
    .maybeSingle();
  return {
    title: vendor ? `${vendor.business_name} — Events` : "Organizer Profile",
  };
}

export default async function OrganizerProfilePage({ params }) {
  const { vendorId } = await params;
  const admin = createAdminClient();

  const { data: vendor } = await admin
    .from("vendors")
    .select("id, business_name, bio, avatar_url, city, state, created_at, users!inner(email)")
    .eq("id", vendorId)
    .eq("status", "approved")
    .maybeSingle();

  if (!vendor) notFound();

  const { data: listings } = await admin
    .from("listings")
    .select("id, title, media_urls, event_date, event_end_date, location, price, remaining_tickets, total_tickets, category_data, ticket_packages")
    .eq("vendor_id", vendorId)
    .eq("category", "events")
    .eq("visibility", "public")
    .eq("active", true)
    .order("event_date", { ascending: true });

  const { count: followerCount } = await admin
    .from("organizer_follows")
    .select("*", { count: "exact", head: true })
    .eq("vendor_id", vendorId);

  return (
    <OrganizerProfileClient
      vendor={vendor}
      listings={listings || []}
      followerCount={followerCount || 0}
    />
  );
}
