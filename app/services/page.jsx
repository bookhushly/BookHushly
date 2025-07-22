"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  MapPin,
  Star,
  Users,
  Clock,
  Filter,
  Grid,
  List,
  Heart,
  Share2,
  Verified,
  TrendingUp,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

// Services content component
function ServicesContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
          Browse Premium Services
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover quality hospitality, logistics, and security services across
          Nigeria and Africa
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4 animate-fade-in">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services, locations, or vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-brand-200 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-48 border-gray-200 focus:ring-brand-500">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    {category.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full lg:w-48 border-gray-200 focus:ring-brand-500">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="lagos">🏙️ Lagos</SelectItem>
              <SelectItem value="abuja">🏛️ Abuja</SelectItem>
              <SelectItem value="kano">🏘️ Kano</SelectItem>
              <SelectItem value="port-harcourt">🏭 Port Harcourt</SelectItem>
              <SelectItem value="ibadan">🌳 Ibadan</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="border-brand-200 hover:bg-brand-50 hover:border-brand-300"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Enhanced Filter Stats and View Toggle */}
        <div className="flex items-center justify-between bg-hospitality-warm rounded-xl p-4 border border-hospitality-gold/20">
          <div className="flex items-center space-x-6">
            <p className="text-sm font-medium text-hospitality-luxury">
              Showing <span className="font-bold text-brand-600">24</span> of{" "}
              <span className="font-bold">156</span> premium services
            </p>
            <div className="flex items-center text-sm text-hospitality-trust">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="font-medium">89% satisfaction rate</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={
                viewMode === "grid"
                  ? "bg-brand-600 hover:bg-brand-700"
                  : "hover:bg-brand-50"
              }
            >
              <Grid className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={
                viewMode === "list"
                  ? "bg-brand-600 hover:bg-brand-700"
                  : "hover:bg-brand-50"
              }
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>
      </div>

      {/* Service Listings Grid */}
      <div
        className={`${
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }`}
      >
        {Array.from({ length: 12 }).map((_, index) => {
          const category = CATEGORIES[index % CATEGORIES.length];
          const isPremium = index % 3 === 0;
          const isVerified = index % 2 === 0;

          const serviceTitle = [
            "Luxury Hotel Suite",
            "Event Security Service",
            "Catering & Restaurant",
            "Logistics & Delivery",
          ][index % 4];

          const serviceLocation = [
            "Victoria Island, Lagos",
            "Wuse 2, Abuja",
            "GRA, Port Harcourt",
          ][index % 3];

          if (viewMode === "list") {
            return (
              <Card
                key={index}
                className="card-hospitality hover:shadow-brand group cursor-pointer overflow-hidden relative"
              >
                <div className="flex">
                  {/* Image Section */}
                  <div className="w-48 aspect-video relative">
                    <Image
                      src={category.image}
                      alt={category.alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10" />

                    {isPremium && (
                      <Badge className="absolute top-2 left-2 z-20 bg-hospitality-gold text-hospitality-luxury shadow-gold">
                        Premium
                      </Badge>
                    )}

                    <div className="absolute top-2 right-2 glass rounded-full px-2 py-1 text-xs font-medium flex items-center z-20">
                      <Star className="h-3 w-3 text-hospitality-gold mr-1 fill-current" />
                      4.{8 + (index % 2)}
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 p-6 z-0 relative">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-xl group-hover:text-brand-600 transition-colors line-clamp-1">
                          {serviceTitle}
                        </CardTitle>
                        {isVerified && (
                          <Verified className="h-4 w-4 text-hospitality-trust" />
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      {serviceLocation}
                    </div>

                    <CardDescription className="line-clamp-2 mb-4 text-sm">
                      Professional {category.label.toLowerCase()} service with
                      excellent quality and customer satisfaction guaranteed.
                      Experience luxury hospitality at its finest.
                    </CardDescription>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          Up to {20 + index * 10} people
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {index % 2 === 0 ? "2-4 hours" : "Full day"}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-hospitality-luxury">
                          ₦{(50000 + index * 25000).toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {index % 2 === 0 ? "/day" : "/event"}
                        </span>
                        <Button
                          size="sm"
                          asChild
                          className="bg-brand-600 hover:bg-brand-700"
                        >
                          <Link href={`/services/${index + 1}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          }

          // Grid View
          return (
            <Card
              key={index}
              className="card-hospitality hover:shadow-brand group cursor-pointer overflow-hidden relative transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative aspect-video">
                <Image
                  src={category.image}
                  alt={category.alt}
                  fill
                  className="object-cover transition-transform group-hover:scale-110 duration-300"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent z-10" />

                {/* Badges */}
                <Badge
                  className={`absolute top-3 left-3 z-20 text-xs shadow-md ${
                    isPremium
                      ? "bg-hospitality-gold text-hospitality-luxury"
                      : "bg-brand-600 text-white"
                  }`}
                >
                  {isPremium ? "Premium" : category.label}
                </Badge>

                <div className="absolute top-3 right-3 glass rounded-full px-2 py-1 text-xs font-medium flex items-center z-20">
                  <Star className="h-3 w-3 text-hospitality-gold mr-1 fill-current" />
                  4.{8 + (index % 2)}
                </div>

                {/* Action Icons */}
                <div className="absolute bottom-3 right-3 z-20 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 glass hover:bg-white/30"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 glass hover:bg-white/30"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardHeader className="pb-2 z-0 relative">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg group-hover:text-brand-600 transition-colors line-clamp-1">
                    {serviceTitle}
                  </CardTitle>
                  {isVerified && (
                    <Verified className="h-4 w-4 text-hospitality-trust" />
                  )}
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {serviceLocation}
                </div>
              </CardHeader>

              <CardContent className="pt-0 z-0 relative">
                <CardDescription className="line-clamp-2 mb-3 text-sm">
                  Professional {category.label.toLowerCase()} service with
                  top-notch quality. Satisfaction guaranteed.
                </CardDescription>

                <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    Up to {20 + index * 10} people
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {index % 2 === 0 ? "2-4 hours" : "Full day"}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-hospitality-luxury">
                    ₦{(50000 + index * 25000).toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {index % 2 === 0 ? "/day" : "/event"}
                  </span>
                  <Button
                    size="sm"
                    asChild
                    className="bg-brand-600 hover:bg-brand-700"
                  >
                    <Link href={`/services/${index + 1}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Load More */}
      <div className="mt-12 text-center">
        <Button
          variant="outline"
          size="lg"
          className="btn-hospitality text-black hover:text-black border-brand-300 hover:bg-brand-50 hover:border-brand-500 px-8"
        >
          Load More Premium Services
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Showing 24 of 156 services •{" "}
          <span className="text-hospitality-trust font-medium">
            132 more available
          </span>
        </p>
      </div>
    </div>
  );
}

// Enhanced Loading component
function ServicesLoading() {
  return (
    <div className="container ">
      <div className="mb-8 animate-pulse">
        <Skeleton className="h-10 w-80 mb-2 bg-gradient-to-r from-brand-100 to-brand-200" />
        <Skeleton className="h-6 w-96 bg-gray-100" />
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <Skeleton className="h-12 flex-1 bg-gradient-to-r from-brand-50 to-brand-100" />
          <Skeleton className="h-12 w-48 bg-brand-50" />
          <Skeleton className="h-12 w-48 bg-brand-50" />
          <Skeleton className="h-12 w-12 bg-brand-50" />
        </div>
        <Skeleton className="h-16 w-full bg-hospitality-warm rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden animate-pulse">
            <Skeleton className="aspect-video bg-gradient-to-br from-brand-100 to-brand-200" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4 bg-brand-100" />
              <Skeleton className="h-4 w-1/2 bg-gray-100" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2 bg-gray-100" />
              <Skeleton className="h-4 w-2/3 mb-4 bg-gray-100" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-24 bg-hospitality-gold/30" />
                <Skeleton className="h-9 w-28 bg-brand-100" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesLoading />}>
      {/* Enhanced Hero Section */}
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

        {/* Animated background elements */}
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
              logistics, and security services across Africa.
              <span className="text-hospitality-gold-light font-medium">
                Premium quality guaranteed.
              </span>
            </p>

            {/* Quick stats */}
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
