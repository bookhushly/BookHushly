"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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

import {
  MapPin,
  Grid,
  List,
  Filter,
  Search,
  Star,
  Verified,
} from "lucide-react";

import { CATEGORIES } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

function ServicesContent() {
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const searchParams = useSearchParams();

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
  }, [searchParams]);

  // Fetch listings from Supabase
  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setListings(data);
        setFetchError(null);
      } catch (error) {
        console.error("Error fetching listings:", error.message);
        setFetchError(error.message);
        setListings([]);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  // Filter listings based on search params and filters
  useEffect(() => {
    if (loading) return;

    let result = [...listings];

    // Apply search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q)
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter((l) => l.category === selectedCategory);
    }

    // Apply location filter
    if (selectedLocation !== "all") {
      result = result.filter((l) =>
        l.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFiltered(result);
  }, [listings, searchQuery, selectedCategory, selectedLocation, loading]);

  if (loading) {
    return <ServicesLoading />;
  }

  return (
    <div className="container py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
          {searchQuery
            ? `Results for "${searchQuery}"`
            : "Browse Premium Services"}
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover quality hospitality, logistics, and security services across
          Nigeria and Africa
        </p>
      </div>

      {/* Error fallback */}
      {fetchError && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          ⚠️ Error fetching services: {fetchError}
        </div>
      )}

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services, locations, or vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
              // Update URL without page reload
              const params = new URLSearchParams(searchParams.toString());
              params.set("category", value);
              window.history.pushState(null, "", `?${params.toString()}`);
            }}
          >
            <SelectTrigger>
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
              // Update URL without page reload
              const params = new URLSearchParams(searchParams.toString());
              params.set("location", value);
              window.history.pushState(null, "", `?${params.toString()}`);
            }}
          >
            <SelectTrigger>
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

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-100 rounded-xl">
          <p>
            Showing <b>{filtered.length}</b> of <b>{listings.length}</b>{" "}
            services
          </p>
          <div className="space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>
      </div>

      {/* Listings or fallback */}
      {filtered.length === 0 ? (
        <div className="text-center mt-12">
          <h3 className="text-xl font-semibold text-gray-700">
            No results found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search terms or filters.
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedLocation("all");
              // Reset URL params
              window.history.pushState(null, "", "/services");
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filtered.map((service) => {
            const category =
              CATEGORIES.find((c) => c.value === service.category) || {};
            const isPremium = service.price > 100000;
            const isVerified = service.active;

            return (
              <Link key={service.id} href={`/services/${service.id}`} passHref>
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="relative w-full h-48">
                    <Image
                      src={category.image || "/placeholder.jpg"}
                      alt={category.alt || "Service image"}
                      fill
                      className="object-cover rounded-t"
                    />
                    {isPremium && (
                      <Badge className="absolute top-2 left-2">Premium</Badge>
                    )}
                    <div className="absolute top-2 right-2 flex items-center text-xs bg-white/80 rounded-full p-1">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      4.8
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <CardTitle>{service.title}</CardTitle>
                      {isVerified && (
                        <Verified className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {service.location}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{service.description}</CardDescription>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-bold">
                        ₦{Number(service.price).toLocaleString()}
                      </span>
                      <Button size="sm">View</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ServicesLoading() {
  return (
    <div className="container py-8">
      <Skeleton className="h-8 w-96 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 bg-gray-200 animate-pulse" />
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
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-hospitality-gold/20 rounded-full animate-float"></div>
          <div className="absolute top-1/2 -left-8 w-16 h-16 bg-white/10 rounded-full animate-pulse-slow"></div>
          <div
            className="absolute bottom-10 right-1/4 w-20 h-20 bg-hospitality-gold/10 rounded-full animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <Badge className="mb-6 bg-hospitality-gold text-hospitality-luxury px-4 py-2 shadow-gold">
              ✨ Premium Services Marketplace
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-balance">
              Discover Quality
              <span className="bg-gradient-to-r from-hospitality-gold to-hospitality-gold-light bg-clip-text text-transparent block">
                Services
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-brand-100 mb-8 max-w-3xl mx-auto text-balance">
              Browse through our curated selection of verified hospitality,
              logistics, and security services across Africa.{" "}
              <span className="text-hospitality-gold-light font-medium">
                Premium quality guaranteed.
              </span>
            </p>

            <div className="flex flex-wrap justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-hospitality-gold">
                  156+
                </div>
                <div className="text-sm text-brand-200">Premium Services</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-hospitality-gold">
                  89%
                </div>
                <div className="text-sm text-brand-200">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-hospitality-gold">
                  5★
                </div>
                <div className="text-sm text-brand-200">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ServicesContent />
    </Suspense>
  );
}
