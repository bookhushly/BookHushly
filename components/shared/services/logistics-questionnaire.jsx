"use client";

import { useState, useEffect, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { submitLogisticsRequest } from "../../../app/actions/logistics";
import { NIGERIAN_STATES } from "@/lib/constants";
import { AlertCircle } from "lucide-react";

const STORAGE_KEY = "logistics_form_data";

export default function LogisticsQuestionnaire({ onSuccess }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    service_type: "delivery",
    full_name: "",
    phone: "",
    email: "",
    pickup_address: "",
    pickup_landmark: "",
    pickup_lga: "",
    pickup_state: "",
    pickup_date: "",
    pickup_time: "",
    delivery_address: "",
    delivery_landmark: "",
    delivery_lga: "",
    delivery_state: "",
    delivery_date: "",
    delivery_time: "",
    item_description: "",
    item_category: "",
    item_weight: "",
    item_dimensions: "",
    item_value: "",
    quantity: 1,
    requires_packaging: false,
    requires_insurance: false,
    requires_tracking: false,
    fragile_items: false,
    perishable_items: false,
    special_instructions: "",
    vehicle_type: "bike",
  });

  // Load from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (error) {
        console.error("Error loading saved form data:", error);
      }
    }
  }, []);

  // Save to local storage whenever form data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    switch (stepNumber) {
      case 1:
        if (!formData.service_type) {
          newErrors.service_type = "Please select a service type";
        }
        break;

      case 2:
        if (!formData.full_name.trim()) {
          newErrors.full_name = "Full name is required";
        } else if (formData.full_name.trim().length < 2) {
          newErrors.full_name = "Name must be at least 2 characters";
        }

        if (!formData.phone.trim()) {
          newErrors.phone = "Phone number is required";
        } else if (
          !/^0[789][01]\d{8}$/.test(formData.phone.replace(/\s/g, ""))
        ) {
          newErrors.phone = "Please enter a valid Nigerian phone number";
        }

        if (!formData.email.trim()) {
          newErrors.email = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Please enter a valid email address";
        }
        break;

      case 3:
        if (!formData.pickup_address.trim()) {
          newErrors.pickup_address = "Pickup address is required";
        } else if (formData.pickup_address.trim().length < 10) {
          newErrors.pickup_address = "Please provide a more detailed address";
        }

        if (!formData.pickup_state) {
          newErrors.pickup_state = "Please select a state";
        }

        if (!formData.pickup_date) {
          newErrors.pickup_date = "Pickup date is required";
        } else {
          const selectedDate = new Date(formData.pickup_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            newErrors.pickup_date = "Pickup date cannot be in the past";
          }
        }
        break;

      case 4:
        if (!formData.delivery_address.trim()) {
          newErrors.delivery_address = "Delivery address is required";
        } else if (formData.delivery_address.trim().length < 10) {
          newErrors.delivery_address = "Please provide a more detailed address";
        }

        if (!formData.delivery_state) {
          newErrors.delivery_state = "Please select a state";
        }

        if (formData.delivery_date) {
          const deliveryDate = new Date(formData.delivery_date);
          const pickupDate = new Date(formData.pickup_date);
          if (deliveryDate < pickupDate) {
            newErrors.delivery_date =
              "Delivery date cannot be before pickup date";
          }
        }
        break;

      case 5:
        if (!formData.item_description.trim()) {
          newErrors.item_description = "Item description is required";
        } else if (formData.item_description.trim().length < 10) {
          newErrors.item_description =
            "Please provide a more detailed description";
        }

        if (!formData.vehicle_type) {
          newErrors.vehicle_type = "Please select a vehicle type";
        }

        if (formData.quantity < 1) {
          newErrors.quantity = "Quantity must be at least 1";
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous errors
    setErrors({});

    // Validate final step
    if (!validateStep(5)) {
      return;
    }

    // Call server action directly using useTransition
    startTransition(async () => {
      try {
        const result = await submitLogisticsRequest(formData);

        if (result.success) {
          // Clear local storage on successful submission
          localStorage.removeItem(STORAGE_KEY);
          // Call parent success handler
          onSuccess?.();
        } else {
          // Handle server-side errors
          setErrors({
            submit:
              result.error || "Failed to submit request. Please try again.",
          });
        }
      } catch (error) {
        // Handle unexpected errors
        console.error("Submission error:", error);
        setErrors({
          submit: "An unexpected error occurred. Please try again.",
        });
      }
    });
  };

  const ErrorMessage = ({ message }) => {
    if (!message) return null;
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
        <AlertCircle className="w-4 h-4" />
        <span>{message}</span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  s <= step
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {s}
              </div>
              {s < 5 && (
                <div
                  className={`flex-1 h-1 mx-2 ${s < step ? "bg-purple-600" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600 px-2">
          <span>Service</span>
          <span>Contact</span>
          <span>Pickup</span>
          <span>Delivery</span>
          <span>Details</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          {/* Step 1: Service Type */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                Select Logistics Service
              </h2>

              <div>
                <Label>What type of logistics service do you need?</Label>
                <RadioGroup
                  value={formData.service_type}
                  onValueChange={(v) => updateField("service_type", v)}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <Label htmlFor="delivery" className="cursor-pointer flex-1">
                      <div className="font-medium">Delivery Service</div>
                      <div className="text-sm text-gray-600">
                        Same-day or scheduled deliveries within Nigeria
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="moving" id="moving" />
                    <Label htmlFor="moving" className="cursor-pointer flex-1">
                      <div className="font-medium">Moving Service</div>
                      <div className="text-sm text-gray-600">
                        Home or office relocation services
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="cargo" id="cargo" />
                    <Label htmlFor="cargo" className="cursor-pointer flex-1">
                      <div className="font-medium">Cargo/Freight</div>
                      <div className="text-sm text-gray-600">
                        Large shipments and bulk cargo
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="courier" id="courier" />
                    <Label htmlFor="courier" className="cursor-pointer flex-1">
                      <div className="font-medium">Courier Service</div>
                      <div className="text-sm text-gray-600">
                        Express document and small package delivery
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                <ErrorMessage message={errors.service_type} />
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Contact Information</h2>

              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  className={errors.full_name ? "border-red-500" : ""}
                />
                <ErrorMessage message={errors.full_name} />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="080XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={errors.phone ? "border-red-500" : ""}
                />
                <ErrorMessage message={errors.phone} />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                <ErrorMessage message={errors.email} />
              </div>
            </div>
          )}

          {/* Step 3: Pickup Details */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Pickup Details</h2>

              <div>
                <Label htmlFor="pickup_address">Pickup Address *</Label>
                <Textarea
                  id="pickup_address"
                  placeholder="Enter full pickup address"
                  value={formData.pickup_address}
                  onChange={(e) =>
                    updateField("pickup_address", e.target.value)
                  }
                  className={errors.pickup_address ? "border-red-500" : ""}
                />
                <ErrorMessage message={errors.pickup_address} />
              </div>

              <div>
                <Label htmlFor="pickup_landmark">Nearest Landmark</Label>
                <Input
                  id="pickup_landmark"
                  placeholder="e.g., First Bank, Shoprite"
                  value={formData.pickup_landmark}
                  onChange={(e) =>
                    updateField("pickup_landmark", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickup_lga">Local Government Area</Label>
                  <Input
                    id="pickup_lga"
                    value={formData.pickup_lga}
                    onChange={(e) => updateField("pickup_lga", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="pickup_state">State *</Label>
                  <Select
                    value={formData.pickup_state}
                    onValueChange={(v) => updateField("pickup_state", v)}
                  >
                    <SelectTrigger
                      className={errors.pickup_state ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorMessage message={errors.pickup_state} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickup_date">Pickup Date *</Label>
                  <Input
                    id="pickup_date"
                    type="date"
                    value={formData.pickup_date}
                    onChange={(e) => updateField("pickup_date", e.target.value)}
                    className={errors.pickup_date ? "border-red-500" : ""}
                  />
                  <ErrorMessage message={errors.pickup_date} />
                </div>

                <div>
                  <Label htmlFor="pickup_time">Preferred Time</Label>
                  <Input
                    id="pickup_time"
                    type="time"
                    value={formData.pickup_time}
                    onChange={(e) => updateField("pickup_time", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Delivery Details */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Delivery Details</h2>

              <div>
                <Label htmlFor="delivery_address">Delivery Address *</Label>
                <Textarea
                  id="delivery_address"
                  placeholder="Enter full delivery address"
                  value={formData.delivery_address}
                  onChange={(e) =>
                    updateField("delivery_address", e.target.value)
                  }
                  className={errors.delivery_address ? "border-red-500" : ""}
                />
                <ErrorMessage message={errors.delivery_address} />
              </div>

              <div>
                <Label htmlFor="delivery_landmark">Nearest Landmark</Label>
                <Input
                  id="delivery_landmark"
                  placeholder="e.g., Zenith Bank, Chicken Republic"
                  value={formData.delivery_landmark}
                  onChange={(e) =>
                    updateField("delivery_landmark", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delivery_lga">Local Government Area</Label>
                  <Input
                    id="delivery_lga"
                    value={formData.delivery_lga}
                    onChange={(e) =>
                      updateField("delivery_lga", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="delivery_state">State *</Label>
                  <Select
                    value={formData.delivery_state}
                    onValueChange={(v) => updateField("delivery_state", v)}
                  >
                    <SelectTrigger
                      className={errors.delivery_state ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorMessage message={errors.delivery_state} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delivery_date">Expected Delivery Date</Label>
                  <Input
                    id="delivery_date"
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) =>
                      updateField("delivery_date", e.target.value)
                    }
                    className={errors.delivery_date ? "border-red-500" : ""}
                  />
                  <ErrorMessage message={errors.delivery_date} />
                </div>

                <div>
                  <Label htmlFor="delivery_time">Preferred Time</Label>
                  <Input
                    id="delivery_time"
                    type="time"
                    value={formData.delivery_time}
                    onChange={(e) =>
                      updateField("delivery_time", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Item Details */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                Item Details & Requirements
              </h2>

              <div>
                <Label htmlFor="item_description">Item Description *</Label>
                <Textarea
                  id="item_description"
                  placeholder="Describe what you're sending"
                  value={formData.item_description}
                  onChange={(e) =>
                    updateField("item_description", e.target.value)
                  }
                  className={errors.item_description ? "border-red-500" : ""}
                />
                <ErrorMessage message={errors.item_description} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item_category">Item Category</Label>
                  <Select
                    value={formData.item_category}
                    onValueChange={(v) => updateField("item_category", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="documents">Documents</SelectItem>
                      <SelectItem value="food">Food Items</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="appliances">Appliances</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="item_weight">Estimated Weight</Label>
                  <Select
                    value={formData.item_weight}
                    onValueChange={(v) => updateField("item_weight", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select weight" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-5kg">0-5 kg</SelectItem>
                      <SelectItem value="5-20kg">5-20 kg</SelectItem>
                      <SelectItem value="20-50kg">20-50 kg</SelectItem>
                      <SelectItem value="50-100kg">50-100 kg</SelectItem>
                      <SelectItem value="100kg+">100+ kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item_dimensions">
                    Dimensions (L x W x H)
                  </Label>
                  <Input
                    id="item_dimensions"
                    placeholder="e.g., 50cm x 30cm x 20cm"
                    value={formData.item_dimensions}
                    onChange={(e) =>
                      updateField("item_dimensions", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="item_value">Item Value (₦)</Label>
                  <Input
                    id="item_value"
                    type="number"
                    placeholder="For insurance purposes"
                    value={formData.item_value}
                    onChange={(e) => updateField("item_value", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="quantity">Number of Items</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => updateField("quantity", e.target.value)}
                  className={errors.quantity ? "border-red-500" : ""}
                />
                <ErrorMessage message={errors.quantity} />
              </div>

              <div>
                <Label htmlFor="vehicle_type">Preferred Vehicle Type *</Label>
                <Select
                  value={formData.vehicle_type}
                  onValueChange={(v) => updateField("vehicle_type", v)}
                >
                  <SelectTrigger
                    className={errors.vehicle_type ? "border-red-500" : ""}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bike">
                      Motorcycle (Small items)
                    </SelectItem>
                    <SelectItem value="car">Car (Medium items)</SelectItem>
                    <SelectItem value="van">Van (Large items)</SelectItem>
                    <SelectItem value="truck">
                      Truck (Very large/Heavy)
                    </SelectItem>
                    <SelectItem value="trailer">
                      Trailer (Bulk cargo)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <ErrorMessage message={errors.vehicle_type} />
              </div>

              <div className="space-y-3">
                <Label>Additional Requirements</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requires_packaging"
                    checked={formData.requires_packaging}
                    onCheckedChange={(checked) =>
                      updateField("requires_packaging", checked)
                    }
                  />
                  <Label
                    htmlFor="requires_packaging"
                    className="cursor-pointer"
                  >
                    Packaging required
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requires_insurance"
                    checked={formData.requires_insurance}
                    onCheckedChange={(checked) =>
                      updateField("requires_insurance", checked)
                    }
                  />
                  <Label
                    htmlFor="requires_insurance"
                    className="cursor-pointer"
                  >
                    Insurance required
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fragile_items"
                    checked={formData.fragile_items}
                    onCheckedChange={(checked) =>
                      updateField("fragile_items", checked)
                    }
                  />
                  <Label htmlFor="fragile_items" className="cursor-pointer">
                    Fragile items (Handle with care)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perishable_items"
                    checked={formData.perishable_items}
                    onCheckedChange={(checked) =>
                      updateField("perishable_items", checked)
                    }
                  />
                  <Label htmlFor="perishable_items" className="cursor-pointer">
                    Perishable items
                  </Label>
                </div>
              </div>

              <div>
                <Label htmlFor="special_instructions">
                  Special Instructions
                </Label>
                <Textarea
                  id="special_instructions"
                  placeholder="Any special handling instructions or notes"
                  value={formData.special_instructions}
                  onChange={(e) =>
                    updateField("special_instructions", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isPending}
              >
                Previous
              </Button>
            )}
            {step < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="ml-auto bg-purple-600 hover:bg-purple-700"
                disabled={isPending}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isPending}
                className="ml-auto bg-purple-600 hover:bg-purple-700"
              >
                {isPending ? "Submitting..." : "Submit Request"}
              </Button>
            )}
          </div>

          {/* Error Messages */}
          {errors.submit && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">
                    Submission Failed
                  </h4>
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Draft Saved Indicator */}
          <div className="mt-4 text-center text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
              </svg>
              Your progress is automatically saved
            </span>
          </div>
        </Card>
      </form>
    </div>
  );
}
