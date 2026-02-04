// components/admin/vendors/VendorListings.jsx
import { useVendorListings } from "@/hooks/use-vendors";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, MapPin } from "lucide-react";

export function VendorListings({ vendorId }) {
  const { data: listings, isLoading } = useVendorListings(vendorId, true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!listings || listings.total === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No listings found for this vendor
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {listings.hotels.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Hotels ({listings.hotels.length})
          </h3>
          <div className="space-y-3">
            {listings.hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <Building2 className="w-5 h-5 text-gray-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {hotel.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {hotel.city}, {hotel.state}
                      </p>
                      {hotel.address && (
                        <p className="text-sm text-gray-500 mt-1">
                          {hotel.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {listings.apartments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Serviced Apartments ({listings.apartments.length})
          </h3>
          <div className="space-y-3">
            {listings.apartments.map((apartment) => (
              <div
                key={apartment.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <Building2 className="w-5 h-5 text-gray-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {apartment.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {apartment.city}, {apartment.state}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        ₦{apartment.price_per_night?.toLocaleString()}/night
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      apartment.status === "active" ? "success" : "secondary"
                    }
                    className={
                      apartment.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {apartment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {listings.events.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Event Centers ({listings.events.length})
          </h3>
          <div className="space-y-3">
            {listings.events.map((event) => (
              <div
                key={event.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <Calendar className="w-5 h-5 text-gray-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={event.active ? "success" : "secondary"}
                    className={
                      event.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {event.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
