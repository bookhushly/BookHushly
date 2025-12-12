import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { debounce } from "lodash";

const ITEMS_PER_PAGE = 16;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const normalizeHotelRoomData = (room) => ({
  id: room.id,
  title: `${room.hotels?.name} - ${room.hotel_room_types?.name}`,
  location:
    `${room.hotels?.city || ""}${room.hotels?.city && room.hotels?.state ? ", " : ""}${room.hotels?.state || ""}`.trim() ||
    room.hotels?.address ||
    "Location not specified",
  price: parseFloat(room.price_per_night),
  media_urls:
    room.image_urls ||
    room.hotel_room_types?.image_urls ||
    room.hotels?.image_urls ||
    [],
  category: "hotels",
  vendor_name: room.hotels?.name || "Hotel",
  description: room.hotel_room_types?.description || room.hotels?.description,
  amenities:
    room.amenities ||
    room.hotel_room_types?.amenities ||
    room.hotels?.amenities,
  // Hotel-specific data
  hotel_id: room.hotel_id,
  room_number: room.room_number,
  floor: room.floor,
  beds: room.beds,
  status: room.status,
  max_occupancy: room.hotel_room_types?.max_occupancy,
  size_sqm: room.hotel_room_types?.size_sqm,
  room_type_name: room.hotel_room_types?.name,
  hotel_name: room.hotels?.name,
  hotel_address: room.hotels?.address,
  hotel_city: room.hotels?.city,
  hotel_state: room.hotels?.state,
  checkout_policy: room.hotels?.checkout_policy,
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

      // For hotels, fetch from hotel_rooms with joins
      if (currentCategory === "hotels") {
        const fields = `
          id,
          hotel_id,
          room_number,
          floor,
          beds,
          status,
          price_per_night,
          amenities,
          image_urls,
          hotels!inner(
            id,
            name,
            description,
            address,
            city,
            state,
            image_urls,
            amenities,
            checkout_policy
          ),
          hotel_room_types(
            name,
            description,
            max_occupancy,
            base_price,
            size_sqm,
            amenities,
            image_urls
          )
        `;

        let query = supabase
          .from("hotel_rooms")
          .select(fields, { count: "exact" })
          .eq("status", "available")
          .range((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE - 1)
          .order("created_at", { ascending: false });

        console.log("🏨 Querying hotel_rooms table");

        if (currentQuery) {
          // Search in hotel name and city
          query = query.or(
            `hotels.name.ilike.%${currentQuery}%,hotels.city.ilike.%${currentQuery}%,hotels.state.ilike.%${currentQuery}%`
          );
          console.log("🔍 Added search filter:", currentQuery);
        }

        if (currentFilters.price_min) {
          query = query.gte("price_per_night", currentFilters.price_min);
          console.log("💰 Added min price filter:", currentFilters.price_min);
        }
        if (currentFilters.price_max) {
          query = query.lte("price_per_night", currentFilters.price_max);
          console.log("💰 Added max price filter:", currentFilters.price_max);
        }

        if (currentFilters.city) {
          query = query.eq("hotels.city", currentFilters.city);
          console.log("📍 Added city filter:", currentFilters.city);
        }

        if (currentFilters.floor) {
          query = query.eq("floor", currentFilters.floor);
          console.log("🏢 Added floor filter:", currentFilters.floor);
        }

        console.log("✅ Hotel rooms query fully built");
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

        // Normalize hotel room data to match listing structure
        if (currentCategory === "hotels") {
          console.log("🏨 Normalizing hotel room data");
          safeData = safeData.map(normalizeHotelRoomData);
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
    [buildQuery]
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
