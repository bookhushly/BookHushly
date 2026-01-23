"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function Step6Images({ formData, updateFormData, errors }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const images = formData.image_urls || [];
  const supabase = createClient();

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter((f) => !validTypes.includes(f.type));

    if (invalidFiles.length > 0) {
      toast.error("Please upload only JPG, PNG, or WebP images");
      return;
    }

    const oversizedFiles = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Each image must be less than 5MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedUrls = [];
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `apartments/${fileName}`;

        const { data, error } = await supabase.storage
          .from("apartment-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Upload error:", error);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("apartment-images").getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      if (uploadedUrls.length > 0) {
        updateFormData({
          image_urls: [...images, ...uploadedUrls],
        });
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = async (index) => {
    const imageUrl = images[index];

    try {
      const urlParts = imageUrl.split("/apartment-images/apartments/");
      if (urlParts.length === 2) {
        const filePath = `apartments/${urlParts[1]}`;
        await supabase.storage.from("apartment-images").remove([filePath]);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }

    const newImages = images.filter((_, i) => i !== index);
    updateFormData({ image_urls: newImages });
    toast.success("Image removed");
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    updateFormData({ image_urls: newImages });
  };

  const setPrimaryImage = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    const [primaryImage] = newImages.splice(index, 1);
    newImages.unshift(primaryImage);
    updateFormData({ image_urls: newImages });
    toast.success("Primary image updated");
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Camera className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-2">
                Photo Tips for Maximum Bookings
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>
                  • Upload at least 5 high-quality photos (10+ recommended)
                </li>
                <li>• First photo is your cover image - make it count!</li>
                <li>
                  • Show: living room, bedrooms, kitchen, bathroom, exterior
                </li>
                <li>
                  • Take photos in good lighting (daytime with windows open)
                </li>
                <li>
                  • Include photos of special features (balcony, view,
                  generator, etc.)
                </li>
                <li>• Clean and declutter before taking photos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-600" />
            Upload Images {images.length > 0 && `(${images.length})`}
          </CardTitle>
          {errors?.image_urls && (
            <p className="text-sm text-red-500 mt-1">{errors.image_urls}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  uploading
                    ? "border-gray-300 bg-gray-50"
                    : "border-purple-300 hover:bg-purple-50"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <>
                      <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-sm text-gray-600">
                        Uploading... {Math.round(uploadProgress)}%
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-purple-600 mb-2" />
                      <p className="text-sm text-gray-700 font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG or WebP (Max 5MB per image)
                      </p>
                    </>
                  )}
                </div>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Photos ({images.length})</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Drag images to reorder. First image is your cover photo.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  <Image
                    src={url}
                    alt={`Apartment image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      Cover Photo
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => removeImage(index)}
                        className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full transition-colors"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                      {index > 0 && (
                        <button
                          onClick={() => moveImage(index, index - 1)}
                          className="flex-1 bg-white/90 hover:bg-white text-gray-900 text-xs font-medium py-1 px-2 rounded transition-colors"
                        >
                          ← Move
                        </button>
                      )}
                      {index !== 0 && (
                        <button
                          onClick={() => setPrimaryImage(index)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
                        >
                          Set Cover
                        </button>
                      )}
                      {index < images.length - 1 && (
                        <button
                          onClick={() => moveImage(index, index + 1)}
                          className="flex-1 bg-white/90 hover:bg-white text-gray-900 text-xs font-medium py-1 px-2 rounded transition-colors"
                        >
                          Move →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Video & Virtual Tour (Optional)</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Add a video tour or 360° virtual tour to stand out
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video_url">Video Tour URL</Label>
            <Input
              id="video_url"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={formData.video_url || ""}
              onChange={(e) => updateFormData({ video_url: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              YouTube, Vimeo, or direct video link
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="virtual_tour_url">Virtual Tour URL</Label>
            <Input
              id="virtual_tour_url"
              type="url"
              placeholder="https://matterport.com/..."
              value={formData.virtual_tour_url || ""}
              onChange={(e) =>
                updateFormData({ virtual_tour_url: e.target.value })
              }
            />
            <p className="text-xs text-gray-500">
              Matterport, Kuula, or other 360° tour link
            </p>
          </div>
        </CardContent>
      </Card>

      {images.length === 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  At least one image is required
                </p>
                <p className="text-xs text-orange-800 mt-1">
                  Listings with 5+ photos receive 3x more inquiries than those
                  with fewer images.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {images.length > 0 && images.length < 5 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  Add more photos for better results
                </p>
                <p className="text-xs text-yellow-800 mt-1">
                  You have {images.length} photo(s). Adding {5 - images.length}{" "}
                  more will significantly improve your booking rate.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
