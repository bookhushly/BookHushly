import React, { useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFeatureIcon } from "@/lib/featureIcons";
import { Trash2, Plus, Upload, Calendar, Clock } from "lucide-react";
import OperatingHoursComponent from "./OperatingHours";

// Fixed AmenityMultiSelect Component
const AmenityMultiSelect = React.memo(
  ({
    fieldName,
    options = [],
    selectedValues = [],
    onSelectionChange,
    label,
    description,
  }) => {
    // Memoize the selected values set for faster lookup
    const selectedValuesSet = useMemo(
      () => new Set(selectedValues),
      [selectedValues]
    );

    // Memoize the selected options for the preview
    const selectedOptions = useMemo(() => {
      return selectedValues
        .map((value) => options.find((opt) => opt.value === value))
        .filter(Boolean);
    }, [selectedValues, options]);

    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-900">{label}</Label>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
          {options.map((option) => {
            const isChecked = selectedValuesSet.has(option.value);
            const checkboxId = `${fieldName}-${option.value}`;

            return (
              <div key={option.value} className="flex items-center space-x-3">
                <Checkbox
                  id={checkboxId}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    if (onSelectionChange) {
                      onSelectionChange(fieldName, option.value, checked);
                    }
                  }}
                />
                <label
                  htmlFor={checkboxId}
                  className="flex items-center text-sm text-gray-700 cursor-pointer flex-1"
                >
                  {getFeatureIcon(option.icon || option.value, option.value)}
                  <span className="ml-2">{option.label}</span>
                </label>
              </div>
            );
          })}
        </div>

        {/* Selected amenities preview */}
        {selectedOptions.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-900 mb-2">
              Selected ({selectedOptions.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="text-xs"
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

AmenityMultiSelect.displayName = "AmenityMultiSelect";

// MultiSelect Component for regular options
const MultiSelect = React.memo(
  ({
    fieldName,
    options = [],
    selectedValues = [],
    onSelectionChange,
    label,
    required = false,
    error,
  }) => {
    const selectedValuesSet = useMemo(
      () => new Set(selectedValues),
      [selectedValues]
    );

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
          {options.map((option) => {
            const isChecked = selectedValuesSet.has(option.value);
            const checkboxId = `${fieldName}-${option.value}`;

            return (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={checkboxId}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter((v) => v !== option.value);
                    onSelectionChange(fieldName, newValues);
                  }}
                />
                <label
                  htmlFor={checkboxId}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            );
          })}
        </div>

        {selectedValues.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedValues.map((value) => {
              const option = options.find((opt) => opt.value === value);
              return option ? (
                <Badge key={value} variant="outline" className="text-xs">
                  {option.label}
                </Badge>
              ) : null;
            })}
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

MultiSelect.displayName = "MultiSelect";

// Main ServiceDetails Component
const ServiceDetails = ({
  categoryConfig,
  formData,
  setFormData,
  errors,
  selectedCategory,
  eventType,
  meals,
  setMeals,
  tempMeal,
  setTempMeal,
  tempMealImage,
  setTempMealImage,
  tempMealImagePreview,
  setTempMealImagePreview,
  handleTempMealChange,
  handleTempMealImageChange,
  addMeal,
  removeMeal,
  useMultiplePackages,
  setUseMultiplePackages,
  tickets,
  setTickets,
  tempTicket,
  setTempTicket,
  handleTempTicketChange,
  addTicket,
  removeTicket,
  firstInputRef,
}) => {
  // Stable handlers using useCallback with proper dependencies
  const handleAmenityChange = useCallback(
    (fieldName, value, checked) => {
      setFormData((prev) => {
        const currentValues = prev[fieldName] || [];
        const newValues = checked
          ? [...currentValues, value]
          : currentValues.filter((v) => v !== value);

        return {
          ...prev,
          [fieldName]: newValues,
        };
      });
    },
    [setFormData]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    [setFormData]
  );

  const handleSelectChange = useCallback(
    (name, value) => {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [setFormData]
  );

  const handleMultiSelectChange = useCallback(
    (name, values) => {
      setFormData((prev) => ({
        ...prev,
        [name]: values,
      }));
    },
    [setFormData]
  );

  const handleFileChange = useCallback(
    (e) => {
      const { name, files } = e.target;
      if (files && files[0]) {
        setFormData((prev) => ({
          ...prev,
          [name]: files[0],
        }));
      }
    },
    [setFormData]
  );

  const renderField = useCallback(
    (field, index) => {
      if (!field || !field.name) return null;

      const value =
        formData[field.name] ||
        (field.type === "multiselect" || field.type === "amenity_multiselect"
          ? []
          : "");
      const error = errors[field.name];

      switch (field.type) {
        case "text":
          return (
            <div key={field.name} className="space-y-2">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium text-gray-900"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={field.placeholder}
                className={error ? "border-red-500" : ""}
                ref={index === 0 ? firstInputRef : null}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          );

        case "textarea":
          return (
            <div key={field.name} className="space-y-2">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium text-gray-900"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={value}
                onChange={handleChange}
                placeholder={field.placeholder}
                className={`min-h-24 ${error ? "border-red-500" : ""}`}
                rows={4}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          );

        case "number":
          return (
            <div key={field.name} className="space-y-2">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium text-gray-900"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                value={value}
                onChange={handleChange}
                placeholder={field.placeholder}
                className={error ? "border-red-500" : ""}
                step="0.01"
                min="0"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          );

        case "date":
          return (
            <div key={field.name} className="space-y-2">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium text-gray-900"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <div className="relative">
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={value}
                  onChange={handleChange}
                  className={error ? "border-red-500" : ""}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          );

        case "time":
          return (
            <div key={field.name} className="space-y-2">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium text-gray-900"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <div className="relative">
                <Input
                  id={field.name}
                  name={field.name}
                  type="time"
                  value={value}
                  onChange={handleChange}
                  className={error ? "border-red-500" : ""}
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          );

        case "file":
          return (
            <div key={field.name} className="space-y-2">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium text-gray-900"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <div className="relative">
                <Input
                  id={field.name}
                  name={field.name}
                  type="file"
                  onChange={handleFileChange}
                  accept={field.accept || "*/*"}
                  className={`${error ? "border-red-500" : ""}`}
                />
                <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {field.description && (
                <p className="text-sm text-gray-500">{field.description}</p>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          );

        case "select":
          return (
            <div key={field.name} className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Select
                value={value}
                onValueChange={(selectedValue) =>
                  handleSelectChange(field.name, selectedValue)
                }
              >
                <SelectTrigger className={error ? "border-red-500" : ""}>
                  <SelectValue
                    placeholder={`Select ${field.label.toLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          );

        case "multiselect":
          return (
            <MultiSelect
              key={field.name}
              fieldName={field.name}
              options={field.options || []}
              selectedValues={value}
              onSelectionChange={handleMultiSelectChange}
              label={field.label}
              required={field.required}
              error={error}
            />
          );

        case "amenity_multiselect":
          return (
            <div key={field.name}>
              <AmenityMultiSelect
                fieldName={field.name}
                options={field.options || []}
                selectedValues={value}
                onSelectionChange={handleAmenityChange}
                label={field.label}
                description={field.description}
              />
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </div>
          );

        case "operating_hours":
          return (
            <div key={field.name}>
              <OperatingHoursComponent
                value={value}
                onChange={(hours) => handleSelectChange(field.name, hours)}
                label={field.label}
                required={field.required}
                error={error}
              />
            </div>
          );

        case "checkbox":
          return (
            <div key={field.name} className="flex items-center space-x-2">
              <Checkbox
                id={field.name}
                name={field.name}
                checked={value}
                onCheckedChange={(checked) =>
                  handleSelectChange(field.name, checked)
                }
              />
              <Label htmlFor={field.name} className="text-sm text-gray-900">
                {field.label}
              </Label>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          );

        default:
          return null;
      }
    },
    [
      formData,
      errors,
      handleChange,
      handleSelectChange,
      handleMultiSelectChange,
      handleFileChange,
      handleAmenityChange,
      firstInputRef,
    ]
  );

  // Render meals section for food category
  const renderMealsSection = () => {
    if (selectedCategory !== "food") return null;

    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Menu Items</CardTitle>
          <p className="text-sm text-gray-600">
            Add your menu items with descriptions and prices
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing meals */}
          {meals?.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Current Menu Items:</h4>
              {meals.map((meal, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {meal.image_url && (
                      <img
                        src={meal.image_url}
                        alt={meal.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{meal.name}</p>
                      <p className="text-sm text-gray-600">
                        {meal.description}
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        ₦{meal.price}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeMeal(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add new meal form */}
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-medium text-gray-900">Add Menu Item:</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meal-name" className="text-sm font-medium">
                  Item Name
                </Label>
                <Input
                  id="meal-name"
                  name="name"
                  value={tempMeal.name}
                  onChange={handleTempMealChange}
                  placeholder="e.g., Jollof Rice"
                />
              </div>

              <div>
                <Label htmlFor="meal-price" className="text-sm font-medium">
                  Price (₦)
                </Label>
                <Input
                  id="meal-price"
                  name="price"
                  type="number"
                  value={tempMeal.price}
                  onChange={handleTempMealChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="meal-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="meal-description"
                name="description"
                value={tempMeal.description}
                onChange={handleTempMealChange}
                placeholder="Describe the dish..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="meal-image" className="text-sm font-medium">
                Image (Optional)
              </Label>
              <Input
                id="meal-image"
                type="file"
                accept="image/*"
                onChange={handleTempMealImageChange}
              />
              {tempMealImagePreview && (
                <img
                  src={tempMealImagePreview}
                  alt="Preview"
                  className="mt-2 w-20 h-20 object-cover rounded"
                />
              )}
            </div>

            <Button
              type="button"
              onClick={addMeal}
              disabled={!tempMeal.name || !tempMeal.price}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render tickets section for event organizers
  const renderTicketsSection = () => {
    if (selectedCategory !== "events" || eventType !== "event_organizer")
      return null;

    // Calculate total tickets for display
    const calculatedTotalTickets = tickets.reduce(
      (sum, t) => sum + parseInt(t.quantity || 0),
      0
    );

    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Ticket Packages
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure different ticket types and pricing
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="multiple-packages"
              checked={useMultiplePackages}
              onCheckedChange={setUseMultiplePackages}
            />
            <Label htmlFor="multiple-packages" className="text-sm">
              Ticket Packages
            </Label>
          </div>

          {useMultiplePackages && (
            <>
              {/* Existing tickets */}
              {tickets?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">
                    Current Packages:
                  </h4>
                  {tickets.map((ticket, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {ticket.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {ticket.description}
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          ₦{ticket.price} • {ticket.quantity} available
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTicket(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new ticket form */}
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-medium text-gray-900">
                  Add Ticket Package:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="ticket-name"
                      className="text-sm font-medium"
                    >
                      Package Name
                    </Label>
                    <Input
                      id="ticket-name"
                      name="name"
                      value={tempTicket.name}
                      onChange={handleTempTicketChange}
                      placeholder="e.g., VIP, Regular"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="ticket-price"
                      className="text-sm font-medium"
                    >
                      Price (₦)
                    </Label>
                    <Input
                      id="ticket-price"
                      name="price"
                      type="number"
                      value={tempTicket.price}
                      onChange={handleTempTicketChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="ticket-quantity"
                      className="text-sm font-medium"
                    >
                      Quantity
                    </Label>
                    <Input
                      id="ticket-quantity"
                      name="quantity"
                      type="number"
                      value={tempTicket.quantity}
                      onChange={handleTempTicketChange}
                      placeholder="100"
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="ticket-description"
                    className="text-sm font-medium"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="ticket-description"
                    name="description"
                    value={tempTicket.description}
                    onChange={handleTempTicketChange}
                    placeholder="What's included in this package..."
                    rows={2}
                  />
                </div>
                <Button
                  type="button"
                  onClick={addTicket}
                  disabled={
                    !tempTicket.name ||
                    !tempTicket.price ||
                    !tempTicket.quantity
                  }
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ticket Package
                </Button>
              </div>
            </>
          )}

          {/* Display total tickets */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Total Tickets
            </Label>
            <Input
              value={calculatedTotalTickets}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500">
              Total number of tickets available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!categoryConfig) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Service Details
          </CardTitle>
          <p className="text-gray-600">Loading service configuration...</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          {categoryConfig.title}
        </CardTitle>
        <p className="text-gray-600">{categoryConfig.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {categoryConfig.fields?.map((field, index) =>
          renderField(field, index)
        )}

        {/* Category-specific sections */}
        {renderMealsSection()}
        {renderTicketsSection()}
      </CardContent>
    </Card>
  );
};

export default ServiceDetails;
