import { createClient } from "../lib/supabase/client";

export const BOOKING_TYPES = {
  EVENT: "event",
  HOTEL: "hotel",
  APARTMENT: "apartment",
  CAR_RENTAL: "car_rental",
  LOGISTICS: "logistics",
  SECURITY: "security",
};

const BOOKING_CONFIG = {
  [BOOKING_TYPES.EVENT]: {
    table: "event_bookings",
    relations: `
      id, listing_id, ticket_details, guests, total_amount, booking_date, booking_time,
      status, payment_status, contact_email, contact_phone,
      listing:listings (
        title, event_date, location, vendor_name, vendor_phone, ticket_packages, media_urls
      )
    `,
    ticketGenerator: true,
  },
  [BOOKING_TYPES.HOTEL]: {
    table: "hotel_bookings",
    relations: `
      id, hotel_id, room_id, room_type_id, guest_name, guest_email, guest_phone,
      check_in_date, check_out_date, adults, children, total_price,
      payment_status, booking_status, special_requests,
      hotel:hotels (
        id, name, city, state, image_urls, checkout_policy, policies
      ),
      room_type:hotel_room_types (
        id, name, base_price, max_occupancy, size_sqm, image_urls
      ),
      room:hotel_rooms (
        id, room_number
      )
    `,
    ticketGenerator: false,
  },
  [BOOKING_TYPES.APARTMENT]: {
    table: "apartment_bookings",
    relations: `
      id, apartment_id, guest_name, guest_email, guest_phone,
      check_in_date, check_out_date, guests, total_price,
      payment_status, booking_status, special_requests,
      apartment:apartments (
        id, name, city, state, image_urls, checkout_policy, policies
      )
    `,
    ticketGenerator: false,
  },
};

/**
 * Detect booking type from URL parameters or booking ID
 */
export const detectBookingType = (searchParams) => {
  const typeParam = searchParams?.get("type");
  if (typeParam && Object.values(BOOKING_TYPES).includes(typeParam)) {
    return typeParam;
  }
  return BOOKING_TYPES.EVENT; // Default
};

/**
 * Fetch booking data based on type
 */
export const fetchBooking = async (bookingId, bookingType) => {
  const supabase = createClient();
  const config = BOOKING_CONFIG[bookingType];

  if (!config) {
    throw new Error(`Invalid booking type: ${bookingType}`);
  }

  const { data, error } = await supabase
    .from(config.table)
    .select(config.relations)
    .eq("id", bookingId)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Booking not found");

  return data;
};

/**
 * Get payment record for a booking
 */
export const fetchPayment = async (bookingId, bookingType) => {
  const supabase = createClient();

  const foreignKeyMap = {
    [BOOKING_TYPES.EVENT]: "event_booking_id",
    [BOOKING_TYPES.HOTEL]: "hotel_booking_id",
    [BOOKING_TYPES.APARTMENT]: "apartment_booking_id",
  };

  const foreignKey = foreignKeyMap[bookingType];
  if (!foreignKey) {
    throw new Error(`No payment mapping for booking type: ${bookingType}`);
  }

  const { data, error } = await supabase
    .from("payments")
    .select(
      "reference, status, provider, vendor_amount, admin_amount, vendor_currency"
    )
    .eq(foreignKey, bookingId)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Payment record not found");

  return data;
};

/**
 * Update booking status after payment verification
 */
export const updateBookingStatus = async (bookingId, bookingType, status) => {
  const supabase = createClient();
  const config = BOOKING_CONFIG[bookingType];

  const updatePayload = {
    payment_status: "completed",
    ...(status && { status }),
  };
  console.log("update payload is", updatePayload);
  const { error } = await supabase
    .from(config.table)
    .update(updatePayload)
    .eq("id", bookingId);

  if (error) throw error;
};

/**
 * Check if booking type supports ticket generation
 */
export const supportsTickets = (bookingType) => {
  return BOOKING_CONFIG[bookingType]?.ticketGenerator || false;
};

/**
 * Get booking type display name
 */
export const getBookingTypeName = (bookingType) => {
  const names = {
    [BOOKING_TYPES.EVENT]: "Event",
    [BOOKING_TYPES.HOTEL]: "Hotel",
    [BOOKING_TYPES.APARTMENT]: "Apartment",
    [BOOKING_TYPES.CAR_RENTAL]: "Car Rental",
    [BOOKING_TYPES.LOGISTICS]: "Logistics",
    [BOOKING_TYPES.SECURITY]: "Security",
  };
  return names[bookingType] || "Booking";
};

/**
 * Validate booking data based on type
 */
export const validateBookingData = (booking, bookingType) => {
  switch (bookingType) {
    case BOOKING_TYPES.EVENT:
      const ticketDetails = booking.ticket_details
        ? JSON.parse(booking.ticket_details)
        : {};
      const totalTickets = Object.values(ticketDetails).reduce(
        (sum, qty) => sum + Number(qty || 0),
        0
      );
      if (totalTickets !== booking.guests) {
        throw new Error("Ticket details do not match number of guests");
      }
      break;

    case BOOKING_TYPES.HOTEL:
      if (!booking.check_in_date || !booking.check_out_date) {
        throw new Error("Missing check-in or check-out dates");
      }
      break;

    case BOOKING_TYPES.APARTMENT:
      if (!booking.check_in_date || !booking.check_out_date) {
        throw new Error("Missing check-in or check-out dates");
      }
      break;

    default:
      break;
  }

  return true;
};
