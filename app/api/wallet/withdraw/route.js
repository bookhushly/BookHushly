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
    const { amount, bank_account_id } = body;

    if (!amount || !bank_account_id) {
      return NextResponse.json(
        { error: "Amount and bank account are required" },
        { status: 400 }
      );
    }

    const result = await walletService.requestWithdrawal(
      session.user.id,
      amount,
      bank_account_id
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("Request withdrawal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
