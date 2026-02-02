import { Resend } from "resend";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { generateAllTicketPDFsServer } from "../../../lib/generatePDFServer";
import {
  sendHotelConfirmationEmail,
  sendApartmentConfirmationEmail,
} from "@/lib/send-other-emails";

const resend = new Resend(process.env.RESEND_API_KEY);

/* ---------------------------------------------
   EVENT EMAIL (PDF + STORAGE + SIGNED URL)
--------------------------------------------- */
async function sendEventTicketEmail({ booking, payment }, bookingId) {
  const supabase = await createClient();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const recipientEmail = booking.contact_email;
  const templatePath = path.join(process.cwd(), "public", "ticket.jpg");

  console.log("🎫 Generating ticket PDFs...");

  const ticketPDFs = await generateAllTicketPDFsServer(
    booking,
    baseUrl,
    templatePath,
  );

  console.log(`✅ Generated ${ticketPDFs.length} PDF(s)`);

  const signedUrls = [];

  for (const ticket of ticketPDFs) {
    const filePath = `${bookingId}/${ticket.filename}`;

    // Upload PDF
    const { error: uploadError } = await supabase.storage
      .from("event-tickets")
      .upload(filePath, ticket.content, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Save DB reference
    const { error: dbError } = await supabase
      .from("event_ticket_files")
      .insert({
        booking_id: bookingId,
        ticket_name: ticket.filename,
        file_path: filePath,
      });

    if (dbError) throw dbError;

    // Signed URL (7 days)
    const { data, error: signedError } = await supabase.storage
      .from("event-tickets")
      .createSignedUrl(filePath, 60 * 60 * 24 * 7);

    if (signedError) throw signedError;

    signedUrls.push({
      name: ticket.filename,
      url: data.signedUrl,
    });
  }

  const ticketDetails = JSON.parse(booking.ticket_details || "{}");
  const ticketSummary = Object.entries(ticketDetails)
    .filter(([_, qty]) => qty > 0)
    .map(([name, qty]) => `${qty} × ${name}`)
    .join(", ");

  console.log(`📧 Sending email to ${recipientEmail}`);

  const { error } = await resend.emails.send({
    from: "BookHushly <tickets@bookhushly.com>",
    to: recipientEmail,
    subject: `Your Tickets for ${booking.listing?.title || "Event"}`,
    html: generateEventEmailTemplate(
      booking,
      payment,
      ticketSummary,
      bookingId,
      signedUrls,
    ),
  });

  if (error) throw error;

  return Response.json({ success: true });
}

/* ---------------------------------------------
   EMAIL TEMPLATE
--------------------------------------------- */
function generateEventEmailTemplate(
  booking,
  payment,
  ticketSummary,
  bookingId,
  signedUrls,
) {
  return `
    <h2>Your tickets are ready 🎉</h2>

    <p><strong>Event:</strong> ${booking.listing?.title}</p>
    <p><strong>Tickets:</strong> ${ticketSummary}</p>

    <div style="margin:20px 0">
      ${signedUrls
        .map(
          (t) => `
        <p>
          <a href="${t.url}"
             style="background:#7c3aed;color:#fff;padding:12px 20px;
                    border-radius:8px;text-decoration:none;display:inline-block">
            Download ${t.name}
          </a>
        </p>
      `,
        )
        .join("")}
    </div>

    <p>
      View your booking:
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/order-successful/${bookingId}?type=event">
        View Booking
      </a>
    </p>

    <p>Need help? support@bookhushly.com</p>
  `;
}

/* ---------------------------------------------
   API ROUTE
--------------------------------------------- */
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { bookingId, bookingType } = await request.json();

    if (!bookingId || !bookingType) {
      return Response.json(
        { success: false, error: "Booking ID and type are required" },
        { status: 400 },
      );
    }

    let booking;
    let payment;

    /* ---------------------------------
       EVENT BOOKING
    --------------------------------- */
    if (bookingType === "event") {
      const { data: eventBooking, error } = await supabase
        .from("event_bookings")
        .select(
          `
          *,
          listing:listing_id (
            id,
            title,
            location,
            event_date,
            event_time,
            vendors:vendor_id (
              business_name,
              phone_number
            )
          )
        `,
        )
        .eq("id", bookingId)
        .single();

      if (error || !eventBooking) {
        return Response.json(
          { success: false, error: "Event booking not found" },
          { status: 404 },
        );
      }

      const { data: eventPayment } = await supabase
        .from("payments")
        .select("*")
        .eq("event_booking_id", bookingId)
        .single();

      booking = eventBooking;
      payment = eventPayment;
    }

    /* ---------------------------------
       HOTEL BOOKING
    --------------------------------- */
    if (bookingType === "hotel") {
      const { data: hotelBooking, error } = await supabase
        .from("hotel_bookings")
        .select(
          `
          *,
          hotel:hotel_id (
            id,
            name,
            city,
            state
          ),
          room_type:room_type_id (
            name
          ),
          room:room_id (
            room_number
          )
        `,
        )
        .eq("id", bookingId)
        .single();

      if (error || !hotelBooking) {
        return Response.json(
          { success: false, error: "Hotel booking not found" },
          { status: 404 },
        );
      }

      const { data: hotelPayment } = await supabase
        .from("payments")
        .select("*")
        .eq("hotel_booking_id", bookingId)
        .single();

      booking = hotelBooking;
      payment = hotelPayment;
    }

    /* ---------------------------------
       APARTMENT BOOKING
    --------------------------------- */
    if (bookingType === "apartment") {
      const { data: apartmentBooking, error } = await supabase
        .from("apartment_bookings")
        .select(
          `
          *,
          apartment:apartment_id (
            id,
            name,
            city,
            state
          )
        `,
        )
        .eq("id", bookingId)
        .single();

      if (error || !apartmentBooking) {
        return Response.json(
          { success: false, error: "Apartment booking not found" },
          { status: 404 },
        );
      }

      const { data: apartmentPayment } = await supabase
        .from("payments")
        .select("*")
        .eq("apartment_booking_id", bookingId)
        .single();

      booking = apartmentBooking;
      payment = apartmentPayment;
    }

    if (!booking || !payment) {
      return Response.json(
        { success: false, error: "Booking or payment not found" },
        { status: 404 },
      );
    }

    const payload = { booking, payment };

    /* ---------------------------------
       ROUTING
    --------------------------------- */
    if (bookingType === "event") {
      return sendEventTicketEmail(payload, bookingId);
    }

    if (bookingType === "hotel") {
      return sendHotelConfirmationEmail(payload, bookingId);
    }

    if (bookingType === "apartment") {
      return sendApartmentConfirmationEmail(payload, bookingId);
    }

    return Response.json(
      { success: false, error: "Unsupported booking type" },
      { status: 400 },
    );
  } catch (error) {
    console.error("❌ Email sending error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
