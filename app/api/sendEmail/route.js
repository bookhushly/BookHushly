import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Configure the transporter with your Namecheap SMTP
  const transporter = nodemailer.createTransport({
    host: "smtp.privateemail.com", // Corrected host
    port: 465,
    secure: true, // Use SSL
    auth: {
      user: "help@bookhushly.com", // Your email
      pass: "bookhush1234", // Your email password
    },
  });

  try {
    // Example: List of recipients and messages
    const recipients = [
      {
        email: "aboderindaniel482@gmail.com",
        message: "Thanks for your purchase!",
      },
      { email: "dnlcodes4@gmail.com", message: "Welcome to BookHushly!" },
    ];

    // Send emails to all recipients
    const emailPromises = recipients.map((recipient) =>
      transporter.sendMail({
        from: "help@bookhushly.com", // Match the auth user for testing
        to: recipient.email,
        subject: "Action Completed!",
        text: `Hi, ${recipient.message} Your order/details are being processed.`,
      })
    );

    // Wait for all emails to send
    await Promise.all(emailPromises);

    res.status(200).json({ message: "Emails sent successfully!" });
  } catch (error) {
    console.error("Error sending emails:", error);
    res
      .status(500)
      .json({ message: "Failed to send emails", error: error.message });
  }
}
