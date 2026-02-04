// components/shared/admin/vendors/filters.jsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function VendorFilters({ filters, onChange }) {
  const handleReset = () => {
    onChange({
      status: "all",
      category: "all",
      approved: "all",
    });
  };

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.approved !== "all" ||
    filters.status !== "all";

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      <Select
        value={filters.category}
        onValueChange={(value) => onChange({ ...filters, category: value })}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="hotels">Hotels</SelectItem>
          <SelectItem value="apartments">Apartments</SelectItem>
          <SelectItem value="events">Events</SelectItem>
          <SelectItem value="logistics">Logistics</SelectItem>
          <SelectItem value="security">Security</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.approved}
        onValueChange={(value) => onChange({ ...filters, approved: value })}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Approval Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="true">Approved</SelectItem>
          <SelectItem value="false">Not Approved</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="w-full sm:w-auto"
        >
          <X className="w-4 h-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
}
