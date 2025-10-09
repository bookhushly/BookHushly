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
      console.error("Session error:", sessionError);
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userEmail = session.user.email;
    const userName = session.user.user_metadata?.name || "User";

    console.log("Processing deposit for user:", userId);

    const body = await request.json();
    const { amount, payment_method, crypto_currency } = body;

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Minimum deposit amount is ₦100" },
        { status: 400 }
      );
    }

    let result;

    if (payment_method === "paystack") {
      result = await walletService.initializeDeposit(
        userId,
        amount,
        userEmail,
        userName
      );
    } else if (payment_method === "crypto") {
      if (!crypto_currency) {
        return NextResponse.json(
          { error: "Crypto currency is required" },
          { status: 400 }
        );
      }

      result = await walletService.initializeCryptoDeposit(
        userId,
        amount,
        crypto_currency,
        userEmail
      );
    } else {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    if (result.error) {
      console.error("Deposit initialization error:", result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("Initialize deposit error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
