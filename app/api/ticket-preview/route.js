import { generateTicketPDF } from "@/lib/ticketGenerator";
import { NextResponse } from "next/server";

const SAMPLES = {
  short: {
    title: "Jazz Night",
    venue: "Lagos Arena",
    ticketType: "VIP",
    date: "2026-07-15",
    time: "2026-07-15T19:00:00Z",
    seat: null,
  },
  medium: {
    title: "Afrobeats Summer Festival 2026",
    venue: "Eko Convention Centre, Victoria Island, Lagos",
    ticketType: "General Admission",
    date: "2026-08-02",
    time: "2026-08-02T16:00:00Z",
    seat: "B12",
  },
  long: {
    title: "The Grand Annual Pan-African Music & Arts Cultural Celebration",
    venue: "Tafawa Balewa Square, Lagos Island, Lagos State, Nigeria",
    ticketType: "Premium Early-Bird Weekend Pass",
    date: "2026-09-20",
    time: "2026-09-20T14:00:00Z",
    seat: null,
  },
  verylong: {
    title:
      "International Bookhushly Hospitality & Entertainment Summit — An Unmissable Week of Networking, Live Performances, and Industry Workshops",
    venue:
      "Landmark Beach Resort & Events Centre, Water Corporation Road, Oniru, Victoria Island Extension, Lagos State, Nigeria — Beachfront Hall A",
    ticketType: "Super Early-Bird All-Access Week-Long Festival Wristband Pass",
    date: "2026-12-01",
    time: "2026-12-01T10:00:00Z",
    seat: "BLOCK-C / ROW 12 / SEAT 004",
  },
  missing: {
    title: "",
    venue: "",
    ticketType: "",
    date: null,
    time: null,
    seat: null,
  },
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const variant = searchParams.get("variant") ?? "medium";
  const sample = SAMPLES[variant] ?? SAMPLES.medium;

  const mockBooking = {
    id: "00000000-0000-0000-0000-000000000000",
    booking_time: sample.time,
    listing: {
      title: sample.title,
      event_date: sample.date,
      location: sample.venue,
    },
  };

  try {
    const pdfBuffer = await generateTicketPDF(
      mockBooking,
      sample.ticketType || "General",
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      sample.seat
    );

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="ticket-${variant}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
