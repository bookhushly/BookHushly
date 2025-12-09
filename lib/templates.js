export const emailTemplates = {
  bookingConfirmation: {
    subject: "Booking Confirmation - Bookhushly",
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <h2>Hello ${data.customerName},</h2>
          <p>Your booking has been confirmed! Here are the details:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3b82f6; margin-top: 0;">${data.serviceTitle}</h3>
            <p><strong>Vendor:</strong> ${data.vendorName}</p>
            <p><strong>Date:</strong> ${data.bookingDate}</p>
            <p><strong>Time:</strong> ${data.bookingTime}</p>
            <p><strong>Guests:</strong> ${data.guests}</p>
            <p><strong>Total Amount:</strong> ₦${data.totalAmount}</p>
            <p><strong>Booking Reference:</strong> ${data.bookingId}</p>
          </div>
          
          <p>The vendor will contact you shortly to finalize the arrangements.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboardUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Booking Details</a>
          </div>
          
          <p>Thank you for choosing Bookhushly!</p>
          <p>Best regards,<br>The Bookhushly Team</p>
        </div>
        <div style="background: #374151; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© 2025 Bookhushly. All rights reserved.</p>
          <p>Made with ❤️ for Africa</p>
        </div>
      </div>
    `,
  },
  contactForm: {
    subject: "New Contact Form Submission",
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h1>New Message from ${data.name}</h1>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Message:</strong></p>
        <div style="border: 1px solid #ccc; padding: 15px;">
          ${data.message}
        </div>
      </div>
    `,
  },
  kycSubmissionNotice: {
    subject: "New KYC Submission - Bookhushly Vendor",
    template: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #facc15; padding: 20px; text-align: center;">
        <h1 style="color: black; margin: 0;">New KYC Submission</h1>
      </div>
      <div style="padding: 20px; background: #f9fafb;">
        <p>A new vendor has submitted KYC details and is awaiting verification:</p>

        <ul style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <li><strong>Name:</strong> ${data.vendorName}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Phone:</strong> ${data.phone}</li>
          <li><strong>Business:</strong> ${data.businessName}</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.dashboardUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Review KYC</a>
        </div>

        <p>Bookhushly Admin Notification</p>
      </div>
      <div style="background: #374151; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p>© 2025 Bookhushly. All rights reserved.</p>
      </div>
    </div>
  `,
  },
  kycApproval: {
    subject: "KYC Approved - Welcome to Bookhushly!",
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">KYC Approved! 🎉</h1>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <h2>Congratulations ${data.vendorName}!</h2>
          <p>Your KYC verification has been approved. You can now:</p>
          
          <ul style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <li>✅ Create service listings</li>
            <li>✅ Accept customer bookings</li>
            <li>✅ Receive payments</li>
            <li>✅ Build your reputation</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboardUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Start Creating Listings</a>
          </div>
          
          <p>Welcome to the Bookhushly family!</p>
          <p>Best regards,<br>The Bookhushly Team</p>
        </div>
        <div style="background: #374151; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© 2025 Bookhushly. All rights reserved.</p>
        </div>
      </div>
    `,
  },

  kycRejection: {
    subject: "KYC Review Required - Bookhushly",
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444, #f97316); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">KYC Review Required</h1>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <h2>Hello ${data.vendorName},</h2>
          <p>We've reviewed your KYC submission and need some additional information:</p>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <p><strong>Reason:</strong> ${data.reason || "Please review and resubmit your documents with correct information."}</p>
          </div>
          
          <p>Please update your information and resubmit for review.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.kycUrl}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Update KYC Information</a>
          </div>
          
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The Bookhushly Team</p>
        </div>
        <div style="background: #374151; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© 2025 Bookhushly. All rights reserved.</p>
        </div>
      </div>
    `,
  },

  passwordReset: {
    subject: "Reset Your Password - Bookhushly",
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Reset Your Password</h1>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <h2>Hello ${data.userName},</h2>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">This link will expire in 24 hours. If you didn't request this, please ignore this email.</p>
          
          <p>Best regards,<br>The Bookhushly Team</p>
        </div>
        <div style="background: #374151; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© 2025 Bookhushly. All rights reserved.</p>
        </div>
      </div>
    `,
  },
  paymentConfirmation: {
    subject: "Payment Successful - Your BookHushly Tickets Are Here!",
    template: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Payment Successful!</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Hello${data.customerName ? ` ${data.customerName}` : ""},</h2>
        <p>Your payment has been processed successfully!</p>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #86efac;">
          <h3 style="color: #166534; margin: 0 0 15px 0;">Ticket Details</h3>
          <p><strong>Event:</strong> ${data.serviceTitle}</p>
          <p><strong>Tickets:</strong> ${data.ticketSummary || "See attached"}</p>
          <p><strong>Date:</strong> ${data.eventDate}</p>
          <p><strong>Time:</strong> ${data.eventTime}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Amount Paid:</strong> ₦${data.amount}</p>
          <p><strong>Reference:</strong> ${data.reference}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.bookingUrl}" style="background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Tickets Online
          </a>
        </div>

        <p>Your tickets are also attached as PDF or available for download from the site.</p>
        <p>Thank you for choosing BookHushly!</p>
      </div>
    </div>
  `,
  },
};
