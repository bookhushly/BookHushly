"use client";
import Link from "next/link";
import { useRouter } from "next/navigation"; // use next/router for older Next versions
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Star,
  Search,
  Shield,
  Clock,
  Users,
  ArrowRight,
  Play,
  CheckCircle,
  Globe,
  Award,
  TrendingUp,
  MapPin,
  Calendar,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import Image from "next/image";

export default function Home() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (location) params.set("location", location);
    if (date) params.set("date", date);

    router.push(`/services?${params.toString()}`);
  };
  const features = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Smart Discovery",
      description:
        "AI-powered search to find the perfect service provider for your specific needs across Africa.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Verified Excellence",
      description:
        "Every vendor undergoes rigorous KYC verification ensuring premium quality and reliability.",
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Instant Booking",
      description:
        "Book services instantly with real-time availability and immediate confirmation.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Trusted Reviews",
      description:
        "Make informed decisions with authentic reviews from verified customers.",
    },
  ];

  const stats = [
    {
      value: "10+",
      label: "Initial Partners",
      icon: <Users className="h-5 w-5" />,
    },
    {
      value: "100+",
      label: "Early Users",
      icon: <Star className="h-5 w-5" />,
    },
    {
      value: "2+",
      label: "Cities Launched",
      icon: <Globe className="h-5 w-5" />,
    },
    {
      value: "24/7",
      label: "Customer Support",
      icon: <Award className="h-5 w-5" />,
    },
  ];

  const testimonials = [
    {
      name: "Adebayo Johnson",
      role: "Business Executive",
      company: "Lagos",
      content:
        "Bookhushly transformed how we book corporate events. The quality of vendors is exceptional!",
      rating: 5,
      avatar: "AJ",
    },
    {
      name: "Fatima Abdullahi",
      role: "Event Planner",
      company: "Abuja",
      content:
        "The platform's verification process gives me confidence. Every vendor delivers exactly as promised.",
      rating: 5,
      avatar: "FA",
    },
    {
      name: "Chidi Okafor",
      role: "Hotel Manager",
      company: "Port Harcourt",
      content:
        "As a vendor, Bookhushly has significantly increased our bookings and customer reach.",
      rating: 5,
      avatar: "CO",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section with Search */}
      <section className="relative min-h-screen text-white overflow-hidden">
        {/* Background Image using Next/Image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/book2.jpg" // 🔁 replace with your actual image filename in /public
            alt="Hero Background"
            layout="fill"
            objectFit="cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />{" "}
          {/* Overlay to improve text contrast */}
        </div>

        {/* Optional SVG Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 -z-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Animated Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Content */}
        <div className="container relative z-10 py-10 flex items-center min-h-screen">
          <div className="w-full max-w-4xl mx-auto text-center">
            {/* Heading */}
            <div className="mb-12">
              <Badge className="mb-6 bg-purple-800 hover:bg-purple-800 text-white border-0 px-6 py-2 text-sm font-medium tracking-wide">
                <span className="font-['Inter',_'SF_Pro_Display',_system-ui,_sans-serif] font-semibold">
                  Your Journey, Seamlessly Booked
                </span>
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="text-white">Hospitality</span>
                <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-300 bg-clip-text text-transparent">
                  Platform
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-12">
                Experience seamless hospitality services with verified providers
                across Nigeria and Africa.
              </p>
            </div>

            {/* Search Interface */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl mb-12 space-y-10 border border-gray-100">
              {/* Search Bar Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                {/* Search Input */}
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors duration-200" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search services..."
                    className="pl-10 h-11 text-sm bg-white border border-gray-200 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
                  />
                </div>

                {/* Location Input */}
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors duration-200" />
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location"
                    className="pl-10 h-11 text-sm bg-white border border-gray-200 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
                  />
                </div>

                {/* Date Picker */}
                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors duration-200" />
                  <Input
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    type="date"
                    className="pl-10 h-11 text-sm bg-white text-gray-600 border border-gray-200 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
                  />
                </div>

                {/* Search Button */}
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="h-11 w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Search
                </Button>
              </div>

              {/* Category Buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none hover:from-blue-600 hover:to-purple-600 px-4 py-1.5 rounded-full text-sm font-medium shadow-[0_2px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-all duration-300 transform hover:-translate-y-0.5"
                  asChild
                >
                  <Link href="/services">
                    <Search className="h-4 w-4 mr-1" />
                    All Services
                  </Link>
                </Button>

                {CATEGORIES.map((category) => (
                  <Button
                    key={category.value}
                    variant="outline"
                    className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 px-4 py-1.5 rounded-full text-sm font-medium shadow-[0_2px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-all duration-300 transform hover:-translate-y-0.5"
                    asChild
                  >
                    <Link href={`/services?category=${category.value}`}>
                      <span className="mr-1">{category.icon}</span>
                      {category.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <div className="text-yellow-400 mb-3 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm lg:text-base text-blue-200">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}

      {/* Featured Services */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
              Featured Services
            </Badge>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Popular Service Categories
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover our most booked services across Nigeria and Africa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CATEGORIES.map((category, index) => (
              <Card
                key={category.value}
                className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:scale-105 bg-gradient-to-br from-white to-gray-50 overflow-hidden"
              >
                <div className="h-48 relative overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.alt}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-gray-700">
                      {(index + 1) * 150}+ providers
                    </Badge>
                  </div>
                </div>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {category.label}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Professional {category.label.toLowerCase()} services across
                    Africa
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-yellow-500 fill-current"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      4.8+ average rating
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="group-hover:bg-blue-600 group-hover:text-white transition-colors w-full"
                    asChild
                  >
                    <Link href={`/services?category=${category.value}`}>
                      Explore {category.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-blue-950 via-purple-950 to-indigo-900 text-white relative overflow-hidden">
        {/* Enhanced Background Patterns */}
        <div className="absolute inset-0">
          {/* Animated gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

          {/* Refined dot pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
              backgroundSize: "30px 30px",
            }}
          ></div>

          {/* Geometric shapes */}
          <div className="absolute top-20 right-20 w-20 h-20 border border-white/20 rotate-45 animate-spin-slow"></div>
          <div className="absolute bottom-32 left-16 w-16 h-16 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full animate-bounce-slow"></div>
        </div>

        <div className="container relative z-10">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold px-4 py-2 text-sm">
              Why Choose Bookhushly?
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Built for African Excellence
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              We provide a secure, reliable platform that connects you with the
              finest service providers across the continent
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 overflow-hidden"
              >
                {/* Card glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Animated border */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full animation-duration-1000"></div>

                <CardHeader className="text-center relative z-10 pb-6">
                  <div className="mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center relative z-10">
                  <CardDescription className="text-blue-100 leading-relaxed group-hover:text-white transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </Card>
            ))}
          </div>

          {/* Call to action section */}
          <div className="text-center mt-20">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-full border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-white">
                Join 50,000+ satisfied customers across Africa
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials Section *

      {/* CTA Section */}
      <section className="py-20 bg-pruple-900 text-white relative overflow-hidden">
        {/* Geometric Background - Modern but not AI-like */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-purple-800"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Subtle diagonal lines */}
            <div className="absolute top-0 left-1/4 w-px h-full bg-white/5 transform rotate-12"></div>
            <div className="absolute top-0 left-2/4 w-px h-full bg-white/5 transform rotate-12"></div>
            <div className="absolute top-0 left-3/4 w-px h-full bg-white/5 transform rotate-12"></div>

            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-yellow-400/30"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-purple-400/30"></div>
          </div>
        </div>

        <div className="container text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Experience African Excellence?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers and verified service
              providers on Africa's leading service platform
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                asChild
              >
                <Link href="/register">
                  <Users className="mr-2 h-5 w-5" />
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-purple-900 hover:bg-white hover:text-purple-600  px-8 py-4 text-lg transition-all duration-300"
                asChild
              >
                <Link href="/services">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Services
                </Link>
              </Button>
            </div>

            {/* Trust Indicators - Enhanced Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-colors">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 text-yellow-400" />
                <div className="font-semibold mb-1">Growing Fast</div>
                <div className="text-sm text-blue-200">
                  +300% growth this year
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-colors">
                <Shield className="h-10 w-10 mx-auto mb-3 text-green-400" />
                <div className="font-semibold mb-1">100% Secure</div>
                <div className="text-sm text-blue-200">Bank-grade security</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-colors">
                <CheckCircle className="h-10 w-10 mx-auto mb-3 text-purple-400" />
                <div className="font-semibold mb-1">Verified Quality</div>
                <div className="text-sm text-blue-200">
                  All providers vetted
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-colors">
                <Globe className="h-10 w-10 mx-auto mb-3 text-orange-400" />
                <div className="font-semibold mb-1">Africa-Wide</div>
                <div className="text-sm text-blue-200">
                  12+ countries served
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
