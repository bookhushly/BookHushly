"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bed, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function RoomStatusTab({ hotelId, onUpdate }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");

  useEffect(() => {
    loadRooms();
  }, [hotelId]);

  const loadRooms = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
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
        .order("floor", { ascending: true })
        .order("room_number", { ascending: true });

      if (error) throw error;

      setRooms(data || []);
    } catch (error) {
      console.error("Error loading rooms:", error);
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const updateRoomStatus = async (roomId, newStatus) => {
    try {
      const updateData = {
        status: newStatus,
      };

      // If marking as available or occupied, update last_cleaned_at
      if (newStatus === "available") {
        updateData.last_cleaned_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("hotel_rooms")
        .update(updateData)
        .eq("id", roomId);

      if (error) throw error;

      toast.success("Room status updated");
      loadRooms();
      onUpdate();
    } catch (error) {
      console.error("Error updating room status:", error);
      toast.error("Failed to update room status");
    }
  };

  const statusColors = {
    available: "bg-green-100 text-green-700 border-green-200",
    occupied: "bg-blue-100 text-blue-700 border-blue-200",
    reserved: "bg-purple-100 text-purple-700 border-purple-200",
    dirty: "bg-yellow-100 text-yellow-700 border-yellow-200",
    out_of_service: "bg-red-100 text-red-700 border-red-200",
    under_maintenance: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const statusLabels = {
    available: "Available",
    occupied: "Occupied",
    reserved: "Reserved",
    dirty: "Needs Cleaning",
    out_of_service: "Out of Service",
    under_maintenance: "Maintenance",
  };

  const statusIcons = {
    available: <Check className="h-4 w-4" />,
    dirty: <AlertTriangle className="h-4 w-4" />,
    occupied: <Bed className="h-4 w-4" />,
  };

  const floors = [...new Set(rooms.map((room) => room.floor))].sort(
    (a, b) => a - b
  );

  const filteredRooms = rooms.filter((room) => {
    const statusMatch = statusFilter === "all" || room.status === statusFilter;
    const floorMatch =
      floorFilter === "all" || room.floor.toString() === floorFilter;
    return statusMatch && floorMatch;
  });

  const getRoomBedSummary = (beds) => {
    if (!beds) return "No beds";
    const bedTypes = [];
    if (beds.single > 0) bedTypes.push(`${beds.single}S`);
    if (beds.double > 0) bedTypes.push(`${beds.double}D`);
    if (beds.queen > 0) bedTypes.push(`${beds.queen}Q`);
    if (beds.king > 0) bedTypes.push(`${beds.king}K`);
    return bedTypes.join(" • ");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Room Status</CardTitle>
          <CardDescription>
            Monitor and update room availability and cleanliness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="dirty">Needs Cleaning</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="out_of_service">Out of Service</SelectItem>
                <SelectItem value="under_maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={floorFilter} onValueChange={setFloorFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                {floors.map((floor) => (
                  <SelectItem key={floor} value={floor.toString()}>
                    Floor {floor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                No rooms match the selected filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className={`border-2 rounded-lg p-4 ${
                    statusColors[room.status]
                  } transition-all hover:shadow-md`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-bold">
                          {room.room_number}
                        </span>
                        {statusIcons[room.status]}
                      </div>
                      <p className="text-xs opacity-75">Floor {room.floor}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {room.hotel_room_types?.name}
                    </Badge>
                  </div>

                  <div className="text-xs opacity-75 mb-3">
                    {getRoomBedSummary(room.beds)}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium mb-2">Quick Actions:</p>

                    {room.status === "dirty" && (
                      <Button
                        size="sm"
                        onClick={() => updateRoomStatus(room.id, "available")}
                        className="w-full bg-green-600 hover:bg-green-700 h-8 text-xs"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark Clean
                      </Button>
                    )}

                    {room.status === "available" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateRoomStatus(room.id, "under_maintenance")
                        }
                        className="w-full h-8 text-xs"
                      >
                        Set Maintenance
                      </Button>
                    )}

                    {room.status === "under_maintenance" && (
                      <Button
                        size="sm"
                        onClick={() => updateRoomStatus(room.id, "available")}
                        className="w-full bg-green-600 hover:bg-green-700 h-8 text-xs"
                      >
                        Mark Available
                      </Button>
                    )}

                    {room.status === "out_of_service" && (
                      <Button
                        size="sm"
                        onClick={() => updateRoomStatus(room.id, "available")}
                        className="w-full bg-green-600 hover:bg-green-700 h-8 text-xs"
                      >
                        Return to Service
                      </Button>
                    )}

                    {room.status === "occupied" && (
                      <div className="text-xs opacity-75 text-center py-2">
                        Guest checked in
                      </div>
                    )}
                  </div>

                  {room.last_cleaned_at && room.status === "available" && (
                    <p className="text-xs opacity-75 mt-2 pt-2 border-t">
                      Cleaned{" "}
                      {new Date(room.last_cleaned_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Status Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {Object.entries(statusLabels).map(([status, label]) => (
              <div key={status} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${statusColors[status]}`}
                />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
