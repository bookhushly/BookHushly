// components/shared/listings/details/ServiceCardWrapper.jsx
import React from "react";
import EventServiceCard from "./EventServiceCard";
import GeneralServiceCard from "./GeneralServiceCard";
import HotelCard from "@/components/shared/services/hotel-card";
import ApartmentCard from "./ApartmentServiceCard";

const ServiceCardWrapper = React.memo(
  ({ service, lastListingRef, isMobile }) => {
    if (service.category === "hotels") {
      return (
        <HotelCard
          service={service}
          lastListingRef={lastListingRef}
          isMobile={isMobile}
        />
      );
    }
    if (service.category === "serviced_apartments") {
      return (
        <ApartmentCard
          service={service}
          lastListingRef={lastListingRef}
          isMobile={isMobile}
        />
      );
    }
    if (service.category === "events") {
      return (
        <EventServiceCard
          service={service}
          lastListingRef={lastListingRef}
          isMobile={isMobile}
        />
      );
    }
    return (
      <GeneralServiceCard
        service={service}
        lastListingRef={lastListingRef}
        isMobile={isMobile}
      />
    );
  },
);

ServiceCardWrapper.displayName = "ServiceCardWrapper";
export default ServiceCardWrapper;
