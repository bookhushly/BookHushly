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
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Maximize2,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

export function RoomTypesSection({ hotelId, roomTypes, onUpdate, loading }) {
  const supabase = createClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    max_occupancy: "",
    base_price: "",
    size_sqm: "",
  });

  const [amenities, setAmenities] = useState({
    wifi: false,
    tv: false,
    air_conditioning: false,
    mini_bar: false,
    safe: false,
    desk: false,
    balcony: false,
    bathtub: false,
    shower: false,
    hairdryer: false,
    iron: false,
    coffee_maker: false,
  });

  const openDialog = (type = null) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name || "",
        description: type.description || "",
        max_occupancy: type.max_occupancy?.toString() || "",
        base_price: type.base_price?.toString() || "",
        size_sqm: type.size_sqm?.toString() || "",
      });
      setAmenities(type.amenities || {});
    } else {
      setEditingType(null);
      setFormData({
        name: "",
        description: "",
        max_occupancy: "",
        base_price: "",
        size_sqm: "",
      });
      setAmenities({
        wifi: false,
        tv: false,
        air_conditioning: false,
        mini_bar: false,
        safe: false,
        desk: false,
        balcony: false,
        bathtub: false,
        shower: false,
        hairdryer: false,
        iron: false,
        coffee_maker: false,
      });
    }
    setDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (amenity) => {
    setAmenities((prev) => ({ ...prev, [amenity]: !prev[amenity] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.max_occupancy ||
      !formData.base_price
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        hotel_id: hotelId,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        max_occupancy: parseInt(formData.max_occupancy),
        base_price: parseFloat(formData.base_price),
        size_sqm: formData.size_sqm ? parseFloat(formData.size_sqm) : null,
        amenities: amenities,
      };

      if (editingType) {
        const { error } = await supabase
          .from("hotel_room_types")
          .update(payload)
          .eq("id", editingType.id);

        if (error) throw error;
        toast.success("Room type updated successfully");
      } else {
        const { error } = await supabase
          .from("hotel_room_types")
          .insert(payload);

        if (error) throw error;
        toast.success("Room type created successfully");
      }

      setDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error saving room type:", error);
      toast.error("Failed to save room type");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const { error } = await supabase
        .from("hotel_room_types")
        .delete()
        .eq("id", deletingId);

      if (error) throw error;

      toast.success("Room type deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingId(null);
      onUpdate();
    } catch (error) {
      console.error("Error deleting room type:", error);
      toast.error("Failed to delete room type");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const amenityLabels = {
    wifi: "WiFi",
    tv: "TV",
    air_conditioning: "Air Conditioning",
    mini_bar: "Mini Bar",
    safe: "Safe",
    desk: "Work Desk",
    balcony: "Balcony",
    bathtub: "Bathtub",
    shower: "Shower",
    hairdryer: "Hair Dryer",
    iron: "Iron",
    coffee_maker: "Coffee Maker",
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Room Types</h2>
            <p className="text-sm text-gray-600 mt-1">
              Define the different types of rooms available at your hotel
            </p>
          </div>
          <Button
            onClick={() => openDialog()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Room Type
          </Button>
        </div>

        {roomTypes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No room types yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by creating your first room type (e.g., Standard,
                  Deluxe, Suite)
                </p>
                <Button
                  onClick={() => openDialog()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Room Type
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomTypes.map((type) => (
              <Card key={type.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{type.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {type.description || "No description"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(type)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingId(type.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Max {type.max_occupancy} guests</span>
                    </div>
                    {type.size_sqm && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Maximize2 className="h-4 w-4" />
                        <span>{type.size_sqm} m²</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Base Price</p>
                        <p className="text-lg font-semibold text-purple-600">
                          {formatPrice(type.base_price)}
                          <span className="text-xs text-gray-500 font-normal">
                            /night
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {type.amenities &&
                    Object.values(type.amenities).some((v) => v) && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(type.amenities)
                            .filter(([_, value]) => value)
                            .slice(0, 4)
                            .map(([key]) => (
                              <span
                                key={key}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {amenityLabels[key] || key}
                              </span>
                            ))}
                          {Object.values(type.amenities).filter((v) => v)
                            .length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +
                              {Object.values(type.amenities).filter((v) => v)
                                .length - 4}
                            </span>
                          )}
                        </div>
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
              {editingType ? "Edit Room Type" : "Create Room Type"}
            </DialogTitle>
            <DialogDescription>
              Define the characteristics and pricing for this room type
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Room Type Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Deluxe Suite, Standard Room"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe this room type..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_occupancy">Max Occupancy *</Label>
                  <Input
                    id="max_occupancy"
                    name="max_occupancy"
                    type="number"
                    placeholder="e.g., 2"
                    value={formData.max_occupancy}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_price">Base Price (₦) *</Label>
                  <Input
                    id="base_price"
                    name="base_price"
                    type="number"
                    placeholder="e.g., 25000"
                    value={formData.base_price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size_sqm">Size (m²)</Label>
                  <Input
                    id="size_sqm"
                    name="size_sqm"
                    type="number"
                    placeholder="e.g., 30"
                    value={formData.size_sqm}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Room Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  {Object.keys(amenities).map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={amenities[amenity]}
                        onChange={() => handleAmenityChange(amenity)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                      />
                      <span className="text-sm text-gray-700">
                        {amenityLabels[amenity]}
                      </span>
                    </label>
                  ))}
                </div>
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
                ) : editingType ? (
                  "Update Room Type"
                ) : (
                  "Create Room Type"
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
            <AlertDialogTitle>Delete Room Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this room type? This will also
              delete all individual rooms of this type. This action cannot be
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
