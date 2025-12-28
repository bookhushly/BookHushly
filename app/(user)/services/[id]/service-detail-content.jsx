import React from "react";
import EventCenterDetail from "@/components/shared/listings/details/EventCenterDetaill";
import EventOrganizerDetail from "@/components/shared/listings/details/EventOrganizer";
import HotelServiceDetail from "@/components/shared/listings/details/HotelServiceDetail";
import ApartmentServiceDetail from "@/components/shared/listings/details/ApartmentServiceDetail";
import CarRentalServiceDetail from "@/components/shared/listings/details/CarRentalServiceDetail";
import FoodServiceDetail from "@/components/shared/listings/details/FoodServiceDetail";
import SecurityServiceDetail from "@/components/shared/listings/details/SecurityServiceDetail";
import LogisticsServiceDetail from "@/components/shared/listings/details/LogisiticsServiceDetail";

import { extractCategoryData } from "@/lib/category-forms";

const ServiceDetailWrapper = ({ service }) => {
  const categoryData = extractCategoryData(service);

  // Select the appropriate detail component based on category
  const renderCategorySpecificDetail = () => {
    switch (service.category) {
      case "events":
        // Further differentiate between event centers and organizers
        if (service.event_type === "event_center") {
          return (
            <EventCenterDetail listing={service} categoryData={categoryData} />
          );
        } else {
          return (
            <EventOrganizerDetail
              service={service}
              categoryData={categoryData}
            />
          );
        }

      case "hotels":
        return (
          <HotelServiceDetail service={service} categoryData={categoryData} />
        );

      case "serviced_apartments":
        return (
          <ApartmentServiceDetail
            service={service}
            categoryData={categoryData}
          />
        );

      case "food":
        return (
          <FoodServiceDetail service={service} categoryData={categoryData} />
        );

      case "logistics":
        return (
          <LogisticsServiceDetail
            service={service}
            categoryData={categoryData}
          />
        );

      case "security":
        return (
          <SecurityServiceDetail
            service={service}
            categoryData={categoryData}
          />
        );

      case "car_rentals":
        return (
          <CarRentalServiceDetail
            service={service}
            categoryData={categoryData}
          />
        );

      default:
        // Fallback to hotel service detail for unknown categories
        return (
          <HotelServiceDetail service={service} categoryData={categoryData} />
        );
    }
  };

  return <div className="space-y-6">{renderCategorySpecificDetail()}</div>;
};

export default ServiceDetailWrapper;
