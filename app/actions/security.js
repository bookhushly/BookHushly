"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitSecurityRequest(formData) {
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
      .from("security_requests")
      .insert([
        {
          user_id: user?.id,
          service_type: formData.service_type,
          full_name: formData.full_name?.trim(),
          phone: formData.phone?.trim(),
          email: formData.email?.trim().toLowerCase(),
          location_address: formData.location_address?.trim(),
          location_landmark: formData.location_landmark?.trim() || null,
          location_lga: formData.location_lga?.trim() || null,
          location_state: formData.location_state,
          start_date: formatDate(formData.start_date),
          end_date: formatDate(formData.end_date),
          coverage_type: formData.coverage_type,
          coverage_hours: formData.coverage_hours || null,
          number_of_personnel: parseInteger(formData.number_of_personnel) || 1,
          property_type: formData.property_type || null,
          property_size: formData.property_size || null,
          access_points: parseInteger(formData.access_points),
          has_existing_security: Boolean(formData.has_existing_security),
          existing_security_details:
            formData.existing_security_details?.trim() || null,
          requires_armed_personnel: Boolean(formData.requires_armed_personnel),
          requires_security_equipment: Boolean(
            formData.requires_security_equipment,
          ),
          equipment_needed: formData.equipment_needed || null,
          risk_level: formData.risk_level,
          previous_incidents: Boolean(formData.previous_incidents),
          incident_details: formData.incident_details?.trim() || null,
          specific_concerns: formData.specific_concerns?.trim() || null,
          special_requirements: formData.special_requirements?.trim() || null,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Send email notification to admin
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/new-security-request`,
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

    revalidatePath("/quote-services/security");
    return { success: true, data };
  } catch (error) {
    console.error("Error submitting security request:", error);
    return {
      success: false,
      error: error.message || "Failed to submit request. Please try again.",
    };
  }
}

export async function getSecurityRequests(userId = null) {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("security_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching security requests:", error);
    return { success: false, error: error.message };
  }
}

export async function updateSecurityRequestWithQuote(requestId, quoteData) {
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
      .from("security_requests")
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
          request_type: "security",
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

    // Generate PDF
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/quotes/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteId: quote.id,
        requestType: "security",
      }),
    });

    // Send quote email to customer
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/quotes/send-quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteId: quote.id,
        requestType: "security",
      }),
    });

    revalidatePath("/admin/security-requests");
    return { success: true, data: { request, quote } };
  } catch (error) {
    console.error("Error updating security request with quote:", error);
    return { success: false, error: error.message };
  }
}
