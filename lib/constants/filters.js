// Filter Constants and Configurations

export const AMENITY_ICONS = [
  { value: "wifi", label: "WiFi", icon: "Wifi" },
  { value: "air-vent", label: "Air Conditioning", icon: "AirVent" },
  { value: "tv", label: "TV", icon: "Tv" },
  { value: "coffee", label: "Coffee Maker", icon: "Coffee" },
  { value: "bath", label: "Bathtub", icon: "Bath" },
  { value: "refrigerator", label: "Mini Fridge", icon: "Refrigerator" },
  { value: "utensils", label: "Room Service", icon: "Utensils" },
  { value: "dumbbell", label: "Gym Access", icon: "Dumbbell" },
  { value: "waves", label: "Pool Access", icon: "Waves" },
  { value: "car", label: "Parking", icon: "Car" },
  { value: "shirt", label: "Laundry", icon: "Shirt" },
  { value: "briefcase", label: "Work Desk", icon: "Briefcase" },
  { value: "shield-check", label: "Safe", icon: "ShieldCheck" },
  { value: "phone", label: "Phone", icon: "Phone" },
  { value: "wind", label: "Balcony", icon: "Wind" },
  { value: "droplet", label: "Hot Water", icon: "Droplet" },
];

export const APARTMENT_TYPES = [
  { value: "studio", label: "Studio" },
  { value: "1_bedroom", label: "1 Bedroom" },
  { value: "2_bedroom", label: "2 Bedroom" },
  { value: "3_bedroom", label: "3 Bedroom" },
  { value: "penthouse", label: "Penthouse" },
];

export const WATER_SUPPLY_OPTIONS = [
  { value: "borehole", label: "Borehole" },
  { value: "public_supply", label: "Public Supply" },
  { value: "both", label: "Both" },
];

export const SECURITY_FEATURES = [
  { value: "estate_gate", label: "Estate Gate" },
  { value: "24hr_security", label: "24hr Security" },
  { value: "access_control", label: "Access Control" },
  { value: "intercom_system", label: "Intercom System" },
  { value: "cctv_surveillance", label: "CCTV" },
];

export const POWER_SUPPLY_OPTIONS = [
  { value: "generator", label: "Generator" },
  { value: "inverter", label: "Inverter" },
  { value: "solar", label: "Solar Power" },
];

// Price ranges per category
export const PRICE_RANGES = {
  hotels: { min: 5000, max: 500000, step: 5000 },
  serviced_apartments: { min: 10000, max: 1000000, step: 10000 },
  events: { min: 1000, max: 10000000, step: 10000 },
};

// Default filter values
export const DEFAULT_FILTERS = {
  hotels: {
    price_min: null,
    price_max: null,
    state: null,
    city: null,
    amenities: [],
    bed_sizes: [],
    max_occupancy: null,
    floor: null,
  },
  serviced_apartments: {
    price_min: null,
    price_max: null,
    state: null,
    city: null,
    apartment_type: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: null,
    amenities: [],
    furnished: null,
    utilities_included: null,
    power_supply: [],
    security_features: [],
    internet_included: null,
    parking_spaces: null,
  },
  events: {
    price_min: null,
    price_max: null,
    state: null,
    city: null,
    capacity: null,
  },
};

// Bed size options
export const BED_SIZES = [
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "queen", label: "Queen" },
  { value: "king", label: "King" },
  { value: "twin", label: "Twin" },
];

// Number ranges for filters
export const NUMBER_RANGES = {
  bedrooms: { min: 1, max: 10, step: 1 },
  bathrooms: { min: 1, max: 6, step: 1 },
  max_guests: { min: 1, max: 20, step: 1 },
  parking_spaces: { min: 1, max: 10, step: 1 },
  capacity: { min: 10, max: 5000, step: 50 },
  max_occupancy: { min: 1, max: 10, step: 1 },
  floor: { min: 1, max: 50, step: 1 },
};
