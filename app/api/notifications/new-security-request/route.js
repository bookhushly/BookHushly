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
      .from("security_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (!requestData) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Get admin emails
    const { data: admins } = await supabase
      .from("users")
      .select("email")
      .eq("role", "admin");

    const adminEmails = admins?.map((a) => a.email).filter(Boolean) || [];

    if (adminEmails.length === 0) {
      console.warn("No admin emails found");
      return NextResponse.json({ success: true, warning: "No admin emails" });
    }

    const isHighPriority =
      requestData.risk_level === "critical" ||
      requestData.risk_level === "high";

    // Render email template - AWAIT the render function
    const emailHtml = await render(
      AdminNotificationEmail({
        requestId: requestData.id,
        requestType: "security",
        customerName: requestData.full_name,
        customerPhone: requestData.phone,
        customerEmail: requestData.email,
        serviceType: requestData.service_type,
        additionalDetails: {
          location: requestData.state,
          startDate: new Date(requestData.start_date).toLocaleDateString(
            "en-NG",
          ),
          personnel: `${requestData.number_of_guards} ${requestData.guard_type} guards`,
          durationType: requestData.duration_type,
          riskLevel: requestData.risk_level,
          specificThreats: requestData.specific_threats,
          previousIncidents: requestData.previous_incidents,
        },
        dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/dashboard/security-requests`,
        isHighPriority,
      }),
    );

    // Send email
    const emailResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/send-emails-quote`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: adminEmails,
          subject: `${isHighPriority ? "⚠️ URGENT - " : ""}New Security Service Request - BookHushly Admin`,
          html: emailHtml,
        }),
      },
    );

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Email send failed:", errorData);
      throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification", details: error.message },
      { status: 500 },
    );
  }
}
