import { Resend } from "resend";
import path from "path";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAllTicketPDFsServer } from "../../../lib/generatePDFServer";
import {
  sendHotelConfirmationEmail,
  sendApartmentConfirmationEmail,
} from "@/lib/send-other-emails";

const resend = new Resend(process.env.RESEND_API_KEY);

/* ---------------------------------------------
   RETRY HELPER
   Retries an async fn up to `attempts` times
   with exponential backoff. Throws the last error
   if all attempts fail.
--------------------------------------------- */
async function withRetry(fn, attempts = 3, baseDelay = 1000) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}

/* ---------------------------------------------
   IDEMPOTENCY GUARD
   Checks whether an email has already been sent
   for this booking. Returns the existing record
   if one exists, null otherwise.
--------------------------------------------- */
async function getExistingEmailRecord(supabase, bookingId, bookingType) {
  const { data } = await supabase
    .from("email_logs")
    .select("*")
    .eq("booking_id", bookingId)
    .eq("booking_type", bookingType)
    .eq("status", "sent")
    .single();
  return data || null;
}

/* ---------------------------------------------
   LOG EMAIL ATTEMPT
   Writes a row to email_logs before sending.
   Status starts as "pending", gets updated to
   "sent" or "failed" after the attempt resolves.
--------------------------------------------- */
async function createEmailLog(supabase, bookingId, bookingType) {
  const { data, error } = await supabase
    .from("email_logs")
    .insert({
      booking_id: bookingId,
      booking_type: bookingType,
      status: "pending",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateEmailLog(supabase, logId, status, error = null) {
  await supabase
    .from("email_logs")
    .update({
      status,
      error_message: error,
      updated_at: new Date().toISOString(),
    })
    .eq("id", logId);
}

/* ---------------------------------------------
   EVENT EMAIL (PDF + STORAGE + SIGNED URL)
--------------------------------------------- */
async function sendEventTicketEmail({ booking, payment }, bookingId) {
  const supabase = await createAdminClient();
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

  // Upload all PDFs and collect signed URLs.
  // Each upload is individually retried — a failure on one
  // doesn't orphan the ones that already succeeded.
  const signedUrls = [];

  for (const ticket of ticketPDFs) {
    const filePath = `${bookingId}/${ticket.filename}`;

    // Retry the upload itself — transient storage errors are common
    await withRetry(async () => {
      const { error: uploadError } = await supabase.storage
        .from("event-tickets")
        .upload(filePath, ticket.content, {
          contentType: "application/pdf",
          upsert: true, // upsert means re-running this is safe
        });

      if (uploadError) throw uploadError;
    });

    // DB reference — upsert so re-runs don't duplicate rows
    const { error: dbError } = await supabase.from("event_ticket_files").upsert(
      {
        booking_id: bookingId,
        ticket_name: ticket.filename,
        file_path: filePath,
      },
      { onConflict: "booking_id, ticket_name" },
    );

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

  // Retry the Resend call — transient API failures are the most
  // common reason emails don't go out
  const { error } = await withRetry(() =>
    resend.emails.send({
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
    }),
  );

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
  const supabase = await createAdminClient();
  let emailLog = null;

  try {
    const { bookingId, bookingType } = await request.json();

    if (!bookingId || !bookingType) {
      return Response.json(
        { success: false, error: "Booking ID and type are required" },
        { status: 400 },
      );
    }

    // --- Idempotency check ---
    // If we already successfully sent an email for this booking, bail out.
    // This is what prevents duplicate emails on retries or double-calls.
    const existing = await getExistingEmailRecord(
      supabase,
      bookingId,
      bookingType,
    );
    if (existing) {
      console.log(
        `⏭️  Email already sent for ${bookingType} booking ${bookingId}, skipping`,
      );
      return Response.json({
        success: true,
        message: "Email already sent",
        alreadySent: true,
      });
    }

    // --- Create a pending log row before doing anything ---
    // If the route crashes mid-way, this row stays as "pending"
    // so you can identify bookings that need a retry.
    emailLog = await createEmailLog(supabase, bookingId, bookingType);

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
      if (emailLog) {
        await updateEmailLog(
          supabase,
          emailLog.id,
          "failed",
          "Booking or payment not found",
        );
      }
      return Response.json(
        { success: false, error: "Booking or payment not found" },
        { status: 404 },
      );
    }

    const payload = { booking, payment };

    /* ---------------------------------
       ROUTING
    --------------------------------- */
    let result;

    if (bookingType === "event") {
      result = await sendEventTicketEmail(payload, bookingId);
    } else if (bookingType === "hotel") {
      result = await sendHotelConfirmationEmail(payload, bookingId);
    } else if (bookingType === "apartment") {
      result = await sendApartmentConfirmationEmail(payload, bookingId);
    } else {
      if (emailLog) {
        await updateEmailLog(
          supabase,
          emailLog.id,
          "failed",
          "Unsupported booking type",
        );
      }
      return Response.json(
        { success: false, error: "Unsupported booking type" },
        { status: 400 },
      );
    }

    // Mark the log as sent — this is what the idempotency check
    // looks for on subsequent calls
    if (emailLog) {
      await updateEmailLog(supabase, emailLog.id, "sent");
    }

    return result;
  } catch (error) {
    console.error("❌ Email sending error:", error);

    // Mark the log as failed so you know which bookings need a retry
    if (emailLog) {
      try {
        await updateEmailLog(supabase, emailLog.id, "failed", error.message);
      } catch {
        // Don't let the log update failure mask the original error
      }
    }

    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
