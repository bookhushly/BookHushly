import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";

export default function CategorySelection({
  selectedCategory,
  onCategoryChange,
  eventType,
  onEventTypeChange,
  errors,
}) {
  return (
    <Card className="border-none shadow-lg rounded-2xl bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Select Category
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger
            className={`w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 ${
              errors.global ? "border-red-500" : ""
            }`}
          >
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {CATEGORIES.map((c) => (
              <SelectItem
                key={c.value}
                value={c.value}
                className="flex items-center"
              >
                <span className="mr-2">{c.icon}</span> {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.global && (
          <p className="text-sm text-red-500 font-medium">{errors.global}</p>
        )}
        {selectedCategory === "events" && (
          <Select value={eventType} onValueChange={onEventTypeChange}>
            <SelectTrigger
              className={`w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 ${
                errors.eventType ? "border-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="event_center">Event Center</SelectItem>
              <SelectItem value="event_organizer">Event Organizer</SelectItem>
            </SelectContent>
          </Select>
        )}
        {errors.eventType && (
          <p className="text-sm text-red-500 font-medium">{errors.eventType}</p>
        )}
      </CardContent>
    </Card>
  );
}
