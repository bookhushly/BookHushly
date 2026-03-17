import { createClient } from "@/lib/supabase/client";

// Default feature state — used as fallback if DB is unreachable
const DEFAULTS = {
  support_chat: true,
  listing_generator: true,
  review_summarizer: true,
  quote_assistant: true,
  vendor_insights: true,
  natural_language_search: true,
  quote_drafting: true,
};

export const getAISettings = async () => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("ai_feature_settings")
      .select("*")
      .order("feature_key");

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("getAISettings error:", error);
    return { data: null, error };
  }
};

// Returns a simple { feature_key: boolean } map — used by client components
export const getAIFeatureMap = async () => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("ai_feature_settings")
      .select("feature_key, enabled");

    if (error) throw error;

    const map = { ...DEFAULTS };
    data.forEach(({ feature_key, enabled }) => {
      map[feature_key] = enabled;
    });
    return { data: map, error: null };
  } catch (error) {
    console.error("getAIFeatureMap error:", error);
    // Fail open — return all features enabled so users aren't affected by DB issues
    return { data: DEFAULTS, error };
  }
};

export const updateAISetting = async (featureKey, enabled, userId) => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("ai_feature_settings")
      .update({
        enabled,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq("feature_key", featureKey)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("updateAISetting error:", error);
    return { data: null, error };
  }
};
