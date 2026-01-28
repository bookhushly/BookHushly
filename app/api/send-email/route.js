// app/api/send-email/route.js
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { emailTemplates } from "../../../lib/templates";

const resend = new Resend(process.env.RESEND_API_KEY); // Secure: server-only

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

export async function POST(request) {
  try {
    const { to, templateName, data } = await request.json();

    if (!to || !templateName || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const template = emailTemplates[templateName];
    if (!template) {
      return NextResponse.json(
        { error: `Template '${templateName}' not found` },
        { status: 400 },
      );
    }

    const html = template.template(data);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: template.subject,
      html,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 },
    );
  }
}
