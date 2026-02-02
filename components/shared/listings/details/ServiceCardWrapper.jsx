// components/shared/listings/details/ServiceCardWrapper.jsx
import React from "react";
import EventServiceCard from "./EventServiceCard";
import GeneralServiceCard from "./GeneralServiceCard";
import HotelCard from "@/components/shared/services/hotel-card";
import ApartmentCard from "./ApartmentServiceCard";

const ServiceCardWrapper = React.memo(
  ({ service, lastListingRef, isMobile }) => {
    // SEO: Add structured data for each service
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.title,
      description: service.description,
      provider: {
        "@type": "Organization",
        name: service.vendor_name || "BookHushly",
      },
      areaServed: {
        "@type": "Country",
        name: "Nigeria",
      },
      offers: {
        "@type": "Offer",
        price: service.price,
        priceCurrency: "NGN",
        availability: "https://schema.org/InStock",
      },
    };

    return (
      <div itemScope itemType="https://schema.org/Service">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        {service.category === "hotels" ? (
          <HotelCard
            service={service}
            lastListingRef={lastListingRef}
            isMobile={isMobile}
          />
        ) : service.category === "serviced_apartments" ? (
          <ApartmentCard
            service={service}
            lastListingRef={lastListingRef}
            isMobile={isMobile}
          />
        ) : service.category === "events" ? (
          <EventServiceCard
            service={service}
            lastListingRef={lastListingRef}
            isMobile={isMobile}
          />
        ) : (
          <GeneralServiceCard
            service={service}
            lastListingRef={lastListingRef}
            isMobile={isMobile}
          />
        )}
      </div>
    );
  },
);

ServiceCardWrapper.displayName = "ServiceCardWrapper";

export default ServiceCardWrapper;
