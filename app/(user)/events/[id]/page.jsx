// app/events/[id]/page.jsx
import { supabase } from "@/lib/supabase";
import EventTicketPurchase from "@/components/common/EventTicketPurchase";

export async function generateStaticParams() {
  try {
    const { data: services, error } = await supabase
      .from("listings")
      .select("id")
      .eq("active", true)
      .eq("category", "events")
      .eq("event_type", "event_organizer");

    if (error) {
      console.error("Error fetching events:", error);
      return [];
    }

    return services.map((service) => ({
      id: service.id.toString(),
    }));
  } catch (err) {
    console.error("Exception in generateStaticParams:", err);
    return [];
  }
}

export default function EventTicketPurchasePage() {
  return <EventTicketPurchase />;
}
