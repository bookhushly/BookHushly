import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { paymentVerification, PAYMENT_STATUS } from "@/lib/paystack";
import { nowpaymentsVerification } from "@/lib/nowpayments";
import {
  notifyPaymentSuccessful,
  notifyPaymentFailed,
  notifyBookingConfirmed,
  notifyVendorNewBooking,
  notifyVendorPaymentReceived,
  notifyBookingPending,
} from "@/lib/notifications";

/**
 * Verify Payment
 * POST /api/payment/verify
 */
export async function POST(request) {
  try {
    const { reference, provider = "paystack" } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (provider === "paystack" || payment.provider === "paystack") {
      return await verifyPaystackPayment(supabase, payment);
    } else if (
      provider === "crypto" ||
      provider === "nowpayments" ||
      payment.provider === "nowpayments"
    ) {
      return await verifyCryptoPayment(supabase, payment);
    } else {
      return NextResponse.json(
        { error: "Unsupported payment provider" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { verified: false, error: "Verification failed", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * Update related booking/request after payment status change
 */
async function releaseLockForPayment(supabase, payment) {
  try {
    const typeMap = { hotel: "hotel", apartment: "apartment", event: "event" };
    const lockType = typeMap[payment.request_type];
    const bookingId =
      payment.hotel_booking_id || payment.apartment_booking_id || payment.event_booking_id;
    if (lockType && bookingId) {
      await supabase
        .from("booking_locks")
        .delete()
        .eq("booking_id", bookingId)
        .eq("listing_type", lockType);
    }
  } catch (err) {
    console.error("Error releasing booking lock:", err);
  }
}

async function updateRelatedEntity(supabase, payment, status) {
  // Release lock when payment is confirmed or failed
  if (status === "completed" || status === "failed") {
    await releaseLockForPayment(supabase, payment);
  }

  try {
    if (
      payment.request_type === "logistics" ||
      payment.request_type === "security"
    ) {
      await supabase
        .from(`${payment.request_type}_requests`)
        .update({
          payment_status: status,
          status: status === "completed" ? "confirmed" : payment.request_type,
          confirmed_at:
            status === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", payment.request_id);
    } else if (payment.hotel_booking_id) {
      const updates = { payment_status: status };
      if (status === "failed") {
        updates.booking_status = "cancelled";
        const { data: booking } = await supabase
          .from("hotel_bookings")
          .select("room_id")
          .eq("id", payment.hotel_booking_id)
          .single();
        if (booking?.room_id) {
          await supabase
            .from("hotel_rooms")
            .update({ status: "available" })
            .eq("id", booking.room_id);
        }
      }
      await supabase
        .from("hotel_bookings")
        .update(updates)
        .eq("id", payment.hotel_booking_id);
    } else if (payment.apartment_booking_id) {
      await supabase
        .from("apartment_bookings")
        .update({
          payment_status: status,
          status: status === "completed" ? "confirmed" : "pending",
        })
        .eq("id", payment.apartment_booking_id);
    } else if (payment.event_booking_id) {
      await supabase
        .from("event_bookings")
        .update({
          payment_status: status,
          status: status === "completed" ? "confirmed" : "pending",
        })
        .eq("id", payment.event_booking_id);
    }
  } catch (error) {
    console.error("Error updating related entity:", error);
  }
}

/**
 * Verify Paystack payment
 */
async function verifyPaystackPayment(supabase, payment) {
  // Already verified and fulfilled — return cached
  if (payment.status === PAYMENT_STATUS.SUCCESS && payment.fulfilled) {
    return NextResponse.json({
      verified: true,
      status: PAYMENT_STATUS.SUCCESS,
      payment: buildPaymentResponse(payment),
      message: "Payment already verified and fulfilled",
    });
  }

  const verificationResult = await paymentVerification.comprehensiveVerify(
    payment.reference,
    Math.round(payment.amount * 100),
  );

  if (!verificationResult.verified) {
    return NextResponse.json({
      verified: false,
      status: payment.status,
      message: verificationResult.message,
      error: verificationResult.error,
    });
  }

  const { data: updatedPayment } = await supabase
    .from("payments")
    .update({
      status: PAYMENT_STATUS.SUCCESS,
      paystack_transaction_id: verificationResult.transaction.id,
      paid_at: verificationResult.transaction.paid_at,
      paystack_channel: verificationResult.transaction.channel,
      paystack_authorization_code:
        verificationResult.transaction.authorization?.authorization_code,
      paystack_card_type:
        verificationResult.transaction.authorization?.card_type,
      paystack_last4: verificationResult.transaction.authorization?.last4,
      paystack_bank: verificationResult.transaction.authorization?.bank,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("reference", payment.reference)
    .eq("status", PAYMENT_STATUS.PENDING)
    .select()
    .single();

  // Webhook already processed — still update related entity in case it was missed
  if (!updatedPayment) {
    console.log("Payment already processed by webhook:", payment.reference);

    // Ensure related entity is updated even if webhook handled payments table
    if (!payment.fulfilled) {
      await updateRelatedEntity(supabase, payment, "completed");
      await supabase
        .from("payments")
        .update({ fulfilled: true })
        .eq("id", payment.id);
    }

    return NextResponse.json({
      verified: true,
      status: PAYMENT_STATUS.SUCCESS,
      payment: buildPaymentResponse(payment),
      message: "Payment verified (processed by webhook)",
    });
  }

  // Update related booking/request
  await updateRelatedEntity(supabase, updatedPayment, "completed");

  // Mark fulfilled
  await supabase
    .from("payments")
    .update({ fulfilled: true })
    .eq("id", updatedPayment.id);

  // Fire in-app notifications
  await firePaymentNotifications(supabase, updatedPayment);

  return NextResponse.json({
    verified: true,
    status: PAYMENT_STATUS.SUCCESS,
    payment: buildPaymentResponse(updatedPayment),
    message: "Payment verified successfully",
  });
}

/**
 * Verify NOWPayments crypto payment
 */
async function verifyCryptoPayment(supabase, payment) {
  // Already completed and fulfilled — return cached
  if (payment.status === "completed" && payment.fulfilled) {
    return NextResponse.json({
      verified: true,
      status: "completed",
      payment: buildPaymentResponse(payment),
      message: "Crypto payment already verified and fulfilled",
    });
  }

  if (!payment.crypto_payment_id) {
    return NextResponse.json({
      verified: false,
      status: payment.status || "pending",
      payment: {
        reference: payment.reference,
        crypto_order_id: payment.crypto_order_id,
        status: payment.status || "waiting",
      },
      message: "Crypto payment awaiting confirmation",
    });
  }

  try {
    const verificationResult =
      await nowpaymentsVerification.comprehensiveVerify(
        payment.crypto_payment_id,
        payment.amount,
        payment.currency.toLowerCase(),
      );

    if (!verificationResult.verified) {
      return NextResponse.json({
        verified: false,
        status: verificationResult.status || payment.status,
        payment: {
          reference: payment.reference,
          crypto_order_id: payment.crypto_order_id,
          status: verificationResult.status || payment.status,
        },
        message: verificationResult.message,
      });
    }

    const pendingStatuses = ["waiting", "confirming", "sending"];
    if (pendingStatuses.includes(verificationResult.status)) {
      return NextResponse.json({
        verified: false,
        status: verificationResult.status,
        payment: {
          reference: payment.reference,
          crypto_order_id: payment.crypto_order_id,
          crypto_payment_id: payment.crypto_payment_id,
          amount: payment.amount,
          status: verificationResult.status,
          crypto_pay_currency: payment.crypto_pay_currency,
          request_type: payment.request_type,
          request_id: payment.request_id,
        },
        message: "Crypto payment is being confirmed on blockchain",
      });
    }

    const { data: updatedPayment } = await supabase
      .from("payments")
      .update({
        status: "completed",
        paid_at: new Date().toISOString(),
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("reference", payment.reference)
      .in("status", ["pending", "waiting", "confirming", "sending"])
      .select()
      .single();

    if (!updatedPayment) {
      console.log(
        "Crypto payment already processed by webhook:",
        payment.crypto_order_id,
      );

      // Ensure related entity is updated even if webhook handled payments table
      if (!payment.fulfilled) {
        await updateRelatedEntity(supabase, payment, "completed");
        await supabase
          .from("payments")
          .update({ fulfilled: true })
          .eq("id", payment.id);
      }

      return NextResponse.json({
        verified: true,
        status: "completed",
        payment: buildPaymentResponse(payment),
        message: "Crypto payment verified (processed by webhook)",
      });
    }

    // Update related booking/request
    await updateRelatedEntity(supabase, updatedPayment, "completed");

    // Mark fulfilled
    await supabase
      .from("payments")
      .update({ fulfilled: true })
      .eq("id", updatedPayment.id);

    // Fire in-app notifications
    await firePaymentNotifications(supabase, updatedPayment);

    return NextResponse.json({
      verified: true,
      status: "completed",
      payment: buildPaymentResponse(updatedPayment),
      message: "Crypto payment verified successfully",
    });
  } catch (error) {
    console.error("NOWPayments verification error:", error);
    return NextResponse.json({
      verified: false,
      status: payment.status || "pending",
      payment: {
        reference: payment.reference,
        crypto_order_id: payment.crypto_order_id,
        status: payment.status || "pending",
      },
      error: "Verification service temporarily unavailable",
      message: "Please check back in a few moments",
    });
  }
}

/**
 * Fire in-app notifications after a payment is confirmed.
 * Runs best-effort — never throws so it can't break the payment flow.
 */
async function firePaymentNotifications(supabase, payment) {
  try {
    const bookingId =
      payment.hotel_booking_id ||
      payment.apartment_booking_id ||
      payment.event_booking_id;

    // customer_id is how the payments table stores the user (not user_id)
    const customerId = payment.customer_id;
    const isValidUser = customerId && customerId !== "anonymous";

    let serviceName         = "your booking";
    let vendorUserId        = null;
    let guestName           = "Guest";
    let apartmentAgentName  = null;
    let apartmentAgentPhone = null;

    if (payment.hotel_booking_id) {
      const { data: b } = await supabase
        .from("hotel_bookings")
        .select("user_id, guest_name, hotel_id, hotels!inner(name, vendor_id)")
        .eq("id", payment.hotel_booking_id)
        .single();

      if (b) {
        serviceName = b.hotels?.name ?? serviceName;
        guestName   = b.guest_name ?? guestName;

        // Resolve vendor's auth user_id via their vendor record
        if (b.hotels?.vendor_id) {
          const { data: v } = await supabase
            .from("vendors")
            .select("user_id")
            .eq("id", b.hotels.vendor_id)
            .single();
          vendorUserId = v?.user_id ?? null;
        }

        if (vendorUserId) {
          await notifyVendorNewBooking(vendorUserId, {
            bookingId:   payment.hotel_booking_id,
            guestName,
            serviceName,
            amount:      payment.amount,
          });
          await notifyVendorPaymentReceived(vendorUserId, {
            amount:      payment.amount,
            reference:   payment.reference,
            serviceName,
          });
        }
      }
    } else if (payment.apartment_booking_id) {
      const { data: b } = await supabase
        .from("apartment_bookings")
        .select("guest_name, apartment_id, serviced_apartments!inner(name, vendor_id, agent_name, agent_phone)")
        .eq("id", payment.apartment_booking_id)
        .single();

      if (b) {
        serviceName = b.serviced_apartments?.name ?? serviceName;
        guestName   = b.guest_name ?? guestName;
        // Store agent info to include in customer notification
        apartmentAgentName  = b.serviced_apartments?.agent_name  ?? null;
        apartmentAgentPhone = b.serviced_apartments?.agent_phone ?? null;

        if (b.serviced_apartments?.vendor_id) {
          const { data: v } = await supabase
            .from("vendors")
            .select("user_id")
            .eq("id", b.serviced_apartments.vendor_id)
            .single();
          vendorUserId = v?.user_id ?? null;
        }

        if (vendorUserId) {
          await notifyVendorNewBooking(vendorUserId, {
            bookingId:   payment.apartment_booking_id,
            guestName,
            serviceName,
            amount:      payment.amount,
          });
          await notifyVendorPaymentReceived(vendorUserId, {
            amount: payment.amount, reference: payment.reference, serviceName,
          });
        }
      }
    } else if (payment.event_booking_id) {
      const { data: b } = await supabase
        .from("event_bookings")
        .select("customer_id, guest_name, listing_id, listings!inner(title, vendor_id)")
        .eq("id", payment.event_booking_id)
        .single();

      if (b) {
        serviceName = b.listings?.title ?? serviceName;
        guestName   = b.guest_name ?? guestName;

        if (b.listings?.vendor_id) {
          const { data: v } = await supabase
            .from("vendors")
            .select("user_id")
            .eq("id", b.listings.vendor_id)
            .single();
          vendorUserId = v?.user_id ?? null;
        }

        if (vendorUserId) {
          await notifyVendorNewBooking(vendorUserId, {
            bookingId:   payment.event_booking_id,
            guestName,
            serviceName,
            amount:      payment.amount,
          });
          await notifyVendorPaymentReceived(vendorUserId, {
            amount: payment.amount, reference: payment.reference, serviceName,
          });
        }
      }
    }

    // Notify customer — payment.customer_id is the auth user UUID
    if (isValidUser) {
      await notifyPaymentSuccessful(customerId, {
        reference:   payment.reference,
        amount:      payment.amount,
        serviceName,
      });
      if (bookingId) {
        await notifyBookingConfirmed(customerId, {
          bookingId,
          serviceName,
          hostName:  apartmentAgentName,
          hostPhone: apartmentAgentPhone,
        });
      }
    }
  } catch (err) {
    console.error("[notifications] firePaymentNotifications error:", err.message);
  }
}

/**
 * Build consistent payment response object
 */
function buildPaymentResponse(payment) {
  return {
    reference: payment.reference,
    amount: payment.amount,
    status: payment.status,
    paid_at: payment.paid_at,
    channel: payment.paystack_channel,
    transaction_id: payment.paystack_transaction_id,
    crypto_order_id: payment.crypto_order_id,
    crypto_payment_id: payment.crypto_payment_id,
    crypto_pay_currency: payment.crypto_pay_currency,
    request_type: payment.request_type,
    request_id: payment.request_id,
    hotel_booking_id: payment.hotel_booking_id,
    apartment_booking_id: payment.apartment_booking_id,
    event_booking_id: payment.event_booking_id,
  };
}
