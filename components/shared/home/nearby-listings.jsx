"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  MapPin, ArrowRight, Loader2, LocateFixed, X, RefreshCw, Navigation,
} from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Button } from "@/components/ui/button";

const ServiceCardWrapper = dynamic(
  () => import("@/components/shared/listings/details/ServiceCardWrapper"),
  { ssr: false }
);

const TABS = [
  { value: "hotels",               label: "Hotels",     emoji: "🏨" },
  { value: "serviced_apartments",  label: "Apartments", emoji: "🏢" },
  { value: "events",               label: "Events",     emoji: "🎉" },
];

const PROXIMITY_LABEL = {
  city:     { text: "In your city",   color: "bg-green-100 text-green-700 border-green-200"  },
  state:    { text: "In your state",  color: "bg-violet-100 text-violet-700 border-violet-200" },
  national: { text: "Other location", color: "bg-gray-100 text-gray-500 border-gray-200"      },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-gray-100 animate-pulse overflow-hidden">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

/** Small pill showing the matched proximity level on each card */
function ProximityBadge({ proximity }) {
  const meta = PROXIMITY_LABEL[proximity];
  if (!meta) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.color}`}
    >
      <Navigation className="h-2.5 w-2.5" />
      {meta.text}
    </span>
  );
}

export default function NearbyListings() {
  const geo = useGeolocation();
  const [activeTab, setActiveTab]   = useState("hotels");
  const [allData, setAllData]       = useState(null);
  const [fetching, setFetching]     = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [dismissed, setDismissed]   = useState(false);

  const fetchNearby = useCallback(async (city, state) => {
    setFetching(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (city)  params.set("city",  city);
      if (state) params.set("state", state);
      const res  = await fetch(`/api/nearby-listings?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setAllData(json.data);
    } catch {
      setFetchError("Could not load nearby listings.");
    } finally {
      setFetching(false);
    }
  }, []);

  // Fetch once location resolves — even if city/state are null (returns national results)
  useEffect(() => {
    if (geo.granted) {
      fetchNearby(geo.city, geo.state);
    }
  }, [geo.granted, geo.city, geo.state, fetchNearby]);

  if (dismissed) return null;

  const activeListings = allData?.[activeTab] || [];

  // ── Permission request ────────────────────────────────────────────────────
  if (!geo.granted && !geo.loading) {
    return (
      <section className="relative py-14 md:py-20 bg-gradient-to-b from-violet-50/60 to-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="max-w-xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet-100 mb-5">
              <LocateFixed className="h-6 w-6 text-violet-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Services near you
            </h2>
            <p className="text-gray-500 mb-7 text-sm md:text-base">
              Allow location access and we&apos;ll show you hotels, apartments and
              events available right in your area.
            </p>
            {geo.error && (
              <p className="text-sm text-red-500 mb-4 bg-red-50 rounded-xl px-4 py-2">{geo.error}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={geo.requestLocation}
                className="gap-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl"
              >
                <LocateFixed className="h-4 w-4" />
                Allow location access
              </Button>
              <Button
                variant="ghost"
                onClick={() => { geo.clearLocation(); setDismissed(true); }}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Maybe later
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // ── Geolocation loading ───────────────────────────────────────────────────
  if (geo.loading) {
    return (
      <section className="py-14 md:py-20 bg-gradient-to-b from-violet-50/60 to-white">
        <div className="container mx-auto px-4 flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 text-violet-500 animate-spin" />
          <p className="text-sm text-gray-400">Detecting your location…</p>
        </div>
      </section>
    );
  }

  // Resolved display label — always show something once geo is granted
  const displayCity  = geo.city  || null;
  const displayState = geo.state || null;
  const displayLabel = displayCity && displayState
    ? `${displayCity}, ${displayState}`
    : displayCity || displayState || (geo.lat ? "Your current location" : null);

  // ── Main section ──────────────────────────────────────────────────────────
  return (
    <section className="relative py-14 md:py-20 bg-gradient-to-b from-violet-50/60 to-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">

        {/* ── Header ── */}
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4"
        >
          <div>
            <div className="flex items-center gap-2 text-violet-600 mb-2">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-widest">Near you</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
              Services in{" "}
              <span className="text-violet-600">
                {displayCity || displayState || "your area"}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchNearby(geo.city, geo.state)}
              disabled={fetching}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`h-3 w-3 ${fetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href={`/services?category=${activeTab}${geo.city ? `&city=${encodeURIComponent(geo.city)}` : ""}`}
              className="flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-500 transition-colors"
            >
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        {/* ── Detected location badge — always visible once granted ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-violet-200 shadow-sm">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-600 shrink-0">
              <Navigation className="h-2.5 w-2.5 text-white" />
            </span>
            <span className="text-gray-400 text-xs">Detected location:</span>
            <span className="font-semibold text-gray-900 text-sm">
              {displayLabel || "Resolving…"}
            </span>
            {geo.lat && !displayCity && !displayState && (
              <span className="text-[10px] text-gray-400">
                ({geo.lat.toFixed(4)}, {geo.lng.toFixed(4)})
              </span>
            )}
            <button
              onClick={() => { geo.clearLocation(); setAllData(null); }}
              className="ml-1 text-gray-300 hover:text-gray-500 transition-colors"
              title="Clear location"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>

        {/* ── Category tabs ── */}
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          className="flex gap-2 mb-7 overflow-x-auto scrollbar-none"
        >
          {TABS.map((tab) => {
            const count = allData?.[tab.value]?.length || 0;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  activeTab === tab.value
                    ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200"
                    : "bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600"
                }`}
              >
                <span>{tab.emoji}</span>
                {tab.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === tab.value ? "bg-white/20 text-white" : "bg-violet-100 text-violet-600"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* ── Grid ── */}
        <AnimatePresence mode="wait">
          {fetching ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </motion.div>
          ) : fetchError ? (
            <motion.p
              key="error"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-sm text-center text-red-400 py-8"
            >
              {fetchError}
            </motion.p>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {activeListings.map((service) => (
                <div key={service.id} className="flex flex-col gap-1.5">
                  {/* Proximity badge sits above the card */}
                  <ProximityBadge proximity={service.proximity} />
                  <ServiceCardWrapper service={service} />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer CTA ── */}
        {!fetching && activeListings.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <Link
              href={`/services?category=${activeTab}${geo.city ? `&city=${encodeURIComponent(geo.city)}` : ""}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-violet-200 hover:border-violet-400 text-violet-700 font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              View all {TABS.find((t) => t.value === activeTab)?.label.toLowerCase()} near you
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
