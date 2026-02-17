"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Truck,
  MapPin,
  Package,
  ArrowRight,
  Calendar,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getLogisticsRequests } from "@/app/actions/customers";
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  CardSkeleton,
  Pagination,
  Amount,
} from "@/components/shared/customer/shared-ui";

const VEHICLE_ICONS = {
  bike: "🏍️",
  car: "🚗",
  van: "🚐",
  truck: "🚛",
  trailer: "🚚",
};
const SERVICE_LABELS = {
  delivery: "Delivery",
  moving: "Moving",
  cargo: "Cargo",
  courier: "Courier",
};

export function LogisticsClient({ userId, initialData }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["logistics-requests", userId, page],
    queryFn: () => getLogisticsRequests(userId, page, PAGE_SIZE),
    initialData: page === 1 ? initialData : undefined,
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true,
  });

  const requests = data?.data || [];
  const totalPages = Math.ceil((data?.count || 0) / PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Logistics Requests"
        description={`${data?.count || 0} total requests`}
        action={
          <Button
            asChild
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Link href="/logistics">
              <Truck className="h-4 w-4 mr-2" />
              New Request
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <CardSkeleton />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No logistics requests yet"
          description="Request delivery, moving, or cargo services."
          actionLabel="Get a Quote"
          actionHref="/logistics"
        />
      ) : (
        <>
          <div className={`space-y-4 ${isFetching ? "opacity-60" : ""}`}>
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-purple-100 rounded-2xl p-5 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {VEHICLE_ICONS[req.vehicle_type] || "📦"}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {SERVICE_LABELS[req.service_type] ||
                              req.service_type}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Submitted{" "}
                            {format(new Date(req.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 mb-3">
                      <div className="text-sm">
                        <p className="text-xs text-gray-400">From</p>
                        <p className="font-medium text-gray-700">
                          {req.pickup_lga || req.pickup_state}
                        </p>
                        {req.pickup_landmark && (
                          <p className="text-xs text-gray-500">
                            {req.pickup_landmark}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-xs text-gray-400">To</p>
                        <p className="font-medium text-gray-700">
                          {req.delivery_lga || req.delivery_state}
                        </p>
                        {req.delivery_landmark && (
                          <p className="text-xs text-gray-500">
                            {req.delivery_landmark}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Item</p>
                        <p className="font-medium text-gray-700 flex items-center gap-1">
                          <Package className="h-3.5 w-3.5 text-purple-400" />
                          {req.item_category || "General goods"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Pickup Date</p>
                        <p className="font-medium text-gray-700 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-purple-400" />
                          {format(new Date(req.pickup_date), "MMM d")}
                        </p>
                      </div>
                      {req.vehicle_type && (
                        <div>
                          <p className="text-xs text-gray-400">Vehicle</p>
                          <p className="font-medium text-gray-700 capitalize">
                            {req.vehicle_type}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:min-w-[120px]">
                    {req.quoted_amount ? (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Quote</p>
                        <Amount value={req.quoted_amount} size="lg" />
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Quote</p>
                        <p className="text-sm text-amber-600 font-medium">
                          Pending
                        </p>
                      </div>
                    )}
                    {req.status === "quoted" && req.quoted_amount && (
                      <Button
                        size="sm"
                        asChild
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Link
                          href={`/payments?request_id=${req.id}&type=logistics`}
                        >
                          Accept & Pay
                        </Link>
                      </Button>
                    )}
                    {req.quote?.pdf_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <a
                          href={req.quote.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          Quote PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
