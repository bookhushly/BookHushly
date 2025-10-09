import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
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
    console.log("Fetching wallet for user:", userId);

    // Get or create wallet
    let { data: wallet, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Wallet fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch wallet" },
        { status: 400 }
      );
    }

    // Create wallet if it doesn't exist
    if (!wallet) {
      console.log("Creating new wallet for user:", userId);

      const { data: newWallet, error: createError } = await supabase
        .from("wallets")
        .insert({
          user_id: userId,
          balance: 0,
          currency: "NGN",
        })
        .select()
        .single();

      if (createError) {
        console.error("Wallet creation error:", createError);
        return NextResponse.json(
          { error: "Failed to create wallet" },
          { status: 400 }
        );
      }

      wallet = newWallet;
    }

    return NextResponse.json({
      data: wallet,
      user: {
        id: userId,
        email: session.user.email,
        role: session.user.user_metadata?.role || "customer",
      },
    });
  } catch (error) {
    console.error("Get wallet error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
