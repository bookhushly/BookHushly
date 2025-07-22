export const CATEGORIES = [
  {
    value: "hotels",
    label: "Hotels",
    icon: "🏨",
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&crop=center",
    alt: "Luxury hotel lobby and reception area",
  },
  {
    value: "food",
    label: "Food & Restaurants",
    icon: "🍽️",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center",
    alt: "Restaurant interior with dining tables",
  },
  {
    value: "events",
    label: "Events",
    icon: "🎉",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop&crop=center",
    alt: "Event celebration with decorations and lighting",
  },
  {
    value: "logistics",
    label: "Logistics",
    icon: "🚚",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop&crop=center",
    alt: "Logistics and delivery trucks",
  },
  {
    value: "security",
    label: "Security",
    icon: "🛡️",
    image:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center",
    alt: "Professional security services",
  },
];

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

export const USER_ROLES = {
  CUSTOMER: "customer",
  VENDOR: "vendor",
  ADMIN: "admin",
};

export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
};
