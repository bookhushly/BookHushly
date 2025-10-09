import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { walletService } from "@/lib/wallet-service";

export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { booking_id, amount } = body;

    if (!booking_id || !amount) {
      return NextResponse.json(
        { error: "Booking ID and amount are required" },
        { status: 400 }
      );
    }

    // Verify booking belongs to user
    const { data: booking } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .eq("customer_id", session.user.id)
      .single();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if already paid
    if (booking.payment_status === "completed") {
      return NextResponse.json(
        { error: "Booking already paid" },
        { status: 400 }
      );
    }

    const result = await walletService.payFromWallet(
      session.user.id,
      booking_id,
      amount
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("Pay from wallet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
