"use client";

import { useState, useEffect } from "react";

/**
 * useSavedListing
 * Manages the save/unsave state for a single listing.
 *
 * Props:
 *  - listingId: string
 *  - listingType: 'hotel' | 'apartment' | 'event' | 'listing'
 *  - meta: { title?, image?, location? } — stored alongside the save
 */
export function useSavedListing(listingId, listingType, meta = {}) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  // Check initial saved state on mount
  useEffect(() => {
    if (!listingId || checked) return;
    (async () => {
      try {
        const res = await fetch("/api/saved-listings");
        if (!res.ok) return;
        const json = await res.json();
        const isSaved = (json.data ?? []).some(
          (s) => s.listing_id === listingId && s.listing_type === listingType
        );
        setSaved(isSaved);
      } catch {
        // silent
      } finally {
        setChecked(true);
      }
    })();
  }, [listingId, listingType, checked]);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    // Optimistic
    setSaved((p) => !p);
    try {
      const res = await fetch("/api/saved-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId,
          listing_type: listingType,
          listing_title: meta.title,
          listing_image: meta.image,
          listing_location: meta.location,
        }),
      });
      if (!res.ok) {
        // Revert on failure
        setSaved((p) => !p);
      }
    } catch {
      setSaved((p) => !p);
    } finally {
      setLoading(false);
    }
  };

  return { saved, toggle, loading };
}
