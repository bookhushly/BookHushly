"use client";

import { useState } from "react";
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

export function VendorListingsGrid() {
  const { data: authData } = useAuth();
  const vendor = authData?.vendor;

  const [deleteId, setDeleteId] = useState(null);

  const isHotelCategory = vendor?.business_category === "hotels";

  // Fetch listings with React Query
  const {
    data: listings = [],
    isLoading,
    error,
    refetch,
  } = useVendorListings(vendor?.id, vendor?.business_category);

  // Delete mutation
  const deleteMutation = useDeleteListing(vendor?.business_category);

  const handleDelete = async () => {
    if (!deleteId) return;

    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
      },
    });
  };

  const formatPrice = (price, priceUnit) => {
    if (!price) return "Contact for pricing";

    const formatted = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    const unitMap = {
      fixed: "",
      per_hour: "/hour",
      per_day: "/day",
      per_night: "/night",
      per_person: "/person",
      per_km: "/km",
      per_event: "/event",
      per_week: "/week",
      per_month: "/month",
      negotiable: "(Negotiable)",
    };

    return `${formatted}${unitMap[priceUnit] || ""}`;
  };

  const getListingImage = (mediaUrls) => {
    if (!mediaUrls || mediaUrls.length === 0) {
      return "/event-placeholder.jpg";
    }
    return mediaUrls[0];
  };

  const getCategoryBadge = (category) => {
    const categoryMap = {
      hotels: { label: "Hotel", color: "bg-blue-100 text-blue-700" },
      serviced_apartments: {
        label: "Apartment",
        color: "bg-purple-100 text-purple-700",
      },
      events: { label: "Event", color: "bg-pink-100 text-pink-700" },
      food: { label: "Food", color: "bg-orange-100 text-orange-700" },
      car_rentals: {
        label: "Car Rental",
        color: "bg-green-100 text-green-700",
      },
      logistics: { label: "Logistics", color: "bg-yellow-100 text-yellow-700" },
      security: { label: "Security", color: "bg-red-100 text-red-700" },
    };

    const config = categoryMap[category] || {
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
  };

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
            Error Loading {isHotelCategory ? "Hotels" : "Listings"}
          </h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            My {isHotelCategory ? "Hotels" : vendor?.business_category}
          </h1>
          <p className="text-gray-600 mt-1">
            {isHotelCategory
              ? "Manage your hotel properties and rooms"
              : "Manage and organize your service listings"}
          </p>
        </div>
        <Link
          href={
            isHotelCategory
              ? "/vendor/dashboard/hotels/create"
              : "/vendor/dashboard/listings/create"
          }
        >
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            {isHotelCategory ? "Add Hotel" : "Create Listing"}
          </Button>
        </Link>
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-100">
          <div className="max-w-md mx-auto">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {isHotelCategory ? "hotels" : "listings"} yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first{" "}
              {isHotelCategory ? "hotel" : "listing"}
            </p>
            <Link
              href={
                isHotelCategory
                  ? "/vendor/dashboard/hotels/create"
                  : "/vendor/dashboard/listings/create"
              }
            >
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                {isHotelCategory
                  ? "Add Your First Hotel"
                  : "Create Your First Listing"}
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => {
            const imageUrl = getListingImage(listing.media_urls);
            const title = listing.title;
            const location = listing.location;

            return (
              <div
                key={listing.id}
                className="group bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {!isHotelCategory && !listing.active && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="px-3 py-1.5 bg-white text-gray-900 text-sm font-medium rounded-full">
                        Inactive
                      </span>
                    </div>
                  )}
                  {!isHotelCategory && listing.category && (
                    <div className="absolute top-3 left-3">
                      {getCategoryBadge(listing.category)}
                    </div>
                  )}
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
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem asChild>
                          <Link
                            href={
                              isHotelCategory
                                ? `/vendor/dashboard/hotels/${listing.id}`
                                : vendor?.business_category ===
                                    "serviced_apartments"
                                  ? `/vendor/dashboard/serviced-apartments/${listing.id}`
                                  : `/vendor/dashboard/listings/${listing.id}`
                            }
                            className="cursor-pointer"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(listing.id)}
                          className="text-red-600 cursor-pointer"
                          disabled={deleteMutation.isPending}
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
                    {title}
                  </h3>

                  {isHotelCategory ? (
                    <>
                      {location && (
                        <div className="flex items-center text-gray-600 text-sm mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="line-clamp-1">{location}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {listing.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {listing.description}
                        </p>
                      )}
                    </>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {!isHotelCategory && listing.price && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">
                          Price
                        </span>
                        <span className="font-semibold text-purple-600">
                          {formatPrice(listing.price, listing.price_unit)}
                        </span>
                      </div>
                    )}
                    {vendor?.business_category === "serviced_apartments" && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">
                          Bedrooms
                        </span>
                        <span className="font-semibold text-purple-600">
                          {listing.bedrooms} bed
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2 ml-auto">
                      <Link
                        href={
                          isHotelCategory
                            ? `/vendor/dashboard/hotels/${listing.id}`
                            : vendor?.business_category ===
                                "serviced_apartments"
                              ? `/vendor/dashboard/serviced-apartments/${listing.id}`
                              : `/vendor/dashboard/listings/${listing.id}`
                        }
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 hover:bg-gray-50"
                        >
                          {isHotelCategory ? (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Manage
                            </>
                          ) : (
                            <Pencil className="h-4 w-4" />
                          )}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {isHotelCategory ? "Hotel" : "Listing"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this{" "}
              {isHotelCategory ? "hotel" : "listing"}? This action cannot be
              undone
              {isHotelCategory
                ? " and all associated rooms will be deleted."
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
