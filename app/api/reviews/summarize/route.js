import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { trackAIUsage } from "@/lib/track-ai-usage";

const anthropic = new Anthropic();

// POST /api/reviews/summarize
// Body: { listingId, listingType, reviews: [{rating, comment}] }
export async function POST(request) {
  try {
    const supabase = await createClient();

    // Feature flag check
    const { data: setting } = await supabase
      .from("ai_feature_settings")
      .select("enabled")
      .eq("feature_key", "review_summarizer")
      .single();

    if (setting && !setting.enabled) {
      return NextResponse.json({ error: "Feature disabled" }, { status: 403 });
    }

    const { reviews } = await request.json();

    if (!reviews || reviews.length < 3) {
      return NextResponse.json(
        { error: "Need at least 3 reviews to summarise." },
        { status: 400 }
      );
    }

    const reviewText = reviews
      .slice(0, 20) // cap at 20 for token safety
      .map((r, i) => `Review ${i + 1} (${r.rating}/5): ${r.comment || "No comment"}`)
      .join("\n");

    const prompt = `You are analysing customer reviews for a listing on Bookhushly, Nigeria's hospitality and services platform.

Here are the reviews:
${reviewText}

Summarise these reviews into:
1. "pros" - up to 3 short bullet points about what guests consistently loved (max 10 words each)
2. "cons" - up to 2 short bullet points about recurring concerns (max 10 words each, omit if none)
3. "summary" - one sentence overall impression (max 20 words)

Respond ONLY with valid JSON:
{"pros": ["...", "..."], "cons": ["...", "..."], "summary": "..."}`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 250,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0]?.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to generate summary." },
        { status: 500 }
      );
    }

    const summary = JSON.parse(jsonMatch[0]);

    // Get current user for tracking (optional — works for anonymous too)
    const { data: { user } } = await supabase.auth.getUser();
    trackAIUsage("review_summarizer", user?.id ?? null);

    return NextResponse.json({ data: summary });
  } catch (error) {
    console.error("review summarize error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
