import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * uploadImage(file, folder)
 *
 * Upload a File/Buffer/base64 string to Cloudinary.
 * Returns the secure_url and public_id.
 *
 * Usage from a server action or route handler:
 *   const { url, publicId } = await uploadImage(file, "bookhushly/hotels");
 *
 * @param {File|Buffer|string} source - File object, Buffer, or base64 data URI
 * @param {string} folder - Cloudinary folder (e.g. "bookhushly/hotels")
 * @returns {{ url: string, publicId: string }}
 */
export async function uploadImage(source, folder = "bookhushly") {
  let uploadSource;

  if (source instanceof File) {
    // Convert File to buffer then to base64 data URI
    const arrayBuffer = await source.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mime = source.type || "image/jpeg";
    uploadSource = `data:${mime};base64,${buffer.toString("base64")}`;
  } else {
    uploadSource = source;
  }

  const result = await cloudinary.uploader.upload(uploadSource, {
    folder,
    resource_type: "image",
    // Auto-format and quality optimisation — served as WebP/AVIF by CDN
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return { url: result.secure_url, publicId: result.public_id };
}

/**
 * deleteImage(publicId)
 * Remove an image from Cloudinary by its public_id.
 */
export async function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
