"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const IMAGE_LIMIT = 5;

export default function ImageGallery({
  images = [],
  altPrefix = "Image",
  propertyType = "apartment",
}) {
  const [showAllImages, setShowAllImages] = useState(false);

  const visibleImages = useMemo(() => {
    if (images.length <= IMAGE_LIMIT) return images;
    return showAllImages ? images : images.slice(0, IMAGE_LIMIT);
  }, [images, showAllImages]);

  const hasMoreImages = images.length > IMAGE_LIMIT;
  const remainingCount = images.length - IMAGE_LIMIT;

  if (!images.length) return null;

  return (
    <div className="relative">
      <div className="grid grid-cols-4 gap-2 h-[500px] sm:h-[450px]">
        {/* Hero image */}
        <div className="col-span-4 sm:col-span-2 relative overflow-hidden rounded-l-xl">
          <Image
            src={visibleImages[0]}
            alt={`${altPrefix} - Main view`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 640px) 100vw, 50vw"
            quality={90}
          />
        </div>

        {/* Supporting images */}
        <div className="col-span-4 sm:col-span-2 grid grid-cols-2 gap-2">
          {visibleImages.slice(1, 5).map((img, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden ${idx === 0 ? "rounded-tr-xl" : ""} ${idx === 3 ? "rounded-br-xl" : ""}`}
            >
              <Image
                src={img}
                alt={`${altPrefix} ${idx + 2}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
                quality={85}
              />
              {/* Show "+X more" on last thumbnail */}
              {idx === 3 && hasMoreImages && !showAllImages && (
                <button
                  onClick={() => setShowAllImages(true)}
                  className="absolute inset-0 bg-black/70 hover:bg-black/75 flex flex-col items-center justify-center text-white transition-all"
                >
                  <span className="text-xl font-medium mb-1">+{remainingCount}</span>
                  <span className="text-sm font-medium">Show all photos</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expanded grid when "Show all" is clicked */}
      {showAllImages && hasMoreImages && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2"
        >
          {images.slice(IMAGE_LIMIT).map((img, idx) => (
            <div
              key={idx + IMAGE_LIMIT}
              className="relative overflow-hidden rounded-lg h-32 sm:h-40"
            >
              <Image
                src={img}
                alt={`${altPrefix} ${idx + IMAGE_LIMIT + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
                quality={80}
              />
            </div>
          ))}
        </motion.div>
      )}

      {showAllImages && hasMoreImages && (
        <button
          onClick={() => setShowAllImages(false)}
          className="mt-4 w-full py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-medium rounded-lg transition-colors"
        >
          Show less photos
        </button>
      )}
    </div>
  );
}
