"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitLogisticsRequest(formData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  try {
    // Format dates properly - convert empty strings to null
    const formatDate = (dateString) => {
      if (!dateString || dateString.trim() === "") return null;
      return dateString;
    };

    // Format time properly - convert empty strings to null
    const formatTime = (timeString) => {
      if (!timeString || timeString.trim() === "") return null;
      return timeString;
    };

    // Parse numeric values properly
    const parseNumeric = (value) => {
      if (!value || value === "") return null;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    };

    const parseInteger = (value) => {
      if (!value || value === "") return null;
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? null : parsed;
    };

    const { data, error } = await supabase
      .from("logistics_requests")
      .insert([
        {
          user_id: user?.id,
          service_type: formData.service_type,
          full_name: formData.full_name?.trim(),
          phone: formData.phone?.trim(),
          email: formData.email?.trim().toLowerCase(),
          pickup_address: formData.pickup_address?.trim(),
          pickup_landmark: formData.pickup_landmark?.trim() || null,
          pickup_lga: formData.pickup_lga?.trim() || null,
          pickup_state: formData.pickup_state,
          pickup_date: formatDate(formData.pickup_date),
          pickup_time: formatTime(formData.pickup_time),
          delivery_address: formData.delivery_address?.trim(),
          delivery_landmark: formData.delivery_landmark?.trim() || null,
          delivery_lga: formData.delivery_lga?.trim() || null,
          delivery_state: formData.delivery_state,
          delivery_date: formatDate(formData.delivery_date),
          delivery_time: formatTime(formData.delivery_time),
          item_description: formData.item_description?.trim(),
          item_category: formData.item_category || null,
          item_weight: formData.item_weight || null,
          item_dimensions: formData.item_dimensions?.trim() || null,
          item_value: parseNumeric(formData.item_value),
          quantity: parseInteger(formData.quantity) || 1,
          requires_packaging: Boolean(formData.requires_packaging),
          requires_insurance: Boolean(formData.requires_insurance),
          requires_tracking: Boolean(formData.requires_tracking),
          fragile_items: Boolean(formData.fragile_items),
          perishable_items: Boolean(formData.perishable_items),
          special_instructions: formData.special_instructions?.trim() || null,
          vehicle_type: formData.vehicle_type,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Send email notification to admin
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/new-logistics-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: data.id }),
        },
      );
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error("Error sending admin notification:", emailError);
    }

    revalidatePath("/quote-services/logistics");
    return { success: true, data };
  } catch (error) {
    console.error("Error submitting logistics request:", error);
    return {
      success: false,
      error: error.message || "Failed to submit request. Please try again.",
    };
  }
}

export async function getLogisticsRequests(userId = null) {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("logistics_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching logistics requests:", error);
    return { success: false, error: error.message };
  }
}

export async function updateLogisticsRequestWithQuote(requestId, quoteData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required" };
  }

  // Check if user is admin
  const { data: userRole } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userRole || userRole.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Update request
    const { data: request, error: requestError } = await supabase
      .from("logistics_requests")
      .update({
        quoted_amount: quoteData.total_amount,
        quote_details: quoteData.breakdown,
        quote_sent_at: new Date().toISOString(),
        status: "quoted",
        admin_id: user.id,
        admin_notes: quoteData.admin_notes,
      })
      .eq("id", requestId)
      .select()
      .single();

    if (requestError) throw requestError;

    // Create quote record
    const { data: quote, error: quoteError } = await supabase
      .from("service_quotes")
      .insert([
        {
          request_id: requestId,
          request_type: "logistics",
          base_amount: quoteData.base_amount,
          breakdown: quoteData.breakdown,
          total_amount: quoteData.total_amount,
          valid_until: quoteData.valid_until,
          created_by: user.id,
          status: "sent",
        },
      ])
      .select()
      .single();

    if (quoteError) throw quoteError;
    console.log("Generated Quote:", quote);
    // Generate PDF
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/quotes/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteId: quote.id,
        requestType: "logistics",
      }),
    });

    // Send quote email to customer
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/quotes/send-quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteId: quote.id,
        requestType: "logistics",
      }),
    });

    revalidatePath("/admin/dashboard/logistics-requests");
    return { success: true, data: { request, quote } };
  } catch (error) {
    console.error("Error updating logistics request with quote:", error);
    return { success: false, error: error.message };
  }
}
