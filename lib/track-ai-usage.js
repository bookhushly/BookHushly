import { createClient } from "@/lib/supabase/server";

/**
 * Log a single AI feature invocation.
 * Call this inside any AI API route handler.
 * Errors are swallowed — tracking must never break the actual feature.
 *
 * @param {string} featureKey  - e.g. "listing_generator"
 * @param {string|null} userId - authenticated user id, or null for anonymous
 */
export async function trackAIUsage(featureKey, userId = null) {
  try {
    const supabase = await createClient();
    await supabase.from("ai_feature_usage").insert({
      feature_key: featureKey,
      user_id: userId ?? null,
    });
  } catch {
    // Silent fail — tracking must never break the feature it wraps
  }
}
