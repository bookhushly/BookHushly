import React, { useState, useCallback, useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

const OperatingHoursComponent = ({
  value = {},
  onChange,
  error,
  label = "Operating Hours",
  required = false,
}) => {
  const [operatingHours, setOperatingHours] = useState({
    monday: { open: "09:00", close: "17:00", closed: false },
    tuesday: { open: "09:00", close: "17:00", closed: false },
    wednesday: { open: "09:00", close: "17:00", closed: false },
    thursday: { open: "09:00", close: "17:00", closed: false },
    friday: { open: "09:00", close: "17:00", closed: false },
    saturday: { open: "09:00", close: "17:00", closed: false },
    sunday: { open: "09:00", close: "17:00", closed: true },
    ...value,
  });

  const [is24Hours, setIs24Hours] = useState(false);
  const [sameForAllDays, setSameForAllDays] = useState(true);

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  // Move formatTimeDisplay function before generateTimeOptions
  const formatTimeDisplay = useCallback((timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }, []);

  // Generate time options - memoized to prevent recreation
  const timeOptions = useMemo(() => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const displayTime = formatTimeDisplay(timeString);
        times.push({ value: timeString, label: displayTime });
      }
    }
    return times;
  }, [formatTimeDisplay]);

  // Helper function to call onChange with new hours
  const notifyChange = useCallback(
    (newHours) => {
      if (onChange) {
        onChange(newHours);
      }
    },
    [onChange]
  );

  const handleDayChange = useCallback(
    (day, field, value) => {
      setOperatingHours((prev) => {
        const newHours = {
          ...prev,
          [day]: {
            ...prev[day],
            [field]: value,
          },
        };
        // Call onChange with the new hours
        notifyChange(newHours);
        return newHours;
      });
    },
    [notifyChange]
  );

  const handleSameForAllToggle = useCallback(
    (checked) => {
      setSameForAllDays(checked);
      if (checked) {
        // Apply Monday's schedule to all days
        setOperatingHours((prev) => {
          const mondaySchedule = prev.monday;
          const newSchedule = {};
          days.forEach((day) => {
            newSchedule[day.key] = { ...mondaySchedule };
          });
          notifyChange(newSchedule);
          return newSchedule;
        });
      }
    },
    [days, notifyChange]
  );

  const handle24HoursToggle = useCallback(
    (checked) => {
      setIs24Hours(checked);
      if (checked) {
        const newSchedule = {};
        days.forEach((day) => {
          newSchedule[day.key] = {
            open: "00:00",
            close: "23:59",
            closed: false,
          };
        });
        setOperatingHours(newSchedule);
        notifyChange(newSchedule);
      }
    },
    [days, notifyChange]
  );

  const handleMasterScheduleChange = useCallback(
    (field, value) => {
      if (sameForAllDays) {
        setOperatingHours((prev) => {
          const newSchedule = {};
          days.forEach((day) => {
            newSchedule[day.key] = {
              ...prev[day.key],
              [field]: value,
            };
          });
          notifyChange(newSchedule);
          return newSchedule;
        });
      }
    },
    [sameForAllDays, days, notifyChange]
  );

  const formatOperatingHoursDisplay = useCallback(() => {
    const openDays = days.filter((day) => !operatingHours[day.key].closed);
    if (openDays.length === 0) return "Closed";

    if (is24Hours) return "24/7";

    // Group consecutive days with same hours
    const grouped = [];
    let currentGroup = null;

    openDays.forEach((day) => {
      const dayHours = operatingHours[day.key];
      const timeString = `${formatTimeDisplay(dayHours.open)} - ${formatTimeDisplay(dayHours.close)}`;

      if (!currentGroup || currentGroup.hours !== timeString) {
        if (currentGroup) grouped.push(currentGroup);
        currentGroup = {
          days: [day.label],
          hours: timeString,
        };
      } else {
        currentGroup.days.push(day.label);
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
  }, [days, operatingHours, is24Hours, formatTimeDisplay]);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-gray-900">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <p className="text-sm text-gray-500 mt-1">
          Set your business operating hours
        </p>
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-4">
          {/* Quick Options */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="same-all-days"
                checked={sameForAllDays}
                onCheckedChange={handleSameForAllToggle}
              />
              <label htmlFor="same-all-days" className="text-sm">
                Same hours for all days
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="24-hours"
                checked={is24Hours}
                onCheckedChange={handle24HoursToggle}
              />
              <label htmlFor="24-hours" className="text-sm">
                24/7 Operation
              </label>
            </div>
          </div>

          {!is24Hours && (
            <div className="space-y-4">
              {sameForAllDays ? (
                // Single schedule for all days
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm">Opening Time</Label>
                    <Select
                      value={operatingHours.monday.open}
                      onValueChange={(value) =>
                        handleMasterScheduleChange("open", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {timeOptions.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Closing Time</Label>
                    <Select
                      value={operatingHours.monday.close}
                      onValueChange={(value) =>
                        handleMasterScheduleChange("close", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {timeOptions.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="closed-all"
                        checked={operatingHours.monday.closed}
                        onCheckedChange={(checked) =>
                          handleMasterScheduleChange("closed", checked)
                        }
                      />
                      <label htmlFor="closed-all" className="text-sm">
                        Closed
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                // Individual schedule for each day
                <div className="space-y-3">
                  {days.map((day) => (
                    <div
                      key={day.key}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 border border-gray-100 rounded-lg"
                    >
                      <div className="flex items-center">
                        <Label className="text-sm font-medium min-w-[80px]">
                          {day.label}
                        </Label>
                      </div>

                      <div>
                        <Select
                          value={operatingHours[day.key].open}
                          onValueChange={(value) =>
                            handleDayChange(day.key, "open", value)
                          }
                          disabled={operatingHours[day.key].closed}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Open" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {timeOptions.map((time) => (
                              <SelectItem key={time.value} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Select
                          value={operatingHours[day.key].close}
                          onValueChange={(value) =>
                            handleDayChange(day.key, "close", value)
                          }
                          disabled={operatingHours[day.key].closed}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Close" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {timeOptions.map((time) => (
                              <SelectItem key={time.value} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`closed-${day.key}`}
                            checked={operatingHours[day.key].closed}
                            onCheckedChange={(checked) =>
                              handleDayChange(day.key, "closed", checked)
                            }
                          />
                          <label
                            htmlFor={`closed-${day.key}`}
                            className="text-sm"
                          >
                            Closed
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Preview</span>
            </div>
            <p className="text-sm text-blue-800">
              {formatOperatingHoursDisplay()}
            </p>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default OperatingHoursComponent;
