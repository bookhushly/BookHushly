// app/services/[id]/service-detail-content.jsx
"use client";

import React from "react";
import EventOrganizerDetail from "@/components/shared/listings/details/EventOrganizer";
import HotelServiceDetail from "@/components/shared/listings/details/HotelServiceDetail";
import ApartmentServiceDetail from "@/components/shared/listings/details/ApartmentServiceDetail";
import GeneralServiceDetail from "@/components/shared/listings/details/GeneralServiceDetail";

const ServiceDetailClient = ({ service }) => {
  // Add structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: service.title,
    description: service.description,
    offers: {
      "@type": "Offer",
      price: service.price,
      priceCurrency: "NGN",
      availability: service.active
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    provider: {
      "@type": "Organization",
      name: service.vendor_name || "BookHushly",
    },
  };

  const renderServiceDetail = () => {
    switch (service.category) {
      case "events":
        return <EventOrganizerDetail service={service} />;

      case "hotels":
        return <HotelServiceDetail service={service} />;

      case "serviced_apartments":
        return <ApartmentServiceDetail service={service} />;

      default:
        return <GeneralServiceDetail service={service} />;
    }
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Service Detail Component */}
      {renderServiceDetail()}
    </>
  );
};

export default ServiceDetailClient;
