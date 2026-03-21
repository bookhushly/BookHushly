import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { notifyAdminKYCSubmitted } from "@/lib/notifications";

export async function POST(req) {
  const supabase = await createClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in again." },
      { status: 401 }
    );
  }

  try {
    const vendorData = await req.json();

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, full_name, role")
      .eq("id", session.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Reject if a vendor record already exists for this user — prevents silent overwrites
    const { data: existingVendor } = await supabase
      .from("vendors")
      .select("id, status")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (existingVendor) {
      return NextResponse.json(
        { error: "A vendor application already exists for this account.", status: existingVendor.status },
        { status: 409 }
      );
    }

    // Insert — never upsert to avoid accidental overwrites
    const { data: newVendor, error: vendorError } = await supabase
      .from("vendors")
      .insert({
        ...vendorData,
        user_id: session.user.id,
        approved: false,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (vendorError) throw vendorError;

    // Notify all admins in-app about the new KYC submission
    const { data: admins } = await supabase
      .from("users")
      .select("id")
      .eq("role", "admin");
    const adminIds = admins?.map((a) => a.id).filter(Boolean) || [];
    if (adminIds.length) {
      notifyAdminKYCSubmitted(adminIds, {
        vendorName: vendorData.business_name || user.full_name || user.email,
        vendorId: newVendor.id,
      }).catch(() => {});
    }

    // Send KYC submission email to admin (or team)
    const adminEmail = process.env.ADMIN_KYC_EMAIL || process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendEmail(adminEmail, "kycSubmissionNotice", {
        vendorName: vendorData.business_name || user.full_name || user.email,
        email: user.email,
        phone: vendorData.phone || "N/A",
        businessName: vendorData.business_name || "N/A",
        dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}admin/`,
      });
    }

    return NextResponse.json({ success: true, data: newVendor });
  } catch (error) {
    console.error("[vendor/create] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create vendor application. Please try again." },
      { status: 500 }
    );
  }
}
