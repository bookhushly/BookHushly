// Serviced Apartments Amenities Configuration
// Follows the same pattern as hotels with icon mapping

import {
  Wifi,
  Tv,
  Wind,
  Fan,
  Waves,
  Droplet,
  Zap,
  Sun,
  Plug,
  WashingMachine,
  Shirt,
  UtensilsCrossed,
  Coffee,
  Microwave,
  Refrigerator,
  ChefHat,
  ConciergeBell,
  ShieldCheck,
  Video,
  Lock,
  Users,
  Dumbbell,
  ParkingSquare,
  Ellipsis,
  Baby,
  PawPrint,
  Briefcase,
  Armchair,
  Bed,
  Bath,
  AirVent,
} from "lucide-react";

// Amenity categories for Nigerian serviced apartments
export const APARTMENT_AMENITY_CATEGORIES = {
  KITCHEN: "kitchen",
  ENTERTAINMENT: "entertainment",
  POWER_UTILITIES: "power_utilities",
  COMFORT: "comfort",
  LAUNDRY: "laundry",
  SECURITY: "security",
  BUILDING: "building",
  SERVICES: "services",
  FAMILY: "family",
};

// Complete amenities list with icons (matching hotel pattern)
export const APARTMENT_AMENITIES = {
  // Kitchen Amenities
  fridge: {
    value: "fridge",
    label: "Refrigerator",
    icon: Refrigerator,
    category: "kitchen",
  },
  microwave: {
    value: "microwave",
    label: "Microwave",
    icon: Microwave,
    category: "kitchen",
  },
  gas_cooker: {
    value: "gas_cooker",
    label: "Gas Cooker",
    icon: ChefHat,
    category: "kitchen",
  },
  electric_cooker: {
    value: "electric_cooker",
    label: "Electric Cooker",
    icon: ChefHat,
    category: "kitchen",
  },
  cooking_utensils: {
    value: "cooking_utensils",
    label: "Cooking Utensils",
    icon: UtensilsCrossed,
    category: "kitchen",
  },
  dining_table: {
    value: "dining_table",
    label: "Dining Table",
    icon: UtensilsCrossed,
    category: "kitchen",
  },
  kettle: {
    value: "kettle",
    label: "Electric Kettle",
    icon: Coffee,
    category: "kitchen",
  },
  blender: {
    value: "blender",
    label: "Blender",
    icon: Coffee,
    category: "kitchen",
  },

  // Entertainment
  tv: {
    value: "tv",
    label: "Television",
    icon: Tv,
    category: "entertainment",
  },
  cable_tv: {
    value: "cable_tv",
    label: "Cable TV (DSTV/GOtv)",
    icon: Tv,
    category: "entertainment",
  },
  wifi: {
    value: "wifi",
    label: "WiFi Internet",
    icon: Wifi,
    category: "entertainment",
  },
  sound_system: {
    value: "sound_system",
    label: "Sound System",
    icon: Tv,
    category: "entertainment",
  },

  // Power & Utilities (Critical in Nigeria)
  generator: {
    value: "generator",
    label: "Generator",
    icon: Zap,
    category: "power_utilities",
  },
  inverter: {
    value: "inverter",
    label: "Inverter Backup",
    icon: Zap,
    category: "power_utilities",
  },
  solar_power: {
    value: "solar_power",
    label: "Solar Power",
    icon: Sun,
    category: "power_utilities",
  },
  prepaid_meter: {
    value: "prepaid_meter",
    label: "Prepaid Meter",
    icon: Plug,
    category: "power_utilities",
  },
  water_heater: {
    value: "water_heater",
    label: "Water Heater",
    icon: Droplet,
    category: "power_utilities",
  },
  borehole: {
    value: "borehole",
    label: "Borehole Water",
    icon: Droplet,
    category: "power_utilities",
  },

  // Comfort & Climate
  air_conditioning: {
    value: "air_conditioning",
    label: "Air Conditioning",
    icon: Wind,
    category: "comfort",
  },
  fan: {
    value: "fan",
    label: "Ceiling/Standing Fan",
    icon: Fan,
    category: "comfort",
  },
  heating: {
    value: "heating",
    label: "Heating System",
    icon: AirVent,
    category: "comfort",
  },

  // Laundry
  washing_machine: {
    value: "washing_machine",
    label: "Washing Machine",
    icon: WashingMachine,
    category: "laundry",
  },
  dryer: {
    value: "dryer",
    label: "Dryer",
    icon: WashingMachine,
    category: "laundry",
  },
  ironing_facilities: {
    value: "ironing_facilities",
    label: "Iron & Ironing Board",
    icon: Shirt,
    category: "laundry",
  },

  // Security (Important in Nigeria)
  cctv: {
    value: "cctv",
    label: "CCTV Surveillance",
    icon: Video,
    category: "security",
  },
  security_guard: {
    value: "security_guard",
    label: "24hr Security Guard",
    icon: ShieldCheck,
    category: "security",
  },
  access_control: {
    value: "access_control",
    label: "Access Control",
    icon: Lock,
    category: "security",
  },
  intercom: {
    value: "intercom",
    label: "Intercom System",
    icon: ConciergeBell,
    category: "security",
  },
  estate_gate: {
    value: "estate_gate",
    label: "Gated Estate",
    icon: ShieldCheck,
    category: "security",
  },

  // Building Amenities
  parking: {
    value: "parking",
    label: "Parking Space",
    icon: ParkingSquare,
    category: "building",
  },
  elevator: {
    value: "elevator",
    label: "Elevator/Lift",
    icon: Ellipsis,
    category: "building",
  },
  gym: {
    value: "gym",
    label: "Gym/Fitness Center",
    icon: Dumbbell,
    category: "building",
  },
  swimming_pool: {
    value: "swimming_pool",
    label: "Swimming Pool",
    icon: Waves,
    category: "building",
  },

  // Services
  housekeeping: {
    value: "housekeeping",
    label: "Housekeeping Service",
    icon: ConciergeBell,
    category: "services",
  },
  concierge: {
    value: "concierge",
    label: "Concierge Service",
    icon: ConciergeBell,
    category: "services",
  },

  // Family Friendly
  baby_cot: {
    value: "baby_cot",
    label: "Baby Cot",
    icon: Baby,
    category: "family",
  },
  high_chair: {
    value: "high_chair",
    label: "High Chair",
    icon: Baby,
    category: "family",
  },
  pet_friendly: {
    value: "pet_friendly",
    label: "Pet Friendly",
    icon: PawPrint,
    category: "family",
  },

  // Work Space
  workspace: {
    value: "workspace",
    label: "Dedicated Workspace",
    icon: Briefcase,
    category: "services",
  },
  desk: {
    value: "desk",
    label: "Desk & Chair",
    icon: Briefcase,
    category: "services",
  },

  // Furniture
  sofa: {
    value: "sofa",
    label: "Sofa/Couch",
    icon: Armchair,
    category: "comfort",
  },
  wardrobe: {
    value: "wardrobe",
    label: "Wardrobe",
    icon: Shirt,
    category: "comfort",
  },
  bedding: {
    value: "bedding",
    label: "Bedding & Linens",
    icon: Bed,
    category: "comfort",
  },
  towels: {
    value: "towels",
    label: "Towels Provided",
    icon: Bath,
    category: "comfort",
  },
};

