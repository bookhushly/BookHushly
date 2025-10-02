"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  PartyPopper,
  Calendar,
  Clock,
  CheckCircle,
  MapPin,
  Share2,
  Heart,
  Shield,
  Ticket,
  X,
  Camera,
} from "lucide-react";
import Link from "next/link";

const EventOrganizerDetail = ({ service, categoryData }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const images = service.media_urls || [];

  const openFullscreen = (index) => {
    setCurrentImageIndex(index);
    setIsFullscreen(true);
  };

  const formatPriceUnit = (unit) => {
    return unit === "per_person" ? "per person" : "per ticket";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="relative h-[60vh] md:h-[80vh] overflow-hidden">
          <Image
            src={images[0] || "/service-images/events/1.jpg"}
            alt={service.title}
            fill
            className="object-cover opacity-80"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent" />

          {/* Floating Action Buttons */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={() => openFullscreen(0)}
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-gray-900 flex items-center gap-2 rounded-full"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">View Photo</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-gray-900 rounded-full"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-gray-900 rounded-full"
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>

          {/* Event Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 py-6 sm:py-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
                {service.title}
              </h1>
              <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-white/90 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {service.event_date
                    ? new Date(service.event_date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "Date TBD"}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {service.created_at
                    ? new Date(service.created_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Time TBD"}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {service.location}
                </div>
              </div>
              <p className="text-sm md:text-base text-white/80 max-w-2xl">
                {service.description ||
                  "Join us for an unforgettable event experience"}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Badge className="bg-purple-600 text-white border-purple-600 rounded-full">
              Live Event
            </Badge>
            {service.active && (
              <Badge className="bg-green-600 text-white border-green-600 rounded-full">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid lg:grid-cols-12 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8 md:space-y-10">
            {/* About Event */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                About This Event
              </h2>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                {service.description ||
                  "Join us for an amazing event experience! Get ready for an unforgettable time with great music, food, and entertainment."}
              </p>
            </section>

            {/* Ticket Packages */}
            {service.ticket_packages && service.ticket_packages.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                  Ticket Options
                </h2>
                <div className="grid gap-4">
                  {service.ticket_packages.map((ticket, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 md:p-6 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                            {ticket.name}
                          </h3>
                        </div>
                        <Badge
                          variant={
                            ticket.remaining > 0 ? "default" : "secondary"
                          }
                          className={
                            ticket.remaining > 0
                              ? "bg-green-100 text-green-800 rounded-full"
                              : "bg-red-100 text-red-800 rounded-full"
                          }
                        >
                          {ticket.remaining > 0 ? "Available" : "Sold Out"}
                        </Badge>
                      </div>
                      {ticket.description && (
                        <p className="text-gray-600 text-sm md:text-base mb-4">
                          {ticket.description}
                        </p>
                      )}
                      {ticket.remaining > 0 && (
                        <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white rounded-full">
                          Select This Ticket
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Event Details */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Event Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Date</div>
                    <div className="text-gray-600 text-sm md:text-base">
                      {service.event_date
                        ? new Date(service.event_date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "Date TBD"}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Time</div>
                    <div className="text-gray-600 text-sm md:text-base">
                      {service.created_at
                        ? new Date(service.created_at).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )
                        : "Time TBD"}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Location</div>
                    <div className="text-gray-600 text-sm md:text-base">
                      {service.location}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 sticky top-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6">
                Event Summary
              </h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm md:text-base">
                    Price
                  </span>
                  <span className="font-semibold text-base md:text-lg">
                    ₦{service.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600 text-sm md:text-base">
                    Location
                  </span>
                  <span className="font-medium text-right text-sm md:text-base max-w-[60%]">
                    {service.location}
                  </span>
                </div>
              </div>
              <Button
                asChild={service.availability === "available"}
                disabled={service.availability !== "available"}
                size="lg"
                className="w-full h-12 text-base md:text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-full"
              >
                {service.availability === "available" ? (
                  <Link
                    href={`/book/${service.id}`}
                    className="flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-5 h-5" />
                    Get Tickets Now
                  </Link>
                ) : (
                  <span>Event Unavailable</span>
                )}
              </Button>
              <div className="flex items-center justify-center gap-2 mt-4 text-green-600 text-sm font-medium">
                <Shield className="w-4 h-4" />
                Secure & Verified Ticketing
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && images && images.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-all duration-200"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-white text-base sm:text-lg font-medium">
            {service.title}
          </div>
          <div className="relative w-full h-full max-w-5xl max-h-[85vh] mx-4 sm:mx-6">
            <Image
              src={images[currentImageIndex]}
              alt={service.title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventOrganizerDetail;
