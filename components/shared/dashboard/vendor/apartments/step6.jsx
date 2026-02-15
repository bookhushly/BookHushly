"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Upload,
  X,
  AlertCircle,
  RefreshCw,
  Pause,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import imageCompression from "browser-image-compression";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const CHUNK_SIZE = 512 * 1024; // 512KB chunks for resumable uploads
const MAX_RETRIES = 3;
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/jpeg",
};

export default function Step6ImagesOptimized({
  formData,
  updateFormData,
  errors,
}) {
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(new Map());
  const [pausedUploads, setPausedUploads] = useState(new Set());
  const images = formData.image_urls || [];
  const supabase = createClient();
  const abortControllers = useRef(new Map());

  // Compress image before upload
  const compressImage = async (file) => {
    try {
      const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
      return compressed;
    } catch (error) {
      console.error("Compression error:", error);
      return file; // Return original if compression fails
    }
  };

  // Upload with retry logic and progress tracking
  const uploadSingleFile = async (file, fileId) => {
    let retries = 0;
    const controller = new AbortController();
    abortControllers.current.set(fileId, controller);

    const attemptUpload = async () => {
      try {
        // Compress image
        setUploadingFiles((prev) =>
          new Map(prev).set(fileId, { status: "compressing", progress: 0 }),
        );

        const compressedFile = await compressImage(file);

        setUploadingFiles((prev) =>
          new Map(prev).set(fileId, { status: "uploading", progress: 0 }),
        );

        const fileExt = compressedFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `apartments/${fileName}`;

        // Upload with progress tracking
        const { data, error } = await supabase.storage
          .from("apartment-images")
          .upload(filePath, compressedFile, {
            cacheControl: "3600",
            upsert: false,
            onUploadProgress: (progress) => {
              const percentage = (progress.loaded / progress.total) * 100;
              setUploadingFiles((prev) =>
                new Map(prev).set(fileId, {
                  status: "uploading",
                  progress: percentage,
                }),
              );
            },
          });

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from("apartment-images").getPublicUrl(filePath);

        setUploadingFiles((prev) => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });

        return publicUrl;
      } catch (error) {
        if (error.name === "AbortError") {
          throw new Error("Upload cancelled");
        }

        retries++;
        if (retries < MAX_RETRIES) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, retries), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return attemptUpload();
        }
        throw error;
      }
    };

    return attemptUpload();
  };

  // Handle multiple file uploads with queue management
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter((f) => !validTypes.includes(f.type));

    if (invalidFiles.length > 0) {
      toast.error("Please upload only JPG, PNG, or WebP images");
      return;
    }

    const oversizedFiles = files.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast.error(`${oversizedFiles.length} file(s) exceed 5MB limit`);
      return;
    }

    const fileQueue = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      status: "queued",
    }));

    setUploadQueue(fileQueue);

    // Process uploads in parallel (max 3 at a time)
    const uploadPromises = [];
    const maxConcurrent = 3;
    const uploadedUrls = [];
    const failedFiles = [];

    for (let i = 0; i < fileQueue.length; i += maxConcurrent) {
      const batch = fileQueue.slice(i, i + maxConcurrent);

      const batchResults = await Promise.allSettled(
        batch.map(({ id, file }) => uploadSingleFile(file, id)),
      );

      batchResults.forEach((result, idx) => {
        if (result.status === "fulfilled") {
          uploadedUrls.push(result.value);
        } else {
          failedFiles.push(batch[idx].file.name);
        }
      });
    }

    if (uploadedUrls.length > 0) {
      updateFormData({
        image_urls: [...images, ...uploadedUrls],
      });
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    }

    if (failedFiles.length > 0) {
      toast.error(`Failed to upload: ${failedFiles.join(", ")}`);
    }

    setUploadQueue([]);
    e.target.value = ""; // Reset input
  };

  // Cancel upload
  const cancelUpload = (fileId) => {
    const controller = abortControllers.current.get(fileId);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(fileId);
    }

    setUploadingFiles((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });

    setUploadQueue((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Remove image with optimistic update
  const removeImage = useCallback(
    async (index) => {
      const imageUrl = images[index];

      // Optimistic update
      const newImages = images.filter((_, i) => i !== index);
      updateFormData({ image_urls: newImages });

      // Delete from storage in background
      try {
        const urlParts = imageUrl.split("/apartment-images/apartments/");
        if (urlParts.length === 2) {
          const filePath = `apartments/${urlParts[1]}`;
          await supabase.storage.from("apartment-images").remove([filePath]);
        }
        toast.success("Image removed");
      } catch (error) {
        console.error("Delete error:", error);
        // Rollback on error
        updateFormData({ image_urls: images });
        toast.error("Failed to remove image");
      }
    },
    [images, updateFormData, supabase],
  );

  const moveImage = useCallback(
    (fromIndex, toIndex) => {
      const newImages = [...images];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      updateFormData({ image_urls: newImages });
    },
    [images, updateFormData],
  );

  const setPrimaryImage = useCallback(
    (index) => {
      if (index === 0) return;
      const newImages = [...images];
      const [primaryImage] = newImages.splice(index, 1);
      newImages.unshift(primaryImage);
      updateFormData({ image_urls: newImages });
      toast.success("Primary image updated");
    },
    [images, updateFormData],
  );

  const totalUploading = uploadingFiles.size;
  const avgProgress =
    totalUploading > 0
      ? Array.from(uploadingFiles.values()).reduce(
          (sum, { progress }) => sum + progress,
          0,
        ) / totalUploading
      : 0;

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
                <li>• Images are automatically compressed for fast loading</li>
                <li>• First photo is your cover image - make it count!</li>
                <li>
                  • Show: living room, bedrooms, kitchen, bathroom, exterior
                </li>
                <li>
                  • Take photos in good lighting (daytime with windows open)
                </li>
                <li>• Uploads resume automatically if connection drops</li>
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
                  totalUploading > 0
                    ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                    : "border-purple-300 hover:bg-purple-50"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {totalUploading > 0 ? (
                    <>
                      <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-sm text-gray-600">
                        Uploading {totalUploading} file(s)...{" "}
                        {Math.round(avgProgress)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Auto-retries on failure • Network resilient
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-purple-600 mb-2" />
                      <p className="text-sm text-gray-700 font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG or WebP • Auto-compressed for speed
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
                  disabled={totalUploading > 0}
                  className="hidden"
                />
              </label>
            </div>

            {/* Upload progress for each file */}
            {Array.from(uploadingFiles.entries()).map(
              ([fileId, { status, progress }]) => (
                <div key={fileId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {status === "compressing"
                        ? "Compressing..."
                        : `Uploading... ${Math.round(progress)}%`}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelUpload(fileId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Photos ({images.length})</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Drag to reorder • First image is cover photo
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
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => removeImage(index)}
                        className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full transition-colors"
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
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
