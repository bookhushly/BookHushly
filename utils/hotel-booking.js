import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function sendBookingConfirmationEmail(booking, hotel, roomType) {
  const checkInDate = new Date(booking.check_in_date).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  const checkOutDate = new Date(booking.check_out_date).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  const nights = Math.ceil(
    (new Date(booking.check_out_date) - new Date(booking.check_in_date)) /
      (1000 * 60 * 60 * 24)
  );

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your reservation has been successfully confirmed</p>
        </div>
        
        <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #7c3aed; margin: 0 0 15px 0; font-size: 20px;">Reservation Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking ID:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">#${booking.id.slice(0, 8).toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Guest Name:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${booking.guest_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Hotel:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${hotel.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Room Type:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${roomType.name}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">Stay Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Check-in:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${checkInDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Check-out:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${checkOutDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Duration:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${nights} night${nights !== 1 ? "s" : ""}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Guests:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">
                  ${booking.adults} Adult${booking.adults !== 1 ? "s" : ""}${
                    booking.children > 0
                      ? `, ${booking.children} Child${booking.children !== 1 ? "ren" : ""}`
                      : ""
                  }
                </td>
              </tr>
            </table>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #166534; font-size: 16px; font-weight: 600;">Total Amount Paid:</td>
                <td style="padding: 8px 0; text-align: right; font-size: 20px; font-weight: 700; color: #166534;">
                  ₦${parseFloat(booking.total_price).toLocaleString()}
                </td>
              </tr>
            </table>
          </div>

          ${
            booking.special_requests
              ? `
          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 14px;">Special Requests:</h4>
            <p style="color: #78350f; margin: 0; font-size: 14px;">${booking.special_requests}</p>
          </div>
          `
              : ""
          }

          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <h4 style="color: #1e40af; margin: 0 0 8px 0; font-size: 14px;">Important Information:</h4>
            <ul style="color: #1e3a8a; margin: 0; padding-left: 20px; font-size: 13px;">
              <li>Please arrive at the hotel between 2:00 PM and 11:59 PM on your check-in date</li>
              <li>Valid ID is required at check-in</li>
              <li>Check-out time is 12:00 PM</li>
              ${hotel.checkout_policy ? `<li>${hotel.checkout_policy}</li>` : ""}
            </ul>
          </div>

          ${
            hotel.address
              ? `
          <div style="margin-bottom: 20px;">
            <h4 style="color: #1f2937; margin: 0 0 8px 0; font-size: 14px;">Hotel Address:</h4>
            <p style="color: #4b5563; margin: 0; font-size: 14px;">${hotel.address}, ${hotel.city}, ${hotel.state}</p>
          </div>
          `
              : ""
          }

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px 0;">
              Need help? Contact us at support@bookhushly.com
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} BookHushly. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "BookHushly <bookings@bookhushly.com>",
      to: [booking.guest_email],
      subject: `Booking Confirmed - ${hotel.name}`,
      html: emailHtml,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to send email:", error);
    throw new Error(`Failed to send email: ${error}`);
  }

  return await response.json();
}

async function verifyPaystackPayment(reference) {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to verify payment");
  }

  const data = await response.json();
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Webhook received:", body);

    // Paystack webhook
    if (body.event === "charge.success") {
      const { reference, metadata } = body.data;

      // Verify payment
      const paymentVerification = await verifyPaystackPayment(reference);

      if (paymentVerification.data.status !== "success") {
        throw new Error("Payment verification failed");
      }

      const bookingId = metadata?.hotel_booking_id;

      if (!bookingId) {
        throw new Error("No booking ID in metadata");
      }

      // Update booking
      const { data: booking, error: bookingError } = await supabase
        .from("hotel_bookings")
        .update({
          payment_status: "paid",
          booking_status: "confirmed",
        })
        .eq("id", bookingId)
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Get hotel and room type details
      const { data: hotel } = await supabase
        .from("hotels")
        .select("*")
        .eq("id", booking.hotel_id)
        .single();

      const { data: roomType } = await supabase
        .from("hotel_room_types")
        .select("*")
        .eq("id", booking.room_type_id)
        .single();

      // Update room status to reserved
      await supabase
        .from("hotel_rooms")
        .update({ status: "reserved" })
        .eq("id", booking.room_id);

      // Send confirmation email
      await sendBookingConfirmationEmail(booking, hotel, roomType);

      return new Response(
        JSON.stringify({ success: true, message: "Booking confirmed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // NOWPayments webhook
    if (body.payment_status === "finished") {
      const bookingId = body.order_description?.match(/HOTEL_([^_]+)/)?.[1];

      if (!bookingId) {
        throw new Error("No booking ID found");
      }

      const { data: booking, error: bookingError } = await supabase
        .from("hotel_bookings")
        .update({
          payment_status: "paid",
          booking_status: "confirmed",
        })
        .eq("id", bookingId)
        .select()
        .single();

      if (bookingError) throw bookingError;

      const { data: hotel } = await supabase
        .from("hotels")
        .select("*")
        .eq("id", booking.hotel_id)
        .single();

      const { data: roomType } = await supabase
        .from("hotel_room_types")
        .select("*")
        .eq("id", booking.room_type_id)
        .single();

      await supabase
        .from("hotel_rooms")
        .update({ status: "reserved" })
        .eq("id", booking.room_id);

      await sendBookingConfirmationEmail(booking, hotel, roomType);

      return new Response(
        JSON.stringify({ success: true, message: "Booking confirmed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Webhook received but not processed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
