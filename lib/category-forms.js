export const CATEGORY_FORMS = {
  hotels: {
    title: "Hotel/Accommodation Details",
    description: "Provide details about your hotel or accommodation service",
    fields: [
      {
        name: "title",
        label: "Property Name",
        type: "text",
        required: true,
        placeholder: "e.g., Luxury Hotel Suite, Budget Inn",
      },
      {
        name: "description",
        label: "Property Description",
        type: "textarea",
        required: true,
        placeholder:
          "Describe your accommodation, amenities, and unique features...",
      },
      {
        name: "price",
        label: "Price per Night (₦)",
        type: "number",
        required: true,
        placeholder: "0.00",
      },
      {
        name: "location",
        label: "Address/Location",
        type: "text",
        required: true,
        placeholder: "e.g., Victoria Island, Lagos",
      },
      {
        name: "room_type",
        label: "Room Type",
        type: "select",
        required: true,
        options: [
          { value: "standard", label: "Standard Room" },
          { value: "deluxe", label: "Deluxe Room" },
          { value: "suite", label: "Suite" },
          { value: "penthouse", label: "Penthouse" },
          { value: "apartment", label: "Apartment" },
        ],
      },
      {
        name: "capacity",
        label: "Guest Capacity",
        type: "number",
        required: true,
        placeholder: "Maximum number of guests",
      },
      {
        name: "bedrooms",
        label: "Number of Bedrooms",
        type: "number",
        required: false,
        placeholder: "e.g., 2",
      },
      {
        name: "bathrooms",
        label: "Number of Bathrooms",
        type: "number",
        required: false,
        placeholder: "e.g., 2",
      },
      {
        name: "amenities",
        label: "Amenities",
        type: "textarea",
        required: false,
        placeholder: "WiFi, AC, Swimming Pool, Gym, Room Service, etc.",
      },

      {
        name: "cancellation_policy",
        label: "Cancellation Policy",
        type: "textarea",
        required: false,
        placeholder: "Free cancellation up to 24 hours before check-in...",
      },
    ],
  },

  food: {
    title: "Restaurant/Food Service Details",
    description:
      "Tell us about your restaurant or food service. For menu, choose manual entry or upload.",
    fields: [
      {
        name: "title",
        label: "Restaurant/Service Name",
        type: "text",
        required: true,
        placeholder: "e.g., Italian Bistro, Catering Service",
      },
      {
        name: "description",
        label: "About Your Restaurant",
        type: "textarea",
        required: true,
        placeholder:
          "Describe your cuisine, specialty dishes, and dining experience...",
      },
      {
        name: "price",
        label: "Average Price per Person (₦)",
        type: "number",
        required: true,
        placeholder: "0.00",
      },
      {
        name: "location",
        label: "Restaurant Address",
        type: "text",
        required: true,
        placeholder: "e.g., Lekki Phase 1, Lagos",
      },
      {
        name: "cuisine_type",
        label: "Cuisine Type",
        type: "select",
        required: true,
        options: [
          { value: "nigerian", label: "Nigerian" },
          { value: "continental", label: "Continental" },
          { value: "chinese", label: "Chinese" },
          { value: "italian", label: "Italian" },
          { value: "indian", label: "Indian" },
          { value: "mexican", label: "Mexican" },
          { value: "fast_food", label: "Fast Food" },
          { value: "seafood", label: "Seafood" },
          { value: "vegetarian", label: "Vegetarian/Vegan" },
          { value: "other", label: "Other" },
        ],
      },
      {
        name: "service_type",
        label: "Service Type",
        type: "multiselect",
        required: true,
        options: [
          { value: "dine_in", label: "Dine-in" },
          { value: "takeaway", label: "Takeaway" },
          { value: "delivery", label: "Home Delivery" },
          { value: "catering", label: "Catering" },
          { value: "buffet", label: "Buffet" },
        ],
      },
      {
        name: "capacity",
        label: "Seating Capacity",
        type: "number",
        required: false,
        placeholder: "Number of seats",
      },
      {
        name: "operating_hours",
        label: "Operating Hours",
        type: "text",
        required: false,
        placeholder: "e.g., 9:00 AM - 10:00 PM",
      },
      {
        name: "special_diets",
        label: "Special Dietary Options",
        type: "textarea",
        required: false,
        placeholder: "Halal, Kosher, Vegetarian, Gluten-free, etc.",
      },
      {
        name: "delivery_areas",
        label: "Delivery Areas",
        type: "textarea",
        required: false,
        placeholder: "Areas you deliver to (if applicable)",
      },
      // Note: Menu method, meals, and menu file are handled custom in the component
    ],
  },

  events: {
    title: (eventType) =>
      eventType === "event_center"
        ? "Event Center Details"
        : "Event Organizer Details",
    description: (eventType) =>
      eventType === "event_center"
        ? "Provide details about your event center or venue"
        : "Provide details about your event and ticket information",
    fields: (eventType) =>
      eventType === "event_center"
        ? [
            {
              name: "title",
              label: "Venue Name",
              type: "text",
              required: true,
              placeholder: "e.g., Grand Event Hall, Lagos",
            },
            {
              name: "description",
              label: "Venue Description",
              type: "textarea",
              required: true,
              placeholder:
                "Describe your venue, facilities, and unique features...",
            },
            {
              name: "price",
              label: "Rental Price (₦)",
              type: "number",
              required: true,
              placeholder: "0.00",
            },
            {
              name: "location",
              label: "Venue Address",
              type: "text",
              required: true,
              placeholder: "e.g., Victoria Island, Lagos",
            },
            {
              name: "capacity",
              label: "Venue Capacity",
              type: "number",
              required: true,
              placeholder: "Maximum number of guests",
            },
            {
              name: "amenities",
              label: "Venue Amenities",
              type: "multiselect",
              required: false,
              options: [
                { value: "projector", label: "Projector" },
                { value: "sound_system", label: "Sound System" },
                { value: "catering", label: "Catering Services" },
                { value: "parking", label: "Parking" },
                { value: "stage", label: "Stage" },
                { value: "lighting", label: "Event Lighting" },
              ],
            },
            {
              name: "operating_hours",
              label: "Operating Hours",
              type: "text",
              required: false,
              placeholder: "e.g., 8:00 AM - 12:00 AM",
            },
            {
              name: "cancellation_policy",
              label: "Cancellation Policy",
              type: "textarea",
              required: false,
              placeholder: "Cancellation terms for venue bookings...",
            },
          ]
        : [
            {
              name: "title",
              label: "Event Name",
              type: "text",
              required: true,
              placeholder: "e.g., Lagos Music Festival, Corporate Gala",
            },
            {
              name: "description",
              label: "Event Description",
              type: "textarea",
              required: true,
              placeholder: "Describe your event, theme, and attractions...",
            },
            {
              name: "price",
              label: "Ticket Price (₦)",
              type: "number",
              required: true,
              placeholder: "0.00",
            },
            {
              name: "location",
              label: "Event Location",
              type: "text",
              required: true,
              placeholder: "e.g., Eko Hotel, Lagos",
            },
            {
              name: "event_date",
              label: "Event Date",
              type: "date",
              required: true,
            },
            {
              name: "event_time",
              label: "Event Start Time",
              type: "time",
              required: true,
            },
            {
              name: "total_tickets",
              label: "Total Tickets Available",
              type: "number",
              required: true,
              placeholder: "e.g., 500",
            },
            {
              name: "event_types",
              label: "Event Type",
              type: "select",
              required: true,
              options: [
                { value: "wedding", label: "Wedding" },
                { value: "concert", label: "Concert" },
                { value: "conference", label: "Conference" },
                { value: "birthday", label: "Birthday Party" },
                { value: "corporate", label: "Corporate Event" },
                { value: "social", label: "Social Gathering" },
                { value: "product_launch", label: "Product Launch" },
              ],
            },
            {
              name: "services_included",
              label: "Services Included",
              type: "textarea",
              required: false,
              placeholder: "Ticketing, coordination, security, etc.",
            },
            {
              name: "cancellation_policy",
              label: "Ticket Cancellation Policy",
              type: "textarea",
              required: false,
              placeholder: "Refund policy for ticket cancellations...",
            },
          ],
  },

  logistics: {
    title: "Logistics Service Details",
    description:
      "Provide information about your logistics and delivery services",
    fields: [
      {
        name: "title",
        label: "Service Name",
        type: "text",
        required: true,
        placeholder: "e.g., Same Day Delivery, Moving Service",
      },
      {
        name: "description",
        label: "Service Description",
        type: "textarea",
        required: true,
        placeholder:
          "Describe your logistics services, coverage area, and capabilities...",
      },
      {
        name: "price",
        label: "Starting Price (₦)",
        type: "number",
        required: true,
        placeholder: "0.00",
      },
      {
        name: "location",
        label: "Base Location",
        type: "text",
        required: true,
        placeholder: "e.g., Lagos Mainland",
      },
      {
        name: "service_types",
        label: "Service Types",
        type: "multiselect",
        required: true,
        options: [
          { value: "same_day", label: "Same Day Delivery" },
          { value: "next_day", label: "Next Day Delivery" },
          { value: "express", label: "Express Delivery" },
          { value: "standard", label: "Standard Delivery" },
          { value: "moving", label: "Moving/Relocation" },
          { value: "freight", label: "Freight Transport" },
          { value: "courier", label: "Courier Services" },
          { value: "warehousing", label: "Warehousing" },
        ],
      },
      {
        name: "vehicle_types",
        label: "Vehicle Types Available",
        type: "multiselect",
        required: false,
        options: [
          { value: "motorcycle", label: "Motorcycle" },
          { value: "car", label: "Car" },
          { value: "van", label: "Van" },
          { value: "pickup", label: "Pickup Truck" },
          { value: "truck", label: "Truck" },
          { value: "container", label: "Container Truck" },
        ],
      },
      {
        name: "weight_limit",
        label: "Maximum Weight Capacity",
        type: "text",
        required: false,
        placeholder: "e.g., 50kg, 1 ton, 5 tons",
      },
      {
        name: "service_areas",
        label: "Service Areas",
        type: "textarea",
        required: false,
        placeholder: "List all areas you serve",
      },
      {
        name: "delivery_time",
        label: "Typical Delivery Time",
        type: "text",
        required: false,
        placeholder: "e.g., 2-4 hours, Same day, 1-3 days",
      },
      {
        name: "tracking_available",
        label: "Real-time Tracking",
        type: "select",
        required: false,
        options: [
          { value: "yes", label: "Yes, tracking available" },
          { value: "no", label: "No tracking" },
          { value: "partial", label: "Limited tracking" },
        ],
      },
      {
        name: "insurance_covered",
        label: "Insurance Coverage",
        type: "select",
        required: false,
        options: [
          { value: "yes", label: "Items are insured" },
          { value: "no", label: "No insurance" },
          { value: "optional", label: "Optional insurance available" },
        ],
      },
    ],
  },

  security: {
    title: "Security Service Details",
    description: "Tell us about your security services and expertise",
    fields: [
      {
        name: "title",
        label: "Service Name",
        type: "text",
        required: true,
        placeholder: "e.g., Event Security, Personal Protection",
      },
      {
        name: "description",
        label: "Service Description",
        type: "textarea",
        required: true,
        placeholder:
          "Describe your security services, experience, and qualifications...",
      },
      {
        name: "price",
        label: "Rate per Hour (₦)",
        type: "number",
        required: true,
        placeholder: "0.00",
      },
      {
        name: "location",
        label: "Service Area",
        type: "text",
        required: true,
        placeholder: "e.g., Lagos State, FCT Abuja",
      },
      {
        name: "security_types",
        label: "Security Services",
        type: "multiselect",
        required: true,
        options: [
          { value: "event", label: "Event Security" },
          { value: "personal", label: "Personal Protection" },
          { value: "corporate", label: "Corporate Security" },
          { value: "residential", label: "Residential Security" },
          { value: "retail", label: "Retail Security" },
          { value: "patrol", label: "Security Patrol" },
          { value: "investigation", label: "Private Investigation" },
          { value: "consultancy", label: "Security Consultancy" },
        ],
      },
      {
        name: "team_size",
        label: "Available Team Size",
        type: "text",
        required: false,
        placeholder: "e.g., 1-10 officers, 20+ officers",
      },
      {
        name: "duration",
        label: "Service Duration Options",
        type: "multiselect",
        required: false,
        options: [
          { value: "hourly", label: "Hourly" },
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
          { value: "contract", label: "Long-term Contract" },
        ],
      },
      {
        name: "certifications",
        label: "Certifications & Licenses",
        type: "textarea",
        required: false,
        placeholder:
          "List relevant security certifications, licenses, and training",
      },
      {
        name: "equipment",
        label: "Equipment/Technology",
        type: "textarea",
        required: false,
        placeholder: "CCTV, Metal detectors, Communication devices, etc.",
      },
      {
        name: "experience_years",
        label: "Years of Experience",
        type: "number",
        required: false,
        placeholder: "Number of years in security",
      },
      {
        name: "background_check",
        label: "Background Verification",
        type: "select",
        required: false,
        options: [
          { value: "yes", label: "All staff background verified" },
          { value: "partial", label: "Management staff verified" },
          { value: "no", label: "No formal verification" },
        ],
      },
      {
        name: "response_time",
        label: "Emergency Response Time",
        type: "text",
        required: false,
        placeholder: "e.g., Within 15 minutes, 24/7 availability",
      },
    ],
  },

  car_rentals: {
    title: "Car Rental Service Details",
    description: "Provide details about your car rental service",
    fields: [
      {
        name: "title",
        label: "Service Name",
        type: "text",
        required: true,
        placeholder: "e.g., Lagos Car Rentals, Executive Vehicle Hire",
      },
      {
        name: "description",
        label: "Service Description",
        type: "textarea",
        required: true,
        placeholder:
          "Describe your car rental service, fleet, and unique offerings...",
      },
      {
        name: "price",
        label: "Starting Price per Day (₦)",
        type: "number",
        required: true,
        placeholder: "0.00",
      },
      {
        name: "location",
        label: "Pick-up Location",
        type: "text",
        required: true,
        placeholder: "e.g., Murtala Mohammed Airport, Victoria Island",
      },
      {
        name: "vehicle_categories",
        label: "Vehicle Categories",
        type: "multiselect",
        required: true,
        options: [
          { value: "economy", label: "Economy Cars" },
          { value: "compact", label: "Compact Cars" },
          { value: "standard", label: "Standard Cars" },
          { value: "luxury", label: "Luxury Cars" },
          { value: "suv", label: "SUVs" },
          { value: "minivan", label: "Minivans" },
          { value: "pickup", label: "Pickup Trucks" },
          { value: "convertible", label: "Convertibles" },
          { value: "electric", label: "Electric Vehicles" },
        ],
      },
      {
        name: "fleet_size",
        label: "Fleet Size",
        type: "number",
        required: false,
        placeholder: "Total number of vehicles",
      },
      {
        name: "transmission_types",
        label: "Transmission Types",
        type: "multiselect",
        required: false,
        options: [
          { value: "automatic", label: "Automatic" },
          { value: "manual", label: "Manual" },
        ],
      },
      {
        name: "fuel_types",
        label: "Fuel Types",
        type: "multiselect",
        required: false,
        options: [
          { value: "petrol", label: "Petrol" },
          { value: "diesel", label: "Diesel" },
          { value: "hybrid", label: "Hybrid" },
          { value: "electric", label: "Electric" },
        ],
      },
      {
        name: "rental_duration",
        label: "Rental Duration Options",
        type: "multiselect",
        required: false,
        options: [
          { value: "hourly", label: "Hourly" },
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
          { value: "long_term", label: "Long-term (3+ months)" },
        ],
      },
      {
        name: "driver_service",
        label: "Driver Service",
        type: "select",
        required: false,
        options: [
          { value: "self_drive", label: "Self-drive only" },
          { value: "with_driver", label: "With driver only" },
          { value: "both", label: "Both options available" },
        ],
      },
      {
        name: "delivery_pickup",
        label: "Delivery & Pickup Service",
        type: "select",
        required: false,
        options: [
          { value: "yes", label: "Free delivery & pickup" },
          { value: "paid", label: "Paid delivery & pickup" },
          { value: "no", label: "Pick-up from location only" },
        ],
      },
      {
        name: "age_requirement",
        label: "Minimum Age Requirement",
        type: "number",
        required: false,
        placeholder: "e.g., 21, 25",
      },
      {
        name: "license_requirement",
        label: "License Requirements",
        type: "textarea",
        required: false,
        placeholder: "Valid driving license, international permit, etc.",
      },
      {
        name: "insurance_coverage",
        label: "Insurance Coverage",
        type: "textarea",
        required: false,
        placeholder:
          "Comprehensive, third-party, collision damage waiver, etc.",
      },
      {
        name: "security_deposit",
        label: "Security Deposit (₦)",
        type: "number",
        required: false,
        placeholder: "Security deposit amount",
      },
    ],
  },

  serviced_apartments: {
    title: "Serviced Apartment Details",
    description: "Provide details about your serviced apartment offering",
    fields: [
      {
        name: "title",
        label: "Property Name",
        type: "text",
        required: true,
        placeholder: "e.g., Executive Serviced Apartments, Business Suites",
      },
      {
        name: "description",
        label: "Property Description",
        type: "textarea",
        required: true,
        placeholder:
          "Describe your serviced apartments, facilities, and services included...",
      },
      {
        name: "price",
        label: "Price per Night (₦)",
        type: "number",
        required: true,
        placeholder: "0.00",
      },
      {
        name: "location",
        label: "Address/Location",
        type: "text",
        required: true,
        placeholder: "e.g., Ikoyi, Lagos",
      },
      {
        name: "apartment_types",
        label: "Apartment Types",
        type: "multiselect",
        required: true,
        options: [
          { value: "studio", label: "Studio" },
          { value: "one_bedroom", label: "1 Bedroom" },
          { value: "two_bedroom", label: "2 Bedroom" },
          { value: "three_bedroom", label: "3 Bedroom" },
          { value: "four_bedroom", label: "4+ Bedroom" },
          { value: "penthouse", label: "Penthouse" },
        ],
      },
      {
        name: "capacity",
        label: "Maximum Guests",
        type: "number",
        required: true,
        placeholder: "Maximum number of guests",
      },
      {
        name: "minimum_stay",
        label: "Minimum Stay",
        type: "select",
        required: true,
        options: [
          { value: "1_night", label: "1 night" },
          { value: "3_nights", label: "3 nights" },
          { value: "1_week", label: "1 week" },
          { value: "2_weeks", label: "2 weeks" },
          { value: "1_month", label: "1 month" },
        ],
      },
      {
        name: "services_included",
        label: "Services Included",
        type: "multiselect",
        required: false,
        options: [
          { value: "housekeeping", label: "Daily Housekeeping" },
          { value: "laundry", label: "Laundry Service" },
          { value: "concierge", label: "Concierge Service" },
          { value: "room_service", label: "Room Service" },
          { value: "grocery_shopping", label: "Grocery Shopping" },
          { value: "airport_transfer", label: "Airport Transfer" },
          { value: "maintenance", label: "24/7 Maintenance" },
        ],
      },
      {
        name: "amenities",
        label: "Amenities",
        type: "textarea",
        required: false,
        placeholder: "Fully equipped kitchen, WiFi, Gym, Pool, Parking, etc.",
      },
      {
        name: "target_guests",
        label: "Target Guests",
        type: "multiselect",
        required: false,
        options: [
          { value: "business", label: "Business Travelers" },
          { value: "expatriates", label: "Expatriates" },
          { value: "relocating", label: "People Relocating" },
          { value: "medical", label: "Medical Tourists" },
          { value: "extended_stay", label: "Extended Stay Guests" },
          { value: "families", label: "Families" },
        ],
      },
      {
        name: "furnishing",
        label: "Furnishing Level",
        type: "select",
        required: false,
        options: [
          { value: "fully_furnished", label: "Fully Furnished" },
          { value: "semi_furnished", label: "Semi-furnished" },
          { value: "luxury_furnished", label: "Luxury Furnished" },
        ],
      },
      {
        name: "kitchen_facilities",
        label: "Kitchen Facilities",
        type: "textarea",
        required: false,
        placeholder: "Full kitchen, microwave, refrigerator, cookware, etc.",
      },
      {
        name: "payment_terms",
        label: "Payment Terms",
        type: "textarea",
        required: false,
        placeholder:
          "Weekly/monthly payment options, deposit requirements, etc.",
      },
      {
        name: "cancellation_policy",
        label: "Cancellation Policy",
        type: "textarea",
        required: false,
        placeholder: "Cancellation terms for short and long-term stays...",
      },
    ],
  },
};

