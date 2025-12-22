// lib/utils/search-filters.js

/**
 * Search filter utilities for Hotels, Serviced Apartments, and Events
 * Optimized for speed and performance with indexed queries
 */

import { createClient } from "@/lib/supabase/client";

/**
 * Normalize hotel data to match card expectations
 */
const normalizeHotelForCard = (hotel) => ({
  id: hotel.id,
  title: hotel.name,
  location:
    `${hotel.city || ""}${hotel.city && hotel.state ? ", " : ""}${hotel.state || ""}`.trim() ||
    hotel.address ||
    "Location not specified",
  price: hotel.min_price || 0,
  max_price: hotel.max_price || hotel.min_price || 0,
  media_urls: hotel.image_urls || [],
  category: "hotels",
  vendor_name: hotel.name,
  description: hotel.description,
  amenities: hotel.amenities,
  // Hotel-specific fields for HotelCard
  city: hotel.city,
  state: hotel.state,
  address: hotel.address,
  checkout_policy: hotel.checkout_policy,
  policies: hotel.policies,
  total_rooms: hotel.total_rooms || 0,
  available_rooms: hotel.available_rooms || 0,
  room_types_count: hotel.room_types_count || 0,
});

/**
 * Normalize apartment data to match card expectations
 */
const normalizeApartmentForCard = (apartment) => ({
  id: apartment.id,
  title: apartment.name,
  location:
    `${apartment.city || ""}${apartment.city && apartment.state ? ", " : ""}${apartment.state || ""}`.trim() ||
    apartment.address ||
    "Location not specified",
  price: apartment.price_per_night || 0,
  media_urls: apartment.image_urls || [],
  category: "serviced_apartments",
  vendor_name: apartment.name,
  description: apartment.description,
  amenities: apartment.amenities,
  // Apartment-specific fields
  bedrooms: apartment.bedrooms,
  bathrooms: apartment.bathrooms,
  capacity: apartment.max_guests,
  minimum_stay: apartment.minimum_stay,
  price_unit: "per_night",
});

/**
 * Normalize event data to match card expectations
 */
const normalizeEventForCard = (event) => ({
  id: event.id,
  title: event.title,
  location: event.location,
  price: event.price || 0,
  media_urls: event.media_urls || [],
  category: "events",
  vendor_name: event.vendor_name,
  description: event.description,
  amenities: event.amenities,
  // Event-specific fields
  event_type: event.event_type,
  event_date: event.event_date,
  event_time: event.event_time,
  capacity: event.maximum_capacity,
  remaining_tickets: event.remaining_tickets,
  total_tickets: event.total_tickets,
  price_unit: event.price_unit || "fixed",
});

/**
 * Build optimized hotel search query
 */
