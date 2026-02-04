// app/api/admin/vendors/approve/route.js
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { vendorId } = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("vendors")
      .update({
        approved: true,
        approved_at: new Date().toISOString(),
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", vendorId)
      .select()
      .single();

    if (error) throw error;

    // Send approval email
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/emails/vendor-approved`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vendorId }),
        },
      );
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error approving vendor:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
