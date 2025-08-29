"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { TermsAndConditionsModal } from "@/components/kyc/Terms&ConditionModal";
import { useAuthStore } from "@/lib/store";
import {
  getVendorProfile,
  createVendorProfile,
  updateVendorProfile,
} from "@/lib/database";
import {
  Upload,
  FileText,
  Building,
  Phone,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function KYCPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [verificationConsent, setVerificationConsent] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    business_description: "",
    business_address: "",
    phone_number: "",
    business_registration_number: "",
    nin: "",
    nin_first_name: "",
    nin_last_name: "",
    drivers_license: "",
    tax_identification_number: "",
    bank_account_name: "",
    bank_account_number: "",
    bank_name: "",
    business_category: "",
    years_in_operation: "",
    website_url: "",
  });
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const businessCategories = [
    { value: "hotels", label: "Hotels" },
    { value: "food_restaurants", label: "Food & Restaurants" },
    { value: "serviced_apartments", label: "Serviced Apartments" },
    { value: "events", label: "Events" },
    { value: "car_rentals", label: "Car Rentals" },
    { value: "logistics", label: "Logistics" },
    { value: "security", label: "Security" },
  ];

  // Custom Progress Bar Component
  const CustomProgressBar = ({ currentStep, totalSteps }) => {
    const progressPercentage = (currentStep / totalSteps) * 100;
    const steps = [
      "Business Information",
      "Contact Information",
      "Legal Information",
      "Banking Information",
      "Review & Consent",
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 text-center">
              <div
                className={cn(
                  "w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                  currentStep >= index + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                )}
              >
                {index + 1}
              </div>
              <p className="text-xs text-gray-500 mt-2">{step}</p>
            </div>
          ))}
        </div>
        <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-blue-600 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    );
  };

  useEffect(() => {
    if (user) {
      console.log("✅ User is logged in:", user);
    } else {
      console.log("🚫 User is NOT logged in.");
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!user) return;

      try {
        setPageLoading(true);
        const { data: profile, error } = await getVendorProfile(user.id);

        if (error && error.code !== "PGRST116") {
          console.error("Profile load error:", error);
          toast.error("Failed to load profile", { description: error.message });
        }

        if (profile) {
          setExistingProfile(profile);
          setFormData({
            business_name: profile.business_name || "",
            business_description: profile.business_description || "",
            business_address: profile.business_address || "",
            phone_number: profile.phone_number || "",
            business_registration_number:
              profile.business_registration_number || "",
            nin: profile.nin || "",
            nin_first_name: profile.nin_first_name || "",
            nin_last_name: profile.nin_last_name || "",
            drivers_license: profile.drivers_license || "",
            tax_identification_number: profile.tax_identification_number || "",
            bank_account_name: profile.bank_account_name || "",
            bank_account_number: profile.bank_account_number || "",
            bank_name: profile.bank_name || "",
            business_category: profile.business_category || "",
            years_in_operation: profile.years_in_operation || "",
            website_url: profile.website_url || "",
          });
          if (profile.approved) {
            setTermsAccepted(true);
            setVerificationConsent(true);
          }
        }
      } catch (error) {
        console.error("Load profile error:", error);
        toast.error("Failed to load profile", { description: error.message });
      } finally {
        setPageLoading(false);
      }
    };

    loadExistingProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validateStep = () => {
    const requiredFields = {
      1: ["business_name", "business_description", "business_category"],
      2: ["business_address", "phone_number"],
      3: [],
      4: [],
      5: [],
    };

    for (const field of requiredFields[currentStep]) {
      if (!formData[field].trim()) {
        setError(
          `${field.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())} is required`
        );
        return false;
      }
    }

    if (currentStep === 3) {
      const requiresCAC = [
        "hotels",
        "food_restaurants",
        "serviced_apartments",
        "events",
        "security",
      ].includes(formData.business_category);
      const requiresDL = ["car_rentals", "logistics"].includes(
        formData.business_category
      );

      if (
        requiresCAC &&
        !formData.business_registration_number &&
        !formData.nin
      ) {
        setError("Either CAC Registration Number or NIN is required");
        return false;
      }

      if (
        formData.nin &&
        (!formData.nin_first_name.trim() || !formData.nin_last_name.trim())
      ) {
        setError("First Name and Last Name are required for NIN verification");
        return false;
      }

      if (formData.nin && !/^\d{11}$/.test(formData.nin)) {
        setError("NIN must be an 11-digit number");
        return false;
      }

      if (requiresDL && !formData.drivers_license) {
        setError("Driver's License is required for Car Rentals and Logistics");
        return false;
      }
    }

    if (currentStep === 5) {
      if (
        (formData.business_registration_number ||
          formData.nin ||
          formData.drivers_license) &&
        !verificationConsent
      ) {
        setError("You must consent to identity verification");
        return false;
      }

      if (!termsAccepted) {
        setError("You must accept the Terms and Conditions to proceed");
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      setError("");
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) return;

    setLoading(true);
    setError("");

    try {
      let verificationResults = {};

      if (formData.business_registration_number) {
        const response = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "cac",
            value: formData.business_registration_number,
          }),
        });
        const { valid, data, error } = await response.json();
        if (!valid) {
          setError(error || "CAC verification failed");
          toast.error("CAC verification failed", { description: error });
          setLoading(false);
          return;
        }
        verificationResults.cac_verified = true;
        verificationResults.cac_data = data;
      }

      if (formData.nin) {
        const response = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "nin",
            value: formData.nin,
            firstname: formData.nin_first_name,
            lastname: formData.nin_last_name,
          }),
        });
        const { valid, data, error } = await response.json();
        if (!valid) {
          setError(error || "NIN verification failed");
          toast.error("NIN verification failed", { description: error });
          setLoading(false);
          return;
        }
        verificationResults.nin_verified = true;
        verificationResults.nin_data = data;
      }

      const requiresDL = ["car_rentals", "logistics"].includes(
        formData.business_category
      );
      if (requiresDL && formData.drivers_license) {
        const response = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "drivers_license",
            value: formData.drivers_license,
            firstname:
              formData.nin_first_name ||
              formData.business_name.split(" ")[0] ||
              "",
            lastname:
              formData.nin_last_name ||
              formData.business_name.split(" ")[1] ||
              "",
          }),
        });
        const { valid, data, error } = await response.json();
        if (!valid) {
          setError(error || "Driver's License verification failed");
          toast.error("Driver's License verification failed", {
            description: error,
          });
          setLoading(false);
          return;
        }
        verificationResults.dl_verified = true;
        verificationResults.dl_data = data;
      }

      const profileData = {
        user_id: user.id,
        ...formData,
        approved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category_data: verificationResults,
      };

      let result;
      if (existingProfile) {
        result = await updateVendorProfile(existingProfile.id, profileData);
      } else {
        result = await createVendorProfile(profileData);
      }

      if (result.error) {
        setError(result.error.message);
        toast.error("KYC submission failed", {
          description: result.error.message,
          style: {
            background: "white",
            color: "#1f2937",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
        });
        return;
      }

      const sendEmails = async () => {
        try {
          const emailData = [
            {
              to: "aboderindaniel482@gmail.com",
              templateName: "kycSubmissionNotice",
              data: {
                vendorName: formData.business_name || "New Vendor",
                businessName: formData.business_name || "Not provided",
                businessCategory: formData.business_category,
                email: formData.email || user.email || "Not provided",
                phone: formData.phone_number || "Not provided",
                dashboardUrl: `${window.location.origin}/admin/`,
                cacVerified: verificationResults.cac_verified ? "Yes" : "No",
                ninVerified: verificationResults.nin_verified ? "Yes" : "No",
                dlVerified: verificationResults.dl_verified ? "Yes" : "No",
              },
            },
          ];

          const responses = await Promise.all(
            emailData.map(async (email) => {
              const response = await fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(email),
              });
              if (!response.ok)
                throw new Error(`Email failed: ${response.statusText}`);
              return response.json();
            })
          );

          const allSuccess = responses.every((res) => res.success);
          if (!allSuccess) {
            console.warn("Some emails failed to send");
            toast.error("KYC submitted, but admin notification failed", {
              style: {
                background: "white",
                color: "#1f2937",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              },
            });
          }
        } catch (error) {
          console.error("Email error:", error);
          toast.error("KYC submitted, but admin notification failed", {
            description: error.message,
            style: {
              background: "white",
              color: "#1f2937",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
          });
        }
      };

      await sendEmails();

      toast.success("KYC submitted successfully!", {
        description:
          "Your profile is under review. You'll be notified once approved.",
        style: {
          background: "white",
          color: "#1f2937",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
      });

      router.push("/dashboard/vendor");
    } catch (err) {
      setError("An unexpected error occurred");
      toast.error("KYC submission failed", {
        description: err.message || "An unexpected error occurred",
        style: {
          background: "white",
          color: "#1f2937",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  const requiresCAC = [
    "hotels",
    "food_restaurants",
    "serviced_apartments",
    "events",
    "security",
  ].includes(formData.business_category);
  const requiresDL = ["car_rentals", "logistics"].includes(
    formData.business_category
  );

  return (
    <AuthGuard requiredRole="vendor">
      <TooltipProvider>
        <div className="container max-w-4xl py-8 bg-white">
          <div className="mb-8">
            <Link
              href="/dashboard/vendor"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold mb-2">
              {existingProfile ? "Update" : "Complete"} KYC Verification
            </h1>
            <p className="text-gray-500">
              {existingProfile
                ? "Update your business information and documents"
                : "Provide your business information to get verified and start accepting bookings"}
            </p>
          </div>

          <CustomProgressBar currentStep={currentStep} totalSteps={5} />

          {existingProfile && (
            <div className="mb-6">
              <Alert
                className={
                  existingProfile.approved
                    ? "border-green-200 bg-green-50"
                    : "border-yellow-200 bg-yellow-50"
                }
              >
                {existingProfile.approved ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <AlertDescription
                  className={
                    existingProfile.approved
                      ? "text-green-800"
                      : "text-yellow-800"
                  }
                >
                  {existingProfile.approved
                    ? "Your KYC has been approved. You can update your information anytime."
                    : "Your KYC is currently under review. Updates will require re-approval."}
                </AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {currentStep === 1 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    Business Information
                  </CardTitle>
                  <CardDescription>Tell us about your business</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="business_name">Business Name *</Label>
                      <Input
                        id="business_name"
                        name="business_name"
                        placeholder="Enter your business name"
                        value={formData.business_name}
                        onChange={handleChange}
                        required
                        className="border-gray-200 focus:ring-blue-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="business_category"
                        className="text-sm font-medium text-gray-700"
                      >
                        Business Category *
                      </Label>
                      <Select
                        name="business_category"
                        value={formData.business_category}
                        onValueChange={(value) =>
                          handleSelectChange("business_category", value)
                        }
                        required
                      >
                        <SelectTrigger
                          id="business_category"
                          className="h-11 bg-white border border-gray-200 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] !text-black"
                        >
                          <SelectValue
                            placeholder="Select a category"
                            className="text-black"
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                          {businessCategories.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                              className="text-sm !text-black hover:bg-gray-50 focus:bg-gray-50 transition-colors duration-200"
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_description">
                      Business Description *
                    </Label>
                    <Textarea
                      id="business_description"
                      name="business_description"
                      placeholder="Describe your business and services"
                      value={formData.business_description}
                      onChange={handleChange}
                      rows={4}
                      required
                      className="border-gray-200 focus:ring-blue-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="years_in_operation">
                        Years in Operation
                      </Label>
                      <Input
                        id="years_in_operation"
                        name="years_in_operation"
                        type="number"
                        placeholder="e.g., 5"
                        value={formData.years_in_operation}
                        onChange={handleChange}
                        className="border-gray-200 focus:ring-blue-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website_url">Website URL</Label>
                      <Input
                        id="website_url"
                        name="website_url"
                        type="url"
                        placeholder="https://your-website.com"
                        value={formData.website_url}
                        onChange={handleChange}
                        className="border-gray-200 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-5 w-5" />
                    Contact Information
                  </CardTitle>
                  <CardDescription>How customers can reach you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_address">Business Address *</Label>
                    <Textarea
                      id="business_address"
                      name="business_address"
                      placeholder="Enter your complete business address"
                      value={formData.business_address}
                      onChange={handleChange}
                      rows={3}
                      required
                      className="border-gray-200 focus:ring-blue-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number *</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      placeholder="+234 xxx xxx xxxx"
                      value={formData.phone_number}
                      onChange={handleChange}
                      required
                      className="border-gray-200 focus:ring-blue-400"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Legal Information
                  </CardTitle>
                  <CardDescription>
                    Provide {requiresCAC ? "CAC Registration Number" : "NIN"}
                    {requiresDL
                      ? " and Driver's License"
                      : requiresCAC
                        ? " or NIN"
                        : ""}{" "}
                    details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {requiresCAC && (
                    <div className="space-y-2">
                      <Label htmlFor="business_registration_number">
                        CAC Registration Number{requiresCAC ? " *" : ""}
                      </Label>
                      <Input
                        id="business_registration_number"
                        name="business_registration_number"
                        placeholder="Enter CAC Registration Number"
                        value={formData.business_registration_number}
                        onChange={handleChange}
                        required={requiresCAC}
                        className="border-gray-200 focus:ring-blue-400"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="nin">
                        National Identification Number (NIN)
                        {!requiresCAC ? " *" : ""}
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-gray-500 cursor-help">ⓘ</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          Enter your 11-digit NIN. Provide the individual&apos;s
                          first and last name associated with the NIN.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="nin"
                      name="nin"
                      placeholder="Enter 11-digit NIN"
                      value={formData.nin}
                      onChange={handleChange}
                      required={!requiresCAC}
                      className="border-gray-200 focus:ring-blue-400"
                    />
                  </div>

                  {formData.nin && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nin_first_name">
                          First Name for NIN *
                        </Label>
                        <Input
                          id="nin_first_name"
                          name="nin_first_name"
                          placeholder="Enter first name"
                          value={formData.nin_first_name}
                          onChange={handleChange}
                          required
                          className="border-gray-200 focus:ring-blue-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nin_last_name">
                          Last Name for NIN *
                        </Label>
                        <Input
                          id="nin_last_name"
                          name="nin_last_name"
                          placeholder="Enter last name"
                          value={formData.nin_last_name}
                          onChange={handleChange}
                          required
                          className="border-gray-200 focus:ring-blue-400"
                        />
                      </div>
                    </div>
                  )}

                  {requiresDL && (
                    <div className="space-y-2">
                      <Label htmlFor="drivers_license">
                        Driver&apos;s License Number *
                      </Label>
                      <Input
                        id="drivers_license"
                        name="drivers_license"
                        placeholder="Enter Driver's License Number"
                        value={formData.drivers_license}
                        onChange={handleChange}
                        required
                        className="border-gray-200 focus:ring-blue-400"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="tax_identification_number">
                      Tax Identification Number
                    </Label>
                    <Input
                      id="tax_identification_number"
                      name="tax_identification_number"
                      placeholder="TIN"
                      value={formData.tax_identification_number}
                      onChange={handleChange}
                      className="border-gray-200 focus:ring-blue-400"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    Banking Information
                  </CardTitle>
                  <CardDescription>For payment processing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_name">Account Name</Label>
                    <Input
                      id="bank_account_name"
                      name="bank_account_name"
                      placeholder="Account holder name"
                      value={formData.bank_account_name}
                      onChange={handleChange}
                      className="border-gray-200 focus:ring-blue-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_account_number">
                        Account Number
                      </Label>
                      <Input
                        id="bank_account_number"
                        name="bank_account_number"
                        placeholder="10-digit account number"
                        value={formData.bank_account_number}
                        onChange={handleChange}
                        className="border-gray-200 focus:ring-blue-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">Bank Name</Label>
                      <Input
                        id="bank_name"
                        name="bank_name"
                        placeholder="e.g., First Bank, GTBank"
                        value={formData.bank_name}
                        onChange={handleChange}
                        className="border-gray-200 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 5 && (
              <>
                <Card className="border-blue-200 bg-blue-50/50 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="verification_consent"
                        checked={verificationConsent}
                        onCheckedChange={setVerificationConsent}
                        className="mt-1"
                      />
                      <div className="space-y-2">
                        <Label
                          htmlFor="verification_consent"
                          className="text-sm font-medium leading-relaxed cursor-pointer"
                        >
                          I consent to identity and document verification *
                        </Label>
                        <p className="text-xs text-gray-500">
                          By checking this box, you agree to allow verification
                          of your CAC, NIN, and/or Driver&apos;s License through
                          our trusted partner, QoreID, in compliance with
                          Nigeria Data Protection Regulation.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50/50 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={setTermsAccepted}
                        className="mt-1"
                      />
                      <div className="space-y-2">
                        <Label
                          htmlFor="terms"
                          className="text-sm font-medium leading-relaxed cursor-pointer"
                        >
                          I have read and agree to the{" "}
                          <TermsAndConditionsModal /> *
                        </Label>
                        <p className="text-xs text-gray-500">
                          By checking this box, you acknowledge that you have
                          read, understood, and agree to be bound by our Terms
                          and Conditions for listing on BOOKHUSHLY.com.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <div className="flex justify-between space-x-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  Previous
                </Button>
              )}
              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading || !termsAccepted || !verificationConsent}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      {existingProfile ? "Updating..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {existingProfile ? "Update KYC" : "Submit for Review"}
                    </>
                  )}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                asChild
                className="border-gray-200 hover:bg-gray-50"
              >
                <Link href="/dashboard/vendor">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      </TooltipProvider>
    </AuthGuard>
  );
}
