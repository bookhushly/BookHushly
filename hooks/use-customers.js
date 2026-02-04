// hooks/use-customers.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const CUSTOMERS_PER_PAGE = 50;

export function useCustomers({ search, filters, page = 1 }) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const customersQuery = useQuery({
    queryKey: ["customers", { search, filters, page }],
    queryFn: async () => {
      const from = (page - 1) * CUSTOMERS_PER_PAGE;
      const to = from + CUSTOMERS_PER_PAGE - 1;

      let query = supabase
        .from("users")
        .select(
          `
          id,
          email,
          name,
          role,
          created_at,
          updated_at
        `,
          { count: "exact" },
        )
        .eq("role", "customer")
        .range(from, to)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch analytics for each customer
      const customersWithAnalytics = await Promise.all(
        (data || []).map(async (customer) => {
          const { data: analytics } = await supabase.rpc(
            "get_customer_analytics_optimized",
            { p_customer_id: customer.id },
          );
          return {
            ...customer,
            analytics: analytics || {},
          };
        }),
      );

      return {
        customers: customersWithAnalytics,
        total: count || 0,
        hasMore: (count || 0) > page * CUSTOMERS_PER_PAGE,
      };
    },
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });

  const statsQuery = useQuery({
    queryKey: ["customerStats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_customer_stats_optimized",
      );
      if (error) throw error;
      return data || {};
    },
    staleTime: 5 * 60 * 1000,
  });

  const prefetchNextPage = () => {
    if (customersQuery.data?.hasMore) {
      queryClient.prefetchQuery({
        queryKey: ["customers", { search, filters, page: page + 1 }],
      });
    }
  };

  return {
    customers: customersQuery.data?.customers || [],
    total: customersQuery.data?.total || 0,
    hasMore: customersQuery.data?.hasMore || false,
    stats: statsQuery.data || {},
    loading: customersQuery.isLoading || customersQuery.isFetching,
    statsLoading: statsQuery.isLoading,
    error: customersQuery.error || statsQuery.error,
    refetch: () => {
      customersQuery.refetch();
      statsQuery.refetch();
    },
    prefetchNextPage,
  };
}

export function useCustomerDetails(customerId, enabled = false) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["customerDetails", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", customerId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: enabled && !!customerId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCustomerAnalytics(customerId, enabled = false) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["customerAnalytics", customerId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_customer_analytics_optimized",
        { p_customer_id: customerId },
      );
      if (error) throw error;
      return data || {};
    },
    enabled: enabled && !!customerId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCustomerBookings(customerId, enabled = false) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["customerBookings", customerId],
    queryFn: async () => {
      const [hotelRes, apartmentRes, eventRes] = await Promise.all([
        supabase
          .from("hotel_bookings")
          .select(
            `
            id,
            guest_name,
            check_in_date,
            check_out_date,
            total_price,
            payment_status,
            booking_status,
            created_at,
            hotels(name, city, state)
          `,
          )
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("apartment_bookings")
          .select(
            `
            id,
            guest_name,
            check_in_date,
            check_out_date,
            total_amount,
            payment_status,
            booking_status,
            created_at,
            serviced_apartments(name, city, state)
          `,
          )
          .eq("user_id", customerId)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("event_bookings")
          .select(
            `
            id,
            contact_email,
            booking_date,
            total_amount,
            payment_status,
            status,
            created_at,
            listings(title, location)
          `,
          )
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      return {
        hotels: hotelRes.data || [],
        apartments: apartmentRes.data || [],
        events: eventRes.data || [],
        total:
          (hotelRes.data?.length || 0) +
          (apartmentRes.data?.length || 0) +
          (eventRes.data?.length || 0),
      };
    },
    enabled: enabled && !!customerId,
    staleTime: 5 * 60 * 1000,
  });
}
