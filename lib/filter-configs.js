export const FILTER_CONFIGS = {
  hotels: {
    priceRange: { min: 5000, max: 500000, step: 5000 },
    filters: [],
  },
  serviced_apartments: {
    priceRange: { min: 10000, max: 1000000, step: 10000 },
    filters: [
      {
        key: "bedrooms",
        label: "Bedrooms",
        type: "range",
        min: 1,
        max: 10,
        step: 1,
      },
      {
        key: "bathrooms",
        label: "Bathrooms",
        type: "range",
        min: 1,
        max: 6,
        step: 1,
      },
    ],
  },
  events: {
    priceRange: { min: 1000, max: 10000000, step: 10000 },
    filters: [
      {
        key: "capacity",
        label: "Capacity",
        type: "range",
        min: 10,
        max: 5000,
        step: 50,
      },
    ],
  },
  food: {
    priceRange: { min: 500, max: 50000, step: 500 },
    filters: [
      {
        key: "capacity",
        label: "Seating Capacity",
        type: "range",
        min: 10,
        max: 500,
        step: 10,
      },
    ],
  },
};

export const CATEGORY_IMAGES = {
  events: [
    "/service-images/events/1.jpg",
    "/service-images/events/2.jpg",
    "/service-images/events/3.jpg",
    "/service-images/events/4.jpg",
  ],
  serviced_apartments: [
    "/service-images/serviced_apartments/1.jpg",
    "/service-images/serviced_apartments/2.jpg",
    "/service-images/serviced_apartments/3.jpg",
    "/service-images/serviced_apartments/4.jpg",
  ],
  car_rentals: [
    "/service-images/car_rentals/1.jpg",
    "/service-images/car_rentals/2.jpg",
    "/service-images/car_rentals/3.jpg",
    "/service-images/car_rentals/4.jpg",
  ],
  "food & restaurants": [
    "/service-images/food/1.jpg",
    "/service-images/food/2.jpg",
    "/service-images/food/3.jpg",
    "/service-images/food/4.jpg",
  ],
  services: [
    "/service-images/services/1.jpg",
    "/service-images/services/2.jpg",
    "/service-images/services/3.jpg",
    "/service-images/services/4.jpg",
  ],
  security: [
    "/service-images/security/1.jpg",
    "/service-images/security/2.jpg",
    "/service-images/security/3.jpg",
    "/service-images/security/4.jpg",
  ],
  logistics: [
    "/service-images/logistics/1.jpg",
    "/service-images/logistics/2.jpg",
    "/service-images/logistics/3.jpg",
    "/service-images/logistics/4.jpg",
  ],
  hotels: [
    "/service-images/hotels/1.jpg",
    "/service-images/hotels/2.jpg",
    "/service-images/hotels/3.jpg",
    "/service-images/hotels/4.jpg",
  ],
};

export const CATEGORY_KEY_MAP = {
  events: "events",
  "serviced apartments": "serviced_apartments",
  serviced_apartments: "serviced_apartments",
  "car rentals": "car_rentals",
  car_rentals: "car_rentals",
  "food & restaurants": "food & restaurants",
  services: "services",
  security: "security",
  logistics: "logistics",
  hotels: "hotels",
};

export const normalizeCategoryKey = (label) => {
  const normalized = label
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ");
  return CATEGORY_KEY_MAP[normalized] || "services";
};
