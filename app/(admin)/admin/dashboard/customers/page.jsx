// app/(admin)/admin/dashboard/customers/page.jsx
"use client";

import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useCustomers } from "@/hooks/use-customers";
import { CustomersTable } from "@/components/shared/admin/customers/table";
import { CustomerDetailsModal } from "@/components/shared/admin/customers/details-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download } from "lucide-react";
import { CustomerStats } from "@/components/shared/admin/customers/stats";
import { useDebounce } from "@/hooks/use-debounce";

function CustomersPageContent() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);

  const searchQuery = useDebounce(searchInput, 500);

  const {
    customers,
    total,
    hasMore,
    stats,
    loading,
    statsLoading,
    prefetchNextPage,
  } = useCustomers({
    search: searchQuery,
    filters,
    page,
  });

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      prefetchNextPage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
              Customers
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage customer accounts and bookings
            </p>
          </div>
          <Button variant="outline" className="gap-2 shrink-0 w-full sm:w-auto">
            <Download className="w-4 h-4" />
            <span className="sm:inline">Export</span>
          </Button>
        </div>

        {/* Stats */}
        <CustomerStats stats={stats} loading={statsLoading} />

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Search */}
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search customers by name or email..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <div
            onScroll={handleScroll}
            className="overflow-auto"
            style={{ maxHeight: "calc(100vh - 400px)", minHeight: "400px" }}
          >
            <CustomersTable
              customers={customers}
              loading={loading}
              onSelectCustomer={setSelectedCustomer}
            />
          </div>

          {hasMore && (
            <div className="p-4 border-t border-gray-200 text-center">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedCustomer && (
        <CustomerDetailsModal
          customerId={selectedCustomer.id}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}

export default function AdminCustomersPage() {
  return (
    <>
      <CustomersPageContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
