import { supabase } from "@/lib/supabase";
import BookServiceClient from "../../../../components/book/BookServiceClient";

export async function generateStaticParams() {
  try {
    const { data: services, error } = await supabase
      .from("listings")
      .select("id")
      .eq("active", true);

    if (error) {
      console.error(
        "Error fetching services for book static generation:",
        error
      );
      return [];
    }

    return services.map((service) => ({
      id: service.id.toString(),
    }));
  } catch (err) {
    console.error("Exception in generateStaticParams for book service:", err);
    return [];
  }
}

export default function BookServicePageWrapper() {
  return <BookServiceClient />;
}
