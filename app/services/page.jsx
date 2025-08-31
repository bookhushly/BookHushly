"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  MapPin,
  Grid,
  List,
  Filter,
  Search,
  Star,
  Verified,
  Building,
  Calendar,
  Car,
  PartyPopper,
  UtensilsCrossed,
  Truck,
  Shield,
  Utensils,
  ChevronDown,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { extractCategoryData } from "@/lib/category-forms";
import { supabase } from "@/lib/supabase";

function ServicesContent() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("created_at_desc");

  const searchParams = useSearchParams();
  const observer = useRef(null);
  const ITEMS_PER_PAGE = 12;

  const initialSearch = searchParams.get("search") || "";
  const initialLocation = searchParams.get("location") || "all";
  const initialCategory = searchParams.get("category") || "all";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [viewMode, setViewMode] = useState("grid");

  const debouncedSearch = useCallback(
    debounce((value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("search", value);
      else params.delete("search");
      window.history.pushState(null, "", `?${params.toString()}`);
    }, 500),
    [searchParams]
  );

  useEffect(() => {
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "all";
    const category = searchParams.get("category") || "all";

    setSearchQuery(search);
    setSelectedLocation(location);
    setSelectedCategory(category);
    setPage(1);
    setHasMore(true);
    setListings([]);
  }, [searchParams]);

  const fetchListings = useCallback(
    async (pageNum, reset = false) => {
      if (!hasMore || isLoadingMore) return;
      setIsLoadingMore(true);

      try {
        let query = supabase
          .from("listings")
          .select(
            "id, vendor_id, title, description, category, price, location, capacity, duration, availability, features, media_urls, active, vendor_name, category_data, price_unit, operating_hours, service_areas, bedrooms, bathrooms, check_in_time, check_out_time, minimum_stay, maximum_capacity, vehicle_type, security_deposit, remaining_tickets, event_type"
          )
          .eq("active", true)
          .range((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE - 1);

        // Sorting
        const parts = sortBy.split("_");
        const sortDir = parts.pop();
        const sortField = parts.join("_");
        query = query.order(sortField, { ascending: sortDir === "asc" });

        if (selectedCategory !== "all")
          query = query.eq("category", selectedCategory);
        if (selectedLocation !== "all")
          query = query.ilike("location", `%${selectedLocation}%`);
        if (searchQuery) {
          query = query.or(
            `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,features.ilike.%${searchQuery}%`
          );
        }

        const { data, error } = await query;
        if (error) throw error;

        setListings((prev) =>
          reset ? data || [] : [...prev, ...(data || [])]
        );
        setHasMore(data?.length === ITEMS_PER_PAGE);
        setFetchError(null);
      } catch (error) {
        console.error("Error fetching listings:", error.message);
        setFetchError(error.message);
        setListings((prev) => (reset ? [] : prev));
      } finally {
        setIsLoadingMore(false);
        if (pageNum === 1) setLoading(false);
      }
    },
    [hasMore, selectedCategory, selectedLocation, searchQuery, sortBy]
  );

  useEffect(() => {
    fetchListings(page, page === 1);
  }, [page, fetchListings]);

  const lastListingRef = useCallback(
    (node) => {
      if (isLoadingMore || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
            setPage((prev) => prev + 1);
          }
        },
        { threshold: 0.1, rootMargin: "200px" }
      );

      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore]
  );

  const getPublicImageUrl = (path) => {
    if (!path) return "/placeholder.jpg";
    const pathParts = path.split("listing-images/");
    const filePath = pathParts.length > 1 ? pathParts[1] : path;

    const { data } = supabase.storage
      .from("listing-images")
      .getPublicUrl(filePath);

    return data.publicUrl || "/placeholder.jpg";
  };

  const getServiceImage = (service) => {
    if (service.media_urls && service.media_urls.length > 0) {
      return getPublicImageUrl(service.media_urls[0]);
    }
    const category = CATEGORIES.find((c) => c.value === service.category);
    return category?.image || "/placeholder.jpg";
  };

  const getCategorySpecificInfo = (service) => {
    const categoryData = extractCategoryData(service);
    const category = service.category;

    switch (category) {
      case "hotels":
      case "serviced_apartments":
        return {
          icon: <Building className="h-4 w-4" />,
          details: [
            service.bedrooms
              ? `${service.bedrooms} bedroom${service.bedrooms > 1 ? "s" : ""}`
              : null,
            service.bathrooms
              ? `${service.bathrooms} bathroom${service.bathrooms > 1 ? "s" : ""}`
              : null,
            service.check_in_time ? `Check-in: ${service.check_in_time}` : null,
            service.minimum_stay ? `Min. stay: ${service.minimum_stay}` : null,
          ]
            .filter(Boolean)
            .join(" • "),
          priceLabel:
            service.price_unit === "per_night" ? "per night" : "starting from",
        };
      case "events":
        return {
          icon: <PartyPopper className="h-4 w-4" />,
          details: service.event_type
            ? `${service.event_type === "event_center" ? "Event Center" : "Event Organizer"}`
            : "",
          priceLabel:
            service.price_unit === "per_event" ? "per event" : "starting from",
        };
      case "food":
        return {
          icon: <Utensils className="h-4 w-4" />,
          details: service.features ? service.features.split("\n")[0] : "",
          priceLabel:
            service.price_unit === "per_person"
              ? "per person"
              : "starting from",
        };
      case "logistics":
        return {
          icon: <Truck className="h-4 w-4" />,
          details: service.vehicle_type || "",
          priceLabel:
            service.price_unit === "per_km" ? "per km" : "starting from",
        };
      case "security":
        return {
          icon: <Shield className="h-4 w-4" />,
          details: service.features ? service.features.split("\n")[0] : "",
          priceLabel: "starting from",
        };
      case "car_rentals":
        return {
          icon: <Car className="h-4 w-4" />,
          details: service.vehicle_type || "",
          priceLabel:
            service.price_unit === "per_day" ? "per day" : "starting from",
        };
      default:
        return {
          icon: <Star className="h-4 w-4" />,
          details: service.features ? service.features.split("\n")[0] : "",
          priceLabel: "starting from",
        };
    }
  };

  const formatPrice = (service) => {
    const price = Number(service.price);
    const priceUnit = service.price_unit || "fixed";

    if (priceUnit === "fixed" || priceUnit === "per_event") {
      return `₦${price.toLocaleString()}`;
    } else if (priceUnit === "negotiable") {
      return "Negotiable";
    } else {
      const unitLabel =
        {
          per_hour: "/hr",
          per_day: "/day",
          per_night: "/night",
          per_person: "/person",
          per_km: "/km",
          per_week: "/week",
          per_month: "/month",
        }[priceUnit] || "";
      return `₦${price.toLocaleString()}${unitLabel}`;
    }
  };

  const getButtonConfig = (category) => {
    const configs = {
      hotels: { icon: Building, text: "Book Now" },
      serviced_apartments: { icon: Building, text: "Book Now" },
      events: { icon: PartyPopper, text: "Book Event" },
      food: { icon: Utensils, text: "Order Now" },
      logistics: { icon: Truck, text: "Hire Now" },
      security: { icon: Shield, text: "Hire Now" },
      car_rentals: { icon: Car, text: "Rent Now" },
    };
    return configs[category] || { icon: Star, text: "View Details" }; // Fallback
  };

  const formatFeatures = (features) => {
    if (!features) return [];
    return features.split("\n").map((feature, index) => ({
      key: `feature-${index}`,
      label: feature,
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  if (loading) {
    return <ServicesLoading />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Filter Bar - Inspired by Booking.com's search bar */}
      <motion.div
        className="sticky top-0 z-20 bg-white/95 backdrop-blur py-4 mb-8 rounded-2xl shadow-md border border-gray-100"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search services, locations, or vendors..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 h-12 rounded-full border-gray-200 focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>
            <Select
              value={selectedLocation}
              onValueChange={(value) => {
                setSelectedLocation(value);
                const params = new URLSearchParams(searchParams.toString());
                value === "all"
                  ? params.delete("location")
                  : params.set("location", value);
                window.history.pushState(null, "", `?${params.toString()}`);
                setPage(1);
                setListings([]);
              }}
            >
              <SelectTrigger className="h-12 rounded-full border-gray-200 w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {Array.from(new Set(listings.map((l) => l.location)))
                  .sort()
                  .map((loc) => (
                    <SelectItem key={loc} value={loc.toLowerCase()}>
                      {loc}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                const params = new URLSearchParams(searchParams.toString());
                value === "all"
                  ? params.delete("category")
                  : params.set("category", value);
                window.history.pushState(null, "", `?${params.toString()}`);
                setPage(1);
                setListings([]);
              }}
            >
              <SelectTrigger className="h-12 rounded-full border-gray-200 w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-12 rounded-full border-gray-200 w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at_desc">Newest First</SelectItem>
                <SelectItem value="price_asc">Price Low to High</SelectItem>
                <SelectItem value="price_desc">Price High to Low</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setViewMode("list")}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {listings.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <h3 className="text-2xl font-semibold text-gray-700">
              No results found
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Try adjusting your search or filters.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedLocation("all");
                window.history.pushState(null, "", "/services");
                setPage(1);
                setListings([]);
              }}
            >
              Reset Filters
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-6"
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {listings.map((service, index) => {
              const category =
                CATEGORIES.find((c) => c.value === service.category) || {};
              const isPremium = service.price > 100000;
              const isVerified = service.active;
              const serviceImage = getServiceImage(service);
              const categoryInfo = getCategorySpecificInfo(service);
              const formattedPrice = formatPrice(service);
              const buttonConfig = getButtonConfig(service.category);
              const ButtonIcon = buttonConfig.icon;
              const features = formatFeatures(service.features);

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  ref={index === listings.length - 1 ? lastListingRef : null}
                >
                  <Link href={`/services/${service.id}`}>
                    <Card
                      className={`group hover:shadow-lg transition-shadow duration-300 border border-gray-200 rounded-2xl overflow-hidden ${viewMode === "list" ? "flex" : ""}`}
                    >
                      <div
                        className={`relative ${viewMode === "list" ? "w-1/3" : "h-64"}`}
                      >
                        <Image
                          src={serviceImage}
                          alt={service.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isPremium && (
                          <Badge className="absolute top-2 left-2 bg-blue-500 text-white">
                            Premium
                          </Badge>
                        )}
                        <div className="absolute bottom-2 left-2 bg-white/80 rounded-full px-2 py-1 text-xs flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 mr-1" /> 4.8
                        </div>
                      </div>
                      <div
                        className={viewMode === "list" ? "p-4 flex-1" : "p-4"}
                      >
                        <CardTitle className="text-xl font-bold mb-1">
                          {service.title}
                        </CardTitle>
                        <div className="text-sm text-gray-600 mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" /> {service.location}
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                          {categoryInfo.details}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {features.map((f) => (
                            <Badge key={f.key} variant="outline">
                              {f.label}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">
                            {formattedPrice}{" "}
                            <span className="text-sm text-gray-500">
                              {categoryInfo.priceLabel}
                            </span>
                          </span>
                          <Button className="rounded-full">
                            <ButtonIcon className="mr-2 h-4 w-4" />{" "}
                            {buttonConfig.text}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}
      {fetchError && (
        <p className="text-red-500 text-center">Error: {fetchError}</p>
      )}
    </div>
  );
}

function ServicesLoading() {
  return (
    <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(9)].map((_, i) => (
        <Skeleton key={i} className="h-96 rounded-2xl" />
      ))}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              'url("https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop")',
          }}
        ></div>
        <div className="absolute inset-0">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-brand-400/20 rounded-full animate-float"></div>
          <div className="absolute top-1/2 -left-8 w-24 h-24 bg-white/10 rounded-full animate-pulse-slow"></div>
          <div
            className="absolute bottom-10 right-1/4 w-28 h-28 bg-brand-400/10 rounded-full animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-brand-400 text-white px-4 py-2 text-sm font-medium shadow-md">
              Premium Services Marketplace
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-balance leading-tight">
              Discover Exceptional
              <span className="block bg-gradient-to-r from-brand-400 to-yellow-300 bg-clip-text text-transparent">
                Services
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-brand-100 mb-8 max-w-3xl mx-auto text-balance">
              Explore our curated selection of verified hospitality, logistics,
              and security services across Africa.{" "}
              <span className="text-brand-300 font-medium">
                Book with confidence.
              </span>
            </p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
              {[
                { value: "200+", label: "Curated Services" },
                { value: "92%", label: "Customer Satisfaction" },
                { value: "4.9★", label: "Average Rating" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-brand-400">
                    {stat.value}
                  </div>
                  <div className="text-sm text-brand-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Suspense fallback={<ServicesLoading />}>
        <ServicesContent />
      </Suspense>
    </>
  );
}
