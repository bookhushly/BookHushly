import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { trackAIUsage } from "@/lib/track-ai-usage";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const supabase = await createClient();

    // Feature flag
    const { data: setting } = await supabase
      .from("ai_feature_settings")
      .select("enabled")
      .eq("feature_key", "natural_language_search")
      .single();

    if (setting && !setting.enabled) {
      return NextResponse.json({ error: "Feature disabled" }, { status: 403 });
    }

    const { query } = await request.json();
    if (!query?.trim()) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const prompt = `You are a search filter extractor for Bookhushly, a Nigerian hospitality and services platform.

Extract structured filters from this search query: "${query}"

Available categories: hotels, serviced_apartments, events, logistics, security
Available Nigerian cities (location): Lagos, Abuja, Port Harcourt, Kano, Ibadan
Price ranges: 0-25000, 25000-50000, 50000-100000, 100000+  (in Naira)
Rating: 3.0, 3.5, 4.0, 4.5  (minimum rating)

Rules:
- If a field cannot be determined, set it to "all"
- For the "query" field, return a clean simplified keyword (e.g. "hotel", "apartment", "event space") — or empty string if the category covers it
- Match partial city names (e.g. "PH" or "port harcourt" → "Port Harcourt")
- Luxury/premium implies priceRange "100000+"
- Budget/cheap/affordable implies priceRange "0-25000"

Respond ONLY with valid JSON:
{"query": "...", "category": "...", "location": "...", "priceRange": "...", "rating": "...", "summary": "one short phrase describing what was parsed"}`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0]?.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Parse failed." }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const { data: { user } } = await supabase.auth.getUser();
    trackAIUsage("natural_language_search", user?.id ?? null);

    return NextResponse.json({ data: parsed });
  } catch (error) {
    console.error("parse-query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
