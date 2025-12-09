// /lib/store.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      vendor: null,
      loading: true, // ✅ Start with loading: true
      setUser: (user) => set({ user }),
      setVendor: (vendor) => set({ vendor }),
      setLoading: (loading) => set({ loading }),
      // This just clears local state - actual logout should call server action
      clearAuth: () => set({ user: null, vendor: null, loading: false }),
    }),
    {
      name: "auth-storage",
      // ✅ Don't persist loading state
      partialize: (state) => ({
        user: state.user,
        vendor: state.vendor,
      }),
    }
  )
);

export const useBookingStore = create((set, get) => ({
  bookings: [],
  loading: false,
  setBookings: (bookings) => set({ bookings }),
  setLoading: (loading) => set({ loading }),
  addBooking: (booking) =>
    set((state) => ({ bookings: [...state.bookings, booking] })),
  updateBooking: (id, updates) =>
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === id ? { ...booking, ...updates } : booking
      ),
    })),
}));

export const useListingStore = create((set, get) => ({
  listings: [],
  loading: false,
  setListings: (listings) => set({ listings }),
  setLoading: (loading) => set({ loading }),
  addListing: (listing) =>
    set((state) => ({ listings: [...state.listings, listing] })),
  updateListing: (id, updates) =>
    set((state) => ({
      listings: state.listings.map((listing) =>
        listing.id === id ? { ...listing, ...updates } : listing
      ),
    })),
  deleteListing: (id) =>
    set((state) => ({
      listings: state.listings.filter((listing) => listing.id !== id),
    })),
}));
