"use server";

import { createStaticClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

function getClient() {
  const cookieStore = cookies();
  return createStaticClient(cookieStore);
}

// ─── Dashboard Overview ───────────────────────────────────────────────────────

export async function getDashboardStats(userId) {
  const supabase = await getClient();

  const [
    eventBookings,
    hotelBookings,
    apartmentBookings,
    logisticsRequests,
    securityRequests,
  ] = await Promise.all([
    supabase
      .from("event_bookings")
      .select("id, status, total_amount, created_at")
      .eq("customer_id", userId),
    supabase
      .from("hotel_bookings")
      .select("id, booking_status, payment_status, total_price, created_at")
      .eq("customer_id", userId),
    supabase
      .from("apartment_bookings")
      .select("id, booking_status, payment_status, total_amount, created_at")
      .eq("user_id", userId),
    supabase
      .from("logistics_requests")
      .select("id, status, quoted_amount, created_at")
      .eq("user_id", userId),
    supabase
      .from("security_requests")
      .select("id, status, quoted_amount, created_at")
      .eq("user_id", userId),
  ]);

  const allBookings = [
    ...(eventBookings.data || []).map((b) => ({
      ...b,
      type: "event",
      status: b.status,
      amount: b.total_amount,
    })),
    ...(hotelBookings.data || []).map((b) => ({
      ...b,
      type: "hotel",
      status: b.booking_status,
      amount: b.total_price,
    })),
    ...(apartmentBookings.data || []).map((b) => ({
      ...b,
      type: "apartment",
      status: b.booking_status,
      amount: b.total_amount,
    })),
    ...(logisticsRequests.data || []).map((b) => ({
      ...b,
      type: "logistics",
      status: b.status,
      amount: b.quoted_amount,
    })),
    ...(securityRequests.data || []).map((b) => ({
      ...b,
      type: "security",
      status: b.status,
      amount: b.quoted_amount,
    })),
  ];

  const totalSpend = allBookings
    .filter((b) => ["completed", "checked_out", "paid"].includes(b.status))
    .reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);

  return {
    totalBookings: allBookings.length,
    activeBookings: allBookings.filter((b) =>
      ["confirmed", "pending", "quoted", "in_progress", "checked_in"].includes(
        b.status,
      ),
    ).length,
    completedBookings: allBookings.filter((b) =>
      ["completed", "checked_out"].includes(b.status),
    ).length,
    totalSpend,
    eventCount: eventBookings.data?.length || 0,
    hotelCount: hotelBookings.data?.length || 0,
    apartmentCount: apartmentBookings.data?.length || 0,
    logisticsCount: logisticsRequests.data?.length || 0,
    securityCount: securityRequests.data?.length || 0,
  };
}

