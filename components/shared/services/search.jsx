"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  memo,
} from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { debounce } from "lodash";
import { CATEGORY_IMAGES, normalizeCategoryKey } from "@/lib/filter-configs";

const SearchBar = memo(({ searchQuery, setSearchQuery, categoryLabel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  const categoryKey = useMemo(
    () => normalizeCategoryKey(categoryLabel),
    [categoryLabel]
  );
  const images = useMemo(
    () => CATEGORY_IMAGES[categoryKey] || CATEGORY_IMAGES.services,
    [categoryKey]
  );

  const debouncedSetSearchQuery = useMemo(
    () => debounce((value) => setSearchQuery(value), 400),
    [setSearchQuery]
  );

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  return (
    <section className="relative bg-white h-[500px] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={images[currentIndex]}
          alt={categoryLabel}
          fill
          className="object-cover transition-opacity duration-700"
          priority={currentIndex === 0}
          quality={75}
          sizes="100vw"
          loading={currentIndex === 0 ? "eager" : "lazy"}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center z-10"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center z-10"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50"
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="container relative z-10 mx-auto px-4 h-full flex items-center">
        <div className="max-w-4xl mx-auto text-center w-full flex flex-col space-y-3 md:space-y-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-14 text-white drop-shadow-lg">
            Find Your Perfect {categoryLabel}
          </h1>
          <div className="max-w-2xl md:w-[500px] mx-auto px-6 py-4 rounded-2xl border border-white/30 backdrop-blur-md bg-white/5 shadow-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
              <Input
                placeholder={`Search ${categoryLabel.toLowerCase()}...`}
                defaultValue={searchQuery}
                onChange={(e) => debouncedSetSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl border-none outline-none bg-transparent text-white placeholder-white/90 focus:ring-2 focus:ring-white/50 w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

SearchBar.displayName = "SearchBar";

export default SearchBar;
