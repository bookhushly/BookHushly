import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    console.log(params);

    const { data: booking, error } = await supabase
      .from("apartment_bookings")
      .select(`*, apartment:apartment_id(*)`)
      .eq("id", id)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 },
    );
  }
}
