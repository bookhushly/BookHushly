"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

async function verifyCAC(registrationNumber) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/verify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cac",
          value: registrationNumber,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || "CAC verification failed",
      };
    }

    const result = await response.json();

    if (!result.valid) {
      return {
        success: false,
        error: result.error || "CAC verification failed",
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("CAC verification error:", error);
    return { success: false, error: error.message };
  }
}

async function verifyNIN(nin, firstName, lastName) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/verify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "nin",
          value: nin,
          firstname: firstName,
          lastname: lastName,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || "NIN verification failed",
      };
    }

    const result = await response.json();

    if (!result.valid) {
      return {
        success: false,
        error: result.error || "NIN verification failed",
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("NIN verification error:", error);
    return { success: false, error: error.message };
  }
}

async function sendKYCNotificationEmail(formData, user, verificationResults) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "aboderindaniel482@gmail.com",
        templateName: "kycSubmissionNotice",
        data: {
          vendorName: formData.business_name || "New Vendor",
          businessName: formData.business_name || "Not provided",
          businessCategory: formData.business_category,
          email: user.email || "Not provided",
          phone: formData.phone_number || "Not provided",
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/`,
          cacVerified: verificationResults.cac_verified ? "Yes" : "No",
          ninVerified: verificationResults.nin_verified ? "Yes" : "No",
          dlVerified: verificationResults.dl_verified ? "Yes" : "No",
        },
      }),
    });
  } catch (error) {
    console.error("Email notification error:", error);
  }
}

export async function submitKYC(formData, existingProfileId = null) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required. Please log in again.",
      };
    }

    const verificationResults = {};

    // Verify CAC if provided
    if (formData.business_registration_number) {
      const cacResult = await verifyCAC(formData.business_registration_number);

      if (!cacResult.success) {
        return {
          success: false,
          error: `CAC Verification Failed: ${cacResult.error}`,
        };
      }

      verificationResults.cac_verified = true;
      verificationResults.cac_data = cacResult.data;
    }

    // Verify NIN if provided
    if (formData.nin) {
      const ninResult = await verifyNIN(
        formData.nin,
        formData.nin_first_name,
        formData.nin_last_name
      );

      if (!ninResult.success) {
        return {
          success: false,
          error: `NIN Verification Failed: ${ninResult.error}`,
        };
      }

      verificationResults.nin_verified = true;
      verificationResults.nin_data = ninResult.data;
    }

    // Prepare profile data
    const profileData = {
      user_id: user.id,
      business_name: formData.business_name,
      business_description: formData.business_description,
      business_address: formData.business_address,
      phone_number: formData.phone_number,
      business_registration_number:
        formData.business_registration_number || null,
      nin: formData.nin || null,
      nin_first_name: formData.nin_first_name || null,
      nin_last_name: formData.nin_last_name || null,
      drivers_license: formData.drivers_license || null,
      tax_identification_number: formData.tax_identification_number || null,
      bank_account_name: formData.bank_account_name || null,
      bank_account_number: formData.bank_account_number || null,
      bank_name: formData.bank_name || null,
      business_category: formData.business_category,
      years_in_operation: formData.years_in_operation
        ? Number(formData.years_in_operation)
        : null,
      website_url: formData.website_url || null,
      category_data: verificationResults,
      approved: false,
      status: "reviewing",
    };

    let result;

    if (existingProfileId) {
      const { data, error } = await supabase
        .from("vendors")
        .update(profileData)
        .eq("id", existingProfileId)
        .select()
        .single();

      result = { data, error };
    } else {
      const { data, error } = await supabase
        .from("vendors")
        .insert(profileData)
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      console.error("Database error:", result.error);
      return {
        success: false,
        error: result.error.message || "Failed to save profile",
      };
    }

    if (!result.data) {
      return {
        success: false,
        error: "Profile save returned no data",
      };
    }

    // Send notification email (non-blocking)
    sendKYCNotificationEmail(formData, user, verificationResults).catch(
      console.error
    );

    return {
      success: true,
      data: result.data,
      message: existingProfileId
        ? "KYC updated successfully! Your profile is under review."
        : "KYC submitted successfully! Your profile is under review. You'll be notified once approved.",
    };
  } catch (error) {
    console.error("Unexpected KYC submission error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}
