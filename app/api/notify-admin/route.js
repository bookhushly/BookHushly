// /app/api/notify-admin/route.js

import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email"; // make sure this only uses SendGrid server-side

export async function POST(req) {
  try {
    const vendorData = await req.json();

    await sendEmail(
      "aboderindaniel482@gmail.com",
      "vendorSubmitted",
      vendorData
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to notify admin:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
