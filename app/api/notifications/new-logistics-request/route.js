import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { render } from "@react-email/render";
import AdminNotificationEmail from "@/emails/admin-notification";

export async function POST(request) {
  try {
    const { requestId } = await request.json();
    const supabase = await createClient();

    // Fetch request details
    const { data: requestData } = await supabase
      .from("logistics_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (!requestData) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Get admin emails (fetch from users where role = 'admin')
    const { data: admins } = await supabase
      .from("users")
      .select("email")
      .eq("role", "admin");

    const adminEmails = admins?.map((a) => a.email).filter(Boolean) || [];

    if (adminEmails.length === 0) {
      console.warn("No admin emails found");
      return NextResponse.json({ success: true, warning: "No admin emails" });
    }

    // Render email template to HTML string
    const emailHtml = await render(
      AdminNotificationEmail({
        requestId: requestData.id,
        requestType: "logistics",
        customerName: requestData.full_name,
        customerPhone: requestData.phone,
        customerEmail: requestData.email,
        serviceType: requestData.service_type,
        additionalDetails: {
          route: `${requestData.pickup_state} → ${requestData.delivery_state}`,
          pickupDate: new Date(requestData.pickup_date).toLocaleDateString(
            "en-NG",
          ),
          vehicleType: requestData.vehicle_type,
        },
        dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/logistics-requests`,
        isHighPriority: false,
      }),
      {
        pretty: false,
      },
    );

    // Send email with error handling
    const emailResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/send-emails-quote`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: adminEmails,
          subject: "New Logistics Service Request - BookHushly Admin",
          html: emailHtml,
        }),
      },
    );

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(errorData.error || "Failed to send email");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 },
    );
  }
}
