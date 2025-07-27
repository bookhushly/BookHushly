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
  MapPin,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function KYCPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState(null);
  const [formData, setFormData] = useState({
    business_name: "",
    business_description: "",
    business_address: "",
    phone_number: "",
    business_registration_number: "",
    tax_identification_number: "",
    bank_account_name: "",
    bank_account_number: "",
    bank_name: "",
    business_category: "",
    years_in_operation: "",
    website_url: "",
  });
  const [error, setError] = useState("");
  useEffect(() => {
    if (user) {
      console.log("✅ User is logged in:", user);
    } else {
      console.log("🚫 User is NOT logged in.");
    }
  }, [user]);

  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!user) return;

      try {
        setPageLoading(true);
        const { data: profile, error } = await getVendorProfile(user.id);

        if (error && error.code !== "PGRST116") {
          // PGRST116 = no rows returned
          console.error("Profile load error:", error);
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
            tax_identification_number: profile.tax_identification_number || "",
            bank_account_name: profile.bank_account_name || "",
            bank_account_number: profile.bank_account_number || "",
            bank_name: profile.bank_name || "",
            status: profile.status || "",
            business_category: profile.business_category || "",
            years_in_operation: profile.years_in_operation || "",
            website_url: profile.website_url || "",
          });
        }
      } catch (error) {
        console.error("Load profile error:", error);
      } finally {
        setPageLoading(false);
      }
    };

    loadExistingProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    const required = [
      "business_name",
      "business_description",
      "business_address",
      "phone_number",
    ];
    for (const field of required) {
      if (!formData[field].trim()) {
        setError(`${field.replace("_", " ")} is required`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const profileData = {
        user_id: user.id,
        ...formData,
        approved: false, // Always set to false for admin review
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
        });
        return;
      }

      toast.success("KYC submitted successfully!", {
        description:
          "Your profile is now under review. You will be notified once approved.",
      });

      router.push("/dashboard/vendor");
    } catch (err) {
      setError("An unexpected error occurred");
      toast.error("KYC submission failed", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <AuthGuard requiredRole="vendor">
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/vendor"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">
            {existingProfile ? "Update" : "Complete"} KYC Verification
          </h1>
          <p className="text-muted-foreground">
            {existingProfile
              ? "Update your business information and documents"
              : "Provide your business information to get verified and start accepting bookings"}
          </p>
        </div>

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

          {/* Business Information */}
          <Card>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_category">Business Category</Label>
                  <Input
                    id="business_category"
                    name="business_category"
                    placeholder="e.g., Hotel, Restaurant, Security"
                    value={formData.business_category}
                    onChange={handleChange}
                  />
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
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="years_in_operation">Years in Operation</Label>
                  <Input
                    id="years_in_operation"
                    name="years_in_operation"
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.years_in_operation}
                    onChange={handleChange}
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
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
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
                />
              </div>
            </CardContent>
          </Card>

          {/* Legal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Legal Information
              </CardTitle>
              <CardDescription>
                Business registration and tax details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_registration_number">
                    Business Registration Number
                  </Label>
                  <Input
                    id="business_registration_number"
                    name="business_registration_number"
                    placeholder="CAC Registration Number"
                    value={formData.business_registration_number}
                    onChange={handleChange}
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
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Banking Information */}
          <Card>
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
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank_account_number">Account Number</Label>
                  <Input
                    id="bank_account_number"
                    name="bank_account_number"
                    placeholder="10-digit account number"
                    value={formData.bank_account_number}
                    onChange={handleChange}
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
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/vendor">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading}>
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
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}
