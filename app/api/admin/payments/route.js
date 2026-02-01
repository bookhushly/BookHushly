import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { STATUS_CATEGORIES } from "../../../../lib/paystack/constants/payment-status";

/**
 * Admin Payments API
 * GET /api/admin/payments
 *
 * Features:
 * - Pagination
 * - Filtering (status, provider, search)
 * - Sorting
 * - Stats calculation
 * - Optimized queries
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const offset = (page - 1) * pageSize;

    // Filters
    const statusFilter = searchParams.get("status");
    const providerFilter = searchParams.get("provider");
    const searchQuery = searchParams.get("search");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const supabase = await createClient();

    // Build base query
    let query = supabase.from("payments").select("*", { count: "exact" });

    // Apply filters
    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "success") {
        query = query.in("status", STATUS_CATEGORIES.SUCCESS);
      } else if (statusFilter === "pending") {
        query = query.in("status", STATUS_CATEGORIES.IN_PROGRESS);
      } else if (statusFilter === "failed") {
        query = query.in("status", STATUS_CATEGORIES.FAILED);
      } else {
        query = query.eq("status", statusFilter);
      }
    }

    if (providerFilter && providerFilter !== "all") {
      query = query.eq("provider", providerFilter);
    }

    // Search across multiple fields
    if (searchQuery && searchQuery.trim()) {
      const search = searchQuery.trim();
      query = query.or(
        `reference.ilike.%${search}%,email.ilike.%${search}%,customer_id.ilike.%${search}%`,
      );
    }

    // Apply sorting
    const validSortFields = [
      "created_at",
      "amount",
      "reference",
      "provider",
      "status",
      "paid_at",
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    query = query.order(sortField, { ascending: sortOrder === "asc" });

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    // Execute query
    const { data: payments, error, count } = await query;

    if (error) {
      console.error("Error fetching payments:", error);
      return NextResponse.json(
        { error: "Failed to fetch payments" },
        { status: 500 },
      );
    }

    // Calculate stats (optimized - single query)
    const { data: statsData } = await supabase
      .from("payments")
      .select("status, amount, currency")
      .in("status", [
        ...STATUS_CATEGORIES.SUCCESS,
        ...STATUS_CATEGORIES.IN_PROGRESS,
        ...STATUS_CATEGORIES.FAILED,
      ]);

    const stats = {
      totalRevenue: 0,
      successCount: 0,
      pendingCount: 0,
      failedCount: 0,
    };

    if (statsData) {
      statsData.forEach((payment) => {
        if (STATUS_CATEGORIES.SUCCESS.includes(payment.status)) {
          stats.successCount++;
          if (payment.currency === "NGN") {
            stats.totalRevenue += parseFloat(payment.amount || 0);
          }
        } else if (STATUS_CATEGORIES.IN_PROGRESS.includes(payment.status)) {
          stats.pendingCount++;
        } else if (STATUS_CATEGORIES.FAILED.includes(payment.status)) {
          stats.failedCount++;
        }
      });
    }

    return NextResponse.json({
      payments,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
      stats,
    });
  } catch (error) {
    console.error("Admin payments API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
