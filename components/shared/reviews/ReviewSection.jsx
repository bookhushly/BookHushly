"use client";

import { useState, useEffect } from "react";
import { ReviewSummary } from "./ReviewSummary";
import { ReviewList } from "./review-list";
import { ReviewForm } from "./review-form";
import { createClient } from "@/lib/supabase/client";

/**
 * ReviewSection — drop-in component for listing pages.
 * Shows: AI summary, review list, and a form for authenticated users.
 *
 * Props:
 *  - listingId: string
 *  - listingType: 'hotel' | 'apartment' | 'event' | 'listing'
 *  - listingTitle?: string
 */
export function ReviewSection({ listingId, listingType, listingTitle }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not authed
  const [submitted, setSubmitted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user ?? null));
  }, []);

  const handleReviewSubmitted = () => {
    setSubmitted(true);
    // Refresh the review list + summary after a short delay
    setTimeout(() => setRefreshKey((k) => k + 1), 500);
  };

  return (
    <div className="space-y-6">
      {/* AI Summary */}
      <ReviewSummary listingId={listingId} listingType={listingType} />

      {/* Review list — keyed so it re-fetches after submission */}
      <ReviewList
        key={refreshKey}
        listingId={listingId}
        listingType={listingType}
      />

      {/* Review form — only for logged-in users */}
      {user === null && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 text-center space-y-2">
          <p className="text-sm text-gray-600 font-medium">Want to leave a review?</p>
          <p className="text-xs text-gray-400">
            <a href="/auth/login" className="text-violet-600 hover:underline font-medium">Sign in</a>
            {" "}to share your experience
          </p>
        </div>
      )}

      {user && !submitted && (
        <ReviewForm
          listingId={listingId}
          listingType={listingType}
          listingTitle={listingTitle}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {user && submitted && (
        <div className="bg-green-50 rounded-2xl border border-green-100 p-5 text-center">
          <p className="text-sm text-green-700 font-medium">Thank you for your review!</p>
          <p className="text-xs text-green-500 mt-1">Your feedback helps other guests.</p>
        </div>
      )}
    </div>
  );
}
