import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendHotelConfirmationEmail(
  { booking, payment },
  bookingId,
) {
  // Use guest_email (not contact_email)
  const recipientEmail = booking.guest_email;

  // Use check_in_date and check_out_date (not check_in/check_out)
  const checkIn = new Date(booking.check_in_date).toDateString();
  const checkOut = new Date(booking.check_out_date).toDateString();

  // Calculate nights
  const nights = Math.ceil(
    (new Date(booking.check_out_date) - new Date(booking.check_in_date)) /
      (1000 * 60 * 60 * 24),
  );

  const { error } = await resend.emails.send({
    from: "BookHushly <bookings@bookhushly.com>",
    to: recipientEmail,
    subject: `Hotel Booking Confirmed – ${booking.hotel?.name || booking.hotels?.name || "Your Stay"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Your hotel booking is confirmed 🏨</h2>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Hotel:</strong> ${booking.hotel?.name || booking.hotels?.name || "N/A"}</p>
          <p><strong>Room Type:</strong> ${booking.room_type?.name || booking.room_types?.name || "Standard Room"}</p>
          <p><strong>Location:</strong> ${booking.hotel?.city || booking.hotels?.city}, ${booking.hotel?.state || booking.hotels?.state}</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;" />
          
          <p><strong>Check-in:</strong> ${checkIn}</p>
          <p><strong>Check-out:</strong> ${checkOut}</p>
          <p><strong>Duration:</strong> ${nights} night${nights !== 1 ? "s" : ""}</p>
          <p><strong>Guests:</strong> ${booking.adults || 0} Adult${booking.adults !== 1 ? "s" : ""}${booking.children > 0 ? `, ${booking.children} Child${booking.children !== 1 ? "ren" : ""}` : ""}</p>
          
          ${
            booking.special_requests
              ? `
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;" />
            <p><strong>Special Requests:</strong><br/>${booking.special_requests}</p>
          `
              : ""
          }
        </div>

        <div style="background: #7c3aed; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Amount Paid:</strong> ₦${Number(payment.amount).toLocaleString()}</p>
        </div>

        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/order-successful/${bookingId}" 
             style="background: #7c3aed; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            View Your Booking
          </a>
        </div>

        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>Important:</strong><br/>
            • Check-in time is typically 2:00 PM<br/>
            • Check-out time is typically 12:00 PM<br/>
            • Please bring a valid ID for check-in<br/>
            • Contact the hotel directly for early check-in/late check-out
          </p>
        </div>

        <p style="color: #6b7280; font-size: 14px;">We wish you a comfortable stay ✨</p>
        <p style="color: #6b7280; font-size: 14px;">Support: <a href="mailto:support@bookhushly.com" style="color: #7c3aed;">support@bookhushly.com</a></p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Powered by BookHushly<br/>
            This is an automated email, please do not reply.
          </p>
        </div>
      </div>
    `,
  });

  if (error) throw error;

  return Response.json({ success: true });
}

export async function sendApartmentConfirmationEmail(
  { booking, payment },
  bookingId,
) {
  const recipientEmail = booking.contact_email || booking.guest_email;

  const checkIn = new Date(booking.check_in_date).toDateString();
  const checkOut = new Date(booking.check_out_date).toDateString();

  const nights = Math.ceil(
    (new Date(booking.check_out_date) - new Date(booking.check_in_date)) /
      (1000 * 60 * 60 * 24),
  );

  const { error } = await resend.emails.send({
    from: "BookHushly <bookings@bookhushly.com>",
    to: recipientEmail,
    subject: `Apartment Booking Confirmed – ${
      booking.apartment?.name || "Your Apartment"
    }`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Your apartment booking is confirmed 🏡</h2>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Apartment:</strong> ${booking.apartment?.name || "N/A"}</p>
          <p><strong>Location:</strong> ${booking.apartment?.city}, ${booking.apartment?.state}</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;" />
          
          <p><strong>Check-in:</strong> ${checkIn}</p>
          <p><strong>Check-out:</strong> ${checkOut}</p>
          <p><strong>Duration:</strong> ${nights} night${nights !== 1 ? "s" : ""}</p>
          <p><strong>Guests:</strong> ${booking.number_of_guests || booking.guests || 0}</p>
          
          ${
            booking.special_requests
              ? `
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;" />
            <p><strong>Special Requests:</strong><br/>${booking.special_requests}</p>
          `
              : ""
          }
        </div>

        <div style="background: #7c3aed; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Amount Paid:</strong> ₦${Number(payment.amount).toLocaleString()}</p>
        </div>

        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/order-successful/${bookingId}" 
             style="background: #7c3aed; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            View Your Booking
          </a>
        </div>

        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>Important:</strong><br/>
            • Check-in time is typically 2:00 PM<br/>
            • Check-out time is typically 12:00 PM<br/>
            • Please bring a valid ID for check-in
          </p>
        </div>

        <p style="color: #6b7280; font-size: 14px;">Enjoy your stay ✨</p>
        <p style="color: #6b7280; font-size: 14px;">Support: <a href="mailto:support@bookhushly.com" style="color: #7c3aed;">support@bookhushly.com</a></p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Powered by BookHushly<br/>
            This is an automated email, please do not reply.
          </p>
        </div>
      </div>
    `,
  });

  if (error) throw error;

  return Response.json({ success: true });
}
