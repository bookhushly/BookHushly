// components/shared/admin/customers/table.jsx
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
import { Eye, User, Mail, ShoppingBag, DollarSign } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/util";

const CustomerRow = memo(({ customer, onSelect }) => {
  return (
    <>
      {/* Desktop View */}
      <TableRow className="hidden lg:table-row hover:bg-gray-50">
        <TableCell className="font-medium max-w-[200px]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
              {customer.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="truncate">{customer.name}</div>
          </div>
        </TableCell>
        <TableCell className="max-w-[200px] truncate">
          {customer.email}
        </TableCell>
        <TableCell className="text-center">
          {customer.analytics?.totalBookings || 0}
        </TableCell>
        <TableCell className="font-medium">
          {formatCurrency(customer.analytics?.totalSpent || 0)}
        </TableCell>
        <TableCell className="text-sm text-gray-500">
          {customer.analytics?.lastBookingDate
            ? formatDate(customer.analytics.lastBookingDate, "short")
            : "No bookings"}
        </TableCell>
        <TableCell className="text-sm text-gray-500 whitespace-nowrap">
          {formatDate(customer.created_at, "short")}
        </TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm" onClick={() => onSelect(customer)}>
            <Eye className="w-4 h-4" />
          </Button>
        </TableCell>
      </TableRow>

      {/* Tablet View */}
      <TableRow className="hidden md:table-row lg:hidden hover:bg-gray-50">
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
              {customer.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <div className="truncate max-w-[150px]">{customer.name}</div>
              <div className="text-xs text-gray-500 truncate max-w-[150px]">
                {customer.email}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="font-medium">
            {customer.analytics?.totalBookings || 0}
          </div>
          <div className="text-xs text-gray-500">bookings</div>
        </TableCell>
        <TableCell>
          <div className="font-medium">
            {formatCurrency(customer.analytics?.totalSpent || 0)}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm" onClick={() => onSelect(customer)}>
            <Eye className="w-4 h-4" />
          </Button>
        </TableCell>
      </TableRow>

      {/* Mobile Card View */}
      <TableRow className="md:hidden hover:bg-gray-50">
        <TableCell colSpan={7} className="p-0">
          <div
            className="p-4 cursor-pointer active:bg-gray-100"
            onClick={() => onSelect(customer)}
          >
            <div className="space-y-3">
              {/* Name & Email */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold shrink-0">
                  {customer.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-gray-900 truncate">
                    {customer.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {customer.email}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <ShoppingBag className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {customer.analytics?.totalBookings || 0} bookings
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 font-medium">
                    {formatCurrency(customer.analytics?.totalSpent || 0)}
                  </span>
                </div>
              </div>

              {/* Joined Date */}
              <div className="text-xs text-gray-500">
                Joined {formatDate(customer.created_at, "short")}
              </div>

              {/* View Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(customer);
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

CustomerRow.displayName = "CustomerRow";

export function CustomersTable({ customers, loading, onSelectCustomer }) {
  if (loading && customers.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No customers found matching your criteria
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        {/* Desktop Header */}
        <TableHeader className="hidden lg:table-header-group">
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[200px]">Email</TableHead>
            <TableHead className="w-[100px] text-center">Bookings</TableHead>
            <TableHead className="w-[120px]">Total Spent</TableHead>
            <TableHead className="w-[120px]">Last Booking</TableHead>
            <TableHead className="w-[120px]">Joined</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        {/* Tablet Header */}
        <TableHeader className="hidden md:table-header-group lg:hidden">
          <TableRow>
            <TableHead className="w-[180px]">Customer</TableHead>
            <TableHead className="w-[100px] text-center">Bookings</TableHead>
            <TableHead className="w-[120px]">Spent</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        {/* Mobile - No Header */}
        <TableHeader className="md:hidden">
          <TableRow>
            <TableHead className="sr-only">Customer Information</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {customers.map((customer) => (
            <CustomerRow
              key={customer.id}
              customer={customer}
              onSelect={onSelectCustomer}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
