import { Resend } from "resend";
import { emailTemplates } from "../../../lib/emailTemplate";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  throw new Error("RESEND_API_KEY is not defined in environment variables.");
}
const resend = new Resend(apiKey);
if (!resend) {
  throw new Error("Resend client not initialized. Check your API key.");
}

export async function POST(request) {
  try {
    const { to, templateName, data } = await request.json();

    const template = emailTemplates[templateName];
    if (!template) {
      return NextResponse.json(
        { error: "Invalid template name" },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to,
      subject: template.subject,
      html: template.template(data),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email sending error:", err);
    return NextResponse.json(
      { error: "Email sending failed" },
      { status: 500 }
    );
  }
}
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
