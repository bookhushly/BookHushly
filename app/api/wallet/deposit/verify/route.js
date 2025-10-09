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
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    const result = await walletService.verifyDeposit(reference);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    console.log(result);
    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("Verify deposit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
