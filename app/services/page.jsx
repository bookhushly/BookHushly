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

  const searchParams = useSearchParams();
  const observer = useRef(null);
  const ITEMS_PER_PAGE = 12;

  // Get initial values from search params
  const initialSearch = searchParams.get("search") || "";
  const initialLocation = searchParams.get("location") || "all";
  const initialCategory = searchParams.get("category") || "all";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [viewMode, setViewMode] = useState("grid");

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
  }, [searchParams]);

  // Fetch listings with pagination
  const fetchListings = useCallback(
    async (pageNum, reset = false) => {
      if (!hasMore || isLoadingMore) return;
      setIsLoadingMore(true);

      try {
        let query = supabase
          .from("listings")
          .select("*")
          .eq("active", true)
          .order("created_at", { ascending: false })
          .range((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE - 1);

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
    [hasMore]
  );

  // Initial fetch and fetch on page change
  useEffect(() => {
    fetchListings(page, page === 1);
  }, [page, fetchListings]);

  // Filter listings based on search params and filters
  const filteredListings = useMemo(() => {
    if (loading) return [];

    let result = [...listings];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          (l.features && l.features.toLowerCase().includes(q)) ||
          (l.category_data &&
            JSON.stringify(l.category_data).toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((l) => l.category === selectedCategory);
    }

    if (selectedLocation !== "all") {
      result = result.filter((l) =>
        l.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    return result;
  }, [listings, searchQuery, selectedCategory, selectedLocation, loading]);

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
        { threshold: 0.1, rootMargin: "100px" }
      );

      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore]
  );

  const getPublicImageUrl = (path) => {
    if (!path) return null;
    const pathParts = path.split("listing-images/");
    const filePath = pathParts.length > 1 ? pathParts[1] : path;

    const { data } = supabase.storage
      .from("listing-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const getServiceImage = (service) => {
    if (service.media_urls && service.media_urls.length > 0) {
      const publicUrl = getPublicImageUrl(service.media_urls[0]);
      return publicUrl || "/placeholder.jpg";
    }

    const category = CATEGORIES.find((c) => c.value === service.category);
    return category?.image || "/placeholder.jpg";
  };

  const getCategorySpecificInfo = (service) => {
    const categoryData = extractCategoryData(service);
    const category = service.category;

    switch (category) {
      case "hotels":
        return {
          icon: <Building className="h-4 w-4" />,
          details: [
            service.capacity && `${service.capacity} guests`,
            categoryData.room_type && `${categoryData.room_type} room`,
            categoryData.bedrooms && `${categoryData.bedrooms} bedrooms`,
          ]
            .filter(Boolean)
            .join(" • "),
          priceLabel: "per night",
        };
      case "food":
        return {
          icon: <Utensils className="h-4 w-4" />,
          details: [
            categoryData.cuisine_type && categoryData.cuisine_type,
            service.capacity && `${service.capacity} seats`,
            service.operating_hours && service.operating_hours,
          ]
            .filter(Boolean)
            .join(" • "),
          priceLabel: "per person",
        };
      case "events":
        return {
          icon: <Calendar className="h-4 w-4" />,
          details: [
            service.capacity && `Up to ${service.capacity} guests`,
            service.duration && service.duration,
            categoryData.event_types &&
              categoryData.event_types.slice(0, 2).join(", "),
          ]
            .filter(Boolean)
            .join(" • "),
        };
      case "logistics":
        return {
          icon: <Truck className="h-4 w-4" />,
          details: [
            categoryData.service_types &&
              categoryData.service_types.slice(0, 2).join(", "),
            categoryData.weight_limit && `Max: ${categoryData.weight_limit}`,
            service.service_areas && "Multiple areas",
          ]
            .filter(Boolean)
            .join(" • "),
          priceLabel: "starting from",
        };
      case "security":
        return {
          icon: <Shield className="h-4 w-4" />,
          details: [
            categoryData.security_types &&
              categoryData.security_types.slice(0, 2).join(", "),
            categoryData.team_size && categoryData.team_size,
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
    } else {
      const unitLabel =
        {
          per_hour: "/hr",
          per_day: "/day",
          per_person: "/person",
          per_km: "/km",
          negotiable: "",
        }[priceUnit] || "";

      return priceUnit === "negotiable"
        ? "Negotiable"
        : `₦${price.toLocaleString()}${unitLabel}`;
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
      default:
        return { text: "View Details", icon: Building };
    }
  };

  // Helper function to parse and format features
  const formatFeatures = (features) => {
    try {
      // If features is a JSON string, parse it; otherwise, assume it's already an array or string
      let parsedFeatures = features;
      if (typeof features === "string") {
        try {
          parsedFeatures = JSON.parse(features);
        } catch {
          parsedFeatures = features.split("\n").filter(Boolean);
        }
      }
      // Ensure it's an array and limit to 3 features for display
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

  if (loading) {
    return <ServicesLoading />;
  }

  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
          {searchQuery
            ? `Results for "${searchQuery}"`
            : selectedCategory !== "all"
              ? `${
                  CATEGORIES.find((c) => c.value === selectedCategory)?.label ||
                  selectedCategory
                } Services`
              : "Discover Premium Services"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Explore our curated selection of hospitality, logistics, and security
          services across Nigeria and Africa.
        </p>
      </motion.div>

      {fetchError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 shadow-sm"
        >
          ⚠️ Error fetching services: {fetchError}
        </motion.div>
      )}

      <motion.div
        className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 mb-8 rounded-xl shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services, locations, or vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-lg"
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
            }}
          >
            <SelectTrigger className="w-full md:w-[200px] h-10 rounded-lg">
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
            }}
          >
            <SelectTrigger className="w-full md:w-[200px] h-10 rounded-lg">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {Array.from(new Set(listings.map((l) => l.location))).map(
                (loc) => (
                  <SelectItem key={loc} value={loc.toLowerCase()}>
                    {loc}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-lg"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium">{filteredListings.length}</span> of{" "}
            <span className="font-medium">{listings.length}</span> services
            {selectedCategory !== "all" && (
              <span>
                {" "}
                in {CATEGORIES.find((c) => c.value === selectedCategory)?.label}
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              className="h-9 rounded-lg"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              className="h-9 rounded-lg"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {filteredListings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <h3 className="text-xl font-semibold text-gray-700">
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
            {filteredListings.map((service, index) => {
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
                >
                  <Link href={`/services/${service.id}`} passHref>
                    <Card
                      className={`group hover:shadow-xl transition-all duration-300 border border-gray-100/50 hover:border-brand-200 ${
                        viewMode === "list" ? "flex flex-row" : ""
                      }`}
                      ref={
                        index === filteredListings.length - 1
                          ? lastListingRef
                          : null
                      }
                    >
                      <div
                        className={`relative ${
                          viewMode === "list" ? "w-64 h-48" : "w-full h-56"
                        }`}
                      >
                        <Image
                          src={serviceImage}
                          alt={`${service.title} service image`}
                          fill
                          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                            viewMode === "list"
                              ? "rounded-l-lg"
                              : "rounded-t-lg"
                          }`}
                          loading="lazy"
                          unoptimized={process.env.NODE_ENV !== "production"}
                          onError={(e) => {
                            const category = CATEGORIES.find(
                              (c) => c.value === service.category
                            );
                            e.currentTarget.src =
                              category?.image || "/placeholder.jpg";
                            e.currentTarget.onerror = null;
                          }}
                        />
                        {isPremium && (
                          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                            ✨ Premium
                          </Badge>
                        )}
                        <Badge
                          variant="secondary"
                          className="absolute bottom-3 left-3 bg-black/70 text-white"
                        >
                          {category.icon} {category.label}
                        </Badge>
                        <div className="absolute top-3 right-3 bg-white/90 rounded-full px-2 py-1 flex items-center text-xs font-medium">
                          <Star className="h-3 w-3 text-yellow-500 mr-1 fill-current" />
                          4.8
                        </div>
                      </div>

                      <div className={viewMode === "list" ? "flex-1" : ""}>
                        <CardHeader className="pb-3 pt-4">
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

                        <CardContent className="pt-0">
                          <CardDescription className="line-clamp-2 text-sm mb-4">
                            {service.description}
                          </CardDescription>

                          {features.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
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
                              <span className="text-lg font-bold">
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
                              className="bg-brand-600 hover:bg-brand-700 rounded-lg"
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
    <div className="container py-12">
      <Skeleton className="h-8 w-96 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Skeleton
            key={i}
            className="h-64 bg-gray-100 animate-pulse rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesLoading />}>
      <section className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0 hero-pattern"
            style={{
              backgroundImage:
                'url("https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-hospitality-gold/20 rounded-full animate-float"></div>
          <div className="absolute top-1/2 -left-8 w-24 h-24 bg-white/10 rounded-full animate-pulse-slow"></div>
          <div
            className="absolute bottom-10 right-1/4 w-28 h-28 bg-hospitality-gold/10 rounded-full animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-hospitality-gold text-hospitality-luxury px-4 py-2 shadow-md">
              ✨ Premium Services Marketplace
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              Discover Quality
              <span className="bg-gradient-to-r from-hospitality-gold to-hospitality-gold-light bg-clip-text text-transparent block">
                Services
              </span>
            </h1>
            <p className="text-lg md:text-xl text-brand-100 mb-8 max-w-3xl mx-auto text-balance">
              Explore our curated selection of verified hospitality, logistics,
              and security services across Africa.{" "}
              <span className="text-hospitality-gold-light font-medium">
                Premium quality guaranteed.
              </span>
            </p>

            <div className="flex flex-wrap justify-center gap-6 md:gap-12 mt-8">
              {[
                { value: "156+", label: "Premium Services" },
                { value: "89%", label: "Satisfaction Rate" },
                { value: "5★", label: "Average Rating" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold text-hospitality-gold">
                    {stat.value}
                  </div>
                  <div className="text-sm text-brand-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <ServicesContent />
    </Suspense>
  );
}
