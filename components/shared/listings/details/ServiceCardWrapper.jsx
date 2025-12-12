import React from "react";
import EventServiceCard from "./EventServiceCard";
import GeneralServiceCard from "./GeneralServiceCard";
import HotelCard from "@/components/shared/services/hotel-card";

const ServiceCardWrapper = React.memo(
  ({ service, lastListingRef, isMobile }) => {
    console.log("Rendering ServiceCardWrapper for service:", service);

    // Check if the service is a hotel
    if (service.category === "hotels") {
      return (
        <HotelCard
          service={service}
          lastListingRef={lastListingRef}
          isMobile={isMobile}
        />
      );
    }

    // Check if the service is an event
    if (service.category === "events") {
      return (
        <EventServiceCard
          service={service}
          lastListingRef={lastListingRef}
          isMobile={isMobile}
        />
      );
    }

    // For all other categories, use the general service card
    return (
      <GeneralServiceCard
        service={service}
        lastListingRef={lastListingRef}
        isMobile={isMobile}
      />
    );
  }
);

ServiceCardWrapper.displayName = "ServiceCardWrapper";

export default ServiceCardWrapper;
