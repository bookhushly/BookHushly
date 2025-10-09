import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET - Get all bank accounts
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

    const { data, error } = await supabase
      .from("user_bank_accounts")
      .select("*")
      .eq("user_id", session.user.id)
      .order("is_default", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Get bank accounts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add new bank account
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
    const { bank_name, bank_code, account_number, account_name, is_default } =
      body;

    if (!bank_name || !bank_code || !account_number || !account_name) {
      return NextResponse.json(
        { error: "All bank details are required" },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await supabase
        .from("user_bank_accounts")
        .update({ is_default: false })
        .eq("user_id", session.user.id);
    }

    const { data, error } = await supabase
      .from("user_bank_accounts")
      .insert({
        user_id: session.user.id,
        bank_name,
        bank_code,
        account_number,
        account_name,
        is_default: is_default || false,
        is_verified: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Add bank account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove bank account
export async function DELETE(request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("id");

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("user_bank_accounts")
      .delete()
      .eq("id", accountId)
      .eq("user_id", session.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete bank account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
