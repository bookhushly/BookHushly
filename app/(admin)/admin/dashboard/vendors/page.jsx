// app/admin/vendors/page.jsx
"use client";

import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useVendors } from "@/hooks/use-vendors";
import { VendorsTable } from "@/components/shared/admin/vendors/table";
import { VendorDetailsModal } from "@/components/shared/admin/vendors/details-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, Filter } from "lucide-react";
import { VendorFilters } from "@/components/shared/admin/vendors/filters";
import { VendorStats } from "@/components/shared/admin/vendors/stats";
import { useDebounce } from "@/hooks/use-debounce";

function VendorsPageContent() {
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    approved: "all",
  });
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);

  const searchQuery = useDebounce(searchInput, 500);

  const {
    vendors,
    total,
    hasMore,
    stats,
    loading,
    statsLoading,
    prefetchNextPage,
  } = useVendors({
    search: searchQuery,
    filters,
    tab: activeTab,
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
              Vendors
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage vendor accounts and approvals
            </p>
          </div>
          <Button variant="outline" className="gap-2 shrink-0 w-full sm:w-auto">
            <Download className="w-4 h-4" />
            <span className="sm:inline">Export</span>
          </Button>
        </div>

        {/* Stats */}
        <VendorStats stats={stats} loading={statsLoading} />

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Search & Filters */}
          <div className="p-3 sm:p-4 border-b border-gray-200 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search vendors..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>

              {/* Desktop Filters */}
              <div className="hidden sm:block">
                <VendorFilters
                  filters={filters}
                  onChange={(newFilters) => {
                    setFilters(newFilters);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {/* Mobile Filters Dropdown */}
            {showFilters && (
              <div className="sm:hidden pt-3 border-t border-gray-200">
                <VendorFilters
                  filters={filters}
                  onChange={(newFilters) => {
                    setFilters(newFilters);
                    setPage(1);
                  }}
                />
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              setPage(1);
            }}
          >
            {/* Tabs List - Responsive */}
            <div className="border-b border-gray-200 overflow-x-auto">
              <TabsList className="w-full sm:w-auto inline-flex justify-start rounded-none border-0 bg-transparent p-0 h-auto min-w-full">
                <TabsTrigger
                  value="all"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent whitespace-nowrap px-3 sm:px-4 py-3 text-sm"
                >
                  <span className="hidden sm:inline">All Vendors</span>
                  <span className="sm:hidden">All</span>
                  <span className="ml-1">({stats.total || 0})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent whitespace-nowrap px-3 sm:px-4 py-3 text-sm"
                >
                  <span className="hidden sm:inline">Pending</span>
                  <span className="sm:hidden">Pending</span>
                  <span className="ml-1">({stats.pending || 0})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="approved"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent whitespace-nowrap px-3 sm:px-4 py-3 text-sm"
                >
                  <span className="hidden sm:inline">Approved</span>
                  <span className="sm:hidden">Approved</span>
                  <span className="ml-1">({stats.approved || 0})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent whitespace-nowrap px-3 sm:px-4 py-3 text-sm"
                >
                  <span className="hidden sm:inline">Rejected</span>
                  <span className="sm:hidden">Rejected</span>
                  <span className="ml-1">({stats.rejected || 0})</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <TabsContent value={activeTab} className="m-0">
              <div
                onScroll={handleScroll}
                className="overflow-auto"
                style={{ maxHeight: "calc(100vh - 400px)", minHeight: "400px" }}
              >
                <VendorsTable
                  vendors={vendors}
                  loading={loading}
                  onSelectVendor={setSelectedVendor}
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
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedVendor && (
        <VendorDetailsModal
          vendorId={selectedVendor.id}
          onClose={() => setSelectedVendor(null)}
        />
      )}
    </div>
  );
}

export default function AdminVendorsPage() {
  return (
    <>
      <VendorsPageContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
