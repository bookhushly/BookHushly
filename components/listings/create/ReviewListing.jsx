import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CATEGORIES } from "@/lib/constants";

export default function ReviewListing({
  formData,
  selectedCategory,
  eventType,
  images,
  meals,
}) {
  // Helper function to format operating hours for display
  const formatOperatingHours = (hoursData) => {
    if (!hoursData || typeof hoursData !== "object") {
      return "Not set";
    }

    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const openDays = days.filter(
      (day) => hoursData[day] && !hoursData[day].closed
    );

    if (openDays.length === 0) return "Closed";

    // Check if it's 24/7
    const is24_7 = openDays.every(
      (day) =>
        hoursData[day] &&
        !hoursData[day].closed &&
        hoursData[day].open === "00:00" &&
        hoursData[day].close === "23:59"
    );

    if (is24_7) return "24/7";

    // Group consecutive days with same hours
    const grouped = [];
    let currentGroup = null;

    openDays.forEach((day) => {
      const dayHours = hoursData[day];
      const timeString = `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`;
      const dayIndex = days.indexOf(day);

      if (!currentGroup || currentGroup.hours !== timeString) {
        if (currentGroup) grouped.push(currentGroup);
        currentGroup = {
          days: [dayLabels[dayIndex]],
          hours: timeString,
        };
      } else {
        currentGroup.days.push(dayLabels[dayIndex]);
      }
    });

    if (currentGroup) grouped.push(currentGroup);

    return grouped
      .map((group) => {
        const dayRange =
          group.days.length > 1
            ? `${group.days[0]} - ${group.days[group.days.length - 1]}`
            : group.days[0];
        return `${dayRange}: ${group.hours}`;
      })
      .join(", ");
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Helper function to format field values for display
  const formatFieldValue = (key, val) => {
    if (val === null || val === undefined || val === "") {
      return "Not set";
    }

    // Handle operating hours object
    if (key === "operating_hours" && typeof val === "object") {
      return formatOperatingHours(val);
    }

    // Handle arrays
    if (Array.isArray(val)) {
      if (val.length === 0) return "Not set";
      return val.join(", ");
    }

    // Handle objects (convert to string representation)
    if (typeof val === "object") {
      return JSON.stringify(val);
    }

    // Handle primitive values
    return String(val);
  };

  // Helper function to format field names
  const formatFieldName = (key) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card className="border-none shadow-lg rounded-2xl bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Review Your Listing
        </CardTitle>
        <CardDescription className="text-gray-600">
          Ensure all details are correct before submitting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-gray-900">
          <strong className="font-semibold">Category:</strong>{" "}
          {CATEGORIES.find((c) => c.value === selectedCategory)?.label ||
            selectedCategory}
        </p>

        {selectedCategory === "events" && eventType && (
          <p className="text-gray-900">
            <strong className="font-semibold">Event Type:</strong>{" "}
            {eventType === "event_center" ? "Event Center" : "Event Organizer"}
          </p>
        )}

        {Object.entries(formData).map(([key, val]) => (
          <p key={key} className="text-gray-900">
            <strong className="font-semibold">{formatFieldName(key)}:</strong>{" "}
            {formatFieldValue(key, val)}
          </p>
        ))}

        {selectedCategory === "food" && meals && meals.length > 0 && (
          <div>
            <strong className="font-semibold text-gray-900">Meals:</strong>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              {meals.map((meal, index) => (
                <li key={index} className="text-gray-900">
                  {meal.name} - ₦{meal.price} - {meal.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-gray-900">
          <strong className="font-semibold">Images:</strong>{" "}
          {images?.length || 0} uploaded
        </p>
      </CardContent>
    </Card>
  );
}
