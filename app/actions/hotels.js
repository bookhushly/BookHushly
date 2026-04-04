"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ==================== IMAGE UPLOAD SERVER ACTION ====================
export async function uploadHotelImagesAction(formData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const files = formData.getAll("files");
    const category = formData.get("category") || "general";

    if (!files || files.length === 0) {
      return { success: false, error: "No files provided" };
    }

    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${category}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data, error } = await supabase.storage
        .from("hotel-images")
        .upload(fileName, buffer, {
          contentType: file.type,
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
    const urls = results.filter((url) => url !== null);

    return { success: true, urls };
  } catch (error) {
    console.error("Upload action error:", error);
    return { success: false, error: error.message };
  }
}

// ==================== DELETE IMAGE SERVER ACTION ====================
export async function deleteHotelImageAction(imageUrl) {
  try {
    if (!imageUrl) {
      return { success: false, error: "No URL provided" };
    }

    const supabase = await createClient();
    const urlParts = imageUrl.split("/hotel-images/");

    if (urlParts.length !== 2) {
      return { success: false, error: "Invalid URL" };
    }

    const filePath = urlParts[1];
    const { error } = await supabase.storage
      .from("hotel-images")
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete image error:", error);
    return { success: false, error: error.message };
  }
}

// ==================== CREATE HOTEL WITH ROOMS SERVER ACTION ====================
export async function createHotelWithRoomsAction(
  hotelData,
  suiteTypes,
  roomConfig,
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    console.log("🚀 Starting hotel creation for user:", user.id);

    // Fetch vendor profile
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id, approved")
      .eq("user_id", user.id)
      .single();

    if (vendorError || !vendor) {
      console.error("❌ Vendor not found:", vendorError);
      return { success: false, error: "Vendor profile not found" };
    }

    if (!vendor.approved) {
      return {
        success: false,
        error: "Vendor not approved. Complete KYC verification first.",
      };
    }

    console.log("✅ Vendor verified:", vendor.id);

    // Transform amenities array to JSONB object for hotel
    const hotelAmenities =
      hotelData.amenities && Array.isArray(hotelData.amenities)
        ? { items: hotelData.amenities }
        : {};

    // 1. Create Hotel
    const { data: hotel, error: hotelError } = await supabase
      .from("hotels")
      .insert({
        vendor_id: vendor.id,
        name: hotelData.name,
        description: hotelData.description,
        address: hotelData.address,
        city: hotelData.city,
        state: hotelData.state,
        image_urls: hotelData.image_urls || [],
        amenities: hotelAmenities,
        checkout_policy: hotelData.checkout_policy,
        policies: hotelData.policies,
        security_deposit: hotelData.security_deposit
          ? parseFloat(hotelData.security_deposit)
          : null,
        security_deposit_notes: hotelData.security_deposit_notes || null,
        generator_available: hotelData.generator_available || null,
        generator_hours: hotelData.generator_hours || null,
        inverter_available: hotelData.inverter_available || null,
        breakfast_offered: hotelData.breakfast_offered || "none",
        breakfast_type: hotelData.breakfast_type || null,
        early_checkin_fee: hotelData.early_checkin_fee
          ? parseFloat(hotelData.early_checkin_fee)
          : null,
        late_checkout_fee: hotelData.late_checkout_fee
          ? parseFloat(hotelData.late_checkout_fee)
          : null,
        weekend_pricing: hotelData.weekend_pricing !== "none"
          ? parseInt(hotelData.weekend_pricing)
          : null,
        vat_inclusive: hotelData.vat_inclusive || false,
        whatsapp_number: hotelData.whatsapp_number || null,
        airport_transfer_enabled: hotelData.airport_transfer_enabled || false,
        airport_prices: (() => {
          const raw = hotelData.airport_prices || {};
          const clean = {};
          Object.entries(raw).forEach(([code, val]) => {
            if (val !== "" && Number(val) > 0) clean[code] = Number(val);
          });
          return clean;
        })(),
        airport_transfer_fee: (() => {
          const raw = hotelData.airport_prices || {};
          const vals = Object.values(raw).map(Number).filter((v) => v > 0);
          return vals.length > 0 ? Math.min(...vals) : null;
        })(),
      })
      .select()
      .single();

    if (hotelError) {
      console.error("❌ Hotel creation error:", hotelError);
      return { success: false, error: hotelError.message };
    }

    console.log("✅ Hotel created:", hotel.id);

    // 2. Create Suite Types in parallel
    const suitePromises = suiteTypes.map((suite) => {
      // Transform amenities array to JSONB object
      const suiteAmenities =
        suite.amenities && Array.isArray(suite.amenities)
          ? { items: suite.amenities }
          : {};

      return supabase
        .from("hotel_room_types")
        .insert({
          hotel_id: hotel.id,
          name: suite.name,
          description: suite.description,
          max_occupancy: suite.max_occupancy,
          base_price: parseFloat(suite.base_price),
          size_sqm: suite.size_sqm ? parseFloat(suite.size_sqm) : null,
          amenities: suiteAmenities,
          image_urls: suite.image_urls || [],
        })
        .select()
        .single();
    });

    const suiteResults = await Promise.all(suitePromises);
    const suiteErrors = suiteResults.filter((r) => r.error);

    if (suiteErrors.length > 0) {
      console.error("❌ Suite creation errors:", suiteErrors);

      // Rollback: Delete hotel
      await supabase.from("hotels").delete().eq("id", hotel.id);

      return {
        success: false,
        error: `Failed to create ${suiteErrors.length} suite type(s)`,
      };
    }

    const createdSuiteTypes = suiteResults.map((result, index) => ({
      ...result.data,
      tempId: suiteTypes[index].id,
    }));

    console.log("✅ Suite types created:", createdSuiteTypes.length);

    // 3. Generate and create rooms
    const allRooms = [];

    if (!roomConfig.floors || roomConfig.floors.length === 0) {
      // Rollback
      await supabase.from("hotels").delete().eq("id", hotel.id);
      return { success: false, error: "No floors configured" };
    }

    for (const floor of roomConfig.floors) {
      if (!floor.rooms || floor.rooms.length === 0) continue;

      for (const roomGroup of floor.rooms) {
        const suite = createdSuiteTypes.find(
          (s) =>
            s.id === roomGroup.suite_type_id ||
            s.tempId === roomGroup.suite_type_id,
        );

        if (!suite) {
          console.error("❌ Suite not found for room group:", roomGroup);
          continue;
        }

        // Generate room numbers as INTEGERS
        const roomNumbers = [];
        for (let i = 0; i < roomGroup.count; i++) {
          const roomNum = parseInt(
            String(floor.floor).padStart(1, "0") +
              String(roomGroup.startNumber + i).padStart(2, "0"),
          );
          roomNumbers.push(roomNum);
        }

        // Transform beds to JSONB format
        const bedsJson =
          roomGroup.beds && Array.isArray(roomGroup.beds)
            ? { beds: roomGroup.beds }
            : { beds: [{ type: "king", count: 1 }] };

        // Transform amenities to JSONB format
        const roomAmenities = {
          suite: suite.amenities || {},
          additional:
            roomGroup.additionalAmenities &&
            Array.isArray(roomGroup.additionalAmenities)
              ? { items: roomGroup.additionalAmenities }
              : {},
        };

        const rooms = roomNumbers.map((roomNumber) => ({
          hotel_id: hotel.id,
          room_type_id: suite.id,
          room_number: roomNumber,
          floor: floor.floor,
          beds: bedsJson,
          status: "available",
          price_per_night: suite.base_price + (roomGroup.priceAdjustment || 0),
          amenities: roomAmenities,
          image_urls: suite.image_urls || [],
          notes: null,
        }));

        allRooms.push(...rooms);
      }
    }

    if (allRooms.length === 0) {
      // Rollback
      await supabase.from("hotels").delete().eq("id", hotel.id);
      return { success: false, error: "No rooms were generated" };
    }

    console.log(`✅ Generated ${allRooms.length} rooms`);

    // 4. Bulk insert rooms (chunked for better performance)
    const CHUNK_SIZE = 100;
    const chunks = [];

    for (let i = 0; i < allRooms.length; i += CHUNK_SIZE) {
      chunks.push(allRooms.slice(i, i + CHUNK_SIZE));
    }

    for (const chunk of chunks) {
      const { error: roomsError } = await supabase
        .from("hotel_rooms")
        .insert(chunk);

      if (roomsError) {
        console.error("❌ Room creation error:", roomsError);

        // Rollback
        await supabase.from("hotels").delete().eq("id", hotel.id);

        return { success: false, error: roomsError.message };
      }
    }

    console.log("✅ All rooms created successfully");

    // Revalidate paths
    revalidatePath("/vendor/dashboard");
    revalidatePath("/vendor/dashboard/hotels");
    revalidatePath(`/vendor/dashboard/hotels/${hotel.id}`);

    return {
      success: true,
      hotel,
      roomCount: allRooms.length,
      suiteTypeCount: createdSuiteTypes.length,
    };
  } catch (error) {
    console.error("💥 Server action error:", error);
    return { success: false, error: error.message };
  }
}

