import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { trackAIUsage } from "@/lib/track-ai-usage";

const anthropic = new Anthropic();

const LOGISTICS_SYSTEM = `You are a friendly AI assistant on Bookhushly, Nigeria's logistics and services platform. You help customers fill out a logistics quote request through natural conversation.

Your goal: collect the fields below by asking friendly, conversational questions — one or two at a time. Be warm and speak naturally. Do NOT list out all fields at once. Adapt your questions based on answers already given.

Required fields to collect:
- service_type: one of delivery | moving | cargo | pickup | dropoff
- full_name: customer's full name
- phone: Nigerian phone number
- email: email address
- pickup_address: full pickup address
- pickup_state: Nigerian state for pickup
- pickup_date: date of pickup (YYYY-MM-DD)
- delivery_address: full delivery address
- delivery_state: Nigerian state for delivery
- item_description: what is being transported
- item_category: one of electronics | furniture | documents | food | clothing | appliances | other
- item_weight: one of 0-5kg | 5-20kg | 20-50kg | 50-100kg | 100kg+
- vehicle_type: one of bike | car | van | truck | trailer

Optional (ask if natural to do so):
- pickup_time, delivery_date, special_instructions, requires_packaging, fragile_items

When you have collected ALL required fields, output this EXACT format on a new line at the end of your message — and ONLY when truly complete:
READY_TO_SUBMIT
{"service_type":"...","full_name":"...","phone":"...","email":"...","pickup_address":"...","pickup_state":"...","pickup_date":"...","delivery_address":"...","delivery_state":"...","item_description":"...","item_category":"...","item_weight":"...","vehicle_type":"..."}

Start by greeting the customer and asking what type of logistics service they need.`;

const SECURITY_SYSTEM = `You are a friendly AI assistant on Bookhushly, Nigeria's security services platform. You help customers fill out a security quote request through natural conversation.

Your goal: collect the fields below by asking friendly, conversational questions — one or two at a time. Be warm and professional. Do NOT list out all fields at once.

Required fields to collect:
- service_type: one of residential | corporate | event_security | personal_security | escort
- full_name: customer's full name
- phone: Nigerian phone number
- email: email address
- service_address: address where security is needed
- state: Nigerian state
- start_date: when service should start (YYYY-MM-DD)
- duration_type: one of hourly | daily | weekly | monthly | one_time | ongoing
- shift_pattern: one of day | night | 24_hours | rotating
- number_of_guards: how many guards needed (integer)
- guard_type: one of unarmed | armed | both
- risk_level: one of low | medium | high | critical

Optional (ask if natural):
- end_date, special_instructions, requires_canine, requires_vehicle

When you have collected ALL required fields, output this EXACT format on a new line at the end of your message — ONLY when truly complete:
READY_TO_SUBMIT
{"service_type":"...","full_name":"...","phone":"...","email":"...","service_address":"...","state":"...","start_date":"...","duration_type":"...","shift_pattern":"...","number_of_guards":1,"guard_type":"...","risk_level":"..."}

Start by greeting the customer and asking what type of security service they need.`;

export async function POST(request) {
  try {
    const supabase = await createClient();

    // Feature flag check
    const { data: setting } = await supabase
      .from("ai_feature_settings")
      .select("enabled")
      .eq("feature_key", "quote_assistant")
      .single();

    if (setting && !setting.enabled) {
      return NextResponse.json(
        { error: "This feature is currently disabled." },
        { status: 403 }
      );
    }

    const { serviceType, messages } = await request.json();

    if (!serviceType || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const systemPrompt =
      serviceType === "security" ? SECURITY_SYSTEM : LOGISTICS_SYSTEM;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const rawReply = response.content[0]?.text ?? "";

    // Check if Claude has collected everything
    const submitIndex = rawReply.indexOf("READY_TO_SUBMIT");
    if (submitIndex !== -1) {
      const jsonStart = rawReply.indexOf("{", submitIndex);
      const jsonEnd = rawReply.lastIndexOf("}") + 1;
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const formData = JSON.parse(rawReply.slice(jsonStart, jsonEnd));
        const replyText = rawReply.slice(0, submitIndex).trim();

        const { data: { user } } = await supabase.auth.getUser();
        trackAIUsage("quote_assistant", user?.id ?? null);

        return NextResponse.json({
          reply: replyText || "Great, I have everything I need! I've filled in the form for you — please review the details and submit when you're ready.",
          isComplete: true,
          formData,
        });
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    trackAIUsage("quote_assistant", user?.id ?? null);

    return NextResponse.json({ reply: rawReply, isComplete: false });
  } catch (error) {
    console.error("quote ai-assistant error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
