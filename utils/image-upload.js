/**
 * Optimized image compression utility
 * Handles image compression with better performance and quality
 */

const DEFAULT_OPTIONS = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  mimeType: "image/jpeg",
};

/**
 * Compress a single image file
 */
export async function compressImage(file, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    // If file is already small enough, return as is
    if (file.size < 200000) {
      // Less than 200KB
      resolve(file);
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Calculate new dimensions
        if (width > opts.maxWidth || height > opts.maxHeight) {
          const ratio = Math.min(
            opts.maxWidth / width,
            opts.maxHeight / height,
          );
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas to Blob conversion failed"));
              return;
            }

            // Create a new file from the blob
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.\w+$/, ".jpg"),
              {
                type: opts.mimeType,
                lastModified: Date.now(),
              },
            );

            resolve(compressedFile);
          },
          opts.mimeType,
          opts.quality,
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Upload images in parallel with concurrency control
 */
export async function uploadImagesInParallel(
  files,
  uploadFunction,
  concurrency = 3,
) {
  const results = [];
  const queue = [...files];

  async function processNext() {
    if (queue.length === 0) return;

    const file = queue.shift();
    try {
      const url = await uploadFunction(file);
      if (url) results.push(url);
    } catch (error) {
      console.error("Upload error:", error);
    }

    // Process next item
    if (queue.length > 0) {
      await processNext();
    }
  }

  // Start parallel uploads
  const workers = Array(Math.min(concurrency, files.length))
    .fill(null)
    .map(() => processNext());

  await Promise.all(workers);

  return results;
}

/**
 * Batch upload images with progress tracking
 */
export async function batchUploadWithProgress(
  files,
  uploadFunction,
  onProgress,
) {
  const total = files.length;
  let completed = 0;

  const uploadWithTracking = async (file) => {
    const result = await uploadFunction(file);
    completed++;
    if (onProgress) {
      onProgress((completed / total) * 100);
    }
    return result;
  };

  return uploadImagesInParallel(files, uploadWithTracking, 3);
}

/**
 * Validate image file
 */
export function validateImageFile(file, maxSize = 10 * 1024 * 1024) {
  // 10MB default
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit.`,
    };
  }

  return { valid: true };
}

/**
 * Get image dimensions without loading the full image
 */
export function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}
