// hooks/use-vendors.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const VENDORS_PER_PAGE = 50;

export function useVendors({ search, filters, tab, page = 1 }) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const vendorsQuery = useQuery({
    queryKey: ["vendors", { search, filters, tab, page }],
    queryFn: async () => {
      const from = (page - 1) * VENDORS_PER_PAGE;
      const to = from + VENDORS_PER_PAGE - 1;

      let query = supabase
        .from("vendors")
        .select(
          `
          id,
          user_id,
          business_name,
          business_category,
          approved,
          status,
          created_at,
          updated_at,
          users!vendors_user_id_fkey(
            id,
            email,
            name
          )
        `,
          { count: "exact" },
        )
        .range(from, to)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(
          `business_name.ilike.%${search}%,business_category.ilike.%${search}%`,
        );
      }

      // Tab filtering based on KYC status enum
      if (tab === "pending") {
        query = query.in("status", ["pending", "submitted", "reviewing"]);
      } else if (tab === "approved") {
        query = query.eq("status", "approved").eq("approved", true);
      } else if (tab === "rejected") {
        query = query.eq("status", "rejected");
      }

      if (filters.category !== "all") {
        query = query.eq("business_category", filters.category);
      }

      if (filters.approved !== "all") {
        query = query.eq("approved", filters.approved === "true");
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        vendors: data || [],
        total: count || 0,
        hasMore: (count || 0) > page * VENDORS_PER_PAGE,
      };
    },
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });

  const statsQuery = useQuery({
    queryKey: ["vendorStats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_vendor_stats_optimized");
      if (error) throw error;
      return data || {};
    },
    staleTime: 5 * 60 * 1000,
  });

  const prefetchNextPage = () => {
    if (vendorsQuery.data?.hasMore) {
      queryClient.prefetchQuery({
        queryKey: ["vendors", { search, filters, tab, page: page + 1 }],
      });
    }
  };

  return {
    vendors: vendorsQuery.data?.vendors || [],
    total: vendorsQuery.data?.total || 0,
    hasMore: vendorsQuery.data?.hasMore || false,
    stats: statsQuery.data || {},
    loading: vendorsQuery.isLoading || vendorsQuery.isFetching,
    statsLoading: statsQuery.isLoading,
    error: vendorsQuery.error || statsQuery.error,
    refetch: () => {
      vendorsQuery.refetch();
      statsQuery.refetch();
    },
    prefetchNextPage,
  };
}

// Hook for vendor analytics (lazy loaded)
export function useVendorAnalytics(vendorId, enabled = false) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["vendorAnalytics", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_vendor_analytics_optimized",
        { p_vendor_id: vendorId },
      );
      if (error) throw error;
      return data || {};
    },
    enabled: enabled && !!vendorId,
    staleTime: 10 * 60 * 1000,
  });
}

// Hook for vendor details
export function useVendorDetails(vendorId, enabled = false) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["vendorDetails", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select(
          `
          *,
          users!vendors_user_id_fkey(
            id,
            email,
            name,
            role
          )
        `,
        )
        .eq("id", vendorId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: enabled && !!vendorId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for vendor listings (lazy loaded)
export function useVendorListings(vendorId, enabled = false) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["vendorListings", vendorId],
    queryFn: async () => {
      const { data: vendorData, error: vendorError } = await supabase
        .from("vendors")
        .select("user_id")
        .eq("id", vendorId)
        .single();

      if (vendorError) throw vendorError;

      const userId = vendorData?.user_id;

      if (!userId) {
        return {
          hotels: [],
          apartments: [],
          events: [],
          total: 0,
        };
      }

      const [hotelsRes, apartmentsRes, eventsRes] = await Promise.all([
        supabase
          .from("hotels")
          .select(
            `
            id,
            name,
            address,
            city,
            state,
            created_at
          `,
          )
          .eq("vendor_id", userId)
          .limit(100),
        supabase
          .from("serviced_apartments")
          .select(
            `
            id,
            name,
            address,
            city,
            state,
            price_per_night,
            status,
            created_at
          `,
          )
          .eq("vendor_id", userId)
          .limit(100),
        supabase
          .from("listings")
          .select(
            `
            id,
            title,
            location,
            active,
            created_at
          `,
          )
          .eq("vendor_id", vendorId)
          .eq("category", "events")
          .limit(100),
      ]);

      return {
        hotels: hotelsRes.data || [],
        apartments: apartmentsRes.data || [],
        events: eventsRes.data || [],
        total:
          (hotelsRes.data?.length || 0) +
          (apartmentsRes.data?.length || 0) +
          (eventsRes.data?.length || 0),
      };
    },
    enabled: enabled && !!vendorId,
    staleTime: 5 * 60 * 1000,
  });
}
