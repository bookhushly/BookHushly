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
