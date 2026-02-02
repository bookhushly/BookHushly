// components/shared/services/RobustImage.jsx
"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

const DEFAULT_FALLBACKS = ["/placeholder.jpg", "/service-placeholder.jpg"];

export const RobustImage = ({
  src,
  alt,
  fallbacks = [],
  className = "",
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  quality = 85,
  onLoad,
  ...props
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Build complete image array with all fallbacks
  const allImages = useMemo(() => {
    const images = [];

    // Primary image
    if (src && typeof src === "string") {
      images.push(src);
    }

    // Custom fallbacks
    if (Array.isArray(fallbacks) && fallbacks.length > 0) {
      images.push(...fallbacks.filter((img) => img && typeof img === "string"));
    }

    // Default fallbacks
    images.push(...DEFAULT_FALLBACKS);

    return [...new Set(images)]; // Remove duplicates
  }, [src, fallbacks]);

  const currentImage = allImages[currentImageIndex];

  const handleError = () => {
    console.error(`Failed to load image: ${currentImage}`);

    // Try next image
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex((prev) => prev + 1);
    } else {
      // All images failed
      setHasError(true);
    }
  };

  const handleLoad = (e) => {
    // Reset error state on successful load
    setHasError(false);
    if (onLoad) onLoad(e);
  };

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gray-100 ${className}`}
      >
        <ImageOff className="h-12 w-12 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Image unavailable</p>
      </div>
    );
  }

  return (
    <Image
      src={currentImage}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      quality={quality}
      priority={priority}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};
