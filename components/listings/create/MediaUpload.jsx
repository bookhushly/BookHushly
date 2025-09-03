import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function MediaUpload({
  handleImageChange,
  errors,
  imagePreviews,
  loading,
  uploadProgress,
}) {
  return (
    <Card className="border-none shadow-lg rounded-2xl bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Upload Media
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Images (up to 5)
          </Label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className={`rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 ${
              errors.images ? "border-red-500" : ""
            }`}
            aria-describedby={errors.images ? "images-error" : undefined}
          />
          {errors.images && (
            <p id="images-error" className="text-sm text-red-500 font-medium">
              {errors.images}
            </p>
          )}
        </div>
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imagePreviews.map((src, idx) => (
              <motion.img
                key={idx}
                src={src}
                alt={`Preview ${idx + 1}`}
                className="rounded-xl object-cover h-40 w-full shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: idx * 0.1 }}
              />
            ))}
          </div>
        )}
        {loading && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-sm text-gray-500">
              Upload Progress: {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
