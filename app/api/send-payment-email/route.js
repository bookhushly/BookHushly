import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { generateAllTicketPDFsServer } from "../../../lib/generatePDFServer";
import path from "path";
import { BOOKING_TYPES, fetchBooking, fetchPayment } from "@/services/booking";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { bookingId, bookingType } = await request.json();

    if (!bookingId || !bookingType) {
      return Response.json(
        { success: false, error: "Booking ID and type are required" },
        { status: 400 }
      );
    }

    // Fetch booking and payment data
    const booking = await fetchBooking(bookingId, bookingType);
    const payment = await fetchPayment(bookingId, bookingType);

    if (!booking || !payment) {
      return Response.json(
        { success: false, error: "Booking or payment not found" },
        { status: 404 }
      );
    }

    // Determine email recipient
    const recipientEmail =
      bookingType === BOOKING_TYPES.EVENT
        ? booking.contact_email
        : booking.guest_email;

    // Generate email based on booking type
    if (bookingType === BOOKING_TYPES.EVENT) {
      return await sendEventTicketEmail(
        booking,
        payment,
        recipientEmail,
        bookingId
      );
    } else if (bookingType === BOOKING_TYPES.HOTEL) {
      return await sendHotelConfirmationEmail(
        booking,
        payment,
        recipientEmail,
        bookingId
      );
    } else if (bookingType === BOOKING_TYPES.APARTMENT) {
      return await sendApartmentConfirmationEmail(
        booking,
        payment,
        recipientEmail,
        bookingId
      );
    }

    return Response.json(
      { success: false, error: "Unsupported booking type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function sendEventTicketEmail(
  booking,
  payment,
  recipientEmail,
  bookingId
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const templatePath = path.join(process.cwd(), "public", "ticket.jpg");

    console.log("🎫 Generating tickets on server...");
    console.log("Template path:", templatePath);
    console.log("Base URL:", baseUrl);

    // Generate ticket PDFs with exact specifications (server-side)
    const ticketPDFs = await generateAllTicketPDFsServer(
      booking,
      baseUrl,
      templatePath
    );

    console.log(`✅ Generated ${ticketPDFs.length} tickets`);

    // Convert buffers to base64 for Resend
    const attachments = ticketPDFs.map((ticket) => ({
      filename: ticket.filename,
      content: ticket.content.toString("base64"),
    }));

    console.log(`📎 Prepared ${attachments.length} attachments`);

    // Prepare ticket summary
    const ticketDetails = JSON.parse(booking.ticket_details || "{}");
    const ticketSummary = Object.entries(ticketDetails)
      .filter(([_, qty]) => qty > 0)
      .map(([name, qty]) => `${qty} × ${name}`)
      .join(", ");

    console.log("📧 Sending email to:", recipientEmail);

    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: "BookHushly <tickets@bookhushly.com>",
      to: recipientEmail,
      subject: `Your Tickets for ${booking.listing?.title || "Event"}`,
      html: generateEventEmailTemplate(
        booking,
        payment,
        ticketSummary,
        bookingId
      ),
      attachments,
    });

    if (error) {
      console.error("Resend error:", error);
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Email sent successfully:", data);
    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Event email error:", error);
    console.error("Error stack:", error.stack);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function sendHotelConfirmationEmail(
  booking,
  payment,
  recipientEmail,
  bookingId
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const calculateNights = () => {
      if (!booking.check_in_date || !booking.check_out_date) return 0;
      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);
      const diffTime = Math.abs(checkOut - checkIn);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const nights = calculateNights();

    const { data, error } = await resend.emails.send({
      from: "BookHushly <bookings@bookhushly.com>",
      to: recipientEmail,
      subject: `Hotel Booking Confirmed - ${booking.hotel?.name || "Your Stay"}`,
      html: generateHotelEmailTemplate(
        booking,
        payment,
        nights,
        bookingId,
        baseUrl
      ),
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
    console.error("Hotel email error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function sendApartmentConfirmationEmail(
  booking,
  payment,
  recipientEmail,
  bookingId
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const calculateNights = () => {
      if (!booking.check_in_date || !booking.check_out_date) return 0;
      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);
      const diffTime = Math.abs(checkOut - checkIn);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const nights = calculateNights();

    const { data, error } = await resend.emails.send({
      from: "BookHushly <bookings@bookhushly.com>",
      to: recipientEmail,
      subject: `Apartment Booking Confirmed - ${booking.apartment?.name || "Your Stay"}`,
      html: generateApartmentEmailTemplate(
        booking,
        payment,
        nights,
        bookingId,
        baseUrl
      ),
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
    console.error("Apartment email error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function generateEventEmailTemplate(
  booking,
  payment,
  ticketSummary,
  bookingId
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return `
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
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">💰 Amount Paid:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${payment.vendor_currency || "NGN"} ${Number(booking.total_amount).toLocaleString()}</td>
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
                          <a href="${baseUrl}/order-successful/${bookingId}?type=event" 
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
  `;
}

function generateHotelEmailTemplate(
  booking,
  payment,
  nights,
  bookingId,
  baseUrl
) {
  return `
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
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">✨ Booking Confirmed!</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 24px; color: #111827; font-size: 16px; line-height: 1.6;">
                      Hello ${booking.guest_name},
                    </p>
                    
                    <p style="margin: 0 0 24px; color: #111827; font-size: 16px; line-height: 1.6;">
                      Great news! Your reservation at <strong>${booking.hotel?.name || "the hotel"}</strong> has been confirmed.
                    </p>
                    
                    <!-- Booking Details Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 24px;">
                          <h2 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">Booking Details</h2>
                          
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 140px;">🏨 Hotel:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${booking.hotel?.name || "N/A"}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">📍 Location:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${booking.hotel?.city}, ${booking.hotel?.state}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">🛏️ Room Type:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${booking.room_type?.name || "N/A"}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">🚪 Room Number:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${booking.room?.room_number || "Will be assigned at check-in"}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">📅 Check-in:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">
                                ${booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "N/A"}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">📅 Check-out:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">
                                ${booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "N/A"}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">🌙 Duration:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${nights} ${nights === 1 ? "night" : "nights"}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">👥 Guests:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">
                                ${booking.adults} Adult${booking.adults !== 1 ? "s" : ""}${booking.children > 0 ? `, ${booking.children} Child${booking.children !== 1 ? "ren" : ""}` : ""}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">💰 Total Amount:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${payment.vendor_currency || "NGN"} ${Number(booking.total_price).toLocaleString()}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    ${
                      booking.special_requests
                        ? `
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ede9fe; border-radius: 8px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 16px;">
                          <h3 style="margin: 0 0 8px; color: #5b21b6; font-size: 14px; font-weight: 600;">📝 Special Requests</h3>
                          <p style="margin: 0; color: #6b21a8; font-size: 14px; line-height: 1.6;">${booking.special_requests}</p>
                        </td>
                      </tr>
                    </table>
                    `
                        : ""
                    }
                    
                    <!-- Important Info -->
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                      <h3 style="margin: 0 0 12px; color: #92400e; font-size: 14px; font-weight: 600;">ℹ️ Important Information</h3>
                      <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.6;">
                        <li>Check-in time is typically 2:00 PM</li>
                        <li>Check-out time is typically 12:00 PM</li>
                        <li>Valid ID required at check-in</li>
                        <li>Contact property for early check-in/late check-out</li>
                      </ul>
                    </div>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 8px 0 24px;">
                          <a href="${baseUrl}/order-successful/${bookingId}?type=hotel" 
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
                      📧 support@bookhushly.com
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
                      You're receiving this email because you made a booking on BookHushly.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function generateApartmentEmailTemplate(
  booking,
  payment,
  nights,
  bookingId,
  baseUrl
) {
  return `
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
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">✨ Booking Confirmed!</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 24px; color: #111827; font-size: 16px; line-height: 1.6;">
                      Hello ${booking.guest_name},
                    </p>
                    
                    <p style="margin: 0 0 24px; color: #111827; font-size: 16px; line-height: 1.6;">
                      Excellent! Your reservation at <strong>${booking.apartment?.name || "the apartment"}</strong> has been confirmed.
                    </p>
                    
                    <!-- Booking Details Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 24px;">
                          <h2 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">Booking Details</h2>
                          
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 140px;">🏠 Property:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${booking.apartment?.name || "N/A"}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">📍 Location:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${booking.apartment?.city}, ${booking.apartment?.state}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">📅 Check-in:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">
                                ${booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "N/A"}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">📅 Check-out:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">
                                ${booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "N/A"}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">🌙 Duration:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${nights} ${nights === 1 ? "night" : "nights"}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">👥 Guests:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">
                                ${booking.guests} Guest${booking.guests !== 1 ? "s" : ""}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">💰 Total Amount:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${payment.vendor_currency || "NGN"} ${Number(booking.total_price).toLocaleString()}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    ${
                      booking.special_requests
                        ? `
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ede9fe; border-radius: 8px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 16px;">
                          <h3 style="margin: 0 0 8px; color: #5b21b6; font-size: 14px; font-weight: 600;">📝 Special Requests</h3>
                          <p style="margin: 0; color: #6b21a8; font-size: 14px; line-height: 1.6;">${booking.special_requests}</p>
                        </td>
                      </tr>
                    </table>
                    `
                        : ""
                    }
                    
                    <!-- Important Info -->
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                      <h3 style="margin: 0 0 12px; color: #92400e; font-size: 14px; font-weight: 600;">ℹ️ Important Information</h3>
                      <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.6;">
                        <li>Check-in time is typically 2:00 PM</li>
                        <li>Check-out time is typically 12:00 PM</li>
                        <li>Valid ID required at check-in</li>
                        <li>Contact property for early check-in/late check-out</li>
                      </ul>
                    </div>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 8px 0 24px;">
                          <a href="${baseUrl}/order-successful/${bookingId}?type=apartment" 
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
                      📧 support@bookhushly.com
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
                      You're receiving this email because you made a booking on BookHushly.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
