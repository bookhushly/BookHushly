import { Button } from "@/components/ui/button";
import {
  Badge,
  Building,
  Edit,
  Package,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const ListingsTab = ({ filteredListings, vendor }) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            My Listings
          </h2>
          <p className="text-slate-600 text-sm">
            Manage all your service listings
          </p>
        </div>
        <Button
          asChild
          disabled={!vendor?.approved}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-600/30 h-11"
        >
          <Link href="/vendor/dashboard/listings/create">
            <Plus className="mr-2 h-5 w-5" />
            Create Listing
          </Link>
        </Button>
      </div>

      {filteredListings.length === 0 ? (
        <Card className="bg-white/60 backdrop-blur-md border-slate-200/50 shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center mb-5">
              <Package className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-900">
              No listings yet
            </h3>
            <p className="text-slate-500 mb-6 max-w-md">
              {vendor?.approved
                ? "Start growing your business by creating your first listing and reaching customers"
                : "Complete your KYC verification to unlock the ability to create listings"}
            </p>
            {vendor?.approved && (
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-xl shadow-purple-600/30 h-12"
              >
                <Link href="/vendor/dashboard/listings/create">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Listing
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/60 backdrop-blur-md border-slate-200/50 shadow-xl overflow-hidden">
          <ScrollArea className="h-[600px]">
            <table className="w-full">
              <thead className="bg-slate-50/80 sticky top-0 backdrop-blur-sm border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Listing
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredListings.map((listing, idx) => (
                  <tr
                    key={listing.id}
                    className="hover:bg-slate-50/50 transition-colors"
                    style={{
                      animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both`,
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                          <Building className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {listing.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            ID: {listing.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="font-medium">
                        {listing.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">
                        ₦{listing.price?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={listing.active ? "default" : "secondary"}
                        className={
                          listing.active
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-slate-100 text-slate-800 border-slate-200"
                        }
                      >
                        {listing.active ? (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>
                            Active
                          </>
                        ) : (
                          "Inactive"
                        )}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="hover:bg-purple-50"
                        >
                          <Link
                            href={`/vendor/dashboard/listings/${listing.id}`}
                          >
                            <Edit className="h-4 w-4 text-purple-600" />
                          </Link>
                        </Button>
                        {listing.event_type === "event_organizer" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="hover:bg-blue-50"
                          >
                            <Link
                              href={`/vendor/dashboard/event-management/${listing.id}`}
                            >
                              <Settings className="h-4 w-4 text-blue-600" />
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(listing)}
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};

export default ListingsTab;
