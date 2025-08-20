"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Star,
  Search,
  Filter,
  Calendar,
  Users,
  Car,
  Shield,
  Truck,
  PartyPopper,
  Home,
  Hotel,
  Clock,
  CheckCircle2,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";

const categoryIcons = {
  hotels: Hotel,
  serviced_apartments: Home,
  events: PartyPopper,
  car_rentals: Car,
  logistics: Truck,
  security: Shield,
  food: UtensilsCrossed,
};

// Mapping between display names and database values
const categoryMapping = {
  "All Categories": "all",
  Hotels: "hotels",
  "Serviced Apartments": "serviced_apartments",
  Events: "events",
  "Car Rentals": "car_rentals",
  Logistics: "logistics",
  Security: "security",
  "Food & Restaurants": "food",
};

// Reverse mapping for display purposes
const categoryDisplayMapping = {
  hotels: "Hotels",
  serviced_apartments: "Serviced Apartments",
  events: "Events",
  car_rentals: "Car Rentals",
  logistics: "Logistics",
  security: "Security",
  food: "Food & Restaurants",
};

const categories = [
  "All Categories",
  "Hotels",
  "Serviced Apartments",
  "Events",
  "Car Rentals",
  "Logistics",
  "Security",
  "Food & Restaurants",
];

export default function VendorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId;

  const [vendor, setVendor] = useState(null);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!vendorId) return;

      try {
        setLoading(true);

        // Fetch vendor details
        const { data: vendorData, error: vendorError } = await supabase
          .from("vendors")
          .select("*")
          .eq("id", vendorId)
          .eq("approved", true)
          .single();

        if (vendorError || !vendorData) {
          throw new Error("Vendor not found or not approved");
        }

        setVendor(vendorData);

        // Fetch vendor's active listings
        const { data: listingsData, error: listingsError } = await supabase
          .from("listings")
          .select("*")
          .eq("vendor_id", vendorId)
          .eq("active", true)
          .order("created_at", { ascending: false });

        if (listingsError) {
          throw listingsError;
        }

        setListings(listingsData || []);
        setFilteredListings(listingsData || []);
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        toast.error("Failed to load vendor profile");
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [vendorId]);

  // Filter and search listings
  useEffect(() => {
    let filtered = [...listings];

    // Apply category filter
    if (selectedCategory !== "All Categories") {
      const dbCategoryValue = categoryMapping[selectedCategory];
      filtered = filtered.filter(
        (listing) => listing.category === dbCategoryValue
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          listing.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default: // latest
        filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
    }

    setFilteredListings(filtered);
  }, [listings, selectedCategory, searchTerm, sortBy]);

  const handleBookNow = (listingId) => {
    // Navigate to booking page with vendor and listing info
    router.push(`/book/${listingId}`);
  };

  // Helper function to get appropriate button text and icon based on category
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
        return { text: "Book Now", icon: Calendar };
    }
  };

  // Helper function to get display name for category
  const getCategoryDisplayName = (dbCategory) => {
    return categoryDisplayMapping[dbCategory] || dbCategory;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Vendor Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              This vendor profile is not available or hasn't been approved yet.
            </p>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              Bookhushly
            </Link>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>Verified Vendor</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Vendor Info Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-3xl font-bold mb-2">
                  {vendor.business_name}
                </CardTitle>
                <CardDescription className="text-lg">
                  Professional services you can trust
                </CardDescription>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">4.8</span>
                  <span className="text-muted-foreground">(124 reviews)</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vendor.business_address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">{vendor.business_address}</span>
                </div>
              )}
              {vendor.business_phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">{vendor.business_phone}</span>
                </div>
              )}
              {vendor.business_email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">{vendor.business_email}</span>
                </div>
              )}
            </div>
            {vendor.business_description && (
              <div className="mt-4">
                <p className="text-muted-foreground">
                  {vendor.business_description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Our Services</h2>
              <p className="text-muted-foreground">
                {filteredListings.length} of {listings.length} services
                available
              </p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest First</SelectItem>
                    <SelectItem value="title">Alphabetical</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Filter className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No services found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || selectedCategory !== "All Categories"
                  ? "Try adjusting your search or filter criteria"
                  : "This vendor hasn't added any services yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => {
              const IconComponent = categoryIcons[listing.category] || Building;

              return (
                <Card
                  key={listing.id}
                  className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  {listing.images && listing.images.length > 0 && (
                    <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <IconComponent className="h-4 w-4 text-purple-500" />
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryDisplayName(listing.category)}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">
                          {listing.title}
                        </CardTitle>
                      </div>
                    </div>
                    {listing.location && (
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{listing.location}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {listing.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-purple-600">
                        ₦{listing.price?.toLocaleString() || "0"}
                        {listing.pricing_type && (
                          <span className="text-sm font-normal text-muted-foreground">
                            /{listing.pricing_type}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Available</span>
                      </div>
                    </div>

                    {listing.capacity && (
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
                        <Users className="h-3 w-3" />
                        <span>Up to {listing.capacity} people</span>
                      </div>
                    )}

                    {(() => {
                      const buttonConfig = getButtonConfig(listing.category);
                      const ButtonIcon = buttonConfig.icon;
                      return (
                        <Button
                          onClick={() => handleBookNow(listing.id)}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          <ButtonIcon className="mr-2 h-4 w-4" />
                          {buttonConfig.text}
                        </Button>
                      );
                    })()}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Contact Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
            <CardDescription>
              Ready to book? Contact us directly for personalized service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vendor.business_phone && (
                <div className="text-center">
                  <Phone className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="font-semibold">Call Us</p>
                  <p className="text-muted-foreground">
                    {vendor.business_phone}
                  </p>
                </div>
              )}
              {vendor.business_email && (
                <div className="text-center">
                  <Mail className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="font-semibold">Email Us</p>
                  <p className="text-muted-foreground">
                    {vendor.business_email}
                  </p>
                </div>
              )}
              {vendor.business_address && (
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="font-semibold">Visit Us</p>
                  <p className="text-muted-foreground">
                    {vendor.business_address}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              Powered by{" "}
              <Link href="/" className="text-purple-600 hover:underline">
                Bookhushly
              </Link>{" "}
              - Your trusted booking platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