// ==================== DELETE HOTEL SERVER ACTION ====================
export async function deleteHotelAction(hotelId) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Fetch vendor record for this user
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (vendorError || !vendor) {
      return { success: false, error: "Vendor profile not found" };
    }

    // Verify ownership
    const { data: hotel, error: fetchError } = await supabase
      .from("hotels")
      .select("id, vendor_id")
      .eq("id", hotelId)
      .maybeSingle();

    if (fetchError || !hotel) {
      return { success: false, error: "Hotel not found" };
    }

    if (hotel.vendor_id !== vendor.id) {
      return { success: false, error: "You don't have permission to delete this hotel" };
    }

    const { error: deleteError } = await supabase
      .from("hotels")
      .delete()
      .eq("id", hotelId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    revalidatePath("/vendor/dashboard");
    revalidatePath("/vendor/dashboard/hotels");

    return { success: true };
  } catch (error) {
    console.error("Delete hotel error:", error);
    return { success: false, error: error.message };
  }
}

// ==================== ATOMIC HOTEL ROOM BOOKING ====================
export async function bookHotelRoomAction(bookingData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "You must be signed in to book a room." };
    }

    const {
      roomTypeId,
      hotelId,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      adults,
      children,
      totalPrice,
      specialRequests,
      payAtHotel = false,
      airportTransfer = false,
      airportTransferType = null,
      airportTransferNotes = null,
    } = bookingData;

    if (!roomTypeId || !hotelId || !checkInDate || !checkOutDate) {
      return { success: false, error: "Missing required booking fields." };
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      return { success: false, error: "Check-out must be after check-in." };
    }

    // If Pay at Hotel requested, verify the hotel has it enabled
    if (payAtHotel) {
      const { data: hotel } = await supabase
        .from("hotels")
        .select("pay_at_hotel_enabled")
        .eq("id", hotelId)
        .maybeSingle();

      if (!hotel?.pay_at_hotel_enabled) {
        return { success: false, error: "Pay at Hotel is not available for this property." };
      }
    }

    // Call the atomic PostgreSQL function — locks a room and inserts the booking
    // in a single transaction, preventing double-booking race conditions.
    const { data: bookingId, error: rpcError } = await supabase.rpc(
      "book_hotel_room",
      {
        p_room_type_id:     roomTypeId,
        p_hotel_id:         hotelId,
        p_customer_id:      user.id,
        p_guest_name:       guestName,
        p_guest_email:      guestEmail,
        p_guest_phone:      guestPhone,
        p_check_in_date:    checkInDate,
        p_check_out_date:   checkOutDate,
        p_adults:           adults,
        p_children:         children,
        p_total_price:      totalPrice,
        p_special_requests: specialRequests || null,
      },
    );

    if (rpcError) {
      if (rpcError.message?.includes("no_rooms_available")) {
        return { success: false, error: "No rooms available for the selected dates. Please try different dates." };
      }
      return { success: false, error: rpcError.message };
    }

    // Apply post-RPC updates: pay-at-hotel status + airport transfer details
    const postUpdate = {};
    if (payAtHotel) {
      postUpdate.booking_status = "pay_at_hotel";
      postUpdate.payment_status = "pay_at_hotel";
    }
    if (airportTransfer) {
      postUpdate.airport_transfer = true;
      postUpdate.airport_transfer_type = airportTransferType || "pickup";
      postUpdate.airport_transfer_notes = airportTransferNotes || null;
    }
    if (bookingId && Object.keys(postUpdate).length > 0) {
      await supabase
        .from("hotel_bookings")
        .update(postUpdate)
        .eq("id", bookingId);
    }

    return { success: true, bookingId, payAtHotel };
  } catch (error) {
    console.error("bookHotelRoomAction error:", error);
    return { success: false, error: error.message };
  }
}

