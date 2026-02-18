"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  Calendar,
  Hotel,
  Building2,
  Ticket,
  Truck,
  Shield,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  Star,
  Banknote,
  Activity,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDashboardStats, getRecentActivity } from "@/app/actions/customers";
import {
  StatCard,
  StatusBadge,
  SectionCard,
  Amount,
} from "@/components/shared/customer/shared-ui";

const SERVICE_LINKS = [
  {
    label: "Book Hotel",
    icon: Hotel,
    href: "/services?category=hotels",
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "Rent Apartment",
    icon: Building2,
    href: "/services?category=serviced_apartments",
    color: "text-purple-600 bg-purple-50",
  },
  {
    label: "Book Event",
    icon: Ticket,
    href: "/services?category=events",
    color: "text-pink-600 bg-pink-50",
  },
  {
    label: "Request Logistics",
    icon: Truck,
    href: "/quote-services?tab=logistics",
    color: "text-amber-600 bg-amber-50",
  },
  {
    label: "Hire Security",
    icon: Shield,
    href: "/quote-services?tab=security",
    color: "text-green-600 bg-green-50",
  },
];

const TYPE_CONFIG = {
  hotel: { label: "Hotel", icon: Hotel, color: "bg-blue-50 text-blue-600" },
  apartment: {
    label: "Apartment",
    icon: Building2,
    color: "bg-purple-50 text-purple-600",
  },
  event: { label: "Event", icon: Ticket, color: "bg-pink-50 text-pink-600" },
  logistics: {
    label: "Logistics",
    icon: Truck,
    color: "bg-amber-50 text-amber-600",
  },
  security: {
    label: "Security",
    icon: Shield,
    color: "bg-green-50 text-green-600",
  },
};

export function DashboardOverviewClient({
  userId,
  userName,
  initialStats,
  initialActivity,
  memberSince,
}) {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", userId],
    queryFn: () => getDashboardStats(userId),
    initialData: initialStats,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: activity = [] } = useQuery({
    queryKey: ["recent-activity", userId],
    queryFn: () => getRecentActivity(userId),
    initialData: initialActivity,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {userName.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {memberSince
              ? `Member since ${format(new Date(memberSince), "MMMM yyyy")}`
              : "Welcome to your dashboard"}
          </p>
        </div>
        <Button
          asChild
          className="bg-purple-600 hover:bg-purple-700 text-white self-start sm:self-auto"
        >
          <Link href="/services">
            <Plus className="h-4 w-4 mr-2" />
            Book a Service
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings ?? "—"}
          subtitle="All time"
          icon={Calendar}
          variant="purple"
        />
        <StatCard
          title="Active"
          value={stats?.activeBookings ?? "—"}
          subtitle="In progress"
          icon={Activity}
        />
        <StatCard
          title="Completed"
          value={stats?.completedBookings ?? "—"}
          subtitle="Successfully done"
          icon={CheckCircle2}
          variant="soft"
        />
        <StatCard
          title="Total Spend"
          value={
            stats?.totalSpend
              ? `₦${(stats.totalSpend / 1000).toFixed(0)}k`
              : "₦0"
          }
          subtitle="Lifetime value"
          icon={Banknote}
        />
      </div>

      {/* Service breakdown */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            {
              label: "Hotels",
              count: stats.hotelCount,
              icon: Hotel,
              href: "/dashboard/customer/hotels",
            },
            {
              label: "Apartments",
              count: stats.apartmentCount,
              icon: Building2,
              href: "/dashboard/customer/apartments",
            },
            {
              label: "Events",
              count: stats.eventCount,
              icon: Ticket,
              href: "/dashboard/customer/events",
            },
            {
              label: "Logistics",
              count: stats.logisticsCount,
              icon: Truck,
              href: "/dashboard/customer/logistics",
            },
            {
              label: "Security",
              count: stats.securityCount,
              icon: Shield,
              href: "/dashboard/customer/security",
            },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="bg-white border border-purple-100 rounded-xl p-4 hover:border-purple-300 hover:shadow-sm transition-all group"
            >
              <item.icon className="h-5 w-5 text-purple-400 group-hover:text-purple-600 mb-2 transition-colors" />
              <p className="text-lg font-bold text-gray-900">{item.count}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Recent Activity"
            description="Your latest bookings and requests"
            action={
              <Link
                href="/dashboard/customer/hotels"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            {activity.length === 0 ? (
              <div className="text-center py-10">
                <Calendar className="h-10 w-10 text-purple-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No activity yet</p>
                <Button asChild variant="link" className="text-purple-600 mt-2">
                  <Link href="/services">Browse services</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activity.map((item) => {
                  const conf = TYPE_CONFIG[item.type] || TYPE_CONFIG.hotel;
                  const Icon = conf.icon;
                  const detailHref = `/dashboard/customer/${item.type === "hotel" ? "hotels" : item.type === "apartment" ? "apartments" : item.type === "event" ? "events" : item.type + "s"}`;

                  return (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={detailHref}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-purple-50 transition-all group"
                    >
                      <div
                        className={`p-2.5 rounded-xl flex-shrink-0 ${conf.color}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {item.subtitle}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <StatusBadge status={item.status} />
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(item.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Quick Book */}
        <div>
          <SectionCard title="Quick Book" description="Start a new booking">
            <div className="space-y-2">
              {SERVICE_LINKS.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 border border-transparent hover:border-purple-100 transition-all group"
                >
                  <div className={`p-2 rounded-lg ${s.color}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 flex-1">
                    {s.label}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-purple-400 transition-colors" />
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