export async function searchHotels(filters) {
  const {
    location,
    checkIn,
    checkOut,
    guests = { adults: 2, children: 0, rooms: 1 },
    priceRange,
    amenities = [],
  } = filters;

  const supabase = createClient();
  const totalGuests = guests.adults + guests.children;

  try {
    // Base query with indexes: city, state, created_at
    let query = supabase
      .from("hotels")
      .select(
        `
        id,
        name,
        description,
        address,
        city,
        state,
        image_urls,
        amenities,
        checkout_policy,
        policies,
        created_at
      `
      )
      .order("created_at", { ascending: false });

    // Location filter - uses indexed city/state columns
    if (location?.trim()) {
      const searchTerm = `%${location.toLowerCase()}%`;
      query = query.or(
        `city.ilike.${searchTerm},state.ilike.${searchTerm},address.ilike.${searchTerm}`
      );
    }

    // Execute hotel query
    const { data: hotels, error: hotelsError } = await query;

    if (hotelsError) throw hotelsError;
    if (!hotels?.length) return [];

    const hotelIds = hotels.map((h) => h.id);

    // Get room data for pricing and availability
    const { data: roomData } = await supabase
      .from("hotel_rooms")
      .select("hotel_id, price_per_night, status")
      .in("hotel_id", hotelIds);

    // Get room types count
    const { data: roomTypesData } = await supabase
      .from("hotel_room_types")
      .select("hotel_id, id, max_occupancy, base_price")
      .in("hotel_id", hotelIds);

    // Check availability if dates provided
    let bookedRoomIds = new Set();
    if (checkIn && checkOut) {
      const { data: bookings } = await supabase
        .from("hotel_bookings")
        .select("room_id")
        .in("hotel_id", hotelIds)
        .or(`check_in.lte.${checkOut},check_out.gte.${checkIn}`)
        .neq("status", "cancelled");

      bookedRoomIds = new Set(bookings?.map((b) => b.room_id) || []);
    }

    // Aggregate data per hotel
    const hotelDataMap = new Map();

    hotelIds.forEach((id) => {
      hotelDataMap.set(id, {
        total_rooms: 0,
        available_rooms: 0,
        room_types_count: 0,
        min_price: null,
        max_price: null,
        prices: [],
        can_accommodate: false,
      });
    });

    // Process room data
    roomData?.forEach((room) => {
      const hotelData = hotelDataMap.get(room.hotel_id);
      if (hotelData) {
        hotelData.total_rooms++;
        const isBooked = bookedRoomIds.has(room.id);
        if (room.status === "available" && !isBooked) {
          hotelData.available_rooms++;
        }
        if (room.price_per_night) {
          hotelData.prices.push(parseFloat(room.price_per_night));
        }
      }
    });

    // Process room types for capacity and pricing
    roomTypesData?.forEach((roomType) => {
      const hotelData = hotelDataMap.get(roomType.hotel_id);
      if (hotelData) {
        hotelData.room_types_count++;
        if (roomType.max_occupancy >= totalGuests) {
          hotelData.can_accommodate = true;
        }
        if (roomType.base_price) {
          hotelData.prices.push(parseFloat(roomType.base_price));
        }
      }
    });

    // Calculate min/max prices
    hotelDataMap.forEach((data) => {
      if (data.prices.length > 0) {
        data.min_price = Math.min(...data.prices);
        data.max_price = Math.max(...data.prices);
      }
    });

    // Enrich and filter hotels
    const results = hotels
      .map((hotel) => {
        const data = hotelDataMap.get(hotel.id);
        if (!data) return null;

        // Filter out hotels with no available rooms
        if (data.available_rooms === 0) return null;

        // Filter by capacity if guests specified
        if (totalGuests > 0 && !data.can_accommodate) return null;

        // Filter by price range
        if (priceRange) {
          if (
            data.min_price < priceRange.min ||
            data.min_price > priceRange.max
          ) {
            return null;
          }
        }

        return normalizeHotelForCard({
          ...hotel,
          min_price: data.min_price || 0,
          max_price: data.max_price || 0,
          total_rooms: data.total_rooms,
          available_rooms: data.available_rooms,
          room_types_count: data.room_types_count,
        });
      })
      .filter(Boolean);

    return results;
  } catch (error) {
    console.error("Hotel search error:", error);
    throw error;
  }
}

/**
 * Build optimized serviced apartments search query
 */
export async function searchApartments(filters) {
  const {
    location,
    checkIn,
    checkOut,
    guests = { adults: 2, children: 0 },
    priceRange,
    bedrooms,
    amenities = [],
  } = filters;

  const supabase = createClient();
  const totalGuests = guests.adults + guests.children;

  try {
    // Base query - uses indexed columns
    let query = supabase
      .from("serviced_apartments")
      .select("*")
      .eq("status", "active")
      .gte("max_guests", totalGuests)
      .order("created_at", { ascending: false });

    // Location filter
    if (location?.trim()) {
      const searchTerm = `%${location.toLowerCase()}%`;
      query = query.or(
        `city.ilike.${searchTerm},state.ilike.${searchTerm},area.ilike.${searchTerm},landmark.ilike.${searchTerm}`
      );
    }

    // Bedroom filter
    if (bedrooms && bedrooms > 0) {
      query = query.gte("bedrooms", bedrooms);
    }

    // Price range filter
    if (priceRange) {
      query = query.gte("price_per_night", priceRange.min);
      query = query.lte("price_per_night", priceRange.max);
    }

    const { data: apartments, error } = await query;

    if (error) throw error;
    if (!apartments?.length) return [];

    // Check availability if dates provided
    if (checkIn && checkOut) {
      const apartmentIds = apartments.map((a) => a.id);

      const { data: bookings } = await supabase
        .from("apartment_bookings")
        .select("apartment_id")
        .in("apartment_id", apartmentIds)
        .or(`check_in.lte.${checkOut},check_out.gte.${checkIn}`)
        .neq("status", "cancelled");

      const bookedIds = new Set(bookings?.map((b) => b.apartment_id) || []);

      return apartments
        .filter((apt) => !bookedIds.has(apt.id))
        .map(normalizeApartmentForCard);
    }

    return apartments.map(normalizeApartmentForCard);
  } catch (error) {
    console.error("Apartment search error:", error);
    throw error;
  }
}

