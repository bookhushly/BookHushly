import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { trackAIUsage } from "@/lib/track-ai-usage";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Feature flag check
    const { data: setting } = await supabase
      .from("ai_feature_settings")
      .select("enabled")
      .eq("feature_key", "listing_generator")
      .single();

    if (setting && !setting.enabled) {
      return NextResponse.json(
        { error: "This feature is currently disabled." },
        { status: 403 }
      );
    }

    const { category, context, hint } = await request.json();

    if (!category) {
      return NextResponse.json(
        { error: "category is required" },
        { status: 400 }
      );
    }

    // Build a context string from whatever fields the vendor has already filled in
    const contextLines = [];
    if (context?.title) contextLines.push(`Current title: ${context.title}`);
    if (context?.location) contextLines.push(`Location: ${context.location}`);
    if (context?.price) contextLines.push(`Price: ₦${context.price}`);
    if (context?.capacity) contextLines.push(`Capacity: ${context.capacity}`);
    if (context?.amenities?.length)
      contextLines.push(`Amenities: ${context.amenities.join(", ")}`);
    if (hint) contextLines.push(`Vendor notes: ${hint}`);

    const contextBlock =
      contextLines.length > 0
        ? `\n\nAdditional context:\n${contextLines.join("\n")}`
        : "";

    const prompt = `You are helping a vendor on Bookhushly — Nigeria's hospitality and services platform — write a professional listing.

Category: ${category}${contextBlock}

Write:
1. A short, compelling listing title (max 10 words)
2. A professional description (2-4 sentences) that highlights the key value, location appeal, and what makes it stand out for Nigerian/African customers.

Respond with ONLY valid JSON in this exact format:
{"title": "...", "description": "..."}`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0]?.text ?? "";

    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to generate content. Please try again." },
        { status: 500 }
      );
    }

    const generated = JSON.parse(jsonMatch[0]);

    trackAIUsage("listing_generator", user.id);

    return NextResponse.json({ data: generated });
  } catch (error) {
    console.error("generate-listing error:", error);
    return NextResponse.json(
      { error: "Failed to generate listing content. Please try again." },
      { status: 500 }
    );
  }
}
