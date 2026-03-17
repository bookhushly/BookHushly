import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getAdminUser(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return null;
  return user;
}

const DEFAULT_FEATURES = [
  { feature_key: "support_chat",            feature_name: "Support Chat",              description: "AI-powered live support chatbot for customers on the /support page.",                               enabled: true },
  { feature_key: "listing_generator",       feature_name: "Smart Listing Generator",   description: "Helps vendors generate professional listing titles and descriptions from a few bullet points.",       enabled: true },
  { feature_key: "review_summarizer",       feature_name: "Review Summarizer",         description: "Automatically summarises customer reviews into key pros and cons on service detail pages.",           enabled: true },
  { feature_key: "quote_assistant",         feature_name: "Guided Quote Assistant",    description: "Conversational AI that guides customers through the logistics and security quote request forms.",      enabled: true },
  { feature_key: "vendor_insights",         feature_name: "Vendor Analytics Insights", description: "Generates plain-English business tips from vendor booking and revenue data on the analytics page.", enabled: true },
  { feature_key: "natural_language_search", feature_name: "Natural Language Search",   description: "Lets users search for services by typing naturally instead of using filters.",                       enabled: true },
  { feature_key: "quote_drafting",          feature_name: "AI Quote Drafting",         description: "Helps admin auto-draft professional quote documents for logistics and security requests.",            enabled: true },
];

// GET /api/admin/ai-settings — fetch all AI feature settings
export async function GET() {
  try {
    const supabase = await createClient();
    const admin = await getAdminUser(supabase);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("ai_feature_settings")
      .select("*")
      .order("feature_key");

    if (error) {
      // Table might not exist yet — return empty with a flag
      if (error.code === "42P01") {
        return NextResponse.json({ data: [], tableExists: false });
      }
      throw error;
    }

    // Auto-seed if table is empty
    if (!data || data.length === 0) {
      const { data: seeded, error: seedError } = await supabase
        .from("ai_feature_settings")
        .upsert(DEFAULT_FEATURES, { onConflict: "feature_key" })
        .select()
        .order("feature_key");

      if (seedError) throw seedError;
      return NextResponse.json({ data: seeded ?? [], seeded: true });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/admin/ai-settings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/ai-settings — toggle a single feature
export async function PUT(request) {
  try {
    const supabase = await createClient();
    const admin = await getAdminUser(supabase);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { feature_key, enabled } = await request.json();

    if (!feature_key || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "feature_key and enabled (boolean) are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("ai_feature_settings")
      .update({
        enabled,
        updated_at: new Date().toISOString(),
        updated_by: admin.id,
      })
      .eq("feature_key", feature_key)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("PUT /api/admin/ai-settings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
