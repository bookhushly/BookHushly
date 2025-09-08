export const AMENITY_OPTIONS = {
  hotels: [
    { value: "wifi", label: "Free WiFi", icon: "wifi" },
    { value: "ac", label: "Air Conditioning", icon: "ac" },
    { value: "power_backup", label: "24/7 Power Backup", icon: "power_backup" },
    { value: "swimming_pool", label: "Swimming Pool", icon: "swimming_pool" },
    { value: "gym", label: "Gym/Fitness Center", icon: "gym" },
    { value: "restaurant", label: "Restaurant", icon: "restaurant" },
    { value: "parking", label: "Free Parking", icon: "parking" },
    { value: "room_service", label: "24/7 Room Service", icon: "room_service" },
    { value: "laundry", label: "Laundry Service", icon: "laundry" },
    { value: "security", label: "24/7 Security", icon: "security" },
    { value: "elevator", label: "Elevator", icon: "elevator" },
    { value: "balcony", label: "Balcony/Terrace", icon: "balcony" },
  ],

  serviced_apartments: [
    { value: "wifi", label: "Free WiFi", icon: "wifi" },
    { value: "ac", label: "Air Conditioning", icon: "ac" },
    { value: "power_backup", label: "24/7 Power Backup", icon: "power_backup" },
    { value: "kitchen", label: "Fully Equipped Kitchen", icon: "kitchen" },
    { value: "parking", label: "Free Parking", icon: "parking" },
    { value: "security", label: "24/7 Security", icon: "security" },
    { value: "gym", label: "Gym", icon: "gym" },
    { value: "pool", label: "Swimming Pool", icon: "pool" },
    { value: "elevator", label: "Elevator", icon: "elevator" },
    {
      value: "housekeeping",
      label: "Housekeeping Service",
      icon: "housekeeping",
    },
    { value: "laundry", label: "Laundry Service", icon: "laundry" },
    { value: "concierge", label: "Concierge Service", icon: "concierge" },
  ],

  food: [
    { value: "dine_in", label: "Dine-in", icon: "dine_in" },
    { value: "takeaway", label: "Takeaway", icon: "takeaway" },
    { value: "delivery", label: "Home Delivery", icon: "delivery" },
    { value: "catering", label: "Catering Services", icon: "catering" },
    { value: "parking", label: "Parking Available", icon: "parking" },
    { value: "ac", label: "Air Conditioned", icon: "ac" },
    { value: "wifi", label: "Free WiFi", icon: "wifi" },
    {
      value: "outdoor_seating",
      label: "Outdoor Seating",
      icon: "outdoor_seating",
    },
    { value: "live_music", label: "Live Music", icon: "live_music" },
    { value: "bar", label: "Full Bar", icon: "bar" },
  ],

  events: [
    { value: "projector", label: "Projector/AV Equipment", icon: "projector" },
    { value: "sound_system", label: "Sound System", icon: "sound_system" },
    { value: "stage", label: "Stage/Platform", icon: "stage" },
    { value: "lighting", label: "Professional Lighting", icon: "lighting" },
    { value: "catering", label: "Catering Services", icon: "catering" },
    { value: "parking", label: "Parking Available", icon: "parking" },
    { value: "ac", label: "Air Conditioning", icon: "ac" },
    { value: "power_backup", label: "Power Backup", icon: "power_backup" },
    { value: "security", label: "Security Services", icon: "security" },
    { value: "decoration", label: "Event Decoration", icon: "decoration" },
  ],

  logistics: [
    { value: "tracking", label: "Real-time Tracking", icon: "tracking" },
    { value: "insurance", label: "Insurance Coverage", icon: "insurance" },
    {
      value: "express_delivery",
      label: "Express Delivery",
      icon: "express_delivery",
    },
    {
      value: "fragile_handling",
      label: "Fragile Item Handling",
      icon: "fragile_handling",
    },
    {
      value: "bulk_transport",
      label: "Bulk Transport",
      icon: "bulk_transport",
    },
    {
      value: "door_to_door",
      label: "Door-to-Door Service",
      icon: "door_to_door",
    },
    { value: "warehousing", label: "Warehousing", icon: "warehousing" },
    { value: "packaging", label: "Professional Packaging", icon: "packaging" },
  ],

  security: [
    { value: "armed_guards", label: "Armed Security", icon: "armed_guards" },
    {
      value: "unarmed_guards",
      label: "Unarmed Security",
      icon: "unarmed_guards",
    },
    { value: "cctv", label: "CCTV Monitoring", icon: "cctv" },
    { value: "patrol", label: "Mobile Patrol", icon: "patrol" },
    {
      value: "alarm_response",
      label: "Alarm Response",
      icon: "alarm_response",
    },
    {
      value: "access_control",
      label: "Access Control",
      icon: "access_control",
    },
    {
      value: "emergency_response",
      label: "Emergency Response",
      icon: "emergency_response",
    },
    { value: "fire_safety", label: "Fire Safety", icon: "fire_safety" },
  ],

  car_rentals: [
    { value: "gps", label: "GPS Navigation", icon: "gps" },
    { value: "ac", label: "Air Conditioning", icon: "ac" },
    { value: "bluetooth", label: "Bluetooth Connectivity", icon: "bluetooth" },
    {
      value: "usb_charging",
      label: "USB Charging Ports",
      icon: "usb_charging",
    },
    { value: "backup_camera", label: "Backup Camera", icon: "backup_camera" },
    {
      value: "child_seats",
      label: "Child Seats Available",
      icon: "child_seats",
    },
    {
      value: "unlimited_mileage",
      label: "Unlimited Mileage",
      icon: "unlimited_mileage",
    },
    {
      value: "roadside_assistance",
      label: "Roadside Assistance",
      icon: "roadside_assistance",
    },
  ],
};
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
        name: "amenities",
        label: "Amenities & Features",
        type: "amenity_multiselect",
        required: false,
        options: AMENITY_OPTIONS.hotels,
        description: "Select all amenities available at your property",
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
      // {
      //   name: "amenities",
      //   label: "Amenities",
      //   type: "multiselect",
      //   required: false,
      //   options: [
      //     { value: "wifi", label: "Free WiFi" },
      //     { value: "ac", label: "Air Conditioning" },
      //     {
      //       value: "power_backup",
      //       label: "24/7 Power Backup (Generator/Inverter)",
      //     },
      //     { value: "swimming_pool", label: "Swimming Pool" },
      //     { value: "gym", label: "Gym" },
      //     { value: "restaurant", label: "On-site Restaurant" },
      //     { value: "parking", label: "Free Parking" },
      //     { value: "room_service", label: "24/7 Room Service" },
      //     { value: "laundry", label: "Laundry Service" },
      //     { value: "security", label: "24/7 Security" },
      //   ],
      // },
      {
        name: "cancellation_policy",
        label: "Cancellation Policy",
        type: "multiselect",
        required: false,
        options: [
          { value: "free_24h", label: "Free cancellation within 24 hours" },
          { value: "free_48h", label: "Free cancellation within 48 hours" },
          { value: "free_7d", label: "Free cancellation within 7 days" },
          { value: "non_refundable", label: "Non-refundable" },
          { value: "partial_refunded", label: "Partial refund (50%)" },
        ],
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
        placeholder: "e.g., Mama's Kitchen, Catering Service",
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
        name: "amenities",
        label: "Restaurant Features",
        type: "amenity_multiselect",
        required: false,
        options: AMENITY_OPTIONS.food,
        description: "Select all features and services available",
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
          { value: "fast_food", label: "Fast Food" },
          { value: "seafood", label: "Seafood" },
          { value: "vegetarian", label: "Vegetarian/Vegan" },
          { value: "intercontinental", label: "Intercontinental" },
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
        type: "operating_hours",
        required: false,
        description: "Set your business operating hours",
      },
      {
        name: "special_diets",
        label: "Special Dietary Options",
        type: "multiselect",
        required: false,
        options: [
          { value: "halal", label: "Halal" },
          { value: "vegetarian", label: "Vegetarian" },
          { value: "vegan", label: "Vegan" },
          { value: "gluten_free", label: "Gluten-Free" },
          { value: "diabetic_friendly", label: "Diabetic-Friendly" },
          { value: "low_sodium", label: "Low Sodium" },
        ],
      },
      {
        name: "delivery_areas",
        label: "Delivery Areas",
        type: "multiselect",
        required: false,
        options: [
          { value: "lekki", label: "Lekki" },
          { value: "ikoyi", label: "Ikoyi" },
          { value: "victoria_island", label: "Victoria Island" },
          { value: "ikeja", label: "Ikeja" },
          { value: "surulere", label: "Surulere" },
          { value: "yaba", label: "Yaba" },
          { value: "abuja_central", label: "Abuja Central Area" },
          { value: "garki", label: "Garki" },
          { value: "maitama", label: "Maitama" },
          { value: "port_harcourt", label: "Port Harcourt" },
        ],
      },
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
              placeholder: "Describe your venue in a few words...",
            },
            {
              name: "amenities",
              label:
                eventType === "event_center"
                  ? "Venue Amenities"
                  : "Services Included",
              type: "amenity_multiselect",
              required: false,
              options: AMENITY_OPTIONS.events,
              description: "Select all amenities and services available",
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

            // Add this field to relevant categories (food, events, security, car_rentals, etc.)
            {
              name: "operating_hours",
              label: "Operating Hours",
              type: "operating_hours",
              required: false,
              description: "Set your business operating hours",
            },
            {
              name: "cancellation_policy",
              label: "Cancellation Policy",
              type: "multiselect",
              required: false,
              options: [
                {
                  value: "free_48h",
                  label: "Free cancellation within 48 hours",
                },
                { value: "free_7d", label: "Free cancellation within 7 days" },
                { value: "partial_50", label: "50% refund within 7 days" },
                { value: "non_refundable", label: "Non-refundable" },
              ],
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
              name: "amenities",
              label:
                eventType === "event_center"
                  ? "Venue Amenities"
                  : "Services Included",
              type: "amenity_multiselect",
              required: false,
              options: AMENITY_OPTIONS.events,
              description: "Select all amenities and services available",
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
              type: "multiselect",
              required: false,
              options: [
                { value: "ticketing", label: "Ticketing" },
                { value: "security", label: "Security Services" },
                { value: "catering", label: "Catering" },
                { value: "photography", label: "Photography/Videography" },
                { value: "mc", label: "MC/Compere" },
                { value: "decoration", label: "Event Decoration" },
                { value: "music", label: "Live Music/DJ" },
                { value: "ushers", label: "Ushers/Hostesses" },
              ],
            },
            {
              name: "cancellation_policy",
              label: "Ticket Cancellation Policy",
              type: "multiselect",
              required: false,
              options: [
                {
                  value: "free_24h",
                  label: "Free cancellation within 24 hours",
                },
                {
                  value: "free_48h",
                  label: "Free cancellation within 48 hours",
                },
                { value: "partial_50", label: "50% refund within 48 hours" },
                { value: "non_refundable", label: "Non-refundable" },
              ],
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
        name: "amenities",
        label: "Service Features",
        type: "amenity_multiselect",
        required: false,
        options: AMENITY_OPTIONS.logistics,
        description: "Select all services and features you provide",
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
        type: "multiselect",
        required: false,
        options: [
          { value: "lagos", label: "Lagos" },
          { value: "abuja", label: "Abuja" },
          { value: "port_harcourt", label: "Port Harcourt" },
          { value: "ibadan", label: "Ibadan" },
          { value: "kano", label: "Kano" },
          { value: "enugu", label: "Enugu" },
          { value: "benin_city", label: "Benin City" },
          { value: "nationwide", label: "Nationwide" },
        ],
      },
      {
        name: "delivery_time",
        label: "Typical Delivery Time",
        type: "multiselect",
        required: false,
        options: [
          { value: "1_2_hours", label: "1-2 Hours" },
          { value: "same_day", label: "Same Day" },
          { value: "next_day", label: "Next Day" },
          { value: "2_3_days", label: "2-3 Days" },
          { value: "within_week", label: "Within a Week" },
        ],
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
        type: "multiselect",
        required: false,
        options: [
          { value: "comprehensive", label: "Comprehensive Insurance" },
          { value: "third_party", label: "Third-Party Insurance" },
          { value: "optional", label: "Optional Insurance" },
          { value: "none", label: "No Insurance" },
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
        name: "amenities",
        label: "Security Services",
        type: "amenity_multiselect",
        required: false,
        options: AMENITY_OPTIONS.security,
        description: "Select all security services you provide",
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
        type: "multiselect",
        required: false,
        options: [
          { value: "nscdc", label: "NSCDC Registered" },
          { value: "psira", label: "PSIRA Certified" },
          { value: "sia", label: "SIA Licensed" },
          { value: "first_aid", label: "First Aid Certified" },
          { value: "fire_safety", label: "Fire Safety Trained" },
        ],
      },
      {
        name: "equipment",
        label: "Equipment/Technology",
        type: "multiselect",
        required: false,
        options: [
          { value: "cctv", label: "CCTV Systems" },
          { value: "metal_detector", label: "Metal Detectors" },
          { value: "walkie_talkie", label: "Walkie-Talkies" },
          { value: "body_cameras", label: "Body Cameras" },
          { value: "security_drones", label: "Security Drones" },
        ],
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
        type: "multiselect",
        required: false,
        options: [
          { value: "5_min", label: "Within 5 Minutes" },
          { value: "15_min", label: "Within 15 Minutes" },
          { value: "30_min", label: "Within 30 Minutes" },
          { value: "1_hour", label: "Within 1 Hour" },
          { value: "24_7", label: "24/7 Availability" },
        ],
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
        name: "amenities",
        label: "Vehicle Features",
        type: "amenity_multiselect",
        required: false,
        options: AMENITY_OPTIONS.car_rentals,
        description: "Select all features available in your vehicles",
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
        type: "multiselect",
        required: false,
        options: [
          { value: "national", label: "Valid Nigerian Driver's License" },
          { value: "international", label: "International Driving Permit" },
          { value: "learners", label: "Learner's Permit Accepted" },
        ],
      },
      {
        name: "insurance_coverage",
        label: "Insurance Coverage",
        type: "multiselect",
        required: false,
        options: [
          { value: "comprehensive", label: "Comprehensive Insurance" },
          { value: "third_party", label: "Third-Party Insurance" },
          { value: "cdw", label: "Collision Damage Waiver" },
          { value: "none", label: "No Insurance" },
        ],
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
        name: "amenities",
        label: "Amenities & Features",
        type: "amenity_multiselect",
        required: false,
        options: AMENITY_OPTIONS.serviced_apartments,
        description: "Select all amenities available",
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
        type: "multiselect",
        required: false,
        options: [
          { value: "microwave", label: "Microwave" },
          { value: "refrigerator", label: "Refrigerator" },
          { value: "gas_cooker", label: "Gas Cooker" },
          { value: "electric_cooker", label: "Electric Cooker" },
          { value: "cookware", label: "Cookware" },
          { value: "dishwasher", label: "Dishwasher" },
        ],
      },
      {
        name: "payment_terms",
        label: "Payment Terms",
        type: "multiselect",
        required: false,
        options: [
          { value: "weekly", label: "Weekly Payments" },
          { value: "monthly", label: "Monthly Payments" },
          { value: "upfront", label: "Full Payment Upfront" },
          { value: "deposit_50", label: "50% Deposit Required" },
          { value: "deposit_25", label: "25% Deposit Required" },
        ],
      },
      {
        name: "cancellation_policy",
        label: "Cancellation Policy",
        type: "multiselect",
        required: false,
        options: [
          { value: "free_48h", label: "Free cancellation within 48 hours" },
          { value: "free_7d", label: "Free cancellation within 7 days" },
          { value: "partial_50", label: "50% refund within 7 days" },
          { value: "non_refundable", label: "Non-refundable" },
        ],
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

export const normalizeFeatures = (input) => {
  if (!input || typeof input !== "string") return [];
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
    // Store amenities as structured array - this is the key change
    amenities: Array.isArray(formData.amenities) ? formData.amenities : [],
  };

  const categoryConfig = getCategoryFormConfig(category, eventType);
  if (!categoryConfig) return baseData;

  const categorySpecificData = {};

  // Set price unit based on category
  switch (category) {
    case "hotels":
    case "serviced_apartments":
      categorySpecificData.price_unit = "per_night";
      break;
    case "food":
      categorySpecificData.price_unit = "per_person";
      break;
    case "events":
      categorySpecificData.price_unit =
        eventType === "event_center" ? "per_event" : "per_person";
      categorySpecificData.event_type = eventType || null;
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
    // In your renderField function, add this case:

    default:
      categorySpecificData.price_unit = "fixed";
  }

  // Process other category-specific fields
  categoryConfig.fields.forEach((field) => {
    const value = formData[field.name];
    if (!value || (Array.isArray(value) && value.length === 0)) return;

    // Skip amenities as it's handled separately above
    if (field.name === "amenities") return;

    switch (field.name) {
      case "capacity":
        categorySpecificData.capacity = parseInt(value);
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
        if (Array.isArray(value)) {
          categorySpecificData[field.name] = value;
        } else {
          categorySpecificData[field.name] = value;
        }
    }
  });

  // Handle meals for food category
  if (category === "food" && additionalData.meals) {
    categorySpecificData.meals = additionalData.meals;
  }

  return { ...baseData, ...categorySpecificData };
};

export const extractCategoryData = (listing) => {
  const categoryData = listing.category_data || {};

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
