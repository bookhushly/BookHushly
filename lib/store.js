// /lib/store.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      vendor: null,
      loading: false,
      setUser: (user) => set({ user }),
      setVendor: (vendor) => set({ vendor }),
      setLoading: (loading) => set({ loading }),

      // Clear local state only (used internally)
      clearAuth: () => set({ user: null, vendor: null, loading: false }),

      // ✅ Full logout function that signs out from Supabase
      logout: async () => {
        try {
          const supabase = createClient();

          // Sign out from Supabase (clears session cookies)
          const { error } = await supabase.auth.signOut();

          if (error) {
            console.error("Logout error:", error);
            throw error;
          }

          // Clear local state
          set({ user: null, vendor: null, loading: false });

          // Redirect to home or login
          window.location.href = "/login";
          console.log("redirecting from authstore");
          return { success: true };
        } catch (error) {
          console.error("Failed to logout:", error);
          return { success: false, error };
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
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
  // ✅ Clear bookings on logout
  clearBookings: () => set({ bookings: [] }),
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
  // ✅ Clear listings on logout
  clearListings: () => set({ listings: [] }),
}));
