import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { category, eventType, formData } = await req.json();

    if (!category || !formData || !formData.title) {
      return NextResponse.json(
        { error: "Missing required fields (category and title)" },
        { status: 400 }
      );
    }

    let prompt = "";
    switch (category) {
      case "hotels":
        prompt = `Generate a concise hotel description (max 100 words) for a property named "${formData.title}" with room type "${formData.room_type || "standard"}" and amenities like ${formData.amenities || "modern facilities"}. Highlight comfort and unique features.`;
        break;
      case "food":
        prompt = `Generate a concise restaurant description (max 100 words) for a service named "${formData.title}" offering ${formData.cuisine_type || "diverse"} cuisine with services: ${formData.service_type?.join(", ") || "dining"}. Highlight the dining experience and specialties.`;
        break;
      case "events":
        const eventLabel =
          eventType === "event_center" ? "event center" : "event";
        prompt = `Generate a concise ${eventLabel} description (max 100 words) for "${formData.title}" at ${formData.location || "a prime location"}. Highlight the ${eventType === "event_center" ? "venue facilities" : "event theme"} and unique attractions.`;
        break;
      case "logistics":
        prompt = `Generate a concise logistics service description (max 100 words) for "${formData.title}" offering ${formData.service_types?.join(", ") || "delivery"} services. Highlight reliability and coverage areas.`;
        break;
      case "security":
        prompt = `Generate a concise security service description (max 100 words) for "${formData.title}" providing ${formData.security_types?.join(", ") || "security"} services. Highlight expertise and reliability.`;
        break;
      case "car_rentals":
        prompt = `Generate a concise car rental description (max 100 words) for "${formData.title}" offering ${formData.vehicle_categories?.join(", ") || "vehicles"} at ${formData.location || "a convenient location"}. Highlight fleet quality and rental options.`;
        break;
      case "serviced_apartments":
        prompt = `Generate a concise serviced apartment description (max 100 words) for "${formData.title}" with ${formData.apartment_types?.join(", ") || "apartments"} and services like ${formData.services_included?.join(", ") || "modern amenities"}. Highlight comfort and convenience.`;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_length: 150, min_length: 50 },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok || !data[0]?.summary_text) {
      throw new Error("Failed to generate description");
    }

    return NextResponse.json({
      description: data[0].summary_text.trim(),
    });
  } catch (error) {
    console.error("Error generating description:", error);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}
