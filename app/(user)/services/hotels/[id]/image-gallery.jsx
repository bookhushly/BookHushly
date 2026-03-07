"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Grid3X3, X, Building } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({ images, index, onClose, altPrefix }) => {
  const [current, setCurrent] = useState(index);
  const prev = () => setCurrent((p) => (p === 0 ? images.length - 1 : p - 1));
  const next = () => setCurrent((p) => (p + 1) % images.length);

  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20
                   flex items-center justify-center text-white transition-colors z-10"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full
                     bg-white/10 hover:bg-white/20 flex items-center justify-center
                     text-white transition-colors z-10"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <div className="relative w-full max-w-5xl max-h-[85vh] mx-20 aspect-[4/3]">
        <Image
          src={images[current]}
          alt={`${altPrefix} ${current + 1}`}
          fill
          className="object-contain"
          sizes="100vw"
        />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full
                     bg-white/10 hover:bg-white/20 flex items-center justify-center
                     text-white transition-colors z-10"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <span className="text-white/50 text-sm">
            {current + 1} / {images.length}
          </span>
          {/* Dot strip — max 10 shown */}
          {images.length <= 10 && (
            <div className="flex gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "rounded-full transition-all duration-200",
                    i === current
                      ? "w-4 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Shared tile wrapper ───────────────────────────────────────────────────────
const Tile = ({
  src,
  alt,
  priority = false,
  sizes = "50vw",
  onClick,
  overlay,
}) => (
  <div
    className="relative h-full w-full cursor-pointer group overflow-hidden bg-gray-100"
    onClick={onClick}
  >
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      sizes={sizes}
      priority={priority}
    />
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
    {overlay}
  </div>
);

// ─── Empty placeholder ─────────────────────────────────────────────────────────
const EmptyGallery = () => (
  <div className="h-[440px] rounded-2xl bg-gray-100 flex flex-col items-center justify-center gap-3">
    <div className="h-14 w-14 rounded-2xl bg-gray-200 flex items-center justify-center">
      <Building className="h-6 w-6 text-gray-400" />
    </div>
    <p className="text-sm text-gray-400 font-medium">No photos available</p>
  </div>
);

// ─── Show-all overlay button ───────────────────────────────────────────────────
const ShowAllOverlay = ({ remaining, onClick }) => (
  <button
    className="absolute inset-0 flex flex-col items-center justify-center gap-1.5
               bg-black/40 hover:bg-black/50 transition-colors duration-200"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  >
    <Grid3X3 className="h-5 w-5 text-white" />
    <span className="text-white text-xs font-semibold">
      +{remaining} photos
    </span>
  </button>
);

// ─── Single-image layout ───────────────────────────────────────────────────────
const Layout1 = ({ images, altPrefix, onOpen }) => (
  <div className="h-[480px] rounded-2xl overflow-hidden">
    <Tile
      src={images[0]}
      alt={`${altPrefix} 1`}
      priority
      sizes="100vw"
      onClick={() => onOpen(0)}
    />
  </div>
);

// ─── Two-image layout (side by side) ──────────────────────────────────────────
const Layout2 = ({ images, altPrefix, onOpen }) => (
  <div className="grid grid-cols-2 gap-2 h-[480px] rounded-2xl overflow-hidden">
    {images.map((src, i) => (
      <Tile
        key={i}
        src={src}
        alt={`${altPrefix} ${i + 1}`}
        priority={i === 0}
        sizes="50vw"
        onClick={() => onOpen(i)}
      />
    ))}
  </div>
);

// ─── Three-image layout (hero left, 2 stacked right) ──────────────────────────
const Layout3 = ({ images, altPrefix, onOpen }) => (
  <div className="grid grid-cols-2 gap-2 h-[480px] rounded-2xl overflow-hidden">
    <div className="row-span-2 h-full">
      <Tile
        src={images[0]}
        alt={`${altPrefix} 1`}
        priority
        sizes="50vw"
        onClick={() => onOpen(0)}
      />
    </div>
    <div className="grid grid-rows-2 gap-2 h-[480px]">
      {[1, 2].map((i) => (
        <Tile
          key={i}
          src={images[i]}
          alt={`${altPrefix} ${i + 1}`}
          sizes="25vw"
          onClick={() => onOpen(i)}
        />
      ))}
    </div>
  </div>
);

// ─── Four-image layout (hero top-left, 3 grid) ────────────────────────────────
const Layout4 = ({ images, altPrefix, onOpen }) => (
  <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[480px] rounded-2xl overflow-hidden">
    <div className="row-span-2 h-full">
      <Tile
        src={images[0]}
        alt={`${altPrefix} 1`}
        priority
        sizes="50vw"
        onClick={() => onOpen(0)}
      />
    </div>
    {[1, 2, 3].map((i) => (
      <Tile
        key={i}
        src={images[i]}
        alt={`${altPrefix} ${i + 1}`}
        sizes="25vw"
        onClick={() => onOpen(i)}
      />
    ))}
  </div>
);

// ─── Five+ image layout (hero + 4 grid, "show all" on last) ───────────────────
const Layout5Plus = ({ images, altPrefix, onOpen }) => {
  const remaining = images.length - 5;
  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[480px] rounded-2xl overflow-hidden">
      {/* Hero */}
      <div className="col-span-2 row-span-2">
        <Tile
          src={images[0]}
          alt={`${altPrefix} 1`}
          priority
          sizes="50vw"
          onClick={() => onOpen(0)}
        />
      </div>
      {/* 4 small */}
      {[1, 2, 3, 4].map((i) => (
        <Tile
          key={i}
          src={images[i]}
          alt={`${altPrefix} ${i + 1}`}
          sizes="25vw"
          onClick={() => onOpen(i)}
          overlay={
            i === 4 && remaining > 0 ? (
              <ShowAllOverlay remaining={remaining} onClick={() => onOpen(0)} />
            ) : null
          }
        />
      ))}
    </div>
  );
};

// ─── Mobile carousel (used on small screens) ──────────────────────────────────
const MobileCarousel = ({ images, altPrefix, onOpen }) => {
  const [idx, setIdx] = useState(0);
  return (
    <div className="relative h-[320px] rounded-2xl overflow-hidden sm:hidden">
      <Tile
        src={images[idx]}
        alt={`${altPrefix} ${idx + 1}`}
        priority
        sizes="100vw"
        onClick={() => onOpen(idx)}
      />
      {images.length > 1 && (
        <>
          <button
            onClick={() => setIdx((p) => (p === 0 ? images.length - 1 : p - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full
                       bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIdx((p) => (p + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full
                       bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={cn(
                  "rounded-full transition-all duration-200",
                  i === idx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50",
                )}
              />
            ))}
          </div>
          <div className="absolute top-3 right-3 bg-black/40 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {idx + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main ImageGallery ────────────────────────────────────────────────────────
const ImageGallery = React.memo(({ images = [], altPrefix = "Photo" }) => {
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });

  const validImages = images.filter(Boolean);

  if (validImages.length === 0) return <EmptyGallery />;

  const openAt = (i) => setLightbox({ open: true, index: i });
  const close = () => setLightbox({ open: false, index: 0 });

  const desktopGallery = () => {
    const count = validImages.length;
    if (count === 1)
      return (
        <Layout1 images={validImages} altPrefix={altPrefix} onOpen={openAt} />
      );
    if (count === 2)
      return (
        <Layout2 images={validImages} altPrefix={altPrefix} onOpen={openAt} />
      );
    if (count === 3)
      return (
        <Layout3 images={validImages} altPrefix={altPrefix} onOpen={openAt} />
      );
    if (count === 4)
      return (
        <Layout4 images={validImages} altPrefix={altPrefix} onOpen={openAt} />
      );
    return (
      <Layout5Plus images={validImages} altPrefix={altPrefix} onOpen={openAt} />
    );
  };

  return (
    <>
      {/* Mobile */}
      <MobileCarousel
        images={validImages}
        altPrefix={altPrefix}
        onOpen={openAt}
      />

      {/* Desktop */}
      <div className="hidden sm:block">{desktopGallery()}</div>

      {/* Lightbox */}
      {lightbox.open && (
        <Lightbox
          images={validImages}
          index={lightbox.index}
          onClose={close}
          altPrefix={altPrefix}
        />
      )}
    </>
  );
});

ImageGallery.displayName = "ImageGallery";
export default ImageGallery;
