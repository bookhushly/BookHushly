import { Resend } from "resend";
import { NextResponse } from "next/server";
import { emailTemplates } from "@/lib/templates";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, templateName, data, subject, html, attachments } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Recipient email is required" },
        { status: 400 },
      );
    }

    let emailSubject;
    let emailHtml;

    // Check if custom HTML and subject provided (for React Email templates)
    if (html && subject) {
      emailSubject = subject;
      emailHtml = html;
    }
    // Otherwise use template system
    else if (templateName && data) {
      const template = emailTemplates[templateName];
      if (!template) {
        return NextResponse.json(
          { error: `Template '${templateName}' not found` },
          { status: 400 },
        );
      }
      emailSubject = template.subject;
      emailHtml = template.template(data);
    } else {
      return NextResponse.json(
        { error: "Either provide (html + subject) or (templateName + data)" },
        { status: 400 },
      );
    }

    // Prepare email payload
    const emailPayload = {
      from: FROM_EMAIL,
      to,
      subject: emailSubject,
      html: emailHtml,
    };

    // Add attachments if provided
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      emailPayload.attachments = attachments;
    }

    const result = await resend.emails.send(emailPayload);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 },
    );
  }
}
