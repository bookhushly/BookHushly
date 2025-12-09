// lib/sendEmail.js
"use server";

export async function sendServerEmail({ to, templateName, data }) {
  const res = await fetch(
    `${process.env.NEXT_BASE_URL || "http://localhost:3000"}/api/send-email`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, templateName, data }),
    }
  );

  return await res.json();
}