// Get all amenities as array (for display)
export const AMENITY_LIST = Object.values(APARTMENT_AMENITIES);

// Get amenities by category
export const getAmenitiesByCategory = (category) => {
  return AMENITY_LIST.filter((amenity) => amenity.category === category);
};

// Get amenity icon by value
export const getAmenityIcon = (amenityValue) => {
  return APARTMENT_AMENITIES[amenityValue]?.icon || null;
};

// Get amenity label by value
export const getAmenityLabel = (amenityValue) => {
  return (
    APARTMENT_AMENITIES[amenityValue]?.label || amenityValue.replace(/_/g, " ")
  );
};

// Category labels for grouping
export const CATEGORY_LABELS = {
  kitchen: "Kitchen & Dining",
  entertainment: "Entertainment",
  power_utilities: "Power & Utilities",
  comfort: "Comfort & Climate",
  laundry: "Laundry Facilities",
  security: "Security Features",
  building: "Building Amenities",
  services: "Services",
  family: "Family Friendly",
};

// Essential amenities (most commonly required)
export const ESSENTIAL_AMENITIES = [
  "wifi",
  "air_conditioning",
  "tv",
  "fridge",
  "washing_machine",
  "parking",
  "generator",
  "security_guard",
];

// Utility-related amenities for pricing info
export const UTILITY_AMENITIES = [
  "generator",
  "inverter",
  "solar_power",
  "prepaid_meter",
  "water_heater",
  "borehole",
];

// Security amenities for safety info
export const SECURITY_AMENITIES = [
  "cctv",
  "security_guard",
  "access_control",
  "intercom",
  "estate_gate",
];

// Convert amenities object (from DB) to array of enabled amenities
export const parseAmenities = (amenitiesData) => {
  if (!amenitiesData) return [];

  // If it's an object with true/false values (from database)
  if (typeof amenitiesData === "object" && !Array.isArray(amenitiesData)) {
    return Object.keys(amenitiesData).filter(
      (key) => amenitiesData[key] === true
    );
  }

  // If it's already an array
  if (Array.isArray(amenitiesData)) return amenitiesData;

  return [];
};

// Get amenity details for display
export const getAmenityDetails = (amenityValue) => {
  const amenity = APARTMENT_AMENITIES[amenityValue];
  if (!amenity) {
    return {
      value: amenityValue,
      label: amenityValue.replace(/_/g, " "),
      icon: null,
      category: "other",
    };
  }
  return amenity;
};

// Create initial amenities object (all false)
export const createInitialAmenitiesObject = () => {
  const amenitiesObj = {};
  Object.keys(APARTMENT_AMENITIES).forEach((key) => {
    amenitiesObj[key] = false;
  });
  return amenitiesObj;
};
