import { createClient } from "@/lib/supabase/client";

// ==================== IMAGE UPLOAD ====================

export async function uploadHotelImages(files, vendorId, category = "general") {
  if (!files || files.length === 0) return [];

  const supabase = createClient();
  const uploadPromises = files.map(async (file) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${vendorId}/${category}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("hotel-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("hotel-images").getPublicUrl(fileName);

    return publicUrl;
  });

  const results = await Promise.all(uploadPromises);
  return results.filter((url) => url !== null);
}

export async function deleteHotelImage(imageUrl) {
  if (!imageUrl) return { error: "No URL provided" };

  const supabase = createClient();
  const urlParts = imageUrl.split("/hotel-images/");

  if (urlParts.length !== 2) return { error: "Invalid URL" };

  const filePath = urlParts[1];
  const { error } = await supabase.storage
    .from("hotel-images")
    .remove([filePath]);

  return { error };
}

// ==================== HOTEL CRUD ====================

export async function createHotel(hotelData) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("hotels")
    .insert({
      vendor_id: hotelData.vendor_id,
      name: hotelData.name,
      description: hotelData.description,
      address: hotelData.address,
      city: hotelData.city,
      state: hotelData.state,
      image_urls: hotelData.image_urls || [],
      amenities: hotelData.amenities || {},
      checkout_policy: hotelData.checkout_policy,
      policies: hotelData.policies,
    })
    .select()
    .single();

  return { data, error };
}

export async function getVendorHotels(vendorId) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getHotelById(hotelId) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("id", hotelId)
    .single();

  return { data, error };
}

export async function updateHotel(hotelId, updates) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("hotels")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", hotelId)
    .select()
    .single();

  return { data, error };
}

// ==================== ROOM TYPE CRUD ====================

export async function createRoomType(roomTypeData) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("hotel_room_types")
    .insert({
      hotel_id: roomTypeData.hotel_id,
      name: roomTypeData.name,
      description: roomTypeData.description,
      max_occupancy: roomTypeData.max_occupancy,
      base_price: roomTypeData.base_price,
      size_sqm: roomTypeData.size_sqm,
      amenities: roomTypeData.amenities || [],
      image_urls: roomTypeData.image_urls || [],
    })
    .select()
    .single();

  return { data, error };
}

export async function getHotelRoomTypes(hotelId) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("hotel_room_types")
    .select("*")
    .eq("hotel_id", hotelId)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function updateRoomType(roomTypeId, updates) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("hotel_room_types")
    .update(updates)
    .eq("id", roomTypeId)
    .select()
    .single();

  return { data, error };
}

export async function deleteRoomType(roomTypeId) {
  const supabase = createClient();

  const { error } = await supabase
    .from("hotel_room_types")
    .delete()
    .eq("id", roomTypeId);

  return { error };
}

// ==================== ROOM CRUD ====================

export async function createRoom(roomData) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("hotel_rooms")
    .insert({
      hotel_id: roomData.hotel_id,
      room_type_id: roomData.room_type_id,
      room_number: roomData.room_number,
      floor: roomData.floor,
      beds: roomData.beds,
      status: roomData.status || "available",
      price_per_night: roomData.price_per_night,
      amenities: roomData.amenities || [],
      image_urls: roomData.image_urls || [],
      notes: roomData.notes,
    })
    .select()
    .single();

  return { data, error };
}

export async function bulkCreateRooms(roomsData) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("hotel_rooms")
    .insert(roomsData)
    .select();

  return { data, error };
}

export async function getHotelRooms(hotelId, filters = {}) {
  const supabase = createClient();

  let query = supabase
    .from("hotel_rooms")
    .select(
      `
      *,
      room_type:hotel_room_types(*)
    `
    )
    .eq("hotel_id", hotelId);

  if (filters.floor) {
    query = query.eq("floor", filters.floor);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.room_type_id) {
    query = query.eq("room_type_id", filters.room_type_id);
  }

  query = query
    .order("floor", { ascending: true })
    .order("room_number", { ascending: true });

  const { data, error } = await query;

  return { data, error };
}

export async function getRoomById(roomId) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("hotel_rooms")
    .select(
      `
      *,
      room_type:hotel_room_types(*)
    `
    )
    .eq("id", roomId)
    .single();

  return { data, error };
}

export async function updateRoom(roomId, updates) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("hotel_rooms")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", roomId)
    .select()
    .single();

  return { data, error };
}

export async function updateRoomStatus(roomId, status, notes = null) {
  const updates = { status };
  if (notes) updates.notes = notes;
  if (status === "available")
    updates.last_cleaned_at = new Date().toISOString();

  return updateRoom(roomId, updates);
}

export async function deleteRoom(roomId) {
  const supabase = createClient();

  const { error } = await supabase
    .from("hotel_rooms")
    .delete()
    .eq("id", roomId);

  return { error };
}

// ==================== AVAILABILITY CHECK ====================

