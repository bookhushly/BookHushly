"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  Suspense,
} from "react";
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

  const searchParams = useSearchParams();
  const observer = useRef(null);
  const ITEMS_PER_PAGE = 12;

  // Initialize filters from search params
  const initialSearch = searchParams.get("search") || "";
  const initialLocation = searchParams.get("location") || "all";
  const initialCategory = searchParams.get("category") || "all";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [viewMode, setViewMode] = useState("grid");

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      window.history.pushState(null, "", `?${params.toString()}`);
    }, 500),
    [searchParams]
  );

  // Update state when search params change
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

  // Fetch listings with pagination and caching
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
          .order("created_at", { ascending: false })
          .range((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE - 1);

        // Apply filters to the query
        if (selectedCategory !== "all") {
          query = query.eq("category", selectedCategory);
        }
        if (selectedLocation !== "all") {
          query = query.ilike("location", `%${selectedLocation}%`);
        }
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
    [hasMore, selectedCategory, selectedLocation, searchQuery]
  );

  // Initial fetch and fetch on page change
  useEffect(() => {
    fetchListings(page, page === 1);
  }, [page, fetchListings]);

  // Infinite scroll observer
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
            service.bedrooms &&
              `${service.bedrooms} bedroom${service.bedrooms > 1 ? "s" : ""}`,
            service.bathrooms &&
              `${service.bathrooms} bathroom${service.bathrooms > 1 ? "s" : ""}`,
            service.check_in_time && `Check-in: ${service.check_in_time}`,
            service.minimum_stay && `Min. stay: ${service.minimum_stay}`,
          ]
            .filter(Boolean)
            .join(" • "),
          priceLabel:
            service.price_unit === "per_night" ? "per night" : "starting from",
        };
      case "food":
        return {
          icon: <Utensils className="h-4 w-4" />,
          details: [
            categoryData.cuisine_type && categoryData.cuisine_type,
            service.operating_hours && service.operating_hours,
            service.capacity && `${service.capacity} seats`,
          ]
            .filter(Boolean)
            .join(" • "),
          priceLabel:
            service.price_unit === "per_person"
              ? "per person"
              : "starting from",
        };
      case "events":
        return {
          icon: <Calendar className="h-4 w-4" />,
          details: [
            service.event_type && service.event_type.replace("_", " "),
            service.remaining_tickets &&
              `${service.remaining_tickets} tickets left`,
            service.duration && service.duration,
          ]
            .filter(Boolean)
            .join(" • "),
          priceLabel:
            service.price_unit === "per_event" ? "per event" : "starting from",
        };
      case "logistics":
      case "car_rentals":
        return {
          icon:
            category === "logistics" ? (
              <Truck className="h-4 w-4" />
            ) : (
              <Car className="h-4 w-4" />
            ),
          details: [
            service.vehicle_type && service.vehicle_type,
            service.service_areas && service.service_areas,
            categoryData.weight_limit && `Max: ${categoryData.weight_limit}`,
          ]
            .filter(Boolean)
            .join(" • "),
          priceLabel:
            service.price_unit === "per_km" ? "per km" : "starting from",
        };
      case "security":
        return {
          icon: <Shield className="h-4 w-4" />,
          details: [
            categoryData.security_types &&
              categoryData.security_types.slice(0, 2).join(", "),
            service.security_deposit &&
              `Deposit: ₦${service.security_deposit.toLocaleString()}`,
            categoryData.response_time &&
              `Response: ${categoryData.response_time}`,
          ]
            .filter(Boolean)
            .join(" • "),
          priceLabel:
            service.price_unit === "per_hour" ? "per hour" : "starting from",
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
    switch (category) {
      case "food":
        return { text: "Order Now", icon: UtensilsCrossed };
      case "car_rentals":
        return { text: "Rent Now", icon: Car };
      case "logistics":
        return { text: "Ship Now", icon: Truck };
      case "security":
        return { text: "Hire Now", icon: Shield };
      case "events":
        return { text: "Book Event", icon: PartyPopper };
      case "hotels":
      case "serviced_apartments":
        return { text: "Book Now", icon: Building };
      default:
        return { text: "View Details", icon: Building };
    }
  };

  const formatFeatures = (features) => {
    try {
      let parsedFeatures = features;
      if (typeof features === "string") {
        try {
          parsedFeatures = JSON.parse(features);
        } catch {
          parsedFeatures = features.split("\n").filter(Boolean);
        }
      }
      return Array.isArray(parsedFeatures)
        ? parsedFeatures.slice(0, 3).map((f) => ({
            label: f.charAt(0).toUpperCase() + f.slice(1),
            key: f,
          }))
        : [];
    } catch {
      return [];
    }
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
      {/* Filter Bar */}
      <motion.div
        className="sticky top-0 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 py-4 mb-8 rounded-xl shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Desktop Filters */}
          <div className="hidden md:flex items-center gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search services, locations, or vendors..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 h-11 rounded-lg border-gray-200 focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                const params = new URLSearchParams(searchParams.toString());
                if (value === "all") {
                  params.delete("category");
                } else {
                  params.set("category", value);
                }
                window.history.pushState(null, "", `?${params.toString()}`);
                setPage(1);
                setListings([]);
              }}
            >
              <SelectTrigger className="w-[200px] h-11 rounded-lg border-gray-200">
                <SelectValue placeholder="All Categories" />
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
            <Select
              value={selectedLocation}
              onValueChange={(value) => {
                setSelectedLocation(value);
                const params = new URLSearchParams(searchParams.toString());
                if (value === "all") {
                  params.delete("location");
                } else {
                  params.set("location", value);
                }
                window.history.pushState(null, "", `?${params.toString()}`);
                setPage(1);
                setListings([]);
              }}
            >
              <SelectTrigger className="w-[200px] h-11 rounded-lg border-gray-200">
                <SelectValue placeholder="All Locations" />
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
          </div>

          {/* Mobile Filter Drawer */}
          <div className="md:hidden flex items-center gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 h-11 rounded-lg border-gray-200"
              />
            </div>
            <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-lg"
                >
                  <Filter className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(value) => {
                        setSelectedCategory(value);
                        const params = new URLSearchParams(
                          searchParams.toString()
                        );
                        if (value === "all") {
                          params.delete("category");
                        } else {
                          params.set("category", value);
                        }
                        window.history.pushState(
                          null,
                          "",
                          `?${params.toString()}`
                        );
                        setPage(1);
                        setListings([]);
                        setIsFilterOpen(false);
                      }}
                    >
                      <SelectTrigger className="w-full h-11 rounded-lg">
                        <SelectValue placeholder="All Categories" />
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
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Location
                    </label>
                    <Select
                      value={selectedLocation}
                      onValueChange={(value) => {
                        setSelectedLocation(value);
                        const params = new URLSearchParams(
                          searchParams.toString()
                        );
                        if (value === "all") {
                          params.delete("location");
                        } else {
                          params.set("location", value);
                        }
                        window.history.pushState(
                          null,
                          "",
                          `?${params.toString()}`
                        );
                        setPage(1);
                        setListings([]);
                        setIsFilterOpen(false);
                      }}
                    >
                      <SelectTrigger className="w-full h-11 rounded-lg">
                        <SelectValue placeholder="All Locations" />
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
                  </div>
                  <Button
                    className="w-full bg-brand-600 hover:bg-brand-700 rounded-lg"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              className="h-11 w-11 rounded-lg"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              className="h-11 w-11 rounded-lg"
              onClick={() => setViewMode("list")}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Listings */}
      <AnimatePresence>
        {listings.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <h3 className="text-2xl font-semibold text-gray-700">
              No results found
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Try adjusting your search terms or filters.
            </p>
            <Button
              className="bg-brand-600 hover:bg-brand-700 rounded-lg"
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
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
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
                  <Link href={`/services/${service.id}`} passHref>
                    <Card
                      className={`group hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-brand-300 overflow-hidden rounded-xl ${
                        viewMode === "list" ? "flex flex-row" : ""
                      }`}
                    >
                      <div
                        className={`relative ${
                          viewMode === "list"
                            ? "w-48 h-40"
                            : "w-full h-48 sm:h-56"
                        }`}
                      >
                        <Image
                          src={serviceImage}
                          alt={`${service.title} image`}
                          fill
                          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                            viewMode === "list"
                              ? "rounded-l-xl"
                              : "rounded-t-xl"
                          }`}
                          sizes={
                            viewMode === "list"
                              ? "(max-width: 768px) 192px, 192px"
                              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          }
                          priority={index < 4}
                          loading={index < 4 ? "eager" : "lazy"}
                          onError={(e) => {
                            e.currentTarget.src =
                              category.image || "/placeholder.jpg";
                          }}
                        />
                        {isPremium && (
                          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-medium">
                            ✨ Premium
                          </Badge>
                        )}
                        <Badge
                          variant="secondary"
                          className="absolute bottom-3 left-3 bg-black/70 text-white text-xs flex items-center gap-1"
                        >
                          {category.icon} {category.label}
                        </Badge>
                        <div className="absolute top-3 right-3 bg-white/90 rounded-full px-2 py-1 flex items-center text-xs font-medium">
                          <Star className="h-3 w-3 text-yellow-500 mr-1 fill-current" />
                          4.8
                        </div>
                      </div>

                      <div
                        className={viewMode === "list" ? "flex-1 p-4" : "p-4"}
                      >
                        <CardHeader className="p-0 mb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg font-semibold line-clamp-1">
                                  {service.title}
                                </CardTitle>
                                {isVerified && (
                                  <Verified className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center mb-2">
                                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                <span className="line-clamp-1">
                                  {service.location}
                                </span>
                              </div>
                              {categoryInfo.details && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  {categoryInfo.icon}
                                  <span className="ml-1 line-clamp-1">
                                    {categoryInfo.details}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-0">
                          <CardDescription className="line-clamp-2 text-sm mb-3">
                            {service.description}
                          </CardDescription>

                          {features.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {features.map((feature) => (
                                <Badge
                                  key={feature.key}
                                  variant="secondary"
                                  className="text-xs py-0.5 px-2 bg-brand-50 text-brand-700 border-brand-200"
                                >
                                  {feature.label}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-lg font-bold text-gray-900">
                                {formattedPrice}
                              </span>
                              {categoryInfo.priceLabel && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  {categoryInfo.priceLabel}
                                </span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              className="bg-brand-600 hover:bg-brand-700 rounded-lg text-white"
                            >
                              <ButtonIcon className="mr-2 h-4 w-4" />
                              {buttonConfig.text}
                            </Button>
                          </div>
                        </CardContent>
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-8"
        >
          <LoadingSpinner className="h-8 w-8 text-brand-600" />
        </motion.div>
      )}
    </div>
  );
}

function ServicesLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-8 w-96 mb-8 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Skeleton
            key={i}
            className="h-64 bg-gray-100 animate-pulse rounded-xl"
          />
        ))}
      </div>
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
