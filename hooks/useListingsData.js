// lib/hooks/useListingsData.js
"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { vendorDashboardKeys } from "./use-vendor-dashboard";
import { useInView } from "react-intersection-observer";
import { useEffect, useMemo } from "react";

const supabase = createClient();

const ITEMS_PER_PAGE = 20;
const PREFETCH_THRESHOLD = 0.8;

// Query keys with better hierarchy
export const listingKeys = {
  all: ["listings"],
  detail: (id) => [...listingKeys.all, "detail", id],
  category: (category) => [...listingKeys.all, "category", category],
  filtered: (category, searchQuery, filters) => [
    ...listingKeys.category(category),
    "filtered",
    searchQuery,
    JSON.stringify(filters),
  ],
};

// ==================== CLIENT-SIDE AMENITIES FILTER ====================
function filterByAmenities(items, amenitiesFilter) {
  if (!amenitiesFilter || amenitiesFilter.length === 0) return items;

  return items.filter((item) => {
    const itemAmenities = item.amenities?.items || [];
    // Also check room_amenities for hotels
    const roomAmenities = item.room_amenities || [];
    const allAmenities = [...itemAmenities, ...roomAmenities];
    return amenitiesFilter.every((amenity) => allAmenities.includes(amenity));
  });
}

// ==================== CLIENT-SIDE BED SIZE FILTER ====================
function filterByBedSizes(items, bedSizesFilter) {
  if (!bedSizesFilter || bedSizesFilter.length === 0) return items;

  return items.filter((item) => {
    const itemBedSizes = item.bed_sizes || [];
    return bedSizesFilter.some((size) => itemBedSizes.includes(size));
  });
}

// ==================== CLIENT-SIDE MAX OCCUPANCY FILTER ====================
function filterByMaxOccupancy(items, minOccupancy) {
  if (!minOccupancy) return items;
  return items.filter((item) => item.max_occupancy >= minOccupancy);
}

// ==================== CLIENT-SIDE FLOOR FILTER ====================
function filterByFloor(items, floorFilter) {
  if (!floorFilter) return items;
  return items.filter((item) => {
    const floors = item.floors || [];
    return floors.includes(floorFilter);
  });
}

// ==================== CLIENT-SIDE SECURITY FEATURES FILTER ====================
function filterBySecurityFeatures(items, securityFilter) {
  if (!securityFilter || securityFilter.length === 0) return items;

  return items.filter((item) => {
    const features = item.security_features || {};
    return securityFilter.every((feature) => features[feature] === true);
  });
}

