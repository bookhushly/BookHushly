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
  TrendingUp,
  AlertCircle,
  Star,
  X,
  Maximize2,
  Camera,
} from "lucide-react";
import Link from "next/link";

const EventOrganizerDetail = ({ service, categoryData }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const images = service.media_urls || [];

  // Intelligent ticket availability status
  const getTicketAvailability = (remainingTickets) => {
    if (!remainingTickets) return null;

    if (remainingTickets > 1000) {
      return { status: "Very High", color: "green", icon: TrendingUp };
    } else if (remainingTickets > 500) {
      return { status: "High", color: "green", icon: CheckCircle };
    } else if (remainingTickets > 100) {
      return { status: "Low", color: "yellow", icon: AlertCircle };
    } else {
      return { status: "About to Finish", color: "red", icon: AlertCircle };
    }
  };

  const ticketAvailability = getTicketAvailability(service.remaining_tickets);

  const openFullscreen = (index) => {
    setCurrentImageIndex(index);
    setIsFullscreen(true);
  };

  const formatPriceUnit = (unit) => {
    return unit === "per_person" ? "per person" : "per ticket";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Image */}
      <div className="relative">
        {images && images.length > 0 ? (
          <div className="relative h-[70vh] overflow-hidden">
            <Image
              src={images[0]}
              alt={service.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/50" />

            {/* Floating Action Buttons */}
            <div className="absolute top-6 right-6 flex gap-3">
              <Button
                onClick={() => openFullscreen(0)}
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                View Photo
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white"
              >
                <Heart className="w-4 h-4" />
              </Button>
            </div>

            {/* Event Info Overlay */}
            <div className="absolute bottom-8 left-6 right-6">
              <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-6 text-white">
                <div className="flex flex-wrap items-center gap-6 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {service.event_date
                      ? new Date(service.event_date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : "Date TBD"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {service.created_at
                      ? new Date(service.created_at).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "Time TBD"}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {service.location}
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  {service.title}
                </h1>
                <p className="text-white/90 text-sm md:text-base">
                  {service.description ||
                    "Join us for an unforgettable event experience"}
                </p>
              </div>
            </div>

            {/* Hero Content */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge className="bg-purple-600 text-white border-purple-600">
                  Live Event
                </Badge>
                {service.active && (
                  <Badge className="bg-green-600 text-white border-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {ticketAvailability && (
                  <Badge
                    className={`border-0 ${
                      ticketAvailability.color === "green"
                        ? "bg-green-600 text-white"
                        : ticketAvailability.color === "yellow"
                          ? "bg-yellow-500 text-white"
                          : "bg-red-600 text-white"
                    }`}
                  >
                    <ticketAvailability.icon className="w-3 h-3 mr-1" />
                    {ticketAvailability.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
          // No images fallback
          <div className="bg-purple-600 text-white py-32">
            <div className="max-w-6xl mx-auto px-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Badge className="bg-white/20 text-white border-white/30">
                  Live Event
                </Badge>
                {service.active && (
                  <Badge className="bg-green-600 text-white border-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                {service.title}
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                {service.description ||
                  "Join us for an unforgettable event experience"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Price Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-4xl font-bold text-gray-900">
                    ₦{service.price.toLocaleString()}
                  </div>
                  <div className="text-gray-600">
                    {formatPriceUnit(service.price_unit)}
                  </div>
                </div>

                {ticketAvailability && (
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">
                      Availability
                    </div>
                    <div
                      className={`font-semibold ${
                        ticketAvailability.color === "green"
                          ? "text-green-600"
                          : ticketAvailability.color === "yellow"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {ticketAvailability.status}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-80">
              <Button
                asChild={service.availability === "available"}
                disabled={service.availability !== "available"}
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white"
              >
                {service.availability === "available" ? (
                  <Link
                    href={`/book/${service.id}`}
                    className="flex items-center justify-center gap-3"
                  >
                    <Ticket className="w-6 h-6" />
                    Get Tickets Now
                  </Link>
                ) : (
                  <span>Event Unavailable</span>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-3 text-green-600 text-sm font-medium">
                <Shield className="w-4 h-4" />
                Secure & Verified Ticketing
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* About Event */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                About This Event
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {service.description ||
                  "Join us for an amazing event experience! Get ready for an unforgettable time with great music, food, and entertainment."}
              </p>
            </div>

            {/* Ticket Packages */}
            {service.ticket_packages && service.ticket_packages.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Ticket Options
                </h2>
                <div className="grid gap-4">
                  {service.ticket_packages.map((ticket, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-2xl p-6 hover:border-purple-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {ticket.name}
                          </h3>
                          <div className="flex items-center gap-6">
                            <span className="text-2xl font-bold text-purple-600">
                              ₦{ticket.price?.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500">
                              {ticket.remaining} of {ticket.total} available
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={
                            ticket.remaining > 0 ? "default" : "secondary"
                          }
                          className={
                            ticket.remaining > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {ticket.remaining > 0 ? "Available" : "Sold Out"}
                        </Badge>
                      </div>
                      {ticket.description && (
                        <p className="text-gray-600 mb-4">
                          {ticket.description}
                        </p>
                      )}
                      {ticket.remaining > 0 && (
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                          Select This Ticket
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Details */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Event Information
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Date</div>
                      <div className="text-gray-600">
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
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Time</div>
                      <div className="text-gray-600">
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
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Location
                      </div>
                      <div className="text-gray-600">{service.location}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Event Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold text-lg">
                    ₦{service.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium text-right">
                    {service.location}
                  </span>
                </div>
                {ticketAvailability && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Availability</span>
                    <span
                      className={`font-semibold ${
                        ticketAvailability.color === "green"
                          ? "text-green-600"
                          : ticketAvailability.color === "yellow"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {ticketAvailability.status}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  Secure & Verified Event
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && images && images.length > 0 && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-all duration-200 z-10"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="absolute top-6 left-6 text-white text-lg font-medium z-10">
            {service.title}
          </div>

          <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-6">
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