export async function getRecentActivity(userId) {
  const supabase = await getClient();

  const [events, hotels, apartments, logistics, security] = await Promise.all([
    supabase
      .from("event_bookings")
      .select(
        `id, status, total_amount, created_at, booking_date, booking_time,
         listing:listing_id(id, title, location, images)`,
      )
      .eq("customer_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("hotel_bookings")
      .select(
        `id, booking_status, payment_status, total_price, created_at, check_in_date, check_out_date,
         hotel:hotel_id(id, name, city, state, images)`,
      )
      .eq("customer_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("apartment_bookings")
      .select(
        `id, booking_status, payment_status, total_amount, created_at, check_in_date, check_out_date,
         apartment:apartment_id(id, name, city, state, images)`,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("logistics_requests")
      .select(
        "id, status, quoted_amount, created_at, service_type, pickup_state, delivery_state",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("security_requests")
      .select("id, status, quoted_amount, created_at, service_type, state")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const combined = [
    ...(events.data || []).map((b) => ({
      id: b.id,
      type: "event",
      title: b.listing?.title || "Event Booking",
      subtitle: b.listing?.location || "",
      status: b.status,
      amount: b.total_amount,
      date: b.booking_date || b.created_at,
      image: b.listing?.images?.[0] || null,
      created_at: b.created_at,
    })),
    ...(hotels.data || []).map((b) => ({
      id: b.id,
      type: "hotel",
      title: b.hotel?.name || "Hotel Booking",
      subtitle: `${b.hotel?.city || ""}, ${b.hotel?.state || ""}`,
      status: b.booking_status,
      amount: b.total_price,
      date: b.check_in_date,
      image: b.hotel?.images?.[0] || null,
      created_at: b.created_at,
    })),
    ...(apartments.data || []).map((b) => ({
      id: b.id,
      type: "apartment",
      title: b.apartment?.name || "Apartment Booking",
      subtitle: `${b.apartment?.city || ""}, ${b.apartment?.state || ""}`,
      status: b.booking_status,
      amount: b.total_amount,
      date: b.check_in_date,
      image: b.apartment?.images?.[0] || null,
      created_at: b.created_at,
    })),
    ...(logistics.data || []).map((b) => ({
      id: b.id,
      type: "logistics",
      title: `${b.service_type?.replace("_", " ")} Delivery`,
      subtitle: `${b.pickup_state} → ${b.delivery_state}`,
      status: b.status,
      amount: b.quoted_amount,
      date: b.created_at,
      image: null,
      created_at: b.created_at,
    })),
    ...(security.data || []).map((b) => ({
      id: b.id,
      type: "security",
      title: `${b.service_type?.replace("_", " ")} Security`,
      subtitle: b.state,
      status: b.status,
      amount: b.quoted_amount,
      date: b.created_at,
      image: null,
      created_at: b.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  return combined;
}

// ─── Event Bookings ───────────────────────────────────────────────────────────

export async function getEventBookings(userId, page = 1, pageSize = 10) {
  const supabase = await getClient();
  const from = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from("event_bookings")
    .select(
      `*, listing:listing_id(id, title, location, images, category, vendor_name)`,
      { count: "exact" },
    )
    .eq("customer_id", userId)
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) throw error;
  return { data: data || [], count: count || 0 };
}

// ─── Hotel Bookings ───────────────────────────────────────────────────────────

export async function getHotelBookings(userId, page = 1, pageSize = 10) {
  const supabase = await getClient();
  const from = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from("hotel_bookings")
    .select(
      `*, hotel:hotel_id(id, name, city, state, images, star_rating),
       room:room_id(id, room_number, floor),
       room_type:room_type_id(id, name, amenities)`,
      { count: "exact" },
    )
    .eq("customer_id", userId)
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) throw error;
  return { data: data || [], count: count || 0 };
}

// ─── Apartment Bookings ───────────────────────────────────────────────────────

export async function getApartmentBookings(userId, page = 1, pageSize = 10) {
  const supabase = await getClient();
  const from = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from("apartment_bookings")
    .select(
      `*, apartment:apartment_id(id, name, city, state, images, apartment_type)`,
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) throw error;
  return { data: data || [], count: count || 0 };
}

// ─── Logistics Requests ───────────────────────────────────────────────────────

export async function getLogisticsRequests(userId, page = 1, pageSize = 10) {
  const supabase = await getClient();
  const from = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from("logistics_requests")
    .select(`*, quote:service_quotes(*)`, { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) throw error;
  return { data: data || [], count: count || 0 };
}

// ─── Security Requests ────────────────────────────────────────────────────────

export async function getSecurityRequests(userId, page = 1, pageSize = 10) {
  const supabase = await getClient();
  const from = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from("security_requests")
    .select(`*, quote:service_quotes(*)`, { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) throw error;
  return { data: data || [], count: count || 0 };
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function getUserProfile(userId) {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, role, created_at")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId, updates) {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("users")
    .update({ name: updates.name, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;

  // Update auth metadata too
  await supabase.auth.updateUser({
    data: { name: updates.name, phone: updates.phone },
  });

  return data;
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function getPaymentHistory(userId, page = 1, pageSize = 20) {
  const supabase = await getClient();
  const from = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from("payments")
    .select("*", { count: "exact" })
    .eq("customer_id", userId)
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) throw error;
  return { data: data || [], count: count || 0 };
}

// ─── Single Booking Details ───────────────────────────────────────────────────

export async function getBookingDetails(type, bookingId, userId) {
  const supabase = await getClient();

  const queries = {
    event: () =>
      supabase
        .from("event_bookings")
        .select(`*, listing:listing_id(*), payment:payments(*)`)
        .eq("id", bookingId)
        .eq("customer_id", userId)
        .single(),

    hotel: () =>
      supabase
        .from("hotel_bookings")
        .select(
          `*, hotel:hotel_id(*), room:room_id(*), room_type:room_type_id(*), payment:payments(*)`,
        )
        .eq("id", bookingId)
        .eq("customer_id", userId)
        .single(),

    apartment: () =>
      supabase
        .from("apartment_bookings")
        .select(`*, apartment:apartment_id(*), payment:payments(*)`)
        .eq("id", bookingId)
        .eq("user_id", userId)
        .single(),

    logistics: () =>
      supabase
        .from("logistics_requests")
        .select(`*, quote:service_quotes(*), payment:payments(*)`)
        .eq("id", bookingId)
        .eq("user_id", userId)
        .single(),

    security: () =>
      supabase
        .from("security_requests")
        .select(`*, quote:service_quotes(*), payment:payments(*)`)
        .eq("id", bookingId)
        .eq("user_id", userId)
        .single(),
  };

  const query = queries[type];
  if (!query) throw new Error("Invalid booking type");

  const { data, error } = await query();
  if (error) throw error;
  return data;
}