/**
 * Build optimized events search query
 */
export async function searchEvents(filters) {
  const {
    location,
    eventDate,
    guests = { adults: 0, children: 0 },
    priceRange,
    eventType,
  } = filters;

  const supabase = createClient();
  const totalAttendees = guests.adults + guests.children;

  try {
    let query = supabase
      .from("listings")
      .select("*")
      .eq("category", "events")
      .eq("active", true)
      .order("event_date", { ascending: true });

    // Event type filter
    if (eventType) {
      query = query.eq("event_type", eventType);
    }

    // Location filter
    if (location?.trim()) {
      const searchTerm = `%${location.toLowerCase()}%`;
      query = query.ilike("location", searchTerm);
    }

    // Date filter
    if (eventDate) {
      const startOfDay = new Date(eventDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(eventDate);
      endOfDay.setHours(23, 59, 59, 999);

      query = query.gte("event_date", startOfDay.toISOString());
      query = query.lte("event_date", endOfDay.toISOString());
    } else {
      // Only show future events
      query = query.gte("event_date", new Date().toISOString());
    }

    // Capacity filter
    if (totalAttendees > 0) {
      query = query.gte("maximum_capacity", totalAttendees);
    }

    // Price range filter
    if (priceRange) {
      query = query.gte("price", priceRange.min);
      query = query.lte("price", priceRange.max);
    }

    const { data: events, error } = await query;

    if (error) throw error;

    // Filter by remaining tickets
    const filteredEvents =
      events?.filter((event) => {
        if (event.event_type === "event_center") return true;
        return event.remaining_tickets > 0;
      }) || [];

    return filteredEvents.map(normalizeEventForCard);
  } catch (error) {
    console.error("Event search error:", error);
    throw error;
  }
}

/**
 * Master search function that routes to appropriate category search
 */
export async function performSearch(category, filters) {
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, "_");

  switch (normalizedCategory) {
    case "hotels":
      return searchHotels(filters);

    case "serviced_apartments":
    case "serviced_apartments":
      return searchApartments(filters);

    case "events":
      return searchEvents(filters);

    default:
      throw new Error(`Unsupported category: ${category}`);
  }
}

/**
 * Get filter suggestions for autocomplete
 */
export async function getFilterSuggestions(category, field, query) {
  const supabase = createClient();
  const searchTerm = `${query}%`;

  try {
    switch (category.toLowerCase()) {
      case "hotels": {
        const { data } = await supabase
          .from("hotels")
          .select(field)
          .ilike(field, searchTerm)
          .limit(5);
        return [...new Set(data?.map((d) => d[field]).filter(Boolean))];
      }

      case "serviced_apartments": {
        const { data } = await supabase
          .from("serviced_apartments")
          .select(field)
          .ilike(field, searchTerm)
          .eq("status", "active")
          .limit(5);
        return [...new Set(data?.map((d) => d[field]).filter(Boolean))];
      }

      case "events": {
        const { data } = await supabase
          .from("listings")
          .select("location")
          .eq("category", "events")
          .eq("active", true)
          .ilike("location", searchTerm)
          .limit(5);
        return [...new Set(data?.map((d) => d.location).filter(Boolean))];
      }

      default:
        return [];
    }
  } catch (error) {
    console.error("Suggestion fetch error:", error);
    return [];
  }
}
