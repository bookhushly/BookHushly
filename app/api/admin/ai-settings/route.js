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

    if (error) throw error;
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
