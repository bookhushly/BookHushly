import {
  Building,
  Car,
  Home,
  PartyPopper,
  Shield,
  Truck,
  Utensils,
} from "lucide-react";

export const CATEGORIES = [
  {
    value: "hotels",
    label: "Hotels",
    icon: "🏨",
    image:
      "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fGhvdGVsfGVufDB8fDB8fHww",
    alt: "Luxury hotel lobby and reception area",
  },
  {
    value: "serviced_apartments",
    label: "Serviced Apartments",
    icon: "🏢",
    image:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG90ZWx8ZW58MHx8MHx8fDA%3D",
    alt: "Modern serviced apartment interior",
  },

  {
    value: "events",
    label: "Events",
    icon: "🎉",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZXZlbnRzfGVufDB8fDB8fHww",
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
export const SCATEGORIES = [
  {
    value: "hotels",
    label: "Hotels",
    icon: <Building className="h-5 w-5" />,
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&crop=center",
    alt: "Luxury hotel lobby and reception area",
    type: "vendor", // vendor-managed
  },
  {
    value: "serviced_apartments",
    label: "Serviced Apartments",
    icon: <Home className="h-5 w-5" />,
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop&crop=center",
    alt: "Modern serviced apartment interior",
    type: "vendor", // vendor-managed
  },
  {
    value: "events",
    label: "Events",
    icon: <PartyPopper className="h-5 w-5" />,
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop&crop=center",
    alt: "Event celebration with decorations and lighting",
    type: "vendor", // vendor-managed
  },
  {
    value: "logistics",
    label: "Logistics",
    icon: <Truck className="h-5 w-5" />,
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop&crop=center",
    alt: "Logistics and delivery trucks",
    type: "bookhushly", // BookHushly-managed
  },
  {
    value: "security",
    label: "Security",
    icon: <Shield className="h-5 w-5" />,
    image:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center",
    alt: "Professional security services",
    type: "bookhushly", // BookHushly-managed
  },
];

// Helper to check if service is BookHushly-managed
export const isBookHushlyService = (category) => {
  const service = SCATEGORIES.find((s) => s.value === category);
  return service?.type === "bookhushly";
};

// Get only vendor services
export const getVendorServices = () => {
  return SCATEGORIES.filter((s) => s.type === "vendor");
};

// Get only BookHushly services
export const getBookHushlyServices = () => {
  return SCATEGORIES.filter((s) => s.type === "bookhushly");
};
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
export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];
