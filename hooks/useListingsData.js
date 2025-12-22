import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { debounce } from "lodash";

const ITEMS_PER_PAGE = 16;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const normalizeHotelData = (hotel) => ({
  id: hotel.id,
  title: hotel.name,
  location:
    `${hotel.city || ""}${hotel.city && hotel.state ? ", " : ""}${hotel.state || ""}`.trim() ||
    hotel.address ||
    "Location not specified",
  price: hotel.min_price || 0, // Minimum room price from aggregation
  media_urls: hotel.image_urls || [],
  category: "hotels",
  vendor_name: hotel.name,
  description: hotel.description,
  amenities: hotel.amenities,
  // Hotel-specific data
  hotel_id: hotel.id,
  city: hotel.city,
  state: hotel.state,
  address: hotel.address,
  checkout_policy: hotel.checkout_policy,
  policies: hotel.policies,
  total_rooms: hotel.total_rooms || 0,
  available_rooms: hotel.available_rooms || 0,
  room_types_count: hotel.room_types_count || 0,
  max_price: hotel.max_price || 0,
});

export const useListingsData = (category, searchQuery, filters) => {
  const supabase = createClient();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const cache = useRef(new Map());
  const observer = useRef(null);
  const abortControllerRef = useRef(null);

  const buildQuery = useCallback(
    (pageNum, currentCategory, currentQuery, currentFilters) => {
      console.log("🔧 Building query:", {
        pageNum,
        currentCategory,
        currentQuery,
        currentFilters,
      });

      // For hotels, fetch from hotels table with room aggregations
      if (currentCategory === "hotels") {
        const fields = `
          id,
          name,
          description,
          address,
          city,
          state,
          image_urls,
          amenities,
          checkout_policy,
          policies
        `;

        let query = supabase
          .from("hotels")
          .select(fields, { count: "exact" })
          .range((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE - 1)
          .order("created_at", { ascending: false });

        console.log("🏨 Querying hotels table");

        if (currentQuery) {
          query = query.or(
            `name.ilike.%${currentQuery}%,city.ilike.%${currentQuery}%,state.ilike.%${currentQuery}%,address.ilike.%${currentQuery}%`
          );
          console.log("🔍 Added search filter:", currentQuery);
        }

        if (currentFilters.city) {
          query = query.eq("city", currentFilters.city);
          console.log("📍 Added city filter:", currentFilters.city);
        }

        if (currentFilters.state) {
          query = query.eq("state", currentFilters.state);
          console.log("📍 Added state filter:", currentFilters.state);
        }

        console.log("✅ Hotels query fully built");
        return query;
      }

      // For other categories, fetch from listings table
      const fields =
        "id,title,location,price,media_urls,category,vendor_name,description,amenities";

      let query = supabase
        .from("listings")
        .select(fields, { count: "exact" })
        .eq("active", true)
        .eq("category", currentCategory)
        .range((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE - 1)
        .order("created_at", { ascending: false });

      console.log("📝 Querying listings table with category:", currentCategory);

      if (currentQuery) {
        query = query.or(
          `title.ilike.%${currentQuery}%,location.ilike.%${currentQuery}%`
        );
        console.log("🔍 Added search filter:", currentQuery);
      }

      if (currentFilters.price_min) {
        query = query.gte("price", currentFilters.price_min);
        console.log("💰 Added min price filter:", currentFilters.price_min);
      }
      if (currentFilters.price_max) {
        query = query.lte("price", currentFilters.price_max);
        console.log("💰 Added max price filter:", currentFilters.price_max);
      }

      // Category-specific filters
      if (currentFilters.bedrooms) {
        query = query.eq("bedrooms", currentFilters.bedrooms);
      }
      if (currentFilters.bathrooms) {
        query = query.eq("bathrooms", currentFilters.bathrooms);
      }
      if (currentFilters.capacity) {
        query = query.gte("maximum_capacity", currentFilters.capacity);
      }

      console.log("✅ Query fully built");
      return query;
    },
    []
  );

  // Fetch room data for hotels to get pricing and availability
  const enrichHotelsWithRoomData = useCallback(
    async (hotels) => {
      if (!hotels.length) return hotels;

      const hotelIds = hotels.map((h) => h.id);

      // Get room pricing and availability aggregates
      const { data: roomData } = await supabase
        .from("hotel_rooms")
        .select("hotel_id,price_per_night,status")
        .in("hotel_id", hotelIds);

      // Get room types count
      const { data: roomTypesData } = await supabase
        .from("hotel_room_types")
        .select("hotel_id,id")
        .in("hotel_id", hotelIds);

      // Aggregate data per hotel
      const hotelDataMap = new Map();

      hotelIds.forEach((id) => {
        hotelDataMap.set(id, {
          total_rooms: 0,
          available_rooms: 0,
          room_types_count: 0,
          min_price: null,
          max_price: null,
          prices: [],
        });
      });

      // Process room data
      roomData?.forEach((room) => {
        const hotelData = hotelDataMap.get(room.hotel_id);
        if (hotelData) {
          hotelData.total_rooms++;
          if (room.status === "available") {
            hotelData.available_rooms++;
          }
          if (room.price_per_night) {
            hotelData.prices.push(parseFloat(room.price_per_night));
          }
        }
      });

      // Process room types data
      roomTypesData?.forEach((roomType) => {
        const hotelData = hotelDataMap.get(roomType.hotel_id);
        if (hotelData) {
          hotelData.room_types_count++;
        }
      });

      // Calculate min/max prices
      hotelDataMap.forEach((data) => {
        if (data.prices.length > 0) {
          data.min_price = Math.min(...data.prices);
          data.max_price = Math.max(...data.prices);
        }
      });

      // Enrich hotels with aggregated data
      return hotels.map((hotel) => {
        const data = hotelDataMap.get(hotel.id) || {};
        return {
          ...hotel,
          total_rooms: data.total_rooms || 0,
          available_rooms: data.available_rooms || 0,
          room_types_count: data.room_types_count || 0,
          min_price: data.min_price || 0,
          max_price: data.max_price || 0,
        };
      });
    },
    [supabase]
  );

  const fetchListings = useCallback(
    async (
      pageNum,
      reset,
      currentCategory,
      currentQuery,
      currentFilters,
      retryCount = 0
    ) => {
      console.log("🔍 fetchListings called:", {
        pageNum,
        reset,
        currentCategory,
        currentQuery,
        currentFilters,
        retryCount,
      });

      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      const cacheKey = `${currentCategory}:${currentQuery}:${JSON.stringify(currentFilters)}:${pageNum}`;

      if (cache.current.has(cacheKey)) {
        console.log("✅ Using cached data");
        const cachedData = cache.current.get(cacheKey);
        setListings((prev) => (reset ? cachedData : [...prev, ...cachedData]));
        setHasMore(cachedData.length === ITEMS_PER_PAGE);
        setLoading(false);
        setIsLoadingMore(false);
        return;
      }

      setIsLoadingMore(!reset && pageNum > 1);
      if (reset) setLoading(true);

      try {
        const query = buildQuery(
          pageNum,
          currentCategory,
          currentQuery,
          currentFilters
        );

        const { data, error, count } = await query.abortSignal(
          abortControllerRef.current.signal
        );

        console.log("📦 Query result:", {
          dataLength: data?.length,
          error: error?.message,
          count,
        });

        if (error) {
          console.error("❌ Supabase error:", error);
          throw error;
        }

        let safeData = Array.isArray(data) ? data : [];
        console.log("✅ Safe data length:", safeData.length);

        // Enrich hotel data with room information
        if (currentCategory === "hotels") {
          console.log("🏨 Enriching hotel data with room information");
          safeData = await enrichHotelsWithRoomData(safeData);
          safeData = safeData
            .map(normalizeHotelData)
            .filter((hotel) => hotel.available_rooms > 0); // Only show hotels with available rooms
        }

        // Apply price filters for hotels after enrichment
        if (currentCategory === "hotels") {
          if (currentFilters.price_min) {
            safeData = safeData.filter(
              (hotel) => hotel.price >= currentFilters.price_min
            );
          }
          if (currentFilters.price_max) {
            safeData = safeData.filter(
              (hotel) => hotel.price <= currentFilters.price_max
            );
          }
        }

        cache.current.set(cacheKey, safeData);

        if (cache.current.size > 30) {
          const firstKey = cache.current.keys().next().value;
          cache.current.delete(firstKey);
        }

        setListings((prev) => (reset ? safeData : [...prev, ...safeData]));
        setHasMore(
          safeData.length === ITEMS_PER_PAGE && count > pageNum * ITEMS_PER_PAGE
        );
        setFetchError(null);
        console.log("✅ Listings set successfully:", safeData.length);
      } catch (error) {
        if (error?.name === "AbortError") {
          console.log("⚠️ Request aborted");
          return;
        }

        console.error("❌ Fetch error:", error);

        if (retryCount < MAX_RETRIES) {
          console.log(`🔄 Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return fetchListings(
            pageNum,
            reset,
            currentCategory,
            currentQuery,
            currentFilters,
            retryCount + 1
          );
        }

        console.error("💥 Max retries reached");
        setFetchError(error.message);
        toast.error(`Failed to load services: ${error.message}`);
      } finally {
        setIsLoadingMore(false);
        setLoading(false);
      }
    },
    [buildQuery, enrichHotelsWithRoomData]
  );

  const debouncedFetchListings = useMemo(
    () =>
      debounce(
        (pageNum, reset, cat, query, filts) =>
          fetchListings(pageNum, reset, cat, query, filts),
        300
      ),
    [fetchListings]
  );

  useEffect(() => {
    console.log("🚀 Initial fetch triggered:", {
      category,
      searchQuery,
      filters,
    });
    setLoading(true);
    setPage(1);
    setListings([]);
    setHasMore(true);
    debouncedFetchListings(1, true, category, searchQuery, filters);
    return () => debouncedFetchListings.cancel();
  }, [category, searchQuery, filters, debouncedFetchListings]);

  useEffect(() => {
    if (page > 1)
      debouncedFetchListings(page, false, category, searchQuery, filters);
  }, [page, category, searchQuery, filters, debouncedFetchListings]);

  const lastListingRef = useCallback(
    (node) => {
      if (isLoadingMore || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) setPage((prev) => prev + 1);
        },
        { threshold: 0.1, rootMargin: "300px" }
      );

      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore]
  );

  useEffect(() => {
    return () => {
      if (observer.current) observer.current.disconnect();
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return {
    listings,
    loading,
    fetchError,
    isLoadingMore,
    hasMore,
    lastListingRef,
  };
};
