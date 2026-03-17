"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MapPin,
  Hotel,
  Home,
  CalendarDays,
  LayoutGrid,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Type config ─────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  hotel: {
    label: "Hotel",
    icon: Hotel,
    color: "text-violet-600",
    bg: "bg-violet-50",
    href: (id) => `/services/hotels/${id}`,
  },
  apartment: {
    label: "Apartment",
    icon: Home,
    color: "text-blue-600",
    bg: "bg-blue-50",
    href: (id) => `/services/serviced-apartments/${id}`,
  },
  event: {
    label: "Event",
    icon: CalendarDays,
    color: "text-pink-600",
    bg: "bg-pink-50",
    href: (id) => `/services/events/${id}`,
  },
  listing: {
    label: "Listing",
    icon: LayoutGrid,
    color: "text-orange-600",
    bg: "bg-orange-50",
    href: (id) => `/services/${id}`,
  },
};

const TABS = [
  { key: "all", label: "All" },
  { key: "hotel", label: "Hotels" },
  { key: "apartment", label: "Apartments" },
  { key: "event", label: "Events" },
];

// ─── Fetch helpers ────────────────────────────────────────────────────────────
async function fetchSaved() {
  const res = await fetch("/api/saved-listings");
  if (!res.ok) throw new Error("Failed to load saved listings");
  const json = await res.json();
  return json.data ?? [];
}

async function removeSaved({ listing_id, listing_type }) {
  const res = await fetch("/api/saved-listings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listing_id, listing_type }),
  });
  if (!res.ok) throw new Error("Failed to unsave");
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function FavoriteCard({ item, onRemove, removing }) {
  const cfg = TYPE_CONFIG[item.listing_type] ?? TYPE_CONFIG.listing;
  const TypeIcon = cfg.icon;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-violet-200 hover:shadow-[0_8px_30px_rgba(124,58,237,0.08)] transition-all duration-200 group">
      {/* Image */}
      <div className="relative h-44 bg-gray-100">
        {item.listing_image ? (
          <Image
            src={item.listing_image}
            alt={item.listing_title ?? "Saved listing"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TypeIcon className={`w-12 h-12 ${cfg.color} opacity-30`} />
          </div>
        )}
        {/* Type badge */}
        <span className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
        {/* Remove button */}
        <button
          onClick={() => onRemove(item)}
          disabled={removing}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50"
          title="Remove from favourites"
        >
          {removing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
          {item.listing_title ?? "Untitled listing"}
        </h3>
        {item.listing_location && (
          <p className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-1">{item.listing_location}</span>
          </p>
        )}
        <Link href={cfg.href(item.listing_id)}>
          <Button
            size="sm"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs h-8"
          >
            View listing
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [removingId, setRemovingId] = useState(null);
  const queryClient = useQueryClient();

  const { data: saved = [], isLoading, isError } = useQuery({
    queryKey: ["saved-listings"],
    queryFn: fetchSaved,
    staleTime: 30_000,
  });

  const { mutate: unsave } = useMutation({
    mutationFn: removeSaved,
    onMutate: ({ listing_id }) => setRemovingId(listing_id),
    onSettled: () => {
      setRemovingId(null);
      queryClient.invalidateQueries({ queryKey: ["saved-listings"] });
    },
  });

  const filtered =
    activeTab === "all"
      ? saved
      : saved.filter((s) => s.listing_type === activeTab);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Favourites</h1>
          <p className="text-sm text-gray-500">
            {saved.length} saved {saved.length === 1 ? "listing" : "listings"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => {
          const count =
            tab.key === "all"
              ? saved.length
              : saved.filter((s) => s.listing_type === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 text-xs ${activeTab === tab.key ? "opacity-80" : "text-gray-400"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-44 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-8 bg-gray-100 rounded-xl mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Failed to load favourites. Please try again.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <Heart className="h-8 w-8 text-red-300" />
          </div>
          <p className="text-gray-900 font-medium">No saved listings yet</p>
          <p className="text-sm text-gray-500">
            Tap the heart icon on any hotel, apartment, or event to save it here.
          </p>
          <Link href="/services/hotels">
            <Button className="mt-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
              Browse listings
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <FavoriteCard
              key={item.id}
              item={item}
              onRemove={(i) => unsave({ listing_id: i.listing_id, listing_type: i.listing_type })}
              removing={removingId === item.listing_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
