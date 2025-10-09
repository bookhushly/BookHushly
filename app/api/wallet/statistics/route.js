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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get transaction statistics
    const { data: transactions, error } = await supabase
      .from("wallet_transactions")
      .select("transaction_type, amount, status")
      .eq("user_id", userId)
      .eq("status", "completed");

    if (error) {
      console.error("Statistics fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch statistics" },
        { status: 400 }
      );
    }

    // Calculate totals
    const stats = {
      total_deposits: 0,
      total_payments: 0,
      total_withdrawals: 0,
      total_refunds: 0,
    };

    transactions?.forEach((tx) => {
      switch (tx.transaction_type) {
        case "deposit":
          stats.total_deposits += parseFloat(tx.amount);
          break;
        case "payment":
          stats.total_payments += parseFloat(tx.amount);
          break;
        case "withdrawal":
          stats.total_withdrawals += parseFloat(tx.amount);
          break;
        case "refund":
          stats.total_refunds += parseFloat(tx.amount);
          break;
      }
    });

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error("Get statistics error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
