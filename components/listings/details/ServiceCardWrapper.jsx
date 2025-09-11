import React from "react";
import EventServiceCard from "./EventServiceCard";
import GeneralServiceCard from "./GeneralServiceCard";

const ServiceCardWrapper = React.memo(
  ({ service, lastListingRef, isMobile }) => {
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
