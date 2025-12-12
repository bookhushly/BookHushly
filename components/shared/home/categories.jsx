"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants";

export default function CategoriesBar() {
  const [mounted, setMounted] = useState(false);

  // Wait until after client hydration to render emojis
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {CATEGORIES.map((category) => {
        const Icon = category.icon;

        return (
          <Button
            key={category.value}
            variant="outline"
            className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300"
            asChild
          >
            <Link href={`/services?category=${category.value}`}>
              {mounted && typeof Icon === "string" ? (
                <span className="mr-1 text-base">{Icon}</span>
              ) : null}
              {category.label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
