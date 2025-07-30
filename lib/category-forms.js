// lib/category-forms.js - Updated version

// Category-specific form configurations (same as before)
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
        name: "check_in_time",
        label: "Check-in Time",
        type: "time",
        required: false,
      },
      {
        name: "check_out_time",
        label: "Check-out Time",
        type: "time",
        required: false,
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
    description: "Tell us about your restaurant or food service",
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
    ],
  },

  events: {
    title: "Event Service Details",
    description: "Describe your event planning and management services",
    fields: [
      {
        name: "title",
        label: "Service Name",
        type: "text",
        required: true,
        placeholder: "e.g., Wedding Planning, Corporate Events",
      },
      {
        name: "description",
        label: "Service Description",
        type: "textarea",
        required: true,
        placeholder:
          "Describe your event services, experience, and what makes you unique...",
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
        label: "Service Area",
        type: "text",
        required: true,
        placeholder: "e.g., Lagos State, Abuja",
      },

      {
        name: "event_types",
        label: "Event Types",
        type: "multiselect",
        required: true,
        options: [
          { value: "wedding", label: "Weddings" },
          { value: "birthday", label: "Birthday Parties" },
          { value: "corporate", label: "Corporate Events" },
          { value: "conference", label: "Conferences" },
          { value: "graduation", label: "Graduations" },
          { value: "funeral", label: "Funeral Services" },
          { value: "religious", label: "Religious Events" },
          { value: "social", label: "Social Gatherings" },
          { value: "product_launch", label: "Product Launches" },
        ],
      },
      {
        name: "capacity",
        label: "Maximum Event Size",
        type: "number",
        required: false,
        placeholder: "Maximum number of guests you can handle",
      },
      {
        name: "duration",
        label: "Typical Event Duration",
        type: "text",
        required: false,
        placeholder: "e.g., 6-8 hours, Full day",
      },
      {
        name: "services_included",
        label: "Services Included",
        type: "textarea",
        required: false,
        placeholder:
          "Planning, Decoration, Catering coordination, Photography, etc.",
      },
      {
        name: "equipment_provided",
        label: "Equipment/Items Provided",
        type: "textarea",
        required: false,
        placeholder:
          "Sound system, Lighting, Decorations, Tables, Chairs, etc.",
      },
      {
        name: "advance_booking",
        label: "Minimum Advance Booking",
        type: "text",
        required: false,
        placeholder: "e.g., 2 weeks, 1 month",
      },
      {
        name: "portfolio_link",
        label: "Portfolio/Gallery Link",
        type: "url",
        required: false,
        placeholder: "Link to your previous work",
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
};

// Helper function to get form config for a category
export const getCategoryFormConfig = (category) => {
  return CATEGORY_FORMS[category] || null;
};

// Updated function to prepare form data for enhanced database schema
export const prepareCategoryData = (formData, category) => {
  const baseData = {
    title: formData.title,
    description: formData.description,
    category: category,
    price: parseFloat(formData.price),
    location: formData.location,
    availability: formData.availability || "available",
    media_urls: formData.media_urls || [],
  };

  const categoryConfig = CATEGORY_FORMS[category];
  if (!categoryConfig) return baseData;

  // Initialize category-specific data
  const categoryData = {};
  const categorySpecificData = {};
  const featuresArray = [];

  // Set price unit based on category
  switch (category) {
    case "hotels":
      categoryData.price_unit = "per_day";
      break;
    case "food":
      categoryData.price_unit = "per_person";
      break;
    case "events":
      categoryData.price_unit = "per_event";
      break;
    case "logistics":
      categoryData.price_unit = "per_km";
      break;
    case "security":
      categoryData.price_unit = "per_hour";
      break;
    default:
      categoryData.price_unit = "fixed";
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
        categoryData.capacity = parseInt(value);
        break;
      case "duration":
        categoryData.duration = value;
        break;
      case "cancellation_policy":
        categoryData.cancellation_policy = value;
        break;
      case "operating_hours":
        categoryData.operating_hours = value;
        break;
      case "service_areas":
      case "delivery_areas":
      case "coverage_areas":
        categoryData.service_areas = value;
        break;
      case "amenities":
      case "services_included":
      case "equipment_provided":
      case "special_diets":
        categoryData.features = value;
        break;
      case "certifications":
      case "equipment":
        categoryData.requirements = value;
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

  // Store structured data in category_data JSONB
  if (Object.keys(categorySpecificData).length > 0) {
    categoryData.category_data = categorySpecificData;
  }

  // Combine features if not already set
  if (!categoryData.features && featuresArray.length > 0) {
    categoryData.features = featuresArray.join("\n");
  }

  return { ...baseData, ...categoryData };
};

// Helper function to extract category data for display - FIXED VERSION
export const extractCategoryData = (listing) => {
  const categoryData = listing.category_data || {};

  // Handle features safely - it might be a string, array, or null/undefined
  let features = [];
  if (listing.features) {
    if (typeof listing.features === "string") {
      // If it's a string, split by newlines
      features = listing.features.split("\n").filter((f) => f.trim());
    } else if (Array.isArray(listing.features)) {
      // If it's already an array, use it directly
      features = listing.features;
    } else {
      // If it's something else, try to convert to string then split
      features = String(listing.features)
        .split("\n")
        .filter((f) => f.trim());
    }
  }

  // Handle requirements safely
  let requirements = [];
  if (listing.requirements) {
    if (typeof listing.requirements === "string") {
      requirements = listing.requirements.split("\n").filter((r) => r.trim());
    } else if (Array.isArray(listing.requirements)) {
      requirements = listing.requirements;
    } else {
      requirements = [String(listing.requirements)];
    }
  }

  // Handle duration - could be from listing.duration (string) or categoryData.duration (array)
  let duration = listing.duration || categoryData.duration;

  // If duration is a string and contains commas, convert to array
  if (typeof duration === "string" && duration.includes(",")) {
    duration = duration.split(",").map((d) => d.trim());
  }

  return {
    ...categoryData,
    features,
    requirements,
    capacity: listing.capacity,
    duration: duration,
    operating_hours: listing.operating_hours,
    service_areas: listing.service_areas,
    price_unit: listing.price_unit,
    cancellation_policy: listing.cancellation_policy,
  };
};
