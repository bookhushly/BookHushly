/**
 * lib/notifications.js
 * Server-side notification service.
 * Uses the admin client so inserts bypass RLS — call from API routes only.
 */

import { createAdminClient } from "@/lib/supabase/admin";

// ─── Notification type constants ────────────────────────────────────────────

export const NOTIFICATION_TYPES = {
  // Customer
  BOOKING_CONFIRMED:   "booking_confirmed",
  BOOKING_CANCELLED:   "booking_cancelled",
  BOOKING_PENDING:     "booking_pending",
  BOOKING_UPDATED:     "booking_updated",
  PAYMENT_SUCCESSFUL:  "payment_successful",
  PAYMENT_FAILED:      "payment_failed",
  WALLET_DEPOSIT:      "wallet_deposit",
  WALLET_WITHDRAWAL:   "wallet_withdrawal",
  PASSWORD_CHANGED:    "password_changed",
  REVIEW_REQUEST:      "review_request",
  // Vendor
  NEW_BOOKING:         "new_booking",
  PAYMENT_RECEIVED:    "payment_received",
  LISTING_APPROVED:    "listing_approved",
  LISTING_REJECTED:    "listing_rejected",
  KYC_APPROVED:        "kyc_approved",
  KYC_REJECTED:        "kyc_rejected",
  NEW_REVIEW:          "new_review",
  PAYOUT_PROCESSED:    "payout_processed",
  // Admin
  NEW_VENDOR:          "new_vendor",
  KYC_SUBMITTED:       "kyc_submitted",
  PAYMENT_ISSUE:       "payment_issue",
  NEW_LOGISTICS:       "new_logistics_request",
  NEW_SECURITY:        "new_security_request",
  // Shared
  SYSTEM:              "system",
};

// ─── Core send function ──────────────────────────────────────────────────────

/**
 * Create a notification for a user.
 * @param {string} userId  - Supabase auth user UUID
 * @param {{ type: string, title: string, message: string, data?: object, link?: string }} payload
 */
