"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  MapPin,
  Calendar,
  Ticket,
  Users,
  ArrowLeft,
  UserPlus,
  UserMinus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/hooks/use-auth";

function EventCard({ listing }) {
  const isPast = listing.event_date && new Date(listing.event_date) < new Date();
  const lowestPrice = listing.ticket_packages?.length > 0
    ? Math.min(...listing.ticket_packages.map((p) => parseFloat(p.price) || 0))
    : parseFloat(listing.price) || 0;

  return (
    <Link
      href={`/services/${listing.id}`}
      className={`group block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all ${isPast ? "opacity-60" : ""}`}
    >
      <div className="aspect-video bg-purple-50 relative overflow-hidden">
        {listing.media_urls?.[0] ? (
          <Image
            src={listing.media_urls[0]}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Ticket className="w-10 h-10 text-purple-200" />
          </div>
        )}
        {isPast && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded-full">Past Event</span>
          </div>
        )}
        {listing.category_data?.is_online && (
          <span className="absolute top-2 left-2 text-xs font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">Virtual</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{listing.title}</h3>
        {listing.event_date && (
          <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(listing.event_date), "EEE, MMM d, yyyy")}
            {listing.event_end_date && listing.event_end_date !== listing.event_date && (
              <> – {format(new Date(listing.event_end_date), "MMM d")}</>
            )}
          </p>
        )}
        {listing.location && (
          <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            {listing.location}
          </p>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-purple-700 font-bold text-sm">
            {lowestPrice === 0 ? "Free" : `From ₦${lowestPrice.toLocaleString()}`}
          </span>
          {listing.remaining_tickets != null && (
            <span className="text-xs text-gray-400">
              {listing.remaining_tickets > 0 ? `${listing.remaining_tickets} left` : "Sold out"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function OrganizerProfileClient({ vendor, listings, followerCount: initialFollowerCount }) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  // Check if current user follows this organizer
  const { data: followData } = useQuery({
    queryKey: ["follow", vendor.id, user?.id],
    queryFn: async () => {
      if (!user?.id) return { following: false };
      const { data } = await supabase
        .from("organizer_follows")
        .select("id")
        .eq("vendor_id", vendor.id)
        .eq("user_id", user.id)
        .maybeSingle();
      return { following: !!data };
    },
    enabled: !!user?.id,
  });

  const isFollowing = followData?.following ?? false;

  const { mutate: toggleFollow, isPending: followPending } = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Sign in to follow organizers");
      const res = await fetch(`/api/organizers/${vendor.id}/follow`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["follow", vendor.id, user?.id], { following: data.following });
      queryClient.invalidateQueries({ queryKey: ["follower-count", vendor.id] });
      toast.success(data.following ? "Following organizer" : "Unfollowed organizer");
    },
    onError: (err) => toast.error(err.message),
  });

  const { data: followerCountData } = useQuery({
    queryKey: ["follower-count", vendor.id],
    queryFn: async () => {
      const res = await fetch(`/api/organizers/${vendor.id}/followers`);
      if (!res.ok) return { count: initialFollowerCount };
      return res.json();
    },
    initialData: { count: initialFollowerCount },
    staleTime: 30 * 1000,
  });

  const upcomingEvents = listings.filter(
    (l) => !l.event_date || new Date(l.event_date) >= new Date()
  );
  const pastEvents = listings.filter(
    (l) => l.event_date && new Date(l.event_date) < new Date()
  );
  const [showPast, setShowPast] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/services?category=events"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>

          <div className="flex items-start gap-5 flex-wrap">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0 overflow-hidden">
              {vendor.avatar_url ? (
                <Image src={vendor.avatar_url} alt={vendor.business_name} width={80} height={80} className="object-cover w-full h-full" />
              ) : (
                <span className="text-3xl font-bold text-purple-600">{vendor.business_name?.[0]?.toUpperCase()}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{vendor.business_name}</h1>
              {(vendor.city || vendor.state) && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {[vendor.city, vendor.state].filter(Boolean).join(", ")}
                </p>
              )}
              {vendor.bio && (
                <p className="text-sm text-gray-600 mt-2 max-w-xl">{vendor.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <strong className="text-gray-800">{followerCountData?.count ?? initialFollowerCount}</strong> followers
                </span>
                <span className="flex items-center gap-1">
                  <Ticket className="w-3.5 h-3.5" />
                  <strong className="text-gray-800">{listings.length}</strong> events
                </span>
              </div>
            </div>

            <Button
              onClick={() => toggleFollow()}
              disabled={followPending}
              variant={isFollowing ? "outline" : "default"}
              className={isFollowing ? "border-purple-200 text-purple-700" : "bg-purple-600 hover:bg-purple-700 text-white"}
            >
              {followPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isFollowing ? (
                <UserMinus className="w-4 h-4 mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upcoming events */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Upcoming Events <span className="text-sm font-normal text-gray-400">({upcomingEvents.length})</span>
        </h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-gray-500 text-sm mb-8">No upcoming events at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {upcomingEvents.map((l) => <EventCard key={l.id} listing={l} />)}
          </div>
        )}

        {/* Past events */}
        {pastEvents.length > 0 && (
          <div>
            <button
              onClick={() => setShowPast((p) => !p)}
              className="text-sm text-gray-500 hover:text-purple-600 font-medium mb-4 flex items-center gap-1 transition-colors"
            >
              {showPast ? "Hide" : "Show"} past events ({pastEvents.length})
            </button>
            {showPast && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {pastEvents.map((l) => <EventCard key={l.id} listing={l} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