// ==================== EFFECTIVE PRICE CALCULATION ====================
/**
 * Compute total price for a stay, applying any active seasonal pricing rules.
 * Returns { totalPrice, nights, breakdown: [{ date, price }] }
 */
export async function getEffectivePriceAction(roomTypeId, checkInDate, checkOutDate) {
  try {
    const supabase = await createClient();

    // Fetch base price + hotel id
    const { data: roomType, error: rtError } = await supabase
      .from("hotel_room_types")
      .select("base_price, hotel_id")
      .eq("id", roomTypeId)
      .single();

    if (rtError || !roomType) {
      return { success: false, error: "Room type not found" };
    }

    // Fetch pricing rules that overlap with the stay
    const { data: rules } = await supabase
      .from("hotel_pricing_rules")
      .select("*")
      .eq("hotel_id", roomType.hotel_id)
      .lte("start_date", checkOutDate)
      .gte("end_date", checkInDate);

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    let totalPrice = 0;
    const breakdown = [];

    // Walk each night of the stay
    const cursor = new Date(checkIn);
    while (cursor < checkOut) {
      const dateStr = cursor.toISOString().split("T")[0];
      let nightPrice = roomType.base_price;

      // Apply the first matching rule (highest adjustment wins if multiple overlap)
      const matchingRules = (rules || []).filter((r) => {
        return dateStr >= r.start_date && dateStr <= r.end_date;
      });

      if (matchingRules.length > 0) {
        // Pick the rule with the largest effective adjustment
        const best = matchingRules.reduce((a, b) => {
          const aAdj =
            a.adjustment_type === "percentage"
              ? roomType.base_price * (a.adjustment_value / 100)
              : a.adjustment_value;
          const bAdj =
            b.adjustment_type === "percentage"
              ? roomType.base_price * (b.adjustment_value / 100)
              : b.adjustment_value;
          return bAdj > aAdj ? b : a;
        });

        if (best.adjustment_type === "percentage") {
          nightPrice = roomType.base_price * (1 + best.adjustment_value / 100);
        } else {
          nightPrice = roomType.base_price + best.adjustment_value;
        }

        breakdown.push({ date: dateStr, price: Math.round(nightPrice), rule: best.name });
      } else {
        breakdown.push({ date: dateStr, price: Math.round(nightPrice), rule: null });
      }

      totalPrice += nightPrice;
      cursor.setDate(cursor.getDate() + 1);
    }

    return {
      success: true,
      totalPrice: Math.round(totalPrice),
      nights: breakdown.length,
      basePrice: roomType.base_price,
      breakdown,
      hasPriceVariation: breakdown.some((d) => d.price !== roomType.base_price),
    };
  } catch (error) {
    console.error("getEffectivePriceAction error:", error);
    return { success: false, error: error.message };
  }
}

