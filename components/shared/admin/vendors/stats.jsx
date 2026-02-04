// components/admin/vendors/VendorStats.jsx
import { memo } from "react";
import {
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/util";

export const VendorStats = memo(({ stats, loading }) => {
  const statCards = [
    {
      label: "Total Vendors",
      value: stats.total || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Pending Approval",
      value: stats.pending || 0,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "Approved",
      value: stats.approved || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue || 0),
      icon: DollarSign,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.bg} p-3 rounded-lg`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

VendorStats.displayName = "VendorStats";
