// app/api/admin/vendors/approve/route.js
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { notifyKYCApproved } from "@/lib/notifications";

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

    // Send approval email (non-blocking — log clearly so ops can investigate)
    try {
      const emailRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/emails/vendor-approved`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vendorId }),
        },
      );
      if (!emailRes.ok) {
        const text = await emailRes.text().catch(() => "");
        console.error(
          `[vendor/approve] Approval email failed for vendor ${vendorId}: HTTP ${emailRes.status}`,
          text,
        );
      }
    } catch (emailError) {
      console.error(
        `[vendor/approve] Approval email threw for vendor ${vendorId}:`,
        emailError.message,
      );
    }

    // In-app notification to vendor
    if (data?.user_id) {
      await notifyKYCApproved(data.user_id);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[vendor/approve] Error:", error);
    return NextResponse.json({ error: "Failed to approve vendor" }, { status: 500 });
  }
}
