"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function CalendarTab({ apartmentId }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          Availability Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Calendar Management Coming Soon
          </h3>
          <p className="text-gray-600">
            Manage your apartment availability, block dates, and set pricing
            rules here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
