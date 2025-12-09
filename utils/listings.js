// /lib/actions/listings.js
import { supabase } from "@/lib/supabase";

/**
 * Fetch all listings for a specific vendor
 */
export const getVendorListings = async (vendorId) => {
  try {
    const { data, error } = await supabase
      .from("listings")
      .select(
        `
        id,
        title,
        description,
        category,
        price,
        price_unit,
        location,
        media_urls,
        active,
        created_at,
        updated_at,
        capacity,
        bedrooms,
        bathrooms,
        event_type,
        vehicle_type,
        total_tickets,
        remaining_tickets,
        vendors (
          business_name,
          approved
        )
      `
      )
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching vendor listings:", error);
    return { data: null, error };
  }
};

/**
 * Fetch a single listing by ID
 */
export const getListing = async (id) => {
  try {
    const { data, error } = await supabase
      .from("listings")
      .select(
        `
        *,
        vendors (
          business_name,
          approved,
          users (
            name,
            email
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching listing:", error);
    return { data: null, error };
  }
};

/**
 * Delete a listing
 */
export const deleteListing = async (id, vendorId) => {
  try {
    // Verify ownership before deleting
    const { data: listing, error: fetchError } = await supabase
      .from("listings")
      .select("vendor_id")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    if (listing.vendor_id !== vendorId) {
      throw new Error("Unauthorized: You don't own this listing");
    }

    const { error } = await supabase.from("listings").delete().eq("id", id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting listing:", error);
    return { success: false, error };
  }
};

/**
 * Toggle listing active status
 */
export const toggleListingStatus = async (id, vendorId, active) => {
  try {
    const { data, error } = await supabase
      .from("listings")
      .update({ active })
      .eq("id", id)
      .eq("vendor_id", vendorId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error toggling listing status:", error);
    return { data: null, error };
  }
};