export async function notify(userId, { type, title, message, data = {}, link }) {
  if (!userId) return { error: "userId is required" };

  const supabase = createAdminClient();

  const { error } = await supabase.from("notifications").insert({
    user_id:    userId,
    type,
    title,
    message,
    data,
    link:       link ?? null,
    read:       false,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[notifications] Failed to create notification:", error.message);
  }

  return { error: error ?? null };
}

/**
 * Notify multiple users at once (e.g. all admins).
 */
export async function notifyMany(userIds, payload) {
  if (!userIds?.length) return;
  await Promise.allSettled(userIds.map((id) => notify(id, payload)));
}

// ─── Typed helpers ───────────────────────────────────────────────────────────

// Customer: booking confirmed
export async function notifyBookingConfirmed(userId, { bookingId, serviceName, checkIn }) {
  return notify(userId, {
    type:    NOTIFICATION_TYPES.BOOKING_CONFIRMED,
    title:   "Booking Confirmed",
    message: `Your booking for ${serviceName} has been confirmed.`,
    data:    { bookingId, serviceName, checkIn },
    link:    bookingId ? `/dashboard/customer` : undefined,
  });
}

// Customer: booking cancelled
export async function notifyBookingCancelled(userId, { bookingId, serviceName, reason }) {
  return notify(userId, {
    type:    NOTIFICATION_TYPES.BOOKING_CANCELLED,
    title:   "Booking Cancelled",
    message: reason
      ? `Your booking for ${serviceName} was cancelled. Reason: ${reason}`
      : `Your booking for ${serviceName} has been cancelled.`,
    data:    { bookingId, serviceName, reason },
    link:    `/dashboard/customer`,
  });
}

// Customer: payment successful
export async function notifyPaymentSuccessful(userId, { reference, amount, serviceName }) {
  const formatted = amount ? `₦${Number(amount).toLocaleString("en-NG")}` : "";
  return notify(userId, {
    type:    NOTIFICATION_TYPES.PAYMENT_SUCCESSFUL,
    title:   "Payment Successful",
    message: `Your payment${formatted ? ` of ${formatted}` : ""}${serviceName ? ` for ${serviceName}` : ""} was processed successfully.`,
    data:    { reference, amount, serviceName },
    link:    `/dashboard/customer/payments`,
  });
}

// Customer: payment failed
export async function notifyPaymentFailed(userId, { reference, amount, reason }) {
  return notify(userId, {
    type:    NOTIFICATION_TYPES.PAYMENT_FAILED,
    title:   "Payment Failed",
    message: reason
      ? `Your payment could not be processed. ${reason}`
      : "Your payment could not be processed. Please try again.",
    data:    { reference, amount, reason },
    link:    `/dashboard/customer/payments`,
  });
}

// Customer: wallet deposit confirmed
export async function notifyWalletDeposit(userId, { amount, reference }) {
  const formatted = `₦${Number(amount).toLocaleString("en-NG")}`;
  return notify(userId, {
    type:    NOTIFICATION_TYPES.WALLET_DEPOSIT,
    title:   "Wallet Funded",
    message: `${formatted} has been added to your BookHushly wallet.`,
    data:    { amount, reference },
    link:    `/dashboard/customer/payments`,
  });
}

// Customer / Vendor: password changed
export async function notifyPasswordChanged(userId, { role = "customer" } = {}) {
  const link = role === "vendor"
    ? "/vendor/dashboard/settings"
    : role === "admin"
    ? "/admin/dashboard/settings"
    : "/dashboard/customer/profile";

  return notify(userId, {
    type:    NOTIFICATION_TYPES.PASSWORD_CHANGED,
    title:   "Password Changed",
    message: "Your account password was changed. If this wasn't you, contact support immediately.",
    data:    {},
    link,
  });
}

// Customer: review request
export async function notifyReviewRequest(userId, { bookingId, serviceName }) {
  return notify(userId, {
    type:    NOTIFICATION_TYPES.REVIEW_REQUEST,
    title:   "How was your stay?",
    message: `Share your experience at ${serviceName}. Your review helps others make better choices.`,
    data:    { bookingId, serviceName },
    link:    `/dashboard/customer`,
  });
}

// Vendor: new booking received
export async function notifyVendorNewBooking(vendorUserId, { bookingId, guestName, serviceName, checkIn, amount }) {
  const formatted = amount ? `₦${Number(amount).toLocaleString("en-NG")}` : "";
  return notify(vendorUserId, {
    type:    NOTIFICATION_TYPES.NEW_BOOKING,
    title:   "New Booking",
    message: `${guestName} booked ${serviceName}${formatted ? ` for ${formatted}` : ""}.`,
    data:    { bookingId, guestName, serviceName, checkIn, amount },
    link:    `/vendor/dashboard/bookings`,
  });
}

// Vendor: payment received
export async function notifyVendorPaymentReceived(vendorUserId, { amount, reference, serviceName }) {
  const formatted = `₦${Number(amount).toLocaleString("en-NG")}`;
  return notify(vendorUserId, {
    type:    NOTIFICATION_TYPES.PAYMENT_RECEIVED,
    title:   "Payment Received",
    message: `${formatted} payment received for ${serviceName}.`,
    data:    { amount, reference, serviceName },
    link:    `/vendor/dashboard/payments`,
  });
}

// Vendor: listing approved
export async function notifyListingApproved(vendorUserId, { listingId, listingName }) {
  return notify(vendorUserId, {
    type:    NOTIFICATION_TYPES.LISTING_APPROVED,
    title:   "Listing Approved",
    message: `"${listingName}" has been approved and is now live on BookHushly.`,
    data:    { listingId, listingName },
    link:    `/vendor/dashboard/listings`,
  });
}

// Vendor: listing rejected
export async function notifyListingRejected(vendorUserId, { listingId, listingName, reason }) {
  return notify(vendorUserId, {
    type:    NOTIFICATION_TYPES.LISTING_REJECTED,
    title:   "Listing Not Approved",
    message: reason
      ? `"${listingName}" was not approved. Reason: ${reason}`
      : `"${listingName}" was not approved. Please review and resubmit.`,
    data:    { listingId, listingName, reason },
    link:    `/vendor/dashboard/listings`,
  });
}

// Vendor: KYC approved
export async function notifyKYCApproved(vendorUserId) {
  return notify(vendorUserId, {
    type:    NOTIFICATION_TYPES.KYC_APPROVED,
    title:   "Application Approved",
    message: "Your vendor application has been approved. You can now create listings and receive bookings.",
    data:    {},
    link:    `/vendor/dashboard`,
  });
}

// Vendor: KYC rejected
export async function notifyKYCRejected(vendorUserId, { reason } = {}) {
  return notify(vendorUserId, {
    type:    NOTIFICATION_TYPES.KYC_REJECTED,
    title:   "Application Not Approved",
    message: reason
      ? `Your vendor application was not approved. Reason: ${reason}`
      : "Your vendor application was not approved. Please contact support for more information.",
    data:    { reason },
    link:    `/vendor/dashboard`,
  });
}

// Vendor: new review
export async function notifyVendorNewReview(vendorUserId, { listingName, rating, reviewerName }) {
  return notify(vendorUserId, {
    type:    NOTIFICATION_TYPES.NEW_REVIEW,
    title:   "New Review",
    message: `${reviewerName} left a ${rating}★ review on "${listingName}".`,
    data:    { listingName, rating, reviewerName },
    link:    `/vendor/dashboard/reviews`,
  });
}

// Admin: new vendor registration
export async function notifyAdminNewVendor(adminUserIds, { vendorName, vendorId }) {
  return notifyMany(adminUserIds, {
    type:    NOTIFICATION_TYPES.NEW_VENDOR,
    title:   "New Vendor Application",
    message: `${vendorName} has submitted a vendor application and is awaiting approval.`,
    data:    { vendorId, vendorName },
    link:    `/admin/dashboard/vendors`,
  });
}

// Admin: KYC submitted
export async function notifyAdminKYCSubmitted(adminUserIds, { vendorName, vendorId }) {
  return notifyMany(adminUserIds, {
    type:    NOTIFICATION_TYPES.KYC_SUBMITTED,
    title:   "KYC Submitted",
    message: `${vendorName} has submitted KYC documents for review.`,
    data:    { vendorId, vendorName },
    link:    `/admin/dashboard/vendors`,
  });
}

// Admin: payment issue
export async function notifyAdminPaymentIssue(adminUserIds, { reference, amount, error: errMsg }) {
  return notifyMany(adminUserIds, {
    type:    NOTIFICATION_TYPES.PAYMENT_ISSUE,
    title:   "Payment Issue",
    message: `Payment ${reference} failed to process${errMsg ? `: ${errMsg}` : ""}.`,
    data:    { reference, amount, error: errMsg },
    link:    `/admin/dashboard/payments`,
  });
}

// Shared: system message
export async function notifySystem(userId, { title, message, link }) {
  return notify(userId, {
    type: NOTIFICATION_TYPES.SYSTEM,
    title,
    message,
    data: {},
    link,
  });
}
