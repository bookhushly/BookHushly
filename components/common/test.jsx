// import nodemailer from "nodemailer";

// const businessCategories = [
//   { value: "hotels", label: "Hotels" },
//   { value: "food_restaurants", label: "Food & Restaurants" },
//   { value: "serviced_apartments", label: "Serviced Apartments" },
//   { value: "events", label: "Events" },
//   { value: "car_rentals", label: "Car Rentals" },
//   { value: "logistics", label: "Logistics" },
//   { value: "security", label: "Security" },
// ];

// const templates = {
//   kycSubmissionNotice: {
//     subject: "New Vendor KYC Submission - Bookhushly",
//     template: (data) => `
//       <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
//         <div style="background: #facc15; padding: 16px; text-align: center;">
//           <h1 style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 600;">New Vendor KYC Submission</h1>
//         </div>
//         <div style="padding: 16px; background: #f9fafb;">
//           <p style="color: #4b5563; font-size: 16px; margin: 0 0 16px;">A vendor has submitted KYC details to join Bookhushly and is awaiting your review:</p>
//           <ul style="background: #ffffff; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; margin: 0 0 16px; list-style: none;">
//             <li style="color: #1f2937; font-size: 14px; margin-bottom: 8px;"><strong>Vendor Name:</strong> ${data.vendorName}</li>
//             <li style="color: #1f2937; font-size: 14px; margin-bottom: 8px;"><strong>Business Name:</strong> ${data.businessName}</li>
//             <li style="color: #1f2937; font-size: 14px; margin-bottom: 8px;"><strong>Email:</strong> ${data.email}</li>
//             <li style="color: #1f2937; font-size: 14px; margin-bottom: 8px;"><strong>Phone:</strong> ${data.phone}</li>
//             <li style="color: #1f2937; font-size: 14px; margin-bottom: 8px;"><strong>Category:</strong> ${
//               businessCategories.find(
//                 (cat) => cat.value === data.businessCategory
//               )?.label || "Not provided"
//             }</li>
//           </ul>
//           <div style="text-align: center; margin: 24px 0;">
//             <a href="${data.dashboardUrl}" style="background: linear-gradient(to right, #3b82f6, #7c3aed); color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; display: inline-block; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">Review Vendor KYC</a>
//           </div>
//           <p style="color: #4b5563; font-size: 14px; text-align: center;">Bookhushly Admin Notification</p>
//         </div>
//         <div style="background: #1f2937; color: #d1d5db; padding: 12px; text-align: center; font-size: 12px;">
//           <p>&copy; ${new Date().getFullYear()} Bookhushly. All rights reserved.</p>
//         </div>
//       </div>
//     `,
//   },
// };

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res
//       .status(405)
//       .json({ success: false, error: "Method not allowed" });
//   }

//   const { to, templateName, data } = req.body;

//   if (!to || !templateName || !templates[templateName]) {
//     return res
//       .status(400)
//       .json({ success: false, error: "Invalid request data" });
//   }

//   // Create Nodemailer transporter for Namecheap Private Email
//   const transporter = nodemailer.createTransport({
//     host: "mail.privateemail.com",
//     port: 587, // Use 587 with TLS for better compatibility
//     secure: false, // TLS requires secure: false with port 587
//     auth: {
//       user: process.env.NAMECHEAP_EMAIL, // e.g., noreply@bookhushly.com
//       pass: process.env.NAMECHEAP_PASSWORD,
//     },
//     tls: {
//       ciphers: "SSLv3", // Optional: Ensure compatibility with Namecheap’s servers
//     },
//   });

//   try {
//     await transporter.sendMail({
//       from: `"Bookhushly Admin" <${process.env.NAMECHEAP_EMAIL}>`,
//       to,
//       subject: templates[templateName].subject,
//       html: templates[templateName].template(data),
//     });
//     return res.status(200).json({ success: true });
//   } catch (error) {
//     console.error("Email sending error:", error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// }
