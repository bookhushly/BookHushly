"use client";

import React, { useState, memo, useCallback, useTransition } from "react";
import { Calendar, Users, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { performSearch } from "@/utils/search";
import { toast } from "sonner";

const SearchFilters = memo(({ categoryLabel = "Hotels", onSearchResults }) => {
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [isSearching, startTransition] = useTransition();

  const incrementGuests = useCallback((type) => {
    setGuests((prev) => ({ ...prev, [type]: prev[type] + 1 }));
  }, []);

  const decrementGuests = useCallback((type) => {
    setGuests((prev) => ({
      ...prev,
      [type]: Math.max(type === "rooms" ? 1 : 0, prev[type] - 1),
    }));
  }, []);

  const totalGuests = guests.adults + guests.children;

  // Dynamic labels based on category
  const getLabels = useCallback(() => {
    const normalized = categoryLabel.toLowerCase();

    if (normalized.includes("event")) {
      return {
        where: "Event Location",
        wherePlaceholder: "Search event centers",
        dateLabel: "Event Date",
        datePlaceholder: "Select date",
        guestLabel: "Attendees",
        guestPlaceholder: "Add attendees",
        showCheckOut: false,
        showRooms: false,
      };
    }

    if (normalized.includes("apartment")) {
      return {
        where: "Location",
        wherePlaceholder: "Search apartments",
        dateLabel: "Move in",
        dateLabel2: "Move out",
        datePlaceholder: "Add dates",
        guestLabel: "Guests",
        guestPlaceholder: "Add guests",
        showCheckOut: true,
        showRooms: false,
      };
    }

    // Default: Hotels
    return {
      where: "Destination",
      wherePlaceholder: "Search destinations",
      dateLabel: "Check in",
      dateLabel2: "Check out",
      datePlaceholder: "Add dates",
      guestLabel: "Guests",
      guestPlaceholder: "Add guests",
      showCheckOut: true,
      showRooms: true,
    };
  }, [categoryLabel]);

  const labels = getLabels();

  const handleSearch = useCallback(async () => {
    // Validation
    if (labels.showCheckOut && checkIn && !checkOut) {
      toast.error("Please select a check-out date");
      return;
    }

    if (labels.showCheckOut && checkOut && checkIn && checkOut <= checkIn) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    // Build search filters
    const searchFilters = {
      location: location.trim(),
      guests,
    };

    // Add dates based on category
    if (labels.showCheckOut) {
      searchFilters.checkIn = checkIn ? format(checkIn, "yyyy-MM-dd") : null;
      searchFilters.checkOut = checkOut ? format(checkOut, "yyyy-MM-dd") : null;
    } else {
      // For events, use single date as eventDate
      searchFilters.eventDate = checkIn ? format(checkIn, "yyyy-MM-dd") : null;
    }

    // Perform search with loading state
    startTransition(async () => {
      try {
        const results = await performSearch(categoryLabel, searchFilters);

        // Pass results to parent component
        onSearchResults?.(results, searchFilters);

        toast.success(`Found ${results.length} ${categoryLabel.toLowerCase()}`);
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Search failed. Please try again.");
      }
    });
  }, [
    location,
    checkIn,
    checkOut,
    guests,
    categoryLabel,
    labels.showCheckOut,
    onSearchResults,
  ]);

  // Handle Enter key in location input
  const handleLocationKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <section className="relative py-6">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center gap-0 bg-white rounded-full shadow-2xl shadow-black/10 p-2 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            {/* Location */}
            <div className="flex-1 px-6 py-3 border-r border-gray-200 group">
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                {labels.where}
              </label>
              <input
                type="text"
                placeholder={labels.wherePlaceholder}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleLocationKeyDown}
                className="w-full text-sm text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0"
              />
            </div>

            {/* Check In / Event Date */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex-1 px-6 py-3 border-r border-gray-200 cursor-pointer hover:bg-gray-50 rounded-full transition-colors duration-200">
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    {labels.dateLabel}
                  </label>
                  <p className="text-sm text-gray-600">
                    {checkIn
                      ? format(checkIn, "MMM dd, yyyy")
                      : labels.datePlaceholder}
                  </p>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={checkIn}
                  onSelect={setCheckIn}
                  disabled={(date) => date < new Date()}
                  className="rounded-xl border-0"
                />
              </PopoverContent>
            </Popover>

            {/* Check Out (conditional) */}
            {labels.showCheckOut && (
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex-1 px-6 py-3 border-r border-gray-200 cursor-pointer hover:bg-gray-50 rounded-full transition-colors duration-200">
                    <label className="block text-xs font-semibold text-gray-900 mb-1">
                      {labels.dateLabel2}
                    </label>
                    <p className="text-sm text-gray-600">
                      {checkOut
                        ? format(checkOut, "MMM dd, yyyy")
                        : labels.datePlaceholder}
                    </p>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={(date) => date < (checkIn || new Date())}
                    className="rounded-xl border-0"
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Guests / Attendees */}
            <Popover open={isGuestsOpen} onOpenChange={setIsGuestsOpen}>
              <PopoverTrigger asChild>
                <div className="flex-1 px-6 py-3 cursor-pointer hover:bg-gray-50 rounded-full transition-colors duration-200">
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    {labels.guestLabel}
                  </label>
                  <p className="text-sm text-gray-600">
                    {totalGuests === 0
                      ? labels.guestPlaceholder
                      : `${totalGuests} ${labels.guestLabel.toLowerCase()}`}
                    {labels.showRooms &&
                      guests.rooms > 0 &&
                      `, ${guests.rooms} room${guests.rooms !== 1 ? "s" : ""}`}
                  </p>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Adults</p>
                      <p className="text-sm text-gray-500">Ages 13 or above</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => decrementGuests("adults")}
                        className="h-8 w-8 rounded-full border border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                        disabled={guests.adults === 0}
                      >
                        <span className="text-gray-700">−</span>
                      </button>
                      <span className="w-10 text-center font-semibold text-gray-900">
                        {guests.adults}
                      </span>
                      <button
                        onClick={() => incrementGuests("adults")}
                        className="h-8 w-8 rounded-full border border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all duration-200"
                      >
                        <span className="text-gray-700">+</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Children</p>
                      <p className="text-sm text-gray-500">Ages 2-12</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => decrementGuests("children")}
                        className="h-8 w-8 rounded-full border border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                        disabled={guests.children === 0}
                      >
                        <span className="text-gray-700">−</span>
                      </button>
                      <span className="w-10 text-center font-semibold text-gray-900">
                        {guests.children}
                      </span>
                      <button
                        onClick={() => incrementGuests("children")}
                        className="h-8 w-8 rounded-full border border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all duration-200"
                      >
                        <span className="text-gray-700">+</span>
                      </button>
                    </div>
                  </div>

                  {labels.showRooms && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-900">Rooms</p>
                        <p className="text-sm text-gray-500">Number of rooms</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decrementGuests("rooms")}
                          className="h-8 w-8 rounded-full border border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                          disabled={guests.rooms === 1}
                        >
                          <span className="text-gray-700">−</span>
                        </button>
                        <span className="w-10 text-center font-semibold text-gray-900">
                          {guests.rooms}
                        </span>
                        <button
                          onClick={() => incrementGuests("rooms")}
                          className="h-8 w-8 rounded-full border border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all duration-200"
                        >
                          <span className="text-gray-700">+</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden space-y-3">
            <div className="bg-white rounded-2xl shadow-xl shadow-black/5 p-4 space-y-3 border border-gray-100">
              {/* Location */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-600" />
                <input
                  type="text"
                  placeholder={labels.wherePlaceholder}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={handleLocationKeyDown}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Dates */}
              <div
                className={`grid ${labels.showCheckOut ? "grid-cols-2" : "grid-cols-1"} gap-3`}
              >
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-3 px-4 py-4 rounded-xl border border-gray-200 hover:border-purple-600 hover:bg-purple-50/50 transition-all duration-200 text-left">
                      <Calendar className="h-5 w-5 text-purple-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-semibold mb-0.5">
                          {labels.dateLabel}
                        </p>
                        <p className="text-sm text-gray-900 font-medium truncate">
                          {checkIn ? format(checkIn, "MMM dd") : "Add date"}
                        </p>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      disabled={(date) => date < new Date()}
                      className="rounded-xl border-0"
                    />
                  </PopoverContent>
                </Popover>

                {labels.showCheckOut && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-3 px-4 py-4 rounded-xl border border-gray-200 hover:border-purple-600 hover:bg-purple-50/50 transition-all duration-200 text-left">
                        <Calendar className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-semibold mb-0.5">
                            {labels.dateLabel2}
                          </p>
                          <p className="text-sm text-gray-900 font-medium truncate">
                            {checkOut ? format(checkOut, "MMM dd") : "Add date"}
                          </p>
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={checkOut}
                        onSelect={setCheckOut}
                        disabled={(date) => date < (checkIn || new Date())}
                        className="rounded-xl border-0"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Guests */}
              <Popover open={isGuestsOpen} onOpenChange={setIsGuestsOpen}>
                <PopoverTrigger asChild>
                  <button className="w-full flex items-center gap-3 px-4 py-4 rounded-xl border border-gray-200 hover:border-purple-600 hover:bg-purple-50/50 transition-all duration-200 text-left">
                    <Users className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-semibold mb-0.5">
                        {labels.guestLabel}
                      </p>
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {totalGuests === 0
                          ? labels.guestPlaceholder
                          : `${totalGuests} ${labels.guestLabel.toLowerCase()}`}
                        {labels.showRooms &&
                          guests.rooms > 0 &&
                          `, ${guests.rooms} room${guests.rooms !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-2rem)] max-w-sm p-0">
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Adults</p>
                        <p className="text-sm text-gray-500">Ages 13+</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decrementGuests("adults")}
                          className="h-9 w-9 rounded-full border border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all duration-200 disabled:opacity-25"
                          disabled={guests.adults === 0}
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-semibold text-gray-900">
                          {guests.adults}
                        </span>
                        <button
                          onClick={() => incrementGuests("adults")}
                          className="h-9 w-9 rounded-full border border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all duration-200"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Children</p>
                        <p className="text-sm text-gray-500">Ages 2-12</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decrementGuests("children")}
                          className="h-9 w-9 rounded-full border border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all duration-200 disabled:opacity-25"
                          disabled={guests.children === 0}
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-semibold text-gray-900">
                          {guests.children}
                        </span>
                        <button
                          onClick={() => incrementGuests("children")}
                          className="h-9 w-9 rounded-full border border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all duration-200"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {labels.showRooms && (
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <p className="font-semibold text-gray-900">Rooms</p>
                          <p className="text-sm text-gray-500">
                            Number of rooms
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => decrementGuests("rooms")}
                            className="h-9 w-9 rounded-full border border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all duration-200 disabled:opacity-25"
                            disabled={guests.rooms === 1}
                          >
                            −
                          </button>
                          <span className="w-10 text-center font-semibold text-gray-900">
                            {guests.rooms}
                          </span>
                          <button
                            onClick={() => incrementGuests("rooms")}
                            className="h-9 w-9 rounded-full border border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all duration-200"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Search {categoryLabel}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

SearchFilters.displayName = "SearchFilters";

export default SearchFilters;
