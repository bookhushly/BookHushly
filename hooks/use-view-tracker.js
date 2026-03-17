"use client";

import { useEffect } from "react";

/**
 * useViewTracker — fire-and-forget view tracking on listing detail pages.
 *
 * Uses sessionStorage to avoid counting the same listing twice per browser tab session.
 * The server also deduplicates by IP hash within a 30-min window.
 *
 * @param {string} listingId   - UUID of the listing
 * @param {string} listingType - 'hotel' | 'apartment' | 'event' | 'listing'
 * @param {string} [vendorId]  - UUID of the vendor (optional but recommended)
 */
export function useViewTracker(listingId, listingType, vendorId) {
  useEffect(() => {
    if (!listingId || !listingType) return;

    // Per-session dedup key
    const sessionKey = `view_tracked::${listingType}::${listingId}`;
    try {
      if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(sessionKey)) {
        return; // Already tracked this listing in this browser tab session
      }
    } catch {
      // sessionStorage unavailable — proceed anyway
    }

    // Fire-and-forget
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing_id: listingId, listing_type: listingType, vendor_id: vendorId }),
    })
      .then(() => {
        try {
          sessionStorage.setItem(sessionKey, "1");
        } catch {
          // ignore
        }
      })
      .catch(() => {
        // Silent fail — views are non-critical
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);
}