// ==================== VALIDATE ROOM CONFIGURATION ====================
export async function validateRoomConfigAction(roomConfig) {
  try {
    if (!roomConfig.floors || roomConfig.floors.length === 0) {
      return { valid: false, error: "No floors configured" };
    }

    const conflicts = [];

    for (const floor of roomConfig.floors) {
      if (!floor.rooms || floor.rooms.length === 0) continue;

      for (let i = 0; i < floor.rooms.length; i++) {
        const currentGroup = floor.rooms[i];
        const currentStart = currentGroup.startNumber;
        const currentEnd = currentStart + currentGroup.count - 1;

        for (let j = i + 1; j < floor.rooms.length; j++) {
          const otherGroup = floor.rooms[j];
          const otherStart = otherGroup.startNumber;
          const otherEnd = otherStart + otherGroup.count - 1;

          const hasOverlap =
            (currentStart >= otherStart && currentStart <= otherEnd) ||
            (currentEnd >= otherStart && currentEnd <= otherEnd) ||
            (otherStart >= currentStart && otherStart <= currentEnd);

          if (hasOverlap) {
            conflicts.push({
              floor: floor.floor,
              group1: i,
              group2: j,
              message: `Room numbers overlap on floor ${floor.floor}`,
            });
          }
        }
      }
    }

    if (conflicts.length > 0) {
      return { valid: false, conflicts };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
