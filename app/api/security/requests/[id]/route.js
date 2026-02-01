import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Get Security Request by ID
 * GET /api/security/requests/[id]
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Fetch security request
    const { data: securityRequest, error } = await supabase
      .from("security_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching security request:", error);
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (!securityRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Fetch related quotes separately (no direct relation)
    const { data: quotes, error: quotesError } = await supabase
      .from("service_quotes")
      .select("id, total_amount, breakdown, valid_until, status, created_at")
      .eq("request_id", id)
      .order("created_at", { ascending: false });

    if (quotesError) {
      console.error("Error fetching quotes:", quotesError);
      // Don't fail the request if quotes fetch fails
      // Just return request without quotes
    }

    return NextResponse.json({
      success: true,
      request: {
        ...securityRequest,
        service_quotes: quotes || [],
      },
    });
  } catch (error) {
    console.error("Error in GET security request:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
