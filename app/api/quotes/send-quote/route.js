import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { render } from "@react-email/render";
import QuoteEmail from "@/emails/quote-email";

export async function POST(request) {
  try {
    const { quoteId, requestType } = await request.json();
    const supabase = await createClient();

    // Fetch quote details
    const { data: quote } = await supabase
      .from("service_quotes")
      .select("*")
      .eq("id", quoteId)
      .single();

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Fetch request details
    const tableName =
      requestType === "logistics" ? "logistics_requests" : "security_requests";
    const { data: requestData } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", quote.request_id)
      .single();

    // Generate payment link
    const paymentLink = `${process.env.NEXT_PUBLIC_SITE_URL}/payment/${requestType}/${quote.request_id}?quote_id=${quoteId}`;

    // Update request with payment link
    await supabase
      .from(tableName)
      .update({ payment_link: paymentLink })
      .eq("id", quote.request_id);

    // Prepare email data for React Email template
    let routeInfo = null;
    let dateInfo = null;

    if (requestType === "logistics") {
      routeInfo = `${requestData.pickup_state} → ${requestData.delivery_state}`;
      dateInfo = new Date(requestData.pickup_date).toLocaleDateString("en-NG");
    } else {
      dateInfo = new Date(requestData.start_date).toLocaleDateString("en-NG");
    }

    // Render email template
    const emailHtml = render(
      QuoteEmail({
        customerName: requestData.full_name,
        serviceType: requestData.service_type?.replace("_", " "),
        requestType,
        quoteDetails: quote.breakdown,
        totalAmount: quote.total_amount,
        validUntil: quote.valid_until,
        paymentLink,
        routeInfo,
        dateInfo,
      }),
    );

    // Send email using Resend
    const emailResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: requestData.email,
          subject: `Your ${requestType === "logistics" ? "Logistics" : "Security"} Service Quote - BookHushly`,
          html: emailHtml,
          attachments: quote.pdf_url
            ? [
                {
                  filename: `BookHushly_Quote_${quote.id.slice(0, 8)}.pdf`,
                  path: quote.pdf_url,
                },
              ]
            : [],
        }),
      },
    );

    if (!emailResponse.ok) {
      throw new Error("Failed to send email");
    }

    return NextResponse.json({
      success: true,
      message: "Quote sent successfully",
      paymentLink,
    });
  } catch (error) {
    console.error("Error sending quote:", error);
    return NextResponse.json(
      { error: "Failed to send quote" },
      { status: 500 },
    );
  }
}
