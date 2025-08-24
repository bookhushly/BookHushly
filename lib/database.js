import { supabase } from "./supabase";

// User operations
export const createUserProfile = async (userData) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .upsert({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        created_at: userData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Create user profile error:", error);
    return { data: null, error };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Vendor operations
export const createVendorProfile = async (vendorData) => {
  try {
    const session = await supabase.auth.getSession();
    const accessToken = session.data?.session?.access_token;
    console.log("🔐 Access token used:", accessToken);

    const { data, error } = await supabase
      .from("vendors")
      .insert({
        user_id: vendorData.user_id,
        business_name: vendorData.business_name,
        business_description: vendorData.business_description,
        business_address: vendorData.business_address,
        phone_number: vendorData.phone_number,
        business_registration_number: vendorData.business_registration_number,
        tax_identification_number: vendorData.tax_identification_number,
        bank_account_name: vendorData.bank_account_name,
        bank_account_number: vendorData.bank_account_number,
        bank_name: vendorData.bank_name,
        business_category: vendorData.business_category,
        years_in_operation: vendorData.years_in_operation,
        website_url: vendorData.website_url,
        approved: false,
        status: "reviewing",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (error) throw error;

    // Send KYC submission notice email to admin
    try {
      const emailResponse = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to:
            process.env.NEXT_PUBLIC_KYC_ADMIN_EMAIL ||
            "aboderindaniel482@gmail.com",
          templateName: "kycSubmissionNotice",
          data: {
            vendorName: vendorData.business_name,

            phone: vendorData.phone_number,
            businessName: vendorData.business_name,
            dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/admin/kyc`,
          },
        }),
      });

      const emailResult = await emailResponse.json();

      if (!emailResponse.ok || !emailResult.success) {
        console.warn("Failed to send KYC submission email:", emailResult.error);
      }
    } catch (emailErr) {
      console.error("Email dispatch error:", emailErr);
    }

    return { data, error: null };
  } catch (error) {
    console.error("Create vendor profile error:", error);
    return { data: null, error };
  }
};

export const getVendorProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("vendors")
      .select(
        `
        *,
        users (
          name,
          email
        )
      `
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Get vendor profile error:", error);
    return { data: null, error };
  }
};

export const updateVendorProfile = async (vendorId, updates) => {
  try {
    const { data, error } = await supabase
      .from("vendors")
      .update(updates)
      .eq("id", vendorId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Listing operations
export const createListing = async (listingData) => {
  try {
    // First get the vendor_id from the user_id
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", listingData.vendor_id)
      .single();

    if (vendorError) throw vendorError;

    const { data, error } = await supabase
      .from("listings")
      .insert({
        vendor_id: vendor.id,
        vendor_name: listingData.vendor_name,
        vendor_phone: listingData.vendor_phone,
        title: listingData.title,
        description: listingData.description,
        category: listingData.category,
        price: listingData.price,
        location: listingData.location,
        capacity: listingData.capacity,
        duration: listingData.duration,
        availability: listingData.availability,
        features: listingData.features,
        requirements: listingData.requirements,
        cancellation_policy: listingData.cancellation_policy,
        media_urls: listingData.media_urls || [],
        active: listingData.active !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Create listing error:", error);
    return { data: null, error };
  }
};

export const getListings = async (filters = {}) => {
  try {
    let query = supabase
      .from("listings")
      .select(
        `
        *,
        vendors (
          id,
          business_name,
          approved,
          users (
            name,
            email
          )
        )
      `
      )
      .eq("active", true);

    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    if (filters.vendorId) {
      // Get vendor record first
      const { data: vendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", filters.vendorId)
        .single();

      if (vendor) {
        query = query.eq("vendor_id", vendor.id);
      }
    }

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Get listings error:", error);
    return { data: null, error };
  }
};

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
    return { data: null, error };
  }
};

export const updateListing = async (listingId, updates) => {
  try {
    const { data, error } = await supabase
      .from("listings")
      .update(updates)
      .eq("id", listingId)
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
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Update listing error:", error);
    return { data: null, error };
  }
};

// Booking operations
export const createBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        listing_id: bookingData.listing_id,
        customer_id: bookingData.customer_id,
        booking_date: bookingData.booking_date,
        booking_time: bookingData.booking_time,
        guests: bookingData.guests,
        payment_reference: "",
        duration: bookingData.duration,
        special_requests: bookingData.special_requests,
        contact_phone: bookingData.contact_phone,
        contact_email: bookingData.contact_email,
        total_amount: bookingData.total_amount,
        status: "pending",
        payment_status: "pending",

        payment_reference: bookingData.payment_reference || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Create booking error:", error);
    return { data: null, error };
  }
};

export const getBookings = async (userId, role) => {
  try {
    if (role === "customer") {
      // Fetch bookings for the customer
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(
          `
          id,
          listing_id,
          booking_date,
          booking_time,
          guests,
          duration,
          special_requests,
          contact_phone,
          contact_email,
          total_amount,
          status,
          payment_status,
          created_at,
          payment_reference,
          updated_at,
          listings (
            *
          )
        `
        )
        .eq("customer_id", userId)
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      // Extract unique vendor IDs
      const vendorIds = [
        ...new Set(
          bookingsData
            ?.map((booking) => booking.listings?.vendor_id)
            .filter(Boolean)
        ),
      ];

      if (vendorIds.length === 0) {
        return { data: bookingsData, error: null };
      }

      // Get vendor details with user info
      const { data: vendorsData, error: vendorsError } = await supabase
        .from("vendors")
        .select(
          `
          id,
          business_name,
          business_description,
          phone_number,
          user_id,
          users (
            name,
            email
          )
        `
        )
        .in("id", vendorIds);

      if (vendorsError) throw vendorsError;

      // Create vendor lookup map for efficiency
      const vendorMap =
        vendorsData?.reduce((acc, vendor) => {
          acc[vendor.id] = vendor;
          return acc;
        }, {}) || {};

      // Enrich bookings with vendor data
      const enrichedBookings = bookingsData.map((booking) => ({
        ...booking,
        listings: {
          ...booking.listings,
          vendors: vendorMap[booking.listings?.vendor_id] || null,
        },
      }));

      return { data: enrichedBookings, error: null };
    } else if (role === "vendor") {
      // Get vendor record first
      const { data: vendor, error: vendorError } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (vendorError || !vendor) {
        console.error("Vendor not found or error:", vendorError);
        return { data: [], error: null };
      }

      console.log("Vendor ID:", vendor.id);

      // Get listing IDs for the vendor
      const { data: listings, error: listingsError } = await supabase
        .from("listings")
        .select("id")
        .eq("vendor_id", vendor.id);

      if (listingsError) {
        console.error("Listings error:", listingsError);
        throw listingsError;
      }

      const listingIds = listings.map((listing) => listing.id);

      if (listingIds.length === 0) {
        console.log("No listings found for vendor:", vendor.id);
        return { data: [], error: null };
      }

      // Get bookings for the vendor's listings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(
          `
          id,
          listing_id,
          booking_date,
          booking_time,
          guests,
          duration,
          special_requests,
          contact_phone,
          contact_email,
          total_amount,
          status,
          payment_status,
          created_at,
          updated_at,
          listings (
            title,
            category,
            price,
            vendor_id
          )
        `
        )
        .in("listing_id", listingIds)
        .order("created_at", { ascending: false });

      if (bookingsError) {
        console.error("Bookings error:", bookingsError);
        throw bookingsError;
      }

      console.log("Bookings data:", bookingsData);

      // Get vendor details with user info
      const { data: vendorData, error: vendorDetailsError } = await supabase
        .from("vendors")
        .select(
          `
          id,
          business_name,
          business_description,
          phone_number,
          user_id,
          users (
            name,
            email
          )
        `
        )
        .eq("id", vendor.id)
        .single();

      if (vendorDetailsError) {
        console.error("Vendor details error:", vendorDetailsError);
        throw vendorDetailsError;
      }

      console.log("Vendor data:", vendorData);

      // Enrich bookings with vendor data
      const enrichedBookings = bookingsData.map((booking) => ({
        ...booking,
        listings: {
          ...booking.listings,
          vendors: vendorData,
        },
      }));

      return { data: enrichedBookings, error: null };
    }

    return { data: [], error: null };
  } catch (error) {
    console.error("Get bookings error:", error);
    return { data: null, error };
  }
};

export const updateBookingStatus = async (bookingId, status) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Review operations
export const createReview = async (reviewData) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .insert(reviewData)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getReviews = async (listingId) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        users (
          name
        )
      `
      )
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Notification operations
export const createNotification = async (notificationData) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: notificationData.user_id,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || "info",
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Create notification error:", error);
    return { data: null, error };
  }
};

export const getNotifications = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Get notifications error:", error);
    return { data: null, error };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
// Admin operations
export const getAdminStats = async () => {
  try {
    const { data, error } = await supabase.rpc("get_admin_stats");

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Get admin stats error:", error);
    // Fallback to mock data if function fails
    const stats = {
      totalUsers: 0,
      totalVendors: 0,
      totalBookings: 0,
      totalRevenue: 0,
      pendingApprovals: 0,
      activeListings: 0,
      monthlyGrowth: 0,
      conversionRate: 0,
    };
    return { data: stats, error: null };
  }
};

export const getPendingVendors = async () => {
  try {
    const { data, error } = await supabase
      .from("vendors")
      .select(
        `
        *,
        users (
          name,
          email
        )
      `
      )
      .eq("approved", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Get pending vendors error:", error);
    return { data: null, error };
  }
};

export const approveVendor = async (vendorId, approved) => {
  try {
    const { data, error } = await supabase
      .from("vendors")
      .update({
        approved,
        status: "approved",
        approved_at: approved ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vendorId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Approve vendor error:", error);
    return { data: null, error };
  }
};

export const getAllUsers = async (options = {}) => {
  try {
    let query = supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getAllBookings = async (options = {}) => {
  try {
    let query = supabase
      .from("bookings")
      .select(
        `
        *,
        listings (
          title,
          category,
          vendors (
            business_name
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const sendNotification = async (notificationData) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        ...notificationData,
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Payment operations
export const getBooking = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
    *,
    listings (
      *
    )
    `
      )
      .eq("id", bookingId)
      .single();

    console.error("Booking data:", data);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updatePaymentStatus = async (
  bookingId,
  paymentStatus,
  reference = null
) => {
  try {
    const updates = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    };

    if (reference) {
      updates.payment_reference = reference;
    }

    if (paymentStatus === "completed") {
      updates.status = "confirmed"; // Auto-confirm booking when payment is completed
    }

    const { data, error } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", bookingId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
