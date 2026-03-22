// app/events/[id]/page.jsx
import { createStaticClient } from "@/lib/supabase/server";
import EventTicketPurchase from "@/components/common/EventTicketPurchase";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = createStaticClient();

  const { data: event } = await supabase
    .from("listings")
    .select("title, description, media_urls, city, state, category")
    .eq("id", id)
    .maybeSingle();

  if (!event) {
    return {
      title: "Event Tickets | BookHushly",
      description: "Book event tickets in Nigeria on BookHushly.",
    };
  }

  const description =
    event.description?.replace(/<[^>]*>/g, "").slice(0, 160) ||
    `Book tickets for ${event.title} on BookHushly.`;
  const image = event.media_urls?.[0];
  const location = [event.city, event.state].filter(Boolean).join(", ");

  return {
    title: `${event.title}${location ? ` — ${location}` : ""} | BookHushly`,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title: event.title,
      description,
      type: "website",
      locale: "en_NG",
      siteName: "BookHushly",
      url: `https://bookhushly.com/events/${id}`,
      images: image ? [{ url: image, alt: event.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
      images: image ? [image] : [],
    },
  };
}

export async function generateStaticParams() {
  try {
    const { data: services, error } = await supabase
      .from("listings")
      .select("id")
      .eq("active", true)
      .eq("category", "events");

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
