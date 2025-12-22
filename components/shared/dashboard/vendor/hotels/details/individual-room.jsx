"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Plus, Pencil, Trash2, Bed, Hash, Building } from "lucide-react";
import { toast } from "sonner";

export function IndividualRoomsSection({
  hotelId,
  rooms,
  roomTypes,
  onUpdate,
  loading,
}) {
  const supabase = createClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    room_type_id: "",
    room_number: "",
    floor: "",
    price_per_night: "",
    status: "available",
    notes: "",
  });

  const [beds, setBeds] = useState({
    single: 0,
    double: 0,
    queen: 0,
    king: 0,
  });

  const openDialog = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        room_type_id: room.room_type_id || "",
        room_number: room.room_number?.toString() || "",
        floor: room.floor?.toString() || "",
        price_per_night: room.price_per_night?.toString() || "",
        status: room.status || "available",
        notes: room.notes || "",
      });
      setBeds(room.beds || { single: 0, double: 0, queen: 0, king: 0 });
    } else {
      setEditingRoom(null);
      setFormData({
        room_type_id: "",
        room_number: "",
        floor: "",
        price_per_night: "",
        status: "available",
        notes: "",
      });
      setBeds({ single: 0, double: 0, queen: 0, king: 0 });
    }
    setDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBedChange = (type, value) => {
    setBeds((prev) => ({ ...prev, [type]: parseInt(value) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.room_type_id ||
      !formData.room_number ||
      !formData.floor ||
      !formData.price_per_night
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        hotel_id: hotelId,
        room_type_id: formData.room_type_id,
        room_number: parseInt(formData.room_number),
        floor: parseInt(formData.floor),
        price_per_night: parseFloat(formData.price_per_night),
        status: formData.status,
        beds: beds,
        notes: formData.notes.trim() || null,
      };

      if (editingRoom) {
        const { error } = await supabase
          .from("hotel_rooms")
          .update(payload)
          .eq("id", editingRoom.id);

        if (error) throw error;
        toast.success("Room updated successfully");
      } else {
        const { error } = await supabase.from("hotel_rooms").insert(payload);

        if (error) throw error;
        toast.success("Room created successfully");
      }

      setDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error saving room:", error);
      toast.error(error.message || "Failed to save room");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const { error } = await supabase
        .from("hotel_rooms")
        .delete()
        .eq("id", deletingId);

      if (error) throw error;

      toast.success("Room deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingId(null);
      onUpdate();
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Failed to delete room");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const statusColors = {
    available: "bg-green-100 text-green-700",
    occupied: "bg-blue-100 text-blue-700",
    reserved: "bg-purple-100 text-purple-700",
    dirty: "bg-yellow-100 text-yellow-700",
    out_of_service: "bg-red-100 text-red-700",
    under_maintenance: "bg-gray-100 text-gray-700",
  };

  const statusLabels = {
    available: "Available",
    occupied: "Occupied",
    reserved: "Reserved",
    dirty: "Needs Cleaning",
    out_of_service: "Out of Service",
    under_maintenance: "Under Maintenance",
  };

  const getBedSummary = (beds) => {
    if (!beds) return "No beds configured";
    const bedTypes = [];
    if (beds.single > 0) bedTypes.push(`${beds.single} Single`);
    if (beds.double > 0) bedTypes.push(`${beds.double} Double`);
    if (beds.queen > 0) bedTypes.push(`${beds.queen} Queen`);
    if (beds.king > 0) bedTypes.push(`${beds.king} King`);
    return bedTypes.length > 0 ? bedTypes.join(", ") : "No beds configured";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (roomTypes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bed className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Create room types first
            </h3>
            <p className="text-gray-600">
              Before adding individual rooms, you need to create at least one
              room type
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Individual Rooms
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage specific room numbers and their availability
            </p>
          </div>
          <Button
            onClick={() => openDialog()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </div>

        {rooms.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No rooms yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start adding individual rooms to your hotel inventory
                </p>
                <Button
                  onClick={() => openDialog()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Room
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <Card key={room.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Room {room.room_number}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {room.hotel_room_types?.name || "Unknown Type"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(room)}
                        className="h-7 w-7"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingId(room.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Building className="h-3.5 w-3.5" />
                      Floor {room.floor}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        statusColors[room.status]
                      }`}
                    >
                      {statusLabels[room.status]}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <Bed className="h-3.5 w-3.5 inline mr-1" />
                    {getBedSummary(room.beds)}
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">
                      Price per Night
                    </p>
                    <p className="text-lg font-semibold text-purple-600">
                      {formatPrice(room.price_per_night)}
                    </p>
                  </div>

                  {room.notes && (
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                      {room.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? "Edit Room" : "Add New Room"}
            </DialogTitle>
            <DialogDescription>
              Configure the details for this specific room
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room_type_id">Room Type *</Label>
                <Select
                  value={formData.room_type_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, room_type_id: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room_number">Room Number *</Label>
                  <Input
                    id="room_number"
                    name="room_number"
                    type="number"
                    placeholder="e.g., 101"
                    value={formData.room_number}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floor">Floor *</Label>
                  <Input
                    id="floor"
                    name="floor"
                    type="number"
                    placeholder="e.g., 1"
                    value={formData.floor}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_per_night">Price (₦/night) *</Label>
                  <Input
                    id="price_per_night"
                    name="price_per_night"
                    type="number"
                    placeholder="e.g., 25000"
                    value={formData.price_per_night}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Room Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="dirty">Needs Cleaning</SelectItem>
                    <SelectItem value="out_of_service">
                      Out of Service
                    </SelectItem>
                    <SelectItem value="under_maintenance">
                      Under Maintenance
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Bed Configuration *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="single" className="text-xs">
                      Single Beds
                    </Label>
                    <Input
                      id="single"
                      type="number"
                      value={beds.single}
                      onChange={(e) =>
                        handleBedChange("single", e.target.value)
                      }
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="double" className="text-xs">
                      Double Beds
                    </Label>
                    <Input
                      id="double"
                      type="number"
                      value={beds.double}
                      onChange={(e) =>
                        handleBedChange("double", e.target.value)
                      }
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="queen" className="text-xs">
                      Queen Beds
                    </Label>
                    <Input
                      id="queen"
                      type="number"
                      value={beds.queen}
                      onChange={(e) => handleBedChange("queen", e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="king" className="text-xs">
                      King Beds
                    </Label>
                    <Input
                      id="king"
                      type="number"
                      value={beds.king}
                      onChange={(e) => handleBedChange("king", e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any special notes about this room..."
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {saving ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : editingRoom ? (
                  "Update Room"
                ) : (
                  "Create Room"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this room? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
