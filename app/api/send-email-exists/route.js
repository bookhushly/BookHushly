import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, subject, html, from, replyTo } = body;

    // Validation
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html" },
        { status: 400 },
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    // Send email
    const data = await resend.emails.send({
      from: from || "BookHushly <noreply@bookhushly.com>",
      to: [to],
      subject: subject,
      html: html,
      replyTo: replyTo || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        messageId: data.id,
        message: "Email sent successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Email sending error:", error);

    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
