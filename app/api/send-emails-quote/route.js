import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { to, subject, html, attachments } = await request.json();

    // Convert single email to array if needed
    const recipients = Array.isArray(to) ? to : [to];

    // Prepare email data
    const emailData = {
      from:
        process.env.RESEND_FROM_EMAIL || "BookHushly <noreply@bookhushly.com>",
      to: recipients,
      subject,
      html,
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      // For Resend, attachments need to be in base64 format
      // If you're passing URLs, you'll need to fetch and convert them
      const processedAttachments = await Promise.all(
        attachments.map(async (attachment) => {
          if (attachment.path) {
            // Fetch the file from the URL
            const response = await fetch(attachment.path);
            const buffer = await response.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");

            return {
              filename: attachment.filename,
              content: base64,
            };
          }
          return attachment;
        }),
      );

      emailData.attachments = processedAttachments;
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send email", message: error.message },
      { status: 500 },
    );
  }
}