// ==================== NORMALIZATION FUNCTIONS ====================
const normalizeHotelData = (hotel) => ({
  id: hotel.id,
  title: hotel.name,
  location:
    `${hotel.city || ""}${hotel.city && hotel.state ? ", " : ""}${hotel.state || ""}`.trim() ||
    hotel.address ||
    "Location not specified",
  price: hotel.min_price || 0,
  media_urls: hotel.image_urls || [],
  category: "hotels",
  vendor_name: hotel.name,
  description: hotel.description,
  amenities: hotel.amenities,
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

const normalizeApartmentData = (apartment) => ({
  id: apartment.id,
  title: apartment.name,
  location:
    `${apartment.city || ""}${apartment.city && apartment.state ? ", " : ""}${apartment.state || ""}`.trim() ||
    apartment.address ||
    "Location not specified",
  price: apartment.price_per_night || 0,
  media_urls: apartment.image_urls || [],
  category: "serviced_apartments",
  vendor_name: apartment.name,
  description: apartment.description,
  amenities: apartment.amenities,
  apartment_id: apartment.id,
  apartment_type: apartment.apartment_type,
  city: apartment.city,
  state: apartment.state,
  area: apartment.area,
  landmark: apartment.landmark,
  address: apartment.address,
  bedrooms: apartment.bedrooms,
  bathrooms: apartment.bathrooms,
  max_guests: apartment.max_guests,
  square_meters: apartment.square_meters,
  price_per_week: apartment.price_per_week,
  price_per_month: apartment.price_per_month,
  minimum_stay: apartment.minimum_stay,
  furnished: apartment.furnished,
  kitchen_equipped: apartment.kitchen_equipped,
  parking_spaces: apartment.parking_spaces,
  has_balcony: apartment.has_balcony,
  has_terrace: apartment.has_terrace,
  utilities_included: apartment.utilities_included,
  electricity_included: apartment.electricity_included,
  generator_available: apartment.generator_available,
  generator_hours: apartment.generator_hours,
  inverter_available: apartment.inverter_available,
  solar_power: apartment.solar_power,
  water_supply: apartment.water_supply,
  internet_included: apartment.internet_included,
  internet_speed: apartment.internet_speed,
  security_features: apartment.security_features,
  check_in_time: apartment.check_in_time,
  check_out_time: apartment.check_out_time,
  cancellation_policy: apartment.cancellation_policy,
  house_rules: apartment.house_rules,
  caution_deposit: apartment.caution_deposit,
  status: apartment.status,
  available_from: apartment.available_from,
  available_until: apartment.available_until,
  instant_booking: apartment.instant_booking,
});

// ==================== ENRICHMENT FUNCTIONS ====================
async function enrichHotelsWithRoomData(hotels) {
  if (!hotels.length) return hotels;

  const hotelIds = hotels.map((h) => h.id);

  try {
    const [roomDataResult, roomTypesResult] = await Promise.all([
      supabase
        .from("hotel_rooms")
        .select("hotel_id,price_per_night,status,beds,floor,amenities")
        .in("hotel_id", hotelIds),
      supabase
        .from("hotel_room_types")
        .select("hotel_id,id,name,max_occupancy,base_price,size_sqm,amenities")
        .in("hotel_id", hotelIds),
    ]);

    const roomData = roomDataResult.data || [];
    const roomTypesData = roomTypesResult.data || [];

    const hotelDataMap = new Map(
      hotelIds.map((id) => [
        id,
        {
          total_rooms: 0,
          available_rooms: 0,
          room_types_count: 0,
          prices: [],
          bed_sizes: new Set(),
          max_occupancy: 0,
          floors: new Set(),
          room_type_names: new Set(),
          room_amenities: new Set(),
        },
      ]),
    );

    // Process rooms
    roomData.forEach((room) => {
      const data = hotelDataMap.get(room.hotel_id);
      if (data) {
        data.total_rooms++;
        if (room.status === "available") data.available_rooms++;
        if (room.price_per_night)
          data.prices.push(parseFloat(room.price_per_night));

        // Extract bed sizes from beds JSONB
        if (room.beds) {
          const beds = Array.isArray(room.beds) ? room.beds : [room.beds];
          beds.forEach((bed) => {
            if (bed.type) data.bed_sizes.add(bed.type.toLowerCase());
          });
        }

        // Track floors
        if (room.floor) data.floors.add(room.floor);

        // Collect room amenities
        if (room.amenities?.items) {
          room.amenities.items.forEach((amenity) =>
            data.room_amenities.add(amenity),
          );
        }
      }
    });

    // Process room types
    roomTypesData.forEach((roomType) => {
      const data = hotelDataMap.get(roomType.hotel_id);
      if (data) {
        data.room_types_count++;
        if (roomType.name) data.room_type_names.add(roomType.name);
        if (roomType.max_occupancy)
          data.max_occupancy = Math.max(
            data.max_occupancy,
            roomType.max_occupancy,
          );

        // Collect room type amenities
        if (roomType.amenities?.items) {
          roomType.amenities.items.forEach((amenity) =>
            data.room_amenities.add(amenity),
          );
        }
      }
    });

    return hotels.map((hotel) => {
      const data = hotelDataMap.get(hotel.id);
      return {
        ...hotel,
        total_rooms: data.total_rooms,
        available_rooms: data.available_rooms,
        room_types_count: data.room_types_count,
        min_price: data.prices.length > 0 ? Math.min(...data.prices) : 0,
        max_price: data.prices.length > 0 ? Math.max(...data.prices) : 0,
        bed_sizes: Array.from(data.bed_sizes),
        max_occupancy: data.max_occupancy,
        floors: Array.from(data.floors).sort((a, b) => a - b),
        room_type_names: Array.from(data.room_type_names),
        room_amenities: Array.from(data.room_amenities),
      };
    });
  } catch (error) {
    console.error("Error enriching hotels:", error);
    return hotels;
  }
}

// ==================== QUERY BUILDERS ====================
function buildQuery(category, searchQuery, filters, pageParam) {
  const offset = pageParam * ITEMS_PER_PAGE;

  if (category === "hotels") {
    const fields = `id,name,description,address,city,state,image_urls,amenities,checkout_policy,policies,created_at`;

    let query = supabase
      .from("hotels")
      .select(fields, { count: "exact" })
      .range(offset, offset + ITEMS_PER_PAGE - 1)
      .order("created_at", { ascending: false });

    if (searchQuery?.trim()) {
      const sanitized = searchQuery.trim();
      query = query.or(
        `name.ilike.%${sanitized}%,city.ilike.%${sanitized}%,state.ilike.%${sanitized}%,address.ilike.%${sanitized}%`,
      );
    }

    if (filters.city?.trim()) query = query.ilike("city", filters.city.trim());
    if (filters.state) query = query.eq("state", filters.state);

    return query;
  }

  if (category === "serviced_apartments") {
    const fields = `id,name,description,apartment_type,address,city,state,area,landmark,bedrooms,bathrooms,max_guests,square_meters,price_per_night,price_per_week,price_per_month,minimum_stay,utilities_included,electricity_included,generator_available,generator_hours,inverter_available,solar_power,water_supply,internet_included,internet_speed,furnished,kitchen_equipped,parking_spaces,has_balcony,has_terrace,security_features,amenities,image_urls,check_in_time,check_out_time,cancellation_policy,house_rules,caution_deposit,status,available_from,available_until,instant_booking,created_at`;

    let query = supabase
      .from("serviced_apartments")
      .select(fields, { count: "exact" })
      .eq("status", "active")
      .range(offset, offset + ITEMS_PER_PAGE - 1)
      .order("created_at", { ascending: false });

    if (searchQuery?.trim()) {
      const sanitized = searchQuery.trim();
      query = query.or(
        `name.ilike.%${sanitized}%,city.ilike.%${sanitized}%,state.ilike.%${sanitized}%,area.ilike.%${sanitized}%,address.ilike.%${sanitized}%`,
      );
    }

    if (filters.city?.trim()) query = query.ilike("city", filters.city.trim());
    if (filters.state) query = query.eq("state", filters.state);
    if (filters.apartment_type)
      query = query.eq("apartment_type", filters.apartment_type);
    if (filters.bedrooms) query = query.gte("bedrooms", filters.bedrooms);
    if (filters.bathrooms) query = query.gte("bathrooms", filters.bathrooms);
    if (filters.max_guests) query = query.gte("max_guests", filters.max_guests);
    if (filters.parking_spaces)
      query = query.gte("parking_spaces", filters.parking_spaces);
    if (filters.price_min)
      query = query.gte("price_per_night", filters.price_min);
    if (filters.price_max)
      query = query.lte("price_per_night", filters.price_max);

    // Boolean filters
    if (filters.furnished !== null && filters.furnished !== undefined) {
      query = query.eq("furnished", filters.furnished);
    }
    if (
      filters.utilities_included !== null &&
      filters.utilities_included !== undefined
    ) {
      query = query.eq("utilities_included", filters.utilities_included);
    }
    if (
      filters.internet_included !== null &&
      filters.internet_included !== undefined
    ) {
      query = query.eq("internet_included", filters.internet_included);
    }

    // Power supply filters
    if (filters.generator_available)
      query = query.eq("generator_available", true);
    if (filters.inverter_available)
      query = query.eq("inverter_available", true);
    if (filters.solar_power) query = query.eq("solar_power", true);

    // Water supply
    if (filters.water_supply)
      query = query.eq("water_supply", filters.water_supply);

    return query;
  }

  // Events (listings table)
  const fields =
    "id,title,location,price,media_urls,category,vendor_name,description,amenities,maximum_capacity,created_at";

  let query = supabase
    .from("listings")
    .select(fields, { count: "exact" })
    .eq("active", true)
    .eq("category", category)
    .range(offset, offset + ITEMS_PER_PAGE - 1)
    .order("created_at", { ascending: false });

  if (searchQuery?.trim()) {
    const sanitized = searchQuery.trim();
    query = query.or(
      `title.ilike.%${sanitized}%,location.ilike.%${sanitized}%`,
    );
  }

  if (filters.price_min) query = query.gte("price", filters.price_min);
  if (filters.price_max) query = query.lte("price", filters.price_max);
  if (filters.capacity) query = query.gte("maximum_capacity", filters.capacity);

  return query;
}

// ==================== FETCH FUNCTIONS ====================
async function fetchListing(listingId, businessCategory) {
  if (!listingId) throw new Error("Listing ID is required");

  try {
    if (businessCategory === "hotels") {
      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .eq("id", listingId)
        .single();

      if (error) throw error;
      return data;
    }

    if (businessCategory === "serviced_apartments") {
      const { data, error } = await supabase
        .from("serviced_apartments")
        .select("*")
        .eq("id", listingId)
        .single();

      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching listing:", error);
    throw error;
  }
}

async function fetchListingsPage({
  pageParam = 0,
  category,
  searchQuery,
  filters,
}) {
  try {
    const query = buildQuery(category, searchQuery, filters, pageParam);
    const { data, error, count } = await query;

    if (error) throw error;

    let items = data || [];

    // Enrich and normalize
    if (category === "hotels") {
      items = await enrichHotelsWithRoomData(items);
      items = items
        .map(normalizeHotelData)
        .filter((hotel) => hotel.available_rooms > 0);

      // Apply price filters after enrichment
      if (filters.price_min) {
        items = items.filter((hotel) => hotel.price >= filters.price_min);
      }
      if (filters.price_max) {
        items = items.filter((hotel) => hotel.price <= filters.price_max);
      }

      // Apply client-side amenities filter
      if (filters.amenities && filters.amenities.length > 0) {
        items = filterByAmenities(items, filters.amenities);
      }

      // Apply client-side bed size filter
      if (filters.bed_sizes && filters.bed_sizes.length > 0) {
        items = filterByBedSizes(items, filters.bed_sizes);
      }

      // Apply max occupancy filter
      if (filters.max_occupancy) {
        items = filterByMaxOccupancy(items, filters.max_occupancy);
      }

      // Apply floor filter
      if (filters.floor) {
        items = filterByFloor(items, filters.floor);
      }
    } else if (category === "serviced_apartments") {
      items = items.map(normalizeApartmentData);

      // Apply client-side filters
      if (filters.amenities && filters.amenities.length > 0) {
        items = filterByAmenities(items, filters.amenities);
      }
      if (filters.security_features && filters.security_features.length > 0) {
        items = filterBySecurityFeatures(items, filters.security_features);
      }
    }

    return {
      items,
      nextPage: items.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined,
      totalCount: count,
    };
  } catch (error) {
    console.error("Error fetching listings page:", error);
    // Return empty result instead of throwing to handle network failures gracefully
    return {
      items: [],
      nextPage: undefined,
      totalCount: 0,
    };
  }
}

async function updateListingData(listingId, updateData, businessCategory) {
  if (!listingId) throw new Error("Listing ID is required");

  const dataToUpdate = {
    ...updateData,
    updated_at: new Date().toISOString(),
  };

  try {
    if (businessCategory === "hotels") {
      const { data, error } = await supabase
        .from("hotels")
        .update(dataToUpdate)
        .eq("id", listingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    if (businessCategory === "serviced_apartments") {
      const { data, error } = await supabase
        .from("serviced_apartments")
        .update(dataToUpdate)
        .eq("id", listingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from("listings")
      .update(dataToUpdate)
      .eq("id", listingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating listing:", error);
    throw error;
  }
}

// ==================== HOOKS ====================
export function useListing(listingId, businessCategory) {
  return useQuery({
    queryKey: listingKeys.detail(listingId),
    queryFn: () => fetchListing(listingId, businessCategory),
    enabled: !!listingId && !!businessCategory,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
}

export function useListingsData(category, searchQuery = "", filters = {}) {
  const queryClient = useQueryClient();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: listingKeys.filtered(category, searchQuery, filters),
    queryFn: ({ pageParam = 0 }) =>
      fetchListingsPage({ pageParam, category, searchQuery, filters }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!category,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const listings = useMemo(
    () => data?.pages.flatMap((page) => page.items) || [],
    [data],
  );

  const { ref: lastListingRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "500px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!data || !hasNextPage || isFetchingNextPage) return;

    const totalLoaded = listings.length;
    const prefetchThreshold = Math.floor(totalLoaded * PREFETCH_THRESHOLD);

    if (listings.length >= prefetchThreshold) {
      const currentPage = data.pages.length;
      queryClient.prefetchInfiniteQuery({
        queryKey: listingKeys.filtered(category, searchQuery, filters),
        queryFn: ({ pageParam = currentPage }) =>
          fetchListingsPage({ pageParam, category, searchQuery, filters }),
      });
    }
  }, [
    listings.length,
    data,
    hasNextPage,
    isFetchingNextPage,
    category,
    searchQuery,
    filters,
    queryClient,
  ]);

  return {
    listings,
    loading: isLoading,
    fetchError: error,
    isLoadingMore: isFetchingNextPage,
    hasMore: hasNextPage,
    lastListingRef,
    totalCount: data?.pages[0]?.totalCount || 0,
  };
}

export function useUpdateListing(businessCategory) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, updateData }) =>
      updateListingData(listingId, updateData, businessCategory),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: listingKeys.detail(variables.listingId),
      });
      queryClient.invalidateQueries({
        queryKey: vendorDashboardKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: listingKeys.all,
      });
    },
  });
}
