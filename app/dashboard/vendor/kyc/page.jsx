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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  ExternalLink,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function KYCPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
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
          // If profile exists and was previously approved, consider terms accepted
          if (profile.approved) {
            setTermsAccepted(true);
          }
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

    if (!termsAccepted) {
      setError("You must accept the Terms and Conditions to proceed");
      return false;
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

  const TermsAndConditionsModal = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="p-0 h-auto text-blue-600 hover:text-blue-800"
        >
          Terms and Conditions
          <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Shield className="mr-2 h-5 w-5" />
            Terms and Conditions for Listers
          </DialogTitle>
          <DialogDescription>
            Please read these terms carefully before proceeding with your
            listing registration.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* Section 1 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-foreground">
                1. Agreement Overview
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                By listing your <span className="font-medium">listing</span> on
                BOOKHUSHLY.com ("Platform"), you agree to these legally binding
                Terms and Conditions. This agreement is governed by the laws of
                the Federal Republic of Nigeria.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-foreground">
                2. Eligibility
              </h3>
              <p className="text-muted-foreground mb-2">Listers must:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Own or have legal rights to manage the listing</li>
                <li>
                  Register with valid identification (e.g., NIN, CAC, or BVN, as
                  applicable)
                </li>
                <li>
                  Provide accurate and up-to-date information about the listing
                </li>
                <li>
                  Comply with all local, state, and federal housing and safety
                  regulations
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-foreground">
                3. Commission Structure
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>
                  A <span className="font-medium">10% commission</span> is
                  charged on the total value of each successful booking
                </li>
                <li>Commission is automatically deducted at payout</li>
                <li>
                  The total booking value includes rent, service fees, cleaning
                  charges, and VAT (if applicable)
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-foreground">
                4. Payout Terms
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>
                  Payouts are made in Nigerian Naira (NGN) to the lister's
                  verified local bank account
                </li>
                <li>
                  Disbursement occurs within{" "}
                  <span className="font-medium">5 business days</span> after
                  guest check-in, minus commission and applicable deductions
                </li>
                <li>
                  The Platform may delay payouts in cases of disputes or
                  suspected fraud
                </li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-foreground">
                5. Taxes & Regulatory Compliance
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>
                  Listers are solely responsible for all applicable taxes
                  (personal or corporate income tax, VAT, etc.)
                </li>
                <li>
                  BOOKHUSHLY.com may provide withholding tax certificates upon
                  request, in line with the Nigerian FIRS rules
                </li>
                <li>
                  Listers are responsible for ensuring tax compliance based on
                  their business structure and location
                </li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-foreground">
                6. Cancellations & Refunds
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>
                  Commission remains payable if cancellation occurs outside your
                  defined cancellation window
                </li>
                <li>
                  Listers must clearly outline cancellation and refund policies
                  on each listing
                </li>
                <li>
                  BOOKHUSHLY.com reserves the right to override cancellation
                  policies for guest protection under exceptional circumstances
                </li>
              </ul>
            </div>

            {/* Section 7 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-foreground">
                7. Listing Conduct
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>
                  Fraudulent, misleading, or illegal listings may result in
                  immediate removal and legal action
                </li>
                <li>
                  Listers must comply with the Nigeria Data Protection Act
                  (NDPA) and may not collect, share, or use guest data without
                  consent
                </li>
                <li>
                  Professional conduct is expected in all interactions with
                  guests and Platform staff
                </li>
              </ul>
            </div>

            {/* Section 8 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-foreground">
                8. Limitation of Liability
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>
                  BOOKHUSHLY.com is not liable for losses, damages, or disputes
                  resulting from listings or guest actions
                </li>
                <li>
                  Listers are strongly advised to maintain adequate listing and
                  liability insurance
                </li>
                <li>
                  The Platform is not responsible for guest behavior or listing
                  damage
                </li>
              </ul>
            </div>

            {/* Section 9 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-foreground">
                9. Account Termination
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>
                  You may delist or pause your listings anytime via your
                  dashboard
                </li>
                <li>
                  BOOKHUSHLY.com may suspend or terminate your account for
                  breach of these terms or 12 months of inactivity
                </li>
                <li>
                  In the event of termination, pending payouts (minus
                  deductions) will be processed per policy
                </li>
              </ul>
            </div>

            {/* Section 10 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-foreground">
                10. Dispute Resolution
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>
                  All disputes will be resolved in good faith. Unresolved
                  disputes may be submitted to arbitration in Lagos, under the
                  Arbitration and Conciliation Act, Cap A18 Laws of Nigeria
                </li>
                <li>
                  Each party will bear its own legal costs unless otherwise
                  agreed
                </li>
              </ul>
            </div>

            {/* Section 11 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-foreground">
                11. Amendments
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>BOOKHUSHLY.com may update these Terms with prior notice</li>
                <li>
                  Continued use of the Platform after notice constitutes
                  acceptance of the revised terms
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              document.querySelector('[data-state="open"]')?.click()
            }
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

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

          {/* Terms and Conditions */}
          <Card className="border-purple-200 bg-purple-50/50">
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
                    I have read and agree to the <TermsAndConditionsModal /> *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    By checking this box, you acknowledge that you have read,
                    understood, and agree to be bound by our Terms and
                    Conditions for listing on BOOKHUSHLY.com.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/vendor">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading || !termsAccepted}>
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
