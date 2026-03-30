// HotelRoomsTab — replace Tabs with manual sub-tab state

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { RoomTypesSection } from "./room-types";
import { IndividualRoomsSection } from "./individual-room";

export function HotelRoomsTab({ hotelId }) {
  const supabase = createClient();
  const [activeSubTab, setActiveSubTab] = useState("types");
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [hotelId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: typesData, error: typesError } = await supabase
        .from("hotel_room_types")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false });

      if (typesError) throw typesError;

      const { data: roomsData, error: roomsError } = await supabase
        .from("hotel_rooms")
        .select(`*, hotel_room_types (name)`)
        .eq("hotel_id", hotelId)
        .order("room_number", { ascending: true });

      if (roomsError) throw roomsError;

      setRoomTypes(typesData || []);
      setRooms(roomsData || []);
    } catch (error) {
      console.error("Error loading room data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Manual sub-tab buttons — no nested Tabs context */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {["types", "rooms"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeSubTab === tab
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 dark:text-white"
            }`}
          >
            {tab === "types" ? "Room Types" : "Individual Rooms"}
          </button>
        ))}
      </div>

      {activeSubTab === "types" && (
        <RoomTypesSection
          hotelId={hotelId}
          roomTypes={roomTypes}
          onUpdate={loadData}
          loading={loading}
        />
      )}

      {activeSubTab === "rooms" && (
        <IndividualRoomsSection
          hotelId={hotelId}
          rooms={rooms}
          roomTypes={roomTypes}
          onUpdate={loadData}
          loading={loading}
        />
      )}
    </div>
  );
}
