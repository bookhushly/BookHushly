import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Check Payment Status
 * GET /api/payment/status/[reference]
 */
export async function GET(request, { params }) {
  try {
    const { reference } = params;

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get payment with related data
    const { data: payment, error } = await supabase
      .from("payments")
      .select(
        `
        *,
        logistics_requests:request_id (
          id,
          status,
          full_name,
          email,
          service_type
        )
      `,
      )
      .eq("reference", reference)
      .single();

    if (error || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Get request data based on type
    let requestData = null;
    if (payment.request_type) {
      const tableName =
        payment.request_type === "logistics"
          ? "logistics_requests"
          : "security_requests";

      const { data } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", payment.request_id)
        .single();

      requestData = data;
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        reference: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paid_at: payment.paid_at,
        channel: payment.channel,
        fulfilled: payment.fulfilled,
        created_at: payment.created_at,
        metadata: payment.metadata,
      },
      request: requestData
        ? {
            id: requestData.id,
            type: payment.request_type,
            status: requestData.status,
            service_type: requestData.service_type,
            customer_name: requestData.full_name,
          }
        : null,
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 },
    );
  }
}
