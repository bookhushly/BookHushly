import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { to, bookingDetails } = await req.json();

    await resend.emails.send({
      from: process.env.RESEND_SENDER_EMAIL, // e.g. "noreply@yourdomain.com"
      to,
      subject: "Payment Confirmation",
      html: `
        <h2>Hello ${bookingDetails.customerName}</h2>
        <p>Thanks for your payment for <strong>${bookingDetails.serviceTitle}</strong>.</p>
        <p>Amount: <strong>₦${bookingDetails.amount}</strong></p>
        <p>Ref: <strong>${bookingDetails.reference}</strong></p>
        <p><a href="${bookingDetails.bookingUrl}">View your booking</a></p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[RESEND ERROR]", err);
    return NextResponse.json(
      { error: "Email sending failed" },
      { status: 500 }
    );
  }
}
