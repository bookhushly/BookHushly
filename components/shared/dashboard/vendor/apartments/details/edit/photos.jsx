import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function EditPhotos({ formData, updateFormData }) {
  const [uploading, setUploading] = useState(false);
  const images = formData.image_urls || [];

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate
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

    try {
      // TODO: Implement actual upload to storage
      // For now, create object URLs
      const uploadedUrls = files.map((file) => URL.createObjectURL(file));

      updateFormData({
        image_urls: [...images, ...uploadedUrls],
      });

      toast.success(`${files.length} image(s) uploaded`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    updateFormData({ image_urls: newImages });
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
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="edit-image-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            uploading
              ? "border-gray-300 bg-gray-50"
              : "border-purple-300 hover:bg-purple-50"
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-2" />
                <p className="text-sm text-gray-600">Uploading...</p>
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
            id="edit-image-upload"
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Uploaded Photos ({images.length})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div
                key={index}
                className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
              >
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />

                {/* Primary Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded">
                    Cover
                  </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index - 1)}
                        className="flex-1 bg-white/90 hover:bg-white text-gray-900 text-xs font-medium py-1 px-2 rounded"
                      >
                        ← Move
                      </button>
                    )}
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(index)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-1 px-2 rounded"
                      >
                        Set Cover
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index + 1)}
                        className="flex-1 bg-white/90 hover:bg-white text-gray-900 text-xs font-medium py-1 px-2 rounded"
                      >
                        Move →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video & Virtual Tour */}
      <div className="space-y-4 pt-4 border-t">
        <div className="space-y-2">
          <Label htmlFor="edit-video">Video Tour URL (Optional)</Label>
          <Input
            id="edit-video"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={formData.video_url || ""}
            onChange={(e) => updateFormData({ video_url: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-virtual-tour">Virtual Tour URL (Optional)</Label>
          <Input
            id="edit-virtual-tour"
            type="url"
            placeholder="https://matterport.com/..."
            value={formData.virtual_tour_url || ""}
            onChange={(e) =>
              updateFormData({ virtual_tour_url: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}
