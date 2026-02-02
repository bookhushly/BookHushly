import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
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
      `,
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

// Helper function to generate text from operating hours data
const generateOperatingHoursText = (hoursData) => {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const openDays = days.filter((day) => !hoursData[day]?.closed);
  if (openDays.length === 0) return "Closed";

  // Group consecutive days with same hours
  const grouped = [];
  let currentGroup = null;

  openDays.forEach((day) => {
    const dayHours = hoursData[day];
    const timeString = `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`;
    const dayIndex = days.indexOf(day);

    if (!currentGroup || currentGroup.hours !== timeString) {
      if (currentGroup) grouped.push(currentGroup);
      currentGroup = {
        days: [dayLabels[dayIndex]],
        hours: timeString,
        indices: [dayIndex],
      };
    } else {
      currentGroup.days.push(dayLabels[dayIndex]);
      currentGroup.indices.push(dayIndex);
    }
  });

  if (currentGroup) grouped.push(currentGroup);

  return grouped
    .map((group) => {
      const dayRange =
        group.days.length > 1
          ? `${group.days[0]} - ${group.days[group.days.length - 1]}`
          : group.days[0];
      return `${dayRange}: ${group.hours}`;
    })
    .join(", ");
};

const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const createListing = async (listingData) => {
  try {
    // First get the vendor_id from the user_id
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", listingData.vendor_id)
      .single();

    if (vendorError) throw vendorError;

    // Process operating hours data
    const processOperatingHours = (hoursData) => {
      if (!hoursData || typeof hoursData !== "object") {
        return {
          data: {},
          text: null,
          is24_7: false,
          general_open: null,
          general_close: null,
        };
      }

      const is24_7 = Object.values(hoursData).every(
        (day) =>
          day && !day.closed && day.open === "00:00" && day.close === "23:59",
      );

      const openDays = Object.entries(hoursData).filter(
        ([_, day]) => day && !day.closed,
      );
      let operatingHoursText = null;

      if (is24_7) {
        operatingHoursText = "24/7";
      } else if (openDays.length > 0) {
        operatingHoursText = generateOperatingHoursText(hoursData);
      }

      let general_open = null;
      let general_close = null;

      if (!is24_7 && openDays.length > 0) {
        const firstOpenDay = openDays[0][1];
        general_open = firstOpenDay.open;
        general_close = firstOpenDay.close;
      }

      return {
        data: hoursData,
        text: operatingHoursText,
        is24_7: is24_7,
        general_open: general_open,
        general_close: general_close,
      };
    };

    const operatingHours = processOperatingHours(listingData.operating_hours);

    // Process amenities
    const processedAmenities = Array.isArray(listingData.amenities)
      ? listingData.amenities
      : [];

    // **NEW: Combine event_date and event_time into a proper timestamptz**
    let eventTimestamp = null;
    if (listingData.event_date && listingData.event_time) {
      // Combine date (YYYY-MM-DD) and time (HH:MM) into ISO timestamp
      eventTimestamp = new Date(
        `${listingData.event_date}T${listingData.event_time}:00`,
      ).toISOString();
    }

    const { data, error } = await supabase
      .from("listings")
      .insert({
        // Core required fields
        vendor_id: vendor.id,
        vendor_name: listingData.vendor_name,
        vendor_phone: listingData.vendor_phone,
        title: listingData.title,
        description: listingData.description,
        category: listingData.category,
        price: parseFloat(listingData.price) || 0,
        location: listingData.location,
        capacity: parseInt(listingData.capacity) || null,
        availability: listingData.availability || "available",

        // Operating hours
        operating_hours: operatingHours.text,
        operating_hours_data: operatingHours.data,
        is_24_7: operatingHours.is24_7,
        general_open_time: operatingHours.general_open,
        general_close_time: operatingHours.general_close,

        // Amenities
        amenities: processedAmenities,

        // Basic additional fields
        requirements: listingData.requirements,
        cancellation_policy: listingData.cancellation_policy || [],
        media_urls: listingData.media_urls || [],

        // Conditional fields
        ...(listingData.price_unit && { price_unit: listingData.price_unit }),
        ...(listingData.bedrooms && {
          bedrooms: parseInt(listingData.bedrooms),
        }),
        ...(listingData.bathrooms && {
          bathrooms: parseInt(listingData.bathrooms),
        }),
        ...(listingData.minimum_stay && {
          minimum_stay: listingData.minimum_stay,
        }),
        ...(listingData.security_deposit && {
          security_deposit: parseFloat(listingData.security_deposit),
        }),
        ...(listingData.service_areas && {
          service_areas: listingData.service_areas,
        }),

        // Category-specific data
        category_data: {
          room_type: listingData.room_type || null,
          apartment_types: listingData.apartment_types || null,
          services_included: listingData.services_included || null,
          target_guests: listingData.target_guests || null,
          furnishing: listingData.furnishing || null,
          kitchen_facilities: listingData.kitchen_facilities || null,
          payment_terms: listingData.payment_terms || null,
          cuisine_type: listingData.cuisine_type || null,
          service_type: listingData.service_type || null,
          special_diets: listingData.special_diets || null,
          delivery_areas: listingData.delivery_areas || null,
          meals: listingData.meals || null,
          event_types: listingData.event_types || null,
          vehicle_categories: listingData.vehicle_categories || null,
          transmission_types: listingData.transmission_types || null,
          fuel_types: listingData.fuel_types || null,
          rental_duration: listingData.rental_duration || null,
          driver_service: listingData.driver_service || null,
          delivery_pickup: listingData.delivery_pickup || null,
          age_requirement: parseInt(listingData.age_requirement) || null,
          license_requirement: listingData.license_requirement || null,
          insurance_coverage: listingData.insurance_coverage || null,
          fleet_size: parseInt(listingData.fleet_size) || null,
          service_types: listingData.service_types || null,
          vehicle_types: listingData.vehicle_types || null,
          weight_limit: listingData.weight_limit || null,
          delivery_time: listingData.delivery_time || null,
          tracking_available: listingData.tracking_available || null,
          insurance_covered: listingData.insurance_covered || null,
          security_types: listingData.security_types || null,
          team_size: listingData.team_size || null,
          duration: listingData.duration || null,
          certifications: listingData.certifications || null,
          equipment: listingData.equipment || null,
          experience_years: parseInt(listingData.experience_years) || null,
          background_check: listingData.background_check || null,
          response_time: listingData.response_time || null,
        },

        // **FIXED: Events specific fields with proper timestamp**
        ...(listingData.event_type && { event_type: listingData.event_type }),
        ...(listingData.event_date && { event_date: listingData.event_date }),
        ...(eventTimestamp && { event_time: eventTimestamp }), // Use combined timestamp
        ...(listingData.total_tickets && {
          remaining_tickets: parseInt(listingData.total_tickets) || 0,
          total_tickets: parseInt(listingData.total_tickets) || 0,
        }),
        ...(listingData.ticket_packages && {
          ticket_packages: listingData.ticket_packages,
        }),

        // Status fields
        active: listingData.active !== false,

        // Timestamps
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
      `,
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
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
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
      `,
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
      `,
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
        `,
        )
        .eq("customer_id", userId)
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      // Extract unique vendor IDs
      const vendorIds = [
        ...new Set(
          bookingsData
            ?.map((booking) => booking.listings?.vendor_id)
            .filter(Boolean),
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
        `,
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
        `,
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
        `,
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
      `,
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
      `,
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
      `,
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
    `,
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
  reference = null,
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
export async function fetchCategories(options = {}) {
  const {
    selectFields = "*",
    filters = {},
    limit = null,
    orderBy = "created_at",
    asc = true,
  } = options;

  let query = supabase.from("categories").select(selectFields);

  // Apply dynamic filters
  Object.keys(filters).forEach((key) => {
    query = query.eq(key, filters[key]);
  });

  // Apply limit if provided
  if (limit) query = query.limit(limit);

  // Sorting
  if (orderBy) query = query.order(orderBy, { ascending: asc });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching categories:", error);
    return null;
  }

  return data;
}
