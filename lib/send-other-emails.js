import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendHotelConfirmationEmail(
  { booking, payment },
  bookingId,
) {
  const recipientEmail = booking.contact_email;

  const checkIn = new Date(booking.check_in).toDateString();
  const checkOut = new Date(booking.check_out).toDateString();

  const { error } = await resend.emails.send({
    from: "BookHushly <bookings@bookhushly.com>",
    to: recipientEmail,
    subject: `Hotel Booking Confirmed – ${booking.listing?.title || "Your Stay"}`,
    html: `
      <h2>Your hotel booking is confirmed 🏨</h2>

      <p><strong>Hotel:</strong> ${booking.listing?.title}</p>
      <p><strong>Check-in:</strong> ${checkIn}</p>
      <p><strong>Check-out:</strong> ${checkOut}</p>
      <p><strong>Guests:</strong> ${booking.guests}</p>

      <p><strong>Amount Paid:</strong> ₦${payment.amount}</p>

      <p>
        View your booking:
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/order-successful/${bookingId}?type=hotel">
          View Booking
        </a>
      </p>

      <p>We wish you a comfortable stay ✨</p>
      <p>Support: support@bookhushly.com</p>
    `,
  });

  if (error) throw error;

  return Response.json({ success: true });
}

export async function sendApartmentConfirmationEmail(
  { booking, payment },
  bookingId,
) {
  const recipientEmail = booking.contact_email;

  const checkIn = new Date(booking.check_in).toDateString();
  const checkOut = new Date(booking.check_out).toDateString();

  const { error } = await resend.emails.send({
    from: "BookHushly <bookings@bookhushly.com>",
    to: recipientEmail,
    subject: `Apartment Booking Confirmed – ${
      booking.listing?.title || "Your Apartment"
    }`,
    html: `
      <h2>Your apartment booking is confirmed 🏡</h2>

      <p><strong>Apartment:</strong> ${booking.listing?.title}</p>
      <p><strong>Check-in:</strong> ${checkIn}</p>
      <p><strong>Check-out:</strong> ${checkOut}</p>
      <p><strong>Guests:</strong> ${booking.guests}</p>

      <p><strong>Amount Paid:</strong> ₦${payment.amount}</p>

      <p>
        View your booking:
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/order-successful/${bookingId}?type=apartment">
          View Booking
        </a>
      </p>

      <p>Enjoy your stay ✨</p>
      <p>Support: support@bookhushly.com</p>
    `,
  });

  if (error) throw error;

  return Response.json({ success: true });
}
