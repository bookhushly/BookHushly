"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  Globe,
  MapPin,
  CreditCard,
  Edit3,
  Save,
  X,
  CheckCircle2,
  Clock,
  Shield,
  AlertCircle,
  LogOut,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// ─── Status badge ─────────────────────────────────────────────────────────────
function KycBadge({ approved, status }) {
  if (approved)
    return (
      <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
      </Badge>
    );
  if (status === "reviewing")
    return (
      <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
        <Clock className="h-3 w-3 mr-1" /> Under Review
      </Badge>
    );
  return (
    <Badge className="bg-red-50 text-red-600 border-red-200 hover:bg-red-50">
      <AlertCircle className="h-3 w-3 mr-1" /> Not Verified
    </Badge>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Card({ title, action, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      {(title || action) && (
        <div className="flex items-center justify-between">
          {title && <h3 className="text-sm font-medium text-gray-900">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Row display ─────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, muted }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5 text-sm text-gray-800">
        <Icon className="h-3.5 w-3.5 text-violet-400 shrink-0" />
        <span className={muted ? "text-gray-400 italic" : ""}>{value || "—"}</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VendorProfileClient({ userId, email, userRow, vendor }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: userRow?.name || "",
    phone: vendor?.phone_number || "",
    website_url: vendor?.website_url || "",
    business_description: vendor?.business_description || "",
    business_address: vendor?.business_address || "",
  });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  const initials = (vendor?.business_name || userRow?.name || "V")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSave = () => {
    startTransition(async () => {
      try {
        // Update users table
        await supabase
          .from("users")
          .update({ name: form.name })
          .eq("id", userId);

        // Update vendors table if vendor record exists
        if (vendor?.id) {
          await supabase
            .from("vendors")
            .update({
              phone_number: form.phone,
              website_url: form.website_url || null,
              business_description: form.business_description || null,
              business_address: form.business_address || null,
            })
            .eq("id", vendor.id);
        }

        toast.success("Profile updated");
        setEditing(false);
        router.refresh();
      } catch {
        toast.error("Failed to save changes");
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-gray-900">Vendor Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your business profile and account details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left column ── */}
        <div className="space-y-4">
          {/* Identity card */}
          <Card>
            <div className="flex flex-col items-center text-center gap-3">
              <Avatar className="h-20 w-20 border-4 border-violet-100">
                <AvatarFallback className="bg-violet-600 text-white text-2xl font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <h2 className="text-base font-medium text-gray-900">
                  {vendor?.business_name || userRow?.name || "—"}
                </h2>
                <p className="text-xs text-gray-400">{email}</p>
              </div>

              {vendor && <KycBadge approved={vendor.approved} status={vendor.status} />}

              {vendor?.business_category && (
                <span className="text-xs bg-violet-50 text-violet-700 px-3 py-1 rounded-full border border-violet-100 capitalize">
                  {vendor.business_category.replace(/_/g, " ")}
                </span>
              )}

              {userRow?.created_at && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Vendor since {format(new Date(userRow.created_at), "MMMM yyyy")}
                </p>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full border-red-200 text-red-600 hover:bg-red-50 mt-2"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </Card>

          {/* Bank info — read only */}
          {vendor?.bank_account_number && (
            <Card title="Payout Account">
              <div className="space-y-3">
                <InfoRow icon={CreditCard} label="Bank" value={vendor.bank_name} />
                <InfoRow icon={User} label="Account Name" value={vendor.bank_account_name} />
                <InfoRow
                  icon={CreditCard}
                  label="Account Number"
                  value={`****${vendor.bank_account_number.slice(-4)}`}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                To update banking details, contact support.
              </p>
            </Card>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Business info with edit */}
          <Card
            title="Business Information"
            action={
              !editing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="border-violet-200 text-violet-700 hover:bg-violet-50"
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(false)}
                    className="border-gray-200 text-gray-600"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isPending}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    {isPending ? "Saving…" : "Save"}
                  </Button>
                </div>
              )
            }
          >
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Your Name</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="mt-1.5 rounded-xl"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="mt-1.5 rounded-xl"
                      placeholder="+234..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Business Address</Label>
                    <Input
                      value={form.business_address}
                      onChange={(e) => setForm((f) => ({ ...f, business_address: e.target.value }))}
                      className="mt-1.5 rounded-xl"
                      placeholder="Street address"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Website</Label>
                    <Input
                      value={form.website_url}
                      onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
                      className="mt-1.5 rounded-xl"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Business Description</Label>
                    <Textarea
                      value={form.business_description}
                      onChange={(e) => setForm((f) => ({ ...f, business_description: e.target.value }))}
                      className="mt-1.5 rounded-xl resize-none"
                      rows={3}
                      placeholder="Describe your business…"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={Building2} label="Business Name" value={vendor?.business_name} />
                <InfoRow icon={User} label="Contact Name" value={userRow?.name} />
                <InfoRow icon={Mail} label="Email" value={email} />
                <InfoRow icon={Phone} label="Phone" value={vendor?.phone_number} muted={!vendor?.phone_number} />
                <InfoRow icon={MapPin} label="Address" value={vendor?.business_address} muted={!vendor?.business_address} />
                <InfoRow icon={Globe} label="Website" value={vendor?.website_url} muted={!vendor?.website_url} />
                {vendor?.years_in_operation && (
                  <InfoRow icon={Briefcase} label="Years in Operation" value={`${vendor.years_in_operation} year${vendor.years_in_operation !== 1 ? "s" : ""}`} />
                )}
                {vendor?.business_description && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-400 mb-0.5">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{vendor.business_description}</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* KYC / verification status */}
          <Card title="Verification Status">
            <div className="flex items-start gap-4 p-3 rounded-xl bg-gray-50">
              <div className={`p-2 rounded-xl shrink-0 ${vendor?.approved ? "bg-green-50" : "bg-amber-50"}`}>
                <Shield className={`h-5 w-5 ${vendor?.approved ? "text-green-500" : "text-amber-500"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {vendor?.approved
                    ? "Your account is verified"
                    : vendor?.status === "reviewing"
                    ? "Your KYC is under review"
                    : "KYC verification required"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {vendor?.approved
                    ? "You can accept bookings and receive payouts."
                    : vendor?.status === "reviewing"
                    ? "Our team is reviewing your documents. This typically takes 1-2 business days."
                    : "Complete KYC to start receiving bookings and payouts."}
                </p>
                {!vendor?.approved && vendor?.status !== "reviewing" && (
                  <Button
                    size="sm"
                    className="mt-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-8 text-xs"
                    onClick={() => router.push("/vendor/dashboard/kyc")}
                  >
                    Complete KYC
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Account security */}
          <Card title="Account Security">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Verified</p>
                    <p className="text-xs text-gray-500">{email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-50 rounded-lg">
                    <Shield className="h-4 w-4 text-violet-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Password</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-violet-200 text-violet-700 hover:bg-violet-50"
                  onClick={() => toast.info("Password reset email sent")}
                >
                  Change
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
