import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { trackAIUsage } from "@/lib/track-ai-usage";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const supabase = await createClient();

    // Admin auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("users").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Feature flag
    const { data: setting } = await supabase
      .from("ai_feature_settings")
      .select("enabled")
      .eq("feature_key", "quote_drafting")
      .single();

    if (setting && !setting.enabled) {
      return NextResponse.json({ error: "Feature disabled" }, { status: 403 });
    }

    const { serviceType, requestData } = await request.json();

    if (!serviceType || !requestData) {
      return NextResponse.json({ error: "serviceType and requestData required" }, { status: 400 });
    }

    // Build context from the request
    let contextLines = [];

    if (serviceType === "logistics") {
      const r = requestData;
      contextLines = [
        `Service type: ${r.service_type}`,
        `Item: ${r.item_description} (${r.item_category}, ${r.item_weight})`,
        `Vehicle required: ${r.vehicle_type}`,
        `Pickup: ${r.pickup_address}, ${r.pickup_state}`,
        `Delivery: ${r.delivery_address}, ${r.delivery_state}`,
        r.pickup_date ? `Pickup date: ${r.pickup_date}` : "",
        r.requires_packaging ? "Requires packaging" : "",
        r.requires_insurance ? "Requires insurance" : "",
        r.fragile_items ? "Contains fragile items" : "",
        r.perishable_items ? "Contains perishable items" : "",
        r.special_instructions ? `Special instructions: ${r.special_instructions}` : "",
      ].filter(Boolean);
    } else {
      const r = requestData;
      contextLines = [
        `Service type: ${r.service_type}`,
        `Location: ${r.service_address}, ${r.state}`,
        `Duration: ${r.duration_type}, starting ${r.start_date}`,
        `Guards: ${r.number_of_guards} ${r.guard_type} guards`,
        `Shift: ${r.shift_pattern}`,
        `Risk level: ${r.risk_level}`,
        r.requires_canine ? "Requires canine unit" : "",
        r.requires_vehicle ? "Requires patrol vehicle" : "",
        r.special_instructions ? `Special instructions: ${r.special_instructions}` : "",
      ].filter(Boolean);
    }

    const prompt = `You are a pricing assistant for Bookhushly, a Nigerian ${serviceType} services company.

Based on this ${serviceType} service request, suggest a reasonable quote in Nigerian Naira (₦):
${contextLines.join("\n")}

Nigerian market context:
- Bike delivery within city: ₦2,000–₦8,000
- Car delivery: ₦8,000–₦25,000
- Van/truck: ₦25,000–₦150,000 depending on distance and load
- Security guard (daily): ₦15,000–₦30,000 per guard
- Armed guards cost 30–50% more than unarmed
- 24-hour shifts cost 2x day rates

Respond ONLY with valid JSON:
{
  "base_amount": number,
  "breakdown": { "label": amount_number },
  "admin_notes": "short professional explanation of pricing (2-3 sentences)",
  "valid_until": "YYYY-MM-DD"
}

Set valid_until to 7 days from today (${new Date().toISOString().slice(0, 10)}).
Keep breakdown to 2-4 line items max. Numbers must be plain integers (no commas).`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0]?.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to draft quote." }, { status: 500 });
    }

    const draft = JSON.parse(jsonMatch[0]);
    trackAIUsage("quote_drafting", user.id);

    return NextResponse.json({ data: draft });
  } catch (error) {
    console.error("draft-quote error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
