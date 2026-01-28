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
          service_address: formData.service_address?.trim(),
          landmark: formData.landmark?.trim() || null,
          lga: formData.lga?.trim() || null,
          state: formData.state,
          start_date: formatDate(formData.start_date),
          end_date: formatDate(formData.end_date) || null,
          start_time: formatTime(formData.start_time) || null,
          end_time: formatTime(formData.end_time) || null,
          duration_type: formData.duration_type || null,
          number_of_guards: parseInteger(formData.number_of_guards) || 1,
          guard_type: formData.guard_type || null,
          requires_canine: Boolean(formData.requires_canine),
          requires_vehicle: Boolean(formData.requires_vehicle),
          shift_pattern: formData.shift_pattern || null,
          event_type: formData.event_type?.trim() || null,
          expected_attendance:
            parseInteger(formData.expected_attendance) || null,
          event_duration_hours:
            parseInteger(formData.event_duration_hours) || null,
          vip_protection: Boolean(formData.vip_protection),
          property_type: formData.property_type || null,
          property_size: formData.property_size || null,
          number_of_entrances:
            parseInteger(formData.number_of_entrances) || null,
          has_cctv: Boolean(formData.has_cctv),
          has_alarm_system: Boolean(formData.has_alarm_system),
          risk_level: formData.risk_level || null,
          specific_threats: formData.specific_threats?.trim() || null,
          previous_incidents: Boolean(formData.previous_incidents),
          incident_details: formData.incident_details?.trim() || null,
          requires_background_check: Boolean(
            formData.requires_background_check,
          ),
          requires_uniform: Boolean(formData.requires_uniform),
          requires_communication_device: Boolean(
            formData.requires_communication_device,
          ),
          additional_equipment: formData.additional_equipment?.trim() || null,
          special_instructions: formData.special_instructions?.trim() || null,
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
