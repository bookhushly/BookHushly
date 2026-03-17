import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/ai-settings — public, returns { feature_key: boolean } map
// Used by all user-facing components to check if a feature is enabled
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ai_feature_settings")
      .select("feature_key, enabled");

    if (error) throw error;

    const map = {};
    data.forEach(({ feature_key, enabled }) => {
      map[feature_key] = enabled;
    });

    return NextResponse.json(
      { data: map },
      {
        headers: {
          // Cache for 30 seconds — settings don't change often
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/ai-settings error:", error);
    // Fail open — return all features enabled so users are not affected
    return NextResponse.json({
      data: {
        support_chat: true,
        listing_generator: true,
        review_summarizer: true,
        quote_assistant: true,
        vendor_insights: true,
        natural_language_search: true,
        quote_drafting: true,
      },
    });
  }
}
