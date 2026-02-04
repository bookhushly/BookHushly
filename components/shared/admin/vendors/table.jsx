// components/admin/vendors/VendorsTable.jsx
import { memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, User, Building2 } from "lucide-react";

const VendorRow = memo(({ vendor, onSelect }) => {
  const getStatusBadge = (status, approved) => {
    const statusConfig = {
      pending: { bg: "bg-gray-100", text: "text-gray-800", label: "Pending" },
      submitted: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Submitted",
      },
      reviewing: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Reviewing",
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Approved",
      },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge variant="outline" className={`${config.bg} ${config.text}`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <>
      {/* Desktop View */}
      <TableRow className="hidden lg:table-row hover:bg-gray-50">
        <TableCell className="font-medium max-w-[200px] truncate">
          {vendor.business_name}
        </TableCell>
        <TableCell className="min-w-[180px]">
          <div>
            <div className="font-medium truncate max-w-[150px]">
              {vendor.users?.name || "N/A"}
            </div>
            <div className="text-sm text-gray-500 truncate max-w-[150px]">
              {vendor.users?.email}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="whitespace-nowrap">
            {vendor.business_category || "N/A"}
          </Badge>
        </TableCell>
        <TableCell>{getStatusBadge(vendor.status, vendor.approved)}</TableCell>
        <TableCell className="text-sm text-gray-500 whitespace-nowrap">
          {new Date(vendor.created_at).toLocaleDateString()}
        </TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm" onClick={() => onSelect(vendor)}>
            <Eye className="w-4 h-4" />
          </Button>
        </TableCell>
      </TableRow>

      {/* Tablet View */}
      <TableRow className="hidden md:table-row lg:hidden hover:bg-gray-50">
        <TableCell className="font-medium max-w-[150px]">
          <div className="truncate">{vendor.business_name}</div>
          <div className="text-xs text-gray-500 mt-1">
            <Badge variant="outline" className="text-xs">
              {vendor.business_category || "N/A"}
            </Badge>
          </div>
        </TableCell>
        <TableCell className="min-w-[150px]">
          <div className="truncate font-medium">
            {vendor.users?.name || "N/A"}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {vendor.users?.email}
          </div>
        </TableCell>
        <TableCell>
          {getStatusBadge(vendor.approved ? "approved" : vendor.status)}
        </TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm" onClick={() => onSelect(vendor)}>
            <Eye className="w-4 h-4" />
          </Button>
        </TableCell>
      </TableRow>

      {/* Mobile Card View */}
      <TableRow className="md:hidden hover:bg-gray-50">
        <TableCell colSpan={6} className="p-0">
          <div
            className="p-4 cursor-pointer active:bg-gray-100"
            onClick={() => onSelect(vendor)}
          >
            <div className="space-y-3">
              {/* Business Name & Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-gray-900 break-words">
                    {vendor.business_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-600 truncate">
                      {vendor.business_category || "N/A"}
                    </span>
                  </div>
                </div>
                {getStatusBadge(vendor.approved ? "approved" : vendor.status)}
              </div>

              {/* Owner Info */}
              <div className="flex items-start gap-2">
                <User className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {vendor.users?.name || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {vendor.users?.email}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3 shrink-0" />
                <span>
                  Joined {new Date(vendor.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* View Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(vendor);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
});

VendorRow.displayName = "VendorRow";

export function VendorsTable({ vendors, loading, onSelectVendor }) {
  if (loading && vendors.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No vendors found matching your criteria
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        {/* Desktop Header */}
        <TableHeader className="hidden lg:table-header-group">
          <TableRow>
            <TableHead className="w-[200px]">Business Name</TableHead>
            <TableHead className="w-[180px]">Owner</TableHead>
            <TableHead className="w-[120px]">Category</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[120px]">Joined</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        {/* Tablet Header */}
        <TableHeader className="hidden md:table-header-group lg:hidden">
          <TableRow>
            <TableHead className="w-[180px]">Business</TableHead>
            <TableHead className="w-[150px]">Owner</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        {/* Mobile - No Header */}
        <TableHeader className="md:hidden">
          <TableRow>
            <TableHead className="sr-only">Vendor Information</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {vendors.map((vendor) => (
            <VendorRow
              key={vendor.id}
              vendor={vendor}
              onSelect={onSelectVendor}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
