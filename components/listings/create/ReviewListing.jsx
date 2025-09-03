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
            <strong className="font-semibold">
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}:
            </strong>{" "}
            {Array.isArray(val) ? val.join(", ") : val || "Not set"}
          </p>
        ))}
        {selectedCategory === "food" && meals.length > 0 && (
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
          <strong className="font-semibold">Images:</strong> {images.length}{" "}
          uploaded
        </p>
      </CardContent>
    </Card>
  );
}