export const getCategoryFormConfig = (category, eventType = "") => {
  const config = CATEGORY_FORMS[category];
  if (!config) return null;

  if (category === "events") {
    return {
      title:
        typeof config.title === "function"
          ? config.title(eventType)
          : config.title,
      description:
        typeof config.description === "function"
          ? config.description(eventType)
          : config.description,
      fields:
        typeof config.fields === "function"
          ? config.fields(eventType)
          : config.fields,
    };
  }

  return config;
};
// Function to normalize features or requirements into an array
export const normalizeFeatures = (input) => {
  if (!input || typeof input !== "string") return [];
  // Split by newline or comma, trim whitespace, and filter out empty strings
  return input
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter((item) => item);
};

export const prepareCategoryData = (
  formData,
  category,
  eventType = "",
  additionalData = {}
) => {
  const baseData = {
    title: formData.title,
    description: formData.description,
    category: category,
    price: parseFloat(formData.price),
    location: formData.location,
    availability: formData.availability || "available",
    media_urls: formData.media_urls || [],
  };

  const categoryConfig = getCategoryFormConfig(category, eventType);
  if (!categoryConfig) return baseData;

  const categorySpecificData = {};
  const featuresArray = [];

  // Set price unit based on category and event type
  switch (category) {
    case "hotels":
      categorySpecificData.price_unit = "per_night";
      break;
    case "food":
      categorySpecificData.price_unit = "per_person";
      if (formData.menu_method === "manual") {
        categorySpecificData.meals = additionalData.meals || [];
      } else if (formData.menu_method === "upload") {
        categorySpecificData.menu_url = additionalData.menu_url || null;
      }
      break;
    case "events":
      categorySpecificData.price_unit =
        eventType === "event_center" ? "per_event" : "per_person";
      categorySpecificData.event_type = eventType || null;
      if (eventType === "event_organizer") {
        categorySpecificData.remaining_tickets =
          parseInt(formData.total_tickets) || 0;
      }
      break;
    case "logistics":
      categorySpecificData.price_unit = "per_km";
      break;
    case "security":
      categorySpecificData.price_unit = "per_hour";
      break;
    case "car_rentals":
      categorySpecificData.price_unit = "per_day";
      break;
    case "serviced_apartments":
      categorySpecificData.price_unit = "per_night";
      break;
    default:
      categorySpecificData.price_unit = "fixed";
  }

  // Process each field
  categoryConfig.fields.forEach((field) => {
    const value = formData[field.name];
    if (
      !value ||
      (typeof value === "string" && !value.trim()) ||
      (Array.isArray(value) && value.length === 0)
    )
      return;

    // Map to existing database columns
    switch (field.name) {
      case "capacity":
        categorySpecificData.capacity = parseInt(value);
        break;
      case "duration":
        categorySpecificData.duration = value;
        break;
      case "cancellation_policy":
        categorySpecificData.cancellation_policy = value;
        break;
      case "operating_hours":
        categorySpecificData.operating_hours = value;
        break;
      case "service_areas":
      case "delivery_areas":
      case "coverage_areas":
        categorySpecificData.service_areas = value;
        break;
      case "amenities":
      case "services_included":
      case "equipment_provided":
      case "special_diets":
        categorySpecificData.features = value;
        break;
      case "certifications":
      case "equipment":
        categorySpecificData.requirements = value;
        break;
      case "bedrooms":
        categorySpecificData.bedrooms = parseInt(value);
        break;
      case "bathrooms":
        categorySpecificData.bathrooms = parseInt(value);
        break;
      case "minimum_stay":
        categorySpecificData.minimum_stay = value;
        break;
      case "security_deposit":
        categorySpecificData.security_deposit = parseFloat(value);
        break;
      default:
        // Store other category-specific data in category_data JSONB
        if (Array.isArray(value)) {
          categorySpecificData[field.name] = value;
          featuresArray.push(`${field.label}: ${value.join(", ")}`);
        } else {
          categorySpecificData[field.name] = value;
          featuresArray.push(`${field.label}: ${value}`);
        }
    }
  });

  // Combine features if not already set
  if (!categorySpecificData.features && featuresArray.length > 0) {
    categorySpecificData.features = featuresArray.join("\n");
  }

  return { ...baseData, ...categorySpecificData };
};

// Updated extractCategoryData to handle food menu
export const extractCategoryData = (listing) => {
  const categoryData = listing.category_data || {};

  let features = [];
  if (listing.features) {
    features = normalizeFeatures(listing.features);
  }

  let requirements = [];
  if (listing.requirements) {
    requirements = normalizeFeatures(listing.requirements);
  }

  let duration = listing.duration || categoryData.duration;
  if (typeof duration === "string" && duration.includes(",")) {
    duration = duration.split(",").map((d) => d.trim());
  }

  return {
    ...categoryData,
    features,
    requirements,
    capacity: listing.capacity,
    duration,
    operating_hours: listing.operating_hours,
    service_areas: listing.service_areas,
    price_unit: listing.price_unit,
    cancellation_policy: listing.cancellation_policy,
    event_type: listing.event_type,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    minimum_stay: listing.minimum_stay,
    security_deposit: listing.security_deposit,
    meals: categoryData.meals || [],
    menu_url: categoryData.menu_url || null,
  };
};
