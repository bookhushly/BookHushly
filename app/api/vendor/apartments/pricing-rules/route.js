// GET  /api/vendor/apartments/pricing-rules?apartment_id=xxx  — list rules
// POST /api/vendor/apartments/pricing-rules                   — create rule
// DELETE /api/vendor/apartments/pricing-rules?id=xxx          — delete rule

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function verifyOwnership(supabase, apartmentId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, ok: false };

  const { data: apt } = await supabase
    .from("serviced_apartments")
    .select("id, vendors!inner(user_id)")
    .eq("id", apartmentId)
    .single();

  const ok = apt?.vendors?.user_id === user.id;
  return { user, ok };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apartmentId = searchParams.get("apartment_id");
  if (!apartmentId) return NextResponse.json({ error: "apartment_id required" }, { status: 400 });

  const supabase = await createClient();
  const { ok } = await verifyOwnership(supabase, apartmentId);
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("apartment_pricing_rules")
    .select("*")
    .eq("apartment_id", apartmentId)
    .order("start_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data || [] });
}

export async function POST(request) {
  const supabase = await createClient();
  const body = await request.json();
  const { apartment_id, label, start_date, end_date, price_per_night } = body;

  if (!apartment_id || !label || !start_date || !end_date || !price_per_night) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (new Date(end_date) < new Date(start_date)) {
    return NextResponse.json({ error: "end_date must be on or after start_date" }, { status: 400 });
  }
  if (parseFloat(price_per_night) <= 0) {
    return NextResponse.json({ error: "price_per_night must be positive" }, { status: 400 });
  }

  const { ok } = await verifyOwnership(supabase, apartment_id);
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("apartment_pricing_rules")
    .insert({ apartment_id, label, start_date, end_date, price_per_night: parseFloat(price_per_night) })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const apartmentId = searchParams.get("apartment_id");
  if (!id || !apartmentId) return NextResponse.json({ error: "id and apartment_id required" }, { status: 400 });

  const supabase = await createClient();
  const { ok } = await verifyOwnership(supabase, apartmentId);
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("apartment_pricing_rules")
    .delete()
    .eq("id", id)
    .eq("apartment_id", apartmentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
