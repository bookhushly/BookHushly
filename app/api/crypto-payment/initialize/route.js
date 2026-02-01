import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  nowpaymentsTransaction,
  generateOrderId,
  generatePurchaseId,
  NOWPAYMENTS_PAYMENT_STATUS,
} from "@/lib/nowpayments";

/**
 * Initialize Crypto Payment
 * POST /api/crypto-payment/initialize
 */
export async function POST(request) {
  try {
    const {
      requestId,
      requestType, // 'logistics' or 'security'
      amount,
      currency = "usd",
      payCurrency, // Cryptocurrency chosen by user (e.g., 'btc', 'eth', 'usdt')
      email,
      metadata = {},
    } = await request.json();

    // Validation
    if (!requestId || !requestType || !amount || !payCurrency) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Fetch request details
    const tableName =
      requestType === "logistics" ? "logistics_requests" : "security_requests";
    const { data: requestData, error: fetchError } = await supabase
      .from(tableName)
      .select("*, service_quotes(*)")
      .eq("id", requestId)
      .single();

    if (fetchError || !requestData) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Check if quote exists
    const quote = requestData.service_quotes?.[0];
    if (!quote) {
      return NextResponse.json(
        { error: "No quote found for this request" },
        { status: 404 },
      );
    }

    // Verify amount matches quote
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

    // Generate unique identifiers
    const prefix = requestType === "logistics" ? "LGS" : "SEC";
    const orderId = generateOrderId(prefix);
    const purchaseId = generatePurchaseId(requestId);

    // IPN callback URL
    const ipnCallbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/crypto-payment/ipn`;

    // Success URL (where user is redirected after payment)
    const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/crypto-payment/success?order_id=${orderId}`;

    // Cancel URL
    const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/crypto-payment/${requestType}/${requestId}`;

    // Create invoice with NOWPayments
    const invoiceResult = await nowpaymentsTransaction.createInvoice({
      price_amount: expectedAmount,
      price_currency: currency.toLowerCase(),
      order_id: orderId,
      order_description: `${requestType === "logistics" ? "Logistics" : "Security"} Service - ${requestData.service_type}`,
      ipn_callback_url: ipnCallbackUrl,
      success_url: successUrl,
      cancel_url: cancelUrl,
      is_fee_paid_by_user: true, // Customer pays blockchain fees
      is_fixed_rate: true, // Lock exchange rate
    });

    if (!invoiceResult || !invoiceResult.id) {
      throw new Error("Failed to create NOWPayments invoice");
    }

    // Create crypto payment record
    const { data: cryptoPayment, error: paymentError } = await supabase
      .from("crypto_payments")
      .insert({
        order_id: orderId,
        purchase_id: purchaseId,
        request_id: requestId,
        request_type: requestType,
        quote_id: quote.id,

        // Amount details
        price_amount: expectedAmount,
        price_currency: currency.toLowerCase(),
        pay_currency: payCurrency.toLowerCase(),

        // NOWPayments data
        invoice_id: invoiceResult.id,
        invoice_url: invoiceResult.invoice_url,
        payment_id: null, // Set when payment is created

        // Status
        status: NOWPAYMENTS_PAYMENT_STATUS.WAITING,

        // Contact
        email: email || requestData.email,

        // Metadata
        metadata: {
          customer_name: requestData.full_name,
          service_type: requestData.service_type,
          ...metadata,
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Failed to create crypto payment record:", paymentError);
      return NextResponse.json(
        { error: "Failed to create payment record" },
        { status: 500 },
      );
    }

    // Update request with payment reference
    await supabase
      .from(tableName)
      .update({
        crypto_payment_order_id: orderId,
        crypto_payment_status: NOWPAYMENTS_PAYMENT_STATUS.WAITING,
      })
      .eq("id", requestId);

    return NextResponse.json({
      success: true,
      payment: {
        id: cryptoPayment.id,
        order_id: orderId,
        invoice_id: invoiceResult.id,
        invoice_url: invoiceResult.invoice_url,
        price_amount: expectedAmount,
        price_currency: currency,
        pay_currency: payCurrency,
        created_at: invoiceResult.created_at,
      },
      message: "Crypto payment initialized successfully",
    });
  } catch (error) {
    console.error("Crypto payment initialization error:", error);
    return NextResponse.json(
      {
        error: "Failed to initialize crypto payment",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
