import { createServerClients } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req) {
  const supabase = createServerClients();

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
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create vendor
    const { data: newVendor, error: vendorError } = await supabase
      .from("vendors")
      .upsert({
        ...vendorData,
        user_id: session.user.id,
        approved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (vendorError) throw vendorError;

    // Send KYC submission email to admin (or team)
    await sendEmail("aboderindaniel482@gmail.com", "kycSubmissionNotice", {
      vendorName: vendorData.business_name || user.full_name || user.email,
      email: user.email,
      phone: vendorData.phone || "N/A",
      businessName: vendorData.business_name || "N/A",
      dashboardUrl: `https://www.bookhushly.com/admin/`, // adjust as needed
    });

    return NextResponse.json({ success: true, data: newVendor });
  } catch (error) {
    console.error("Error creating vendor:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
