"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import {
  useVendorListings,
  useDeleteListing,
} from "@/hooks/use-vendor-dashboard";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  MoreVertical,
  AlertCircle,
  MapPin,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// ─── Route resolver ─────────────────────────────────────────────────────────
// Single source of truth for listing routes — avoids the repeated ternary chains
function getListingRoute(listing, businessCategory) {
  if (businessCategory === "hotels") {
    return `/vendor/dashboard/hotels/${listing.id}`;
  }
  if (businessCategory === "serviced_apartments") {
    return `/vendor/dashboard/serviced-apartments/${listing.id}`;
  }
  if (businessCategory === "events" || listing.category === "events") {
    return `/vendor/dashboard/event-management/${listing.id}`;
  }
  return `/vendor/dashboard/listings/${listing.id}`;
}

// ─── Formatting helpers ─────────────────────────────────────────────────────
const UNIT_LABELS = {
  fixed: "",
  per_hour: "/hour",
  per_day: "/day",
  per_night: "/night",
  per_person: "/person",
  per_km: "/km",
  per_event: "/event",
  per_week: "/week",
  per_month: "/month",
  negotiable: " (Negotiable)",
};

function formatPrice(price, priceUnit) {
  if (!price) return "Contact for pricing";
  const formatted = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
  return `${formatted}${UNIT_LABELS[priceUnit] || ""}`;
}

// ─── Category badge config ──────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  hotels: { label: "Hotel", color: "bg-blue-100 text-blue-700" },
  serviced_apartments: {
    label: "Apartment",
    color: "bg-purple-100 text-purple-700",
  },
  events: { label: "Event", color: "bg-pink-100 text-pink-700" },
  food: { label: "Food", color: "bg-orange-100 text-orange-700" },
  car_rentals: { label: "Car Rental", color: "bg-green-100 text-green-700" },
  logistics: { label: "Logistics", color: "bg-yellow-100 text-yellow-700" },
  security: { label: "Security", color: "bg-red-100 text-red-700" },
};

function CategoryBadge({ category }) {
  const config = CATEGORY_CONFIG[category] || {
    label: category,
    color: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}
    >
      {config.label}
    </span>
  );
}

// ─── Listing card ───────────────────────────────────────────────────────────
function ListingCard({ listing, businessCategory, onDelete, isDeleting }) {
  const isHotel = businessCategory === "hotels";
  const isEvent =
    businessCategory === "events" || listing.category === "events";
  const route = getListingRoute(listing, businessCategory);
  const imageUrl = listing.media_urls?.[0] || "/event-placeholder.jpg";

  return (
    <div className="group bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <Image
          src={imageUrl}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />

        {!isHotel && !listing.active && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="px-3 py-1.5 bg-white text-gray-900 text-sm font-medium rounded-full">
              Inactive
            </span>
          </div>
        )}

        {!isHotel && listing.category && (
          <div className="absolute top-3 left-3">
            <CategoryBadge category={listing.category} />
          </div>
        )}

        {/* Dropdown menu */}
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-white/90 hover:bg-white backdrop-blur-sm"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {/* Events get both Edit (listing fields) and Manage (dashboard) */}
              {isEvent && (
                <DropdownMenuItem asChild>
                  <Link
                    href={`/vendor/dashboard/listings/${listing.id}`}
                    className="cursor-pointer"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Listing
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem asChild>
                <Link href={route} className="cursor-pointer">
                  {isEvent ? (
                    <>
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Manage Event
                    </>
                  ) : (
                    <>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  )}
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onDelete(listing.id)}
                className="text-red-600 cursor-pointer"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-1">
          {listing.title}
        </h3>

        {isHotel && listing.location && (
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <MapPin className="h-4 w-4 mr-1 shrink-0" />
            <span className="line-clamp-1">{listing.location}</span>
          </div>
        )}

        {!isHotel && listing.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {listing.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex gap-4">
            {!isHotel && listing.price && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Price</span>
                <span className="font-semibold text-purple-600">
                  {formatPrice(listing.price, listing.price_unit)}
                </span>
              </div>
            )}

            {businessCategory === "serviced_apartments" && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Bedrooms</span>
                <span className="font-semibold text-purple-600">
                  {listing.bedrooms} bed
                </span>
              </div>
            )}

            {isEvent && listing.remaining_tickets != null && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Tickets Left</span>
                <span className="font-semibold text-purple-600">
                  {listing.remaining_tickets.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <Link href={route}>
            <Button
              variant="outline"
              size="sm"
              className="h-9 hover:bg-gray-50"
            >
              {isHotel && <Eye className="h-4 w-4 mr-2" />}
              {isEvent && <LayoutDashboard className="h-4 w-4 mr-2" />}
              {!isHotel && !isEvent && <Pencil className="h-4 w-4" />}
              {isHotel && "Manage"}
              {isEvent && "Dashboard"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main grid ──────────────────────────────────────────────────────────────
export function VendorListingsGrid() {
  const { data: authData } = useAuth();
  const vendor = authData?.vendor;
  const businessCategory = vendor?.business_category;

  const [deleteId, setDeleteId] = useState(null);

  const isHotelCategory = businessCategory === "hotels";
  const isApartmentsCategory = businessCategory === "serviced_apartments";
  const isEventCategory = businessCategory === "events";

  const {
    data: listings = [],
    isLoading,
    error,
    refetch,
  } = useVendorListings(vendor?.id, businessCategory);

  const deleteMutation = useDeleteListing(businessCategory);

  // Derive labels once
  const labels = useMemo(() => {
    if (isHotelCategory)
      return {
        plural: "Hotels",
        singular: "Hotel",
        sub: "Manage your hotel properties and rooms",
      };
    if (isEventCategory)
      return {
        plural: "Events",
        singular: "Event",
        sub: "Manage your event listings and tickets",
      };
    return {
      plural: businessCategory,
      singular: "Listing",
      sub: "Manage and organize your service listings",
    };
  }, [businessCategory, isHotelCategory, isEventCategory]);

  const createRoute = isApartmentsCategory
    ? "/vendor/dashboard/serviced-apartments/new"
    : "/vendor/dashboard/listings/create";

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  // ── States ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading {labels.plural}
          </h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            My {labels.plural}
          </h1>
          <p className="text-gray-600 mt-1">{labels.sub}</p>
        </div>
        <Link href={createRoute}>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            {isHotelCategory ? "Add Hotel" : `Create ${labels.singular}`}
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-100">
          <div className="max-w-md mx-auto">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {labels.plural?.toLowerCase()} yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first {labels.singular.toLowerCase()}
            </p>
            <Link href={createRoute}>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First {labels.singular}
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              businessCategory={businessCategory}
              onDelete={setDeleteId}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {labels.singular}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this{" "}
              {labels.singular.toLowerCase()}? This action cannot be undone
              {isHotelCategory
                ? " and all associated rooms will be deleted."
                : isEventCategory
                  ? " and all associated bookings and tickets will be affected."
                  : " and all associated bookings will be affected."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
