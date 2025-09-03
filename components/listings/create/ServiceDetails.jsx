import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Plus } from "lucide-react";
import FoodMenuEntry from "./FoodMenuEntry";
import { useState } from "react";

export default function ServiceDetails({
  categoryConfig,
  formData,
  setFormData,
  errors,
  selectedCategory,
  meals,
  tempMeal,
  tempMealImage,
  tempMealImagePreview,
  handleTempMealChange,
  handleTempMealImageChange,
  addMeal,
  removeMeal,
  handleSelectChange,
  handleChange,
  handleMultiSelectChange,
  firstInputRef,
}) {
  const [customInputs, setCustomInputs] = useState({});

  const renderCustomProgressBar = (value, isNearLimit) => (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className={`h-full ${isNearLimit ? "bg-red-500" : "bg-blue-500"}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );

  const handleAddCustomOption = (fieldName, value) => {
    if (!value.trim()) return;

    const formattedValue = value.trim().toLowerCase().replace(/\s+/g, "_");
    const newOption = {
      value: `custom_${formattedValue}`,
      label: value.trim(),
    };

    setFormData((prev) => {
      const currentValues = prev[fieldName] || [];
      if (currentValues.includes(newOption.value)) return prev;
      return { ...prev, [fieldName]: [...currentValues, newOption.value] };
    });

    setCustomInputs((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const renderField = (field) => {
    const value =
      formData[field.name] ?? (field.type === "multiselect" ? [] : "");
    const maxLength =
      field.name === "title"
        ? 100
        : field.name === "description"
          ? 500
          : undefined;
    const isNearLimit =
      maxLength && typeof value === "string" && value.length >= maxLength * 0.9;

    return (
      <div className="relative space-y-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Label
                  htmlFor={field.name}
                  className="text-sm font-medium text-gray-700"
                >
                  {field.label}{" "}
                  {field.required && <span className="text-red-500">*</span>}
                </Label>
                {field.description && (
                  <Info className="ml-2 h-4 w-4 text-gray-400" />
                )}
              </div>
            </TooltipTrigger>
            {field.description && (
              <TooltipContent className="max-w-xs">
                <p>{field.description}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        {["text", "url", "time", "date", "number"].includes(field.type) ? (
          <>
            <Input
              id={field.name}
              name={field.name}
              type={field.type === "number" ? "number" : field.type}
              placeholder={field.placeholder}
              value={typeof value === "string" ? value : ""}
              onChange={handleChange}
              required={field.required}
              maxLength={maxLength}
              className={`rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 ${errors[field.name] ? "border-red-500" : ""}`}
              ref={
                field.name === categoryConfig.fields[0]?.name
                  ? firstInputRef
                  : null
              }
              aria-invalid={errors[field.name] ? "true" : "false"}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
            />
            {maxLength && typeof value === "string" && (
              <div className="mt-1">
                {renderCustomProgressBar(
                  (value.length / maxLength) * 100,
                  isNearLimit
                )}
                <p
                  className={`text-sm ${isNearLimit ? "text-red-500" : "text-gray-500"}`}
                >
                  {value.length}/{maxLength}
                </p>
              </div>
            )}
          </>
        ) : field.type === "textarea" ? (
          <>
            <Textarea
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              value={typeof value === "string" ? value : ""}
              onChange={handleChange}
              rows={5}
              required={field.required}
              maxLength={maxLength}
              className={`rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 ${errors[field.name] ? "border-red-500" : ""}`}
              ref={
                field.name === categoryConfig.fields[0]?.name
                  ? firstInputRef
                  : null
              }
              aria-invalid={errors[field.name] ? "true" : "false"}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
            />
            {maxLength && typeof value === "string" && (
              <div className="mt-1">
                {renderCustomProgressBar(
                  (value.length / maxLength) * 100,
                  isNearLimit
                )}
                <p
                  className={`text-sm ${isNearLimit ? "text-red-500" : "text-gray-500"}`}
                >
                  {value.length}/{maxLength}
                </p>
              </div>
            )}
          </>
        ) : field.type === "select" ? (
          <Select
            value={typeof value === "string" ? value : ""}
            onValueChange={(val) => handleSelectChange(field.name, val)}
            required={field.required}
          >
            <SelectTrigger
              className={`rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 ${errors[field.name] ? "border-red-500" : ""}`}
              aria-invalid={errors[field.name] ? "true" : "false"}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
            >
              <SelectValue
                placeholder={`Select ${field.label.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === "multiselect" ? (
          <div className="space-y-3">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <Checkbox
                  id={`${field.name}-${option.value}`}
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleMultiSelectChange(field.name, option.value, checked)
                  }
                  aria-describedby={
                    errors[field.name] ? `${field.name}-error` : undefined
                  }
                  className="rounded-md border-gray-300 focus:ring-blue-500"
                />
                <Label
                  htmlFor={`${field.name}-${option.value}`}
                  className="text-gray-700"
                >
                  {option.label}
                </Label>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add custom option"
                value={customInputs[field.name] || ""}
                onChange={(e) =>
                  setCustomInputs((prev) => ({
                    ...prev,
                    [field.name]: e.target.value,
                  }))
                }
                className="rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="button"
                onClick={() =>
                  handleAddCustomOption(field.name, customInputs[field.name])
                }
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!customInputs[field.name]?.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Selected: {Array.isArray(value) ? value.length : 0}/10
            </p>
          </div>
        ) : null}
        {errors[field.name] && (
          <p
            id={`${field.name}-error`}
            className="text-sm text-red-500 font-medium"
          >
            {errors[field.name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="border-none shadow-lg rounded-2xl bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Service Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {categoryConfig.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              {renderField(field)}
            </div>
          ))}
          {selectedCategory === "food" && (
            <FoodMenuEntry
              meals={meals}
              tempMeal={tempMeal}
              tempMealImage={tempMealImage}
              tempMealImagePreview={tempMealImagePreview}
              handleTempMealChange={handleTempMealChange}
              handleTempMealImageChange={handleTempMealImageChange}
              addMeal={addMeal}
              removeMeal={removeMeal}
              errors={errors}
            />
          )}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Availability
            </Label>
            <Select
              value={formData.availability || "available"}
              onValueChange={(value) =>
                handleSelectChange("availability", value)
              }
            >
              <SelectTrigger className="rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
