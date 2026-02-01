import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { unifiedPayment } from "@/lib/payment-service";
import { generateReference } from "@/lib/paystack/utils/reference-generator";
import { generateOrderId } from "@/lib/nowpayments/utils/order-id-generator";

/**
 * Unified Payment Initialization
 * POST /api/payment/initialize
 * Supports both Paystack and NOWPayments
 */
export async function POST(request) {
  try {
    const {
      requestId,
      requestType, // 'logistics', 'security', 'hotel', 'apartment', 'event'
      amount,
      currency = "NGN",
      email,
      provider, // 'paystack' or 'crypto'
      payCurrency, // Required for crypto: 'btc', 'eth', 'usdt', etc.
      metadata = {},
    } = await request.json();

    // Validation
    if (!requestId || !requestType || !amount || !provider) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (provider === "crypto" && !payCurrency) {
      return NextResponse.json(
        { error: "payCurrency is required for crypto payments" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Fetch request details based on type
    let requestData, quote, tableName;

    if (requestType === "logistics" || requestType === "security") {
      tableName = `${requestType}_requests`;

      // Fetch request
      const { data: request, error: requestError } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", requestId)
        .single();

      if (requestError || !request) {
        return NextResponse.json(
          { error: "Request not found" },
          { status: 404 },
        );
      }

      requestData = request;

      // Fetch quotes separately (no direct relation)
      const { data: quotes, error: quotesError } = await supabase
        .from("service_quotes")
        .select("*")
        .eq("request_id", requestId)
        .order("created_at", { ascending: false });

      if (!quotesError && quotes && quotes.length > 0) {
        quote = quotes[0]; // Get most recent quote
      }
    } else if (requestType === "hotel") {
      const { data, error } = await supabase
        .from("hotel_bookings")
        .select("*")
        .eq("id", requestId)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 },
        );
      }

      requestData = data;
      // For hotel bookings, amount comes from booking total
    } else if (requestType === "apartment") {
      const { data, error } = await supabase
        .from("apartment_bookings")
        .select("*")
        .eq("id", requestId)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 },
        );
      }

      requestData = data;
    } else if (requestType === "event") {
      const { data, error } = await supabase
        .from("event_bookings")
        .select("*")
        .eq("id", requestId)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 },
        );
      }

      requestData = data;
    } else {
      return NextResponse.json(
        { error: "Invalid request type" },
        { status: 400 },
      );
    }

    // Verify amount if quote exists
    if (quote) {
      const expectedAmount = parseFloat(quote.total_amount);
      const providedAmount = parseFloat(amount);

      if (Math.abs(providedAmount - expectedAmount) > 0.01) {
        return NextResponse.json(
          {
            error: "Amount mismatch",
            expected: expectedAmount,
            provided: providedAmount,
          },
          { status: 400 },
        );
      }
    }

    // Generate reference based on provider
    const prefix = requestType.substring(0, 3).toUpperCase();
    const reference =
      provider === "paystack"
        ? generateReference(prefix)
        : generateOrderId(prefix);

    // Callback URL
    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/payment/callback?reference=${reference}&provider=${provider}`;

    // Initialize payment with unified service
    const paymentResult = await unifiedPayment.initializePayment({
      provider,
      amount: parseFloat(amount),
      currency,
      email: email || requestData.email,
      reference,
      payCurrency,
      callbackUrl,
      metadata: {
        request_id: requestId,
        request_type: requestType,
        quote_id: quote?.id,
        customer_name: requestData.full_name || requestData.customer_name,
        ...metadata,
      },
    });

    if (!paymentResult.success) {
      throw new Error("Failed to initialize payment");
    }

    // Prepare payment record data
    const paymentData = {
      reference: paymentResult.reference,
      request_id: requestId,
      request_type: requestType,
      quote_id: quote?.id,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      provider: provider === "crypto" ? "nowpayments" : provider,
      status: "pending",
      customer_id:
        requestData.user_id || requestData.customer_id || "anonymous",
      email: email || requestData.email,
      metadata: {
        customer_name: requestData.full_name || requestData.customer_name,
        request_type: requestType,
        ...metadata,
      },
      fulfilled: false,
    };

    // Add provider-specific fields
    if (provider === "paystack") {
      paymentData.paystack_authorization_url = paymentResult.authorization_url;
      paymentData.paystack_access_code = paymentResult.access_code;
    } else {
      paymentData.crypto_order_id = paymentResult.order_id;
      paymentData.crypto_invoice_id = paymentResult.invoice_id;
      paymentData.crypto_invoice_url = paymentResult.invoice_url;
      paymentData.crypto_pay_currency = payCurrency?.toUpperCase();
    }

    // Add booking relationship if applicable
    if (requestType === "hotel") {
      paymentData.hotel_booking_id = requestId;
    } else if (requestType === "apartment") {
      paymentData.apartment_booking_id = requestId;
    } else if (requestType === "event") {
      paymentData.event_booking_id = requestId;
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert(paymentData)
      .select()
      .single();

    if (paymentError) {
      console.error("Failed to create payment record:", paymentError);
      return NextResponse.json(
        {
          error: "Failed to create payment record",
          details: paymentError.message,
        },
        { status: 500 },
      );
    }

    // Update request/booking with payment reference
    if (tableName) {
      const updateField =
        provider === "paystack"
          ? "payment_reference"
          : "crypto_payment_order_id";
      await supabase
        .from(tableName)
        .update({ [updateField]: paymentResult.reference })
        .eq("id", requestId);
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        reference: paymentResult.reference,
        provider: provider,
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        // Provider-specific URLs
        payment_url:
          provider === "paystack"
            ? paymentResult.authorization_url
            : paymentResult.invoice_url,
        // Additional data
        ...(provider === "paystack" && {
          access_code: paymentResult.access_code,
        }),
        ...(provider === "crypto" && {
          order_id: paymentResult.order_id,
          invoice_id: paymentResult.invoice_id,
          pay_currency: payCurrency?.toUpperCase(),
        }),
      },
      message: "Payment initialized successfully",
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      {
        error: "Failed to initialize payment",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
