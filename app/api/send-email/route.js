// import { Resend } from "resend";
// import { emailTemplates } from "../../../lib/emailTemplate";
// import { NextResponse } from "next/server";
// import validator from "validator";
// import sanitizeHtml from "sanitize-html";
// import { rateLimit } from "next-rate-limit";

// // Initialize rate limiter (e.g., 100 requests per 15 minutes per IP)
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 15 * 60 * 1000,
// });

// // Allowed origins for CORS
// const ALLOWED_ORIGINS = [
//   "https://yourdomain.com",
//   "http://localhost:3000", // For development
// ];

// export async function POST(request) {
//   // Check API key inside handler
//   const apiKey = process.env.RESEND_API_KEY;
//   if (!apiKey) {
//     console.error("RESEND_API_KEY is not defined");
//     return NextResponse.json(
//       { error: "Server configuration error" },
//       { status: 500 }
//     );
//   }

//   const resend = new Resend(apiKey);
//   if (!resend) {
//     console.error("Resend client initialization failed");
//     return NextResponse.json(
//       { error: "Server configuration error" },
//       { status: 500 }
//     );
//   }

//   // Rate limiting
//   try {
//     await limiter(request);
//   } catch (err) {
//     console.error("Rate limit exceeded:", err);
//     return NextResponse.json({ error: "Too many requests" }, { status: 429 });
//   }

//   try {
//     const { to, templateName, data } = await request.json();

//     // Validate input
//     if (!to || !templateName || !data) {
//       return NextResponse.json(
//         { error: "Missing required fields: to, templateName, or data" },
//         { status: 400 }
//       );
//     }

//     // Validate 'to' as email or array of emails
//     const toArray = Array.isArray(to) ? to : [to];
//     if (!toArray.every((email) => validator.isEmail(email))) {
//       return NextResponse.json(
//         { error: "Invalid email address in 'to' field" },
//         { status: 400 }
//       );
//     }

//     // Validate template
//     const template = emailTemplates[templateName];
//     if (!template || !template.subject || !template.template) {
//       return NextResponse.json(
//         { error: "Invalid or misconfigured template" },
//         { status: 400 }
//       );
//     }

//     // Sanitize data to prevent XSS
//     const sanitizedData = Object.fromEntries(
//       Object.entries(data).map(([key, value]) => [
//         key,
//         typeof value === "string" ? sanitizeHtml(value) : value,
//       ])
//     );

//     // Send email with retry logic
//     let attempts = 0;
//     const maxRetries = 3;
//     const retryDelay = 1000;

//     while (attempts < maxRetries) {
//       try {
//         await resend.emails.send({
//           from:
//             process.env.RESEND_FROM_ADDRESS || "Acme <onboarding@resend.dev>",
//           to: toArray,
//           subject: template.subject,
//           html: template.template(sanitizedData),
//         });
//         return NextResponse.json({ success: true });
//       } catch (err) {
//         if (err.statusCode === 429 && attempts < maxRetries - 1) {
//           await new Promise((resolve) => setTimeout(resolve, retryDelay));
//           attempts++;
//           continue;
//         }
//         throw err;
//       }
//     }

//     throw new Error("Max retries exceeded");
//   } catch (err) {
//     console.error("Email sending error:", {
//       message: err.message,
//       statusCode: err.statusCode,
//       requestBody: await request.json().catch(() => "Invalid JSON"),
//     });

//     // Map Resend errors to appropriate responses
//     if (err.statusCode === 429) {
//       return NextResponse.json(
//         { error: "Rate limit exceeded. Please try again later." },
//         { status: 429 }
//       );
//     }
//     if (err.statusCode === 400 || err.statusCode === 422) {
//       return NextResponse.json(
//         { error: "Invalid email parameters" },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { error: "Email sending failed" },
//       { status: 500 }
//     );
//   }
// }

// export async function OPTIONS() {
//   return new NextResponse(null, {
//     headers: {
//       "Access-Control-Allow-Origin": ALLOWED_ORIGINS.join(", "),
//       "Access-Control-Allow-Methods": "POST, OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type",
//     },
//   });
// }
