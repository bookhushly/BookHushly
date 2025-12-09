import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { generateAllTicketPDFs } from "@/utils/generatePdf";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return Response.json(
        { success: false, error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Fetch booking data
    const supabase = await createClient();
    const { data: booking, error: bookingError } = await supabase
      .from("event_bookings")
      .select(
        `
        id, listing_id, ticket_details, guests, total_amount, booking_date, booking_time,
        status, payment_status, contact_email, contact_phone,
        listing:listings (
          title, event_date, location, vendor_name, vendor_phone, ticket_packages, media_urls
        )
      `
      )
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("Booking fetch error:", bookingError);
      return Response.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Generate ticket PDFs with exact specifications
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Use file system path to the template in public folder
    const templatePath = path.join(process.cwd(), "public", "ticket.jpg");

    const ticketPDFs = await generateAllTicketPDFs(
      booking,
      baseUrl,
      templatePath
    );

    // Convert buffers to base64 for Resend
    const attachments = ticketPDFs.map((ticket) => ({
      filename: ticket.filename,
      content: ticket.content.toString("base64"),
    }));

    // Prepare ticket summary for email
    const ticketDetails = JSON.parse(booking.ticket_details || "{}");
    const ticketSummary = Object.entries(ticketDetails)
      .filter(([_, qty]) => qty > 0)
      .map(([name, qty]) => `${qty} × ${name}`)
      .join(", ");

    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: "BookHushly <tickets@bookhushly.com>",
      to: booking.contact_email,
      subject: `Your Tickets for ${booking.listing?.title || "Event"}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #7c3aed; padding: 32px 40px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🎉 Your Tickets Are Ready!</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <p style="margin: 0 0 24px; color: #111827; font-size: 16px; line-height: 1.6;">
                          Hi there,
                        </p>
                        
                        <p style="margin: 0 0 24px; color: #111827; font-size: 16px; line-height: 1.6;">
                          Thank you for your purchase! Your tickets for <strong>${booking.listing?.title || "the event"}</strong> are attached to this email.
                        </p>
                        
                        <!-- Event Details Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
                          <tr>
                            <td style="padding: 24px;">
                              <h2 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">Event Details</h2>
                              
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;">📅 Date:</td>
                                  <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">
                                    ${booking.listing?.event_date ? new Date(booking.listing.event_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "TBD"}
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">⏰ Time:</td>
                                  <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${booking.booking_time || "TBD"}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">📍 Location:</td>
                                  <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${booking.listing?.location || "Venue TBD"}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">🎫 Tickets:</td>
                                  <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${ticketSummary}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Important Info -->
                        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                          <h3 style="margin: 0 0 12px; color: #92400e; font-size: 14px; font-weight: 600;">📋 Before You Go</h3>
                          <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.6;">
                            <li>Bring your ticket (digital or printed)</li>
                            <li>Arrive 30 minutes early</li>
                            <li>Valid ID required for entry</li>
                            <li>Check your email for updates</li>
                          </ul>
                        </div>
                        
                        <p style="margin: 0 0 24px; color: #111827; font-size: 16px; line-height: 1.6;">
                          Your tickets are attached as PDF files. You can also view your booking anytime at:
                        </p>
                        
                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 8px 0 24px;">
                              <a href="${baseUrl}/booking-status/${booking.id}" 
                                 style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                View Booking Details
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 0 0 8px; color: #111827; font-size: 16px; line-height: 1.6;">
                          Need help? Contact us:
                        </p>
                        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          📧 support@bookhushly.com<br>
                          📞 ${booking.listing?.vendor_phone || "N/A"}
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px;">
                          © 2024 BookHushly. All rights reserved.
                        </p>
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                          You're receiving this email because you purchased tickets on BookHushly.
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      attachments,
    });

    if (error) {
      console.error("Resend error:", error);
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Email sending error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
