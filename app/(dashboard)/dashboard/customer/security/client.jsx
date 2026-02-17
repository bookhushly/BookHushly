"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Shield,
  MapPin,
  Calendar,
  Users,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSecurityRequests } from "@/app/actions/customers";
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  CardSkeleton,
  Pagination,
  Amount,
} from "@/components/shared/customer/shared-ui";

const SERVICE_LABELS = {
  personal_security: "Personal Security",
  event_security: "Event Security",
  residential: "Residential Security",
  corporate: "Corporate Security",
  escort: "Escort Service",
};

const RISK_COLORS = {
  low: "bg-green-50 text-green-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700",
};

export function SecurityClient({ userId, initialData }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["security-requests", userId, page],
    queryFn: () => getSecurityRequests(userId, page, PAGE_SIZE),
    initialData: page === 1 ? initialData : undefined,
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true,
  });

  const requests = data?.data || [];
  const totalPages = Math.ceil((data?.count || 0) / PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Security Requests"
        description={`${data?.count || 0} total requests`}
        action={
          <Button
            asChild
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Link href="/security">
              <Shield className="h-4 w-4 mr-2" />
              New Request
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <CardSkeleton />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No security requests yet"
          description="Request professional security services for events, residential, or personal protection."
          actionLabel="Get Security Quote"
          actionHref="/security"
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
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {SERVICE_LABELS[req.service_type] || req.service_type}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Submitted{" "}
                          {format(new Date(req.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-xs text-gray-400">Location</p>
                        <p className="font-medium text-gray-700 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-purple-400" />
                          {req.lga ? `${req.lga},` : ""} {req.state}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Start Date</p>
                        <p className="font-medium text-gray-700 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-purple-400" />
                          {format(new Date(req.start_date), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Guards</p>
                        <p className="font-medium text-gray-700 flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-purple-400" />
                          {req.number_of_guards} guard
                          {req.number_of_guards !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {req.guard_type && (
                        <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full capitalize">
                          {req.guard_type} guards
                        </span>
                      )}
                      {req.risk_level && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${RISK_COLORS[req.risk_level] || "bg-gray-50 text-gray-600"}`}
                        >
                          <AlertTriangle className="h-3 w-3 inline mr-0.5" />
                          {req.risk_level} risk
                        </span>
                      )}
                      {req.requires_canine && (
                        <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">
                          🐕 Canine
                        </span>
                      )}
                      {req.requires_vehicle && (
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                          🚗 Vehicle
                        </span>
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
                          href={`/payments?request_id=${req.id}&type=security`}
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
