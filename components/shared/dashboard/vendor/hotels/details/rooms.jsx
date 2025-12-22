"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
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

      // Load room types
      const { data: typesData, error: typesError } = await supabase
        .from("hotel_room_types")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false });

      if (typesError) throw typesError;

      // Load individual rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from("hotel_rooms")
        .select(
          `
          *,
          hotel_room_types (
            name
          )
        `
        )
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
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="types">Room Types</TabsTrigger>
          <TabsTrigger value="rooms">Individual Rooms</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="mt-6">
          <RoomTypesSection
            hotelId={hotelId}
            roomTypes={roomTypes}
            onUpdate={loadData}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="rooms" className="mt-6">
          <IndividualRoomsSection
            hotelId={hotelId}
            rooms={rooms}
            roomTypes={roomTypes}
            onUpdate={loadData}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
