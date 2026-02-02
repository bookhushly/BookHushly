"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/shared/auth/auth-guard";
import { submitKYC } from "@/app/actions/kyc";
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
import { TermsAndConditionsModal } from "@/components/shared/kyc/Terms&ConditionModal";
import { useAuth } from "@/hooks/use-auth";
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
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-500",
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
          className="absolute h-full bg-purple-600 rounded-full transition-all duration-500 ease-in-out"
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

export default function KYCPage() {
  const router = useRouter();
  const { data: authData, isLoading } = useAuth();
  const [isPending, startTransition] = useTransition();
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
    { value: "serviced_apartments", label: "Serviced Apartments" },
    { value: "events", label: "Events" },
  ];

  useEffect(() => {
    if (!authData?.vendor) return;

    const vendor = authData.vendor;
    setFormData({
      business_name: vendor.business_name || "",
      business_description: vendor.business_description || "",
      business_address: vendor.business_address || "",
      phone_number: vendor.phone_number || "",
      business_registration_number: vendor.business_registration_number || "",
      nin: vendor.nin || "",
      nin_first_name: vendor.nin_first_name || "",
      nin_last_name: vendor.nin_last_name || "",
      drivers_license: vendor.drivers_license || "",
      tax_identification_number: vendor.tax_identification_number || "",
      bank_account_name: vendor.bank_account_name || "",
      bank_account_number: vendor.bank_account_number || "",
      bank_name: vendor.bank_name || "",
      business_category: vendor.business_category || "",
      years_in_operation: vendor.years_in_operation || "",
      website_url: vendor.website_url || "",
    });

    if (vendor.approved) {
      setTermsAccepted(true);
      setVerificationConsent(true);
    }
  }, [authData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          `${field.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())} is required`,
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
  console.log("VendorId", authData);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) return;

    setError("");

    startTransition(async () => {
      const result = await submitKYC(formData, authData?.vendor?.id);

      if (!result.success) {
        setError(result.error);
        toast.error("KYC submission failed", { description: result.error });
        return;
      }

      toast.success("Success!", { description: result.message });

      setTimeout(() => {
        router.push("/vendor/dashboard");
      }, 1500);
    });
  };

  const requiresCAC = [
    "hotels",
    "food_restaurants",
    "serviced_apartments",
    "events",
    "security",
  ].includes(formData.business_category);

  const requiresDL = ["car_rentals", "logistics"].includes(
    formData.business_category,
  );

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <TooltipProvider>
        <div className="container max-w-4xl py-8 bg-white">
          <div className="mb-8">
            <Link
              href="/vendor/dashboard"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold mb-2">
              {authData?.vendor ? "Update" : "Complete"} KYC Verification
            </h1>
            <p className="text-gray-500">
              {authData?.vendor
                ? "Update your business information and documents"
                : "Provide your business information to get verified and start accepting bookings"}
            </p>
          </div>

          <CustomProgressBar currentStep={currentStep} totalSteps={5} />

          {authData?.vendor && (
            <div className="mb-6">
              <Alert
                className={
                  authData.vendor.approved
                    ? "border-green-200 bg-green-50"
                    : "border-yellow-200 bg-yellow-50"
                }
              >
                {authData.vendor.approved ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <AlertDescription
                  className={
                    authData.vendor.approved
                      ? "text-green-800"
                      : "text-yellow-800"
                  }
                >
                  {authData.vendor.approved
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
                        className="border-gray-200 focus:ring-purple-400"
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
                          className="h-11 bg-white border border-gray-200 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] !text-black"
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
                      className="border-gray-200 focus:ring-purple-400"
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
                        className="border-gray-200 focus:ring-purple-400"
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
                        className="border-gray-200 focus:ring-purple-400"
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
                      className="border-gray-200 focus:ring-purple-400"
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
                      className="border-gray-200 focus:ring-purple-400"
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
                        className="border-gray-200 focus:ring-purple-400"
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
                      className="border-gray-200 focus:ring-purple-400"
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
                          className="border-gray-200 focus:ring-purple-400"
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
                          className="border-gray-200 focus:ring-purple-400"
                        />
                      </div>
                    </div>
                  )}

                  {requiresDL && (
                    <>
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
                          className="border-gray-200 focus:ring-purple-400"
                        />
                      </div>
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
                          className="border-gray-200 focus:ring-purple-400"
                        />
                      </div>
                    </>
                  )}
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
                      className="border-gray-200 focus:ring-purple-400"
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
                        className="border-gray-200 focus:ring-purple-400"
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
                        className="border-gray-200 focus:ring-purple-400"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 5 && (
              <>
                <Card className="border-purple-200 bg-purple-50/50 shadow-sm">
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
                  disabled={isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white ml-auto"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isPending || !termsAccepted || !verificationConsent}
                  className="bg-purple-600 hover:bg-purple-700 text-white ml-auto"
                >
                  {isPending ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      {authData?.vendor ? "Updating..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {authData?.vendor ? "Update KYC" : "Submit for Review"}
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
                <Link href="/vendor/dashboard">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      </TooltipProvider>
    </AuthGuard>
  );
}