export async function checkRoomAvailability(
  hotelId,
  checkIn,
  checkOut,
  roomTypeId = null
) {
  const supabase = createClient();

  // Get all rooms for the hotel (or specific room type)
  let roomsQuery = supabase
    .from("hotel_rooms")
    .select("id, room_number, floor, status, price_per_night, room_type_id")
    .eq("hotel_id", hotelId)
    .eq("status", "available");

  if (roomTypeId) {
    roomsQuery = roomsQuery.eq("room_type_id", roomTypeId);
  }

  const { data: rooms, error: roomsError } = await roomsQuery;

  if (roomsError) return { data: null, error: roomsError };

  // Get all bookings that overlap with the requested dates
  const { data: bookings, error: bookingsError } = await supabase
    .from("hotel_bookings")
    .select("room_id")
    .eq("hotel_id", hotelId)
    .not("booking_status", "in", '("cancelled")')
    .or(`and(check_in_date.lte.${checkOut},check_out_date.gte.${checkIn})`);

  if (bookingsError) return { data: null, error: bookingsError };

  // Filter out booked rooms
  const bookedRoomIds = new Set(bookings.map((b) => b.room_id));
  const availableRooms = rooms.filter((room) => !bookedRoomIds.has(room.id));

  return { data: availableRooms, error: null };
}

// ==================== STATS & ANALYTICS ====================

export async function getHotelStats(hotelId) {
  const supabase = createClient();

  // Get room counts by status
  const { data: rooms } = await supabase
    .from("hotel_rooms")
    .select("status")
    .eq("hotel_id", hotelId);

  // Get booking stats
  const { data: bookings } = await supabase
    .from("hotel_bookings")
    .select("booking_status, payment_status, total_price")
    .eq("hotel_id", hotelId);

  const stats = {
    totalRooms: rooms?.length || 0,
    available: rooms?.filter((r) => r.status === "available").length || 0,
    occupied: rooms?.filter((r) => r.status === "occupied").length || 0,
    reserved: rooms?.filter((r) => r.status === "reserved").length || 0,
    dirty: rooms?.filter((r) => r.status === "dirty").length || 0,
    outOfService:
      rooms?.filter((r) => r.status === "out_of_service").length || 0,
    underMaintenance:
      rooms?.filter((r) => r.status === "under_maintenance").length || 0,
    totalBookings: bookings?.length || 0,
    confirmedBookings:
      bookings?.filter((b) => b.booking_status === "confirmed").length || 0,
    checkedIn:
      bookings?.filter((b) => b.booking_status === "checked_in").length || 0,
    totalRevenue:
      bookings
        ?.filter((b) => b.payment_status === "paid")
        .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0) || 0,
  };

  return stats;
}

// ==================== ROOM NUMBER GENERATOR ====================

export function generateRoomNumbers(floor, count, startNumber = 1) {
  const rooms = [];
  for (let i = 0; i < count; i++) {
    const roomNum =
      String(floor).padStart(1, "0") + String(startNumber + i).padStart(2, "0");
    rooms.push(roomNum);
  }
  return rooms;
}

// ==================== BED CONFIGURATIONS ====================

export const BED_TYPES = [
  { value: "single", label: "Single", icon: "bed-single" },
  { value: "double", label: "Double", icon: "bed-double" },
  { value: "queen", label: "Queen", icon: "bed" },
  { value: "king", label: "King", icon: "bed" },
];

// ==================== AMENITY ICONS ====================

export const AMENITY_ICONS = [
  { value: "wifi", label: "WiFi", icon: "wifi" },
  { value: "air-vent", label: "Air Conditioning", icon: "air-vent" },
  { value: "tv", label: "TV", icon: "tv" },
  { value: "coffee", label: "Coffee Maker", icon: "coffee" },
  { value: "bath", label: "Bathtub", icon: "bath" },
  { value: "refrigerator", label: "Mini Fridge", icon: "refrigerator" },
  { value: "utensils", label: "Room Service", icon: "utensils" },
  { value: "dumbbell", label: "Gym Access", icon: "dumbbell" },
  { value: "waves", label: "Pool Access", icon: "waves" },
  { value: "car", label: "Parking", icon: "car" },
  { value: "shirt", label: "Laundry", icon: "shirt" },
  { value: "briefcase", label: "Work Desk", icon: "briefcase" },
  { value: "shield-check", label: "Safe", icon: "shield-check" },
  { value: "phone", label: "Phone", icon: "phone" },
  { value: "wind", label: "Balcony", icon: "wind" },
  { value: "droplet", label: "Hot Water", icon: "droplet" },
];

export const ROOM_STATUSES = [
  { value: "available", label: "Available", color: "bg-green-500" },
  { value: "occupied", label: "Occupied", color: "bg-blue-500" },
  { value: "reserved", label: "Reserved", color: "bg-purple-500" },
  { value: "dirty", label: "Dirty", color: "bg-yellow-500" },
  { value: "out_of_service", label: "Out of Service", color: "bg-red-500" },
  {
    value: "under_maintenance",
    label: "Under Maintenance",
    color: "bg-orange-500",
  },
];
