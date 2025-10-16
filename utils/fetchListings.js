import { supabase } from "@/lib/supabase";

const fetchListing = async (id) => {
  try {
    const { data: listing, error } = await supabase
      .from("listings")
      .eq("id", id);
  } catch {
  } finally {
  }
};
