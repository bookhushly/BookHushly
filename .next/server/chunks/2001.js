"use strict";exports.id=2001,exports.ids=[2001],exports.modules={52001:(e,i,o)=>{o.d(i,{Cz:()=>a});var t=o(26958);let r=new t.R("re_RCwc9zvd_om6aY9catATrx2tzBnTcr2Tr"),n={bookingConfirmation:{subject:"Booking Confirmation - Bookhushly",template:e=>`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <h2>Hello ${e.customerName},</h2>
          <p>Your booking has been confirmed! Here are the details:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3b82f6; margin-top: 0;">${e.serviceTitle}</h3>
            <p><strong>Vendor:</strong> ${e.vendorName}</p>
            <p><strong>Date:</strong> ${e.bookingDate}</p>
            <p><strong>Time:</strong> ${e.bookingTime}</p>
            <p><strong>Guests:</strong> ${e.guests}</p>
            <p><strong>Total Amount:</strong> ₦${e.totalAmount}</p>
            <p><strong>Booking Reference:</strong> ${e.bookingId}</p>
          </div>
          
          <p>The vendor will contact you shortly to finalize the arrangements.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${e.dashboardUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Booking Details</a>
          </div>
          
          <p>Thank you for choosing Bookhushly!</p>
          <p>Best regards,<br>The Bookhushly Team</p>
        </div>
        <div style="background: #374151; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>\xa9 2025 Bookhushly. All rights reserved.</p>
          <p>Made with ❤️ for Africa</p>
        </div>
      </div>
    `},kycSubmissionNotice:{subject:"New KYC Submission - Bookhushly Vendor",template:e=>`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #facc15; padding: 20px; text-align: center;">
        <h1 style="color: black; margin: 0;">New KYC Submission</h1>
      </div>
      <div style="padding: 20px; background: #f9fafb;">
        <p>A new vendor has submitted KYC details and is awaiting verification:</p>

        <ul style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <li><strong>Name:</strong> ${e.vendorName}</li>
          <li><strong>Email:</strong> ${e.email}</li>
          <li><strong>Phone:</strong> ${e.phone}</li>
          <li><strong>Business:</strong> ${e.businessName}</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${e.dashboardUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Review KYC</a>
        </div>

        <p>Bookhushly Admin Notification</p>
      </div>
      <div style="background: #374151; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p>\xa9 2025 Bookhushly. All rights reserved.</p>
      </div>
    </div>
  `},kycApproval:{subject:"KYC Approved - Welcome to Bookhushly!",template:e=>`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">KYC Approved! 🎉</h1>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <h2>Congratulations ${e.vendorName}!</h2>
          <p>Your KYC verification has been approved. You can now:</p>
          
          <ul style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <li>✅ Create service listings</li>
            <li>✅ Accept customer bookings</li>
            <li>✅ Receive payments</li>
            <li>✅ Build your reputation</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${e.dashboardUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Start Creating Listings</a>
          </div>
          
          <p>Welcome to the Bookhushly family!</p>
          <p>Best regards,<br>The Bookhushly Team</p>
        </div>
        <div style="background: #374151; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>\xa9 2025 Bookhushly. All rights reserved.</p>
        </div>
      </div>
    `},kycRejection:{subject:"KYC Review Required - Bookhushly",template:e=>`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444, #f97316); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">KYC Review Required</h1>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <h2>Hello ${e.vendorName},</h2>
          <p>We've reviewed your KYC submission and need some additional information:</p>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <p><strong>Reason:</strong> ${e.reason||"Please review and resubmit your documents with correct information."}</p>
          </div>
          
          <p>Please update your information and resubmit for review.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${e.kycUrl}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Update KYC Information</a>
          </div>
          
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The Bookhushly Team</p>
        </div>
        <div style="background: #374151; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>\xa9 2025 Bookhushly. All rights reserved.</p>
        </div>
      </div>
    `},passwordReset:{subject:"Reset Your Password - Bookhushly",template:e=>`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Reset Your Password</h1>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <h2>Hello ${e.userName},</h2>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${e.resetUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">This link will expire in 24 hours. If you didn't request this, please ignore this email.</p>
          
          <p>Best regards,<br>The Bookhushly Team</p>
        </div>
        <div style="background: #374151; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>\xa9 2025 Bookhushly. All rights reserved.</p>
        </div>
      </div>
    `},paymentConfirmation:{subject:"Payment Successful - Bookhushly",template:e=>`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Payment Successful! ✅</h1>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <h2>Hello ${e.customerName},</h2>
          <p>Your payment has been processed successfully!</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #10b981; margin-top: 0;">Payment Details</h3>
            <p><strong>Service:</strong> ${e.serviceTitle}</p>
            <p><strong>Amount Paid:</strong> ₦${e.amount}</p>
            <p><strong>Payment Reference:</strong> ${e.reference}</p>
            <p><strong>Payment Method:</strong> ${e.provider}</p>
            <p><strong>Date:</strong> ${e.paymentDate}</p>
          </div>
          
          <p>Your booking is now confirmed and the vendor has been notified.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${e.bookingUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Booking</a>
          </div>
          
          <p>Thank you for choosing Bookhushly!</p>
          <p>Best regards,<br>The Bookhushly Team</p>
        </div>
        <div style="background: #374151; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>\xa9 2025 Bookhushly. All rights reserved.</p>
        </div>
      </div>
    `}},a=async(e,i,o)=>{try{let t=n[i];if(!t)throw Error(`Email template '${i}' not found`);let a={to:e,from:"aboderindaniel482@gmail.com",subject:t.subject,html:t.template(o)};return await r.emails.send(a),console.log(`Email sent successfully to ${e}`),{success:!0}}catch(e){return console.error("Email send error:",e),{success:!1,error:e.message}}}}};