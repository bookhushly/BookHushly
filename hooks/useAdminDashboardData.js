"use client";

import { useEffect, useState } from "react";
import {
  getAdminStats,
  getAllUsers,
  getAllBookings,
  getPendingVendors,
  approveVendor,
} from "@/lib/database";
import { toast } from "sonner";

export const useAdminDashboardData = (user) => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeListings: 0,
    monthlyGrowth: 0,
    conversionRate: 0,
  });
  const [pendingVendors, setPendingVendors] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const loadAdminData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [
          { data: stats },
          { data: vendors },
          { data: users },
          { data: bookings },
        ] = await Promise.all([
          getAdminStats(),
          getPendingVendors(),
          getAllUsers({ limit: 5 }),
          getAllBookings({ limit: 5 }),
        ]);

        if (stats) setStats(stats);
        if (vendors) setPendingVendors(vendors);
        if (users) setRecentUsers(users);
        if (bookings) setRecentBookings(bookings);
      } catch (error) {
        console.error("Admin data load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [user]);

  const handleApproveVendor = async (vendorId, approved) => {
    setActionLoading(vendorId);
    try {
      const { error } = await approveVendor(vendorId, approved);
      if (error) throw error;

      setPendingVendors((prev) => prev.filter((v) => v.id !== vendorId));

      toast.success(`Vendor ${approved ? "approved" : "rejected"}!`, {
        description: "The vendor has been notified.",
      });
    } catch (err) {
      console.error("Vendor approval failed:", err);
      toast.error("Failed to update vendor status");
    } finally {
      setActionLoading(null);
    }
  };

  return {
    loading,
    stats,
    pendingVendors,
    recentUsers,
    recentBookings,
    actionLoading,
    handleApproveVendor,
  };
};
