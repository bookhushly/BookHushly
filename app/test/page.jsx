"use client";
import { useState } from "react";

export default function MyComponent() {
  const [status, setStatus] = useState("");

  const sendEmails = async () => {
    try {
      const emailData = [
        {
          to: "aboderindaniel482@gmail.com",
          templateName: "purchaseConfirmation",
          data: { name: "Daniel", orderId: "12345", amount: "29.99" },
        },
        {
          to: "dnlcodes4@gmail.com",
          templateName: "welcomeEmail",
          data: { name: "DnlCodes" },
        },
      ];

      const responses = await Promise.all(
        emailData.map(async (email) => {
          const response = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(email),
          });
          return response.json();
        })
      );

      const allSuccess = responses.every((res) => res.success);
      setStatus(
        allSuccess ? "Emails sent successfully!" : "Some emails failed"
      );
    } catch (error) {
      console.error("Error:", error);
      setStatus("Failed to send emails");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <button onClick={sendEmails}>Send Emails to Customers</button>
      <p>{status}</p>
    </div>
  );
}
