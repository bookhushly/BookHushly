"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Camera,
  LogOut,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { updateUserProfile } from "@/app/actions/customers";
import { createClient } from "@/lib/supabase/client";
import { StatCard, SectionCard } from "@/components/shared/customer/shared-ui";
import {
  Calendar as CalendarIcon,
  Hotel,
  Building2,
  Ticket,
  Truck,
  Shield as ShieldIcon,
} from "lucide-react";

export function ProfileClient({ userId, initialProfile, stats }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: initialProfile.name,
    phone: initialProfile.phone || "",
  });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  const initials = initialProfile.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateUserProfile(userId, form);
        toast.success("Profile updated successfully");
        setEditing(false);
        router.refresh();
      } catch (err) {
        toast.error("Failed to update profile");
        console.error(err);
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your account information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <SectionCard>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="h-20 w-20 border-4 border-purple-100">
                  <AvatarImage src={initialProfile.avatar} />
                  <AvatarFallback className="bg-purple-600 text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {initialProfile.name}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {initialProfile.email}
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1 rounded-full">
                <Shield className="h-3 w-3" />
                Customer
              </span>

              {initialProfile.created_at && (
                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  Member since{" "}
                  {format(new Date(initialProfile.created_at), "MMMM yyyy")}
                </p>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full mt-6 border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </SectionCard>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard
            title="Personal Information"
            action={
              !editing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(false);
                      setForm({
                        name: initialProfile.name,
                        phone: initialProfile.phone || "",
                      });
                    }}
                    className="border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    {isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              )
            }
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </Label>
                  {editing ? (
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="mt-1.5 border-purple-200 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Your full name"
                    />
                  ) : (
                    <div className="mt-1.5 flex items-center gap-2 text-gray-900">
                      <User className="h-4 w-4 text-purple-400" />
                      <span className="text-sm">
                        {initialProfile.name || "—"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="mt-1.5 flex items-center gap-2 text-gray-900">
                    <Mail className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">{initialProfile.email}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-1" />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </Label>
                  {editing ? (
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className="mt-1.5 border-purple-200 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="+234..."
                    />
                  ) : (
                    <div className="mt-1.5 flex items-center gap-2 text-gray-900">
                      <Phone className="h-4 w-4 text-purple-400" />
                      <span className="text-sm">
                        {initialProfile.phone || "Not set"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Account Role
                  </Label>
                  <div className="mt-1.5 flex items-center gap-2 text-gray-900">
                    <Shield className="h-4 w-4 text-purple-400" />
                    <span className="text-sm capitalize">
                      {initialProfile.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Account Stats */}
          {stats && (
            <SectionCard title="Your Activity">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Hotels", count: stats.hotelCount, icon: Hotel },
                  {
                    label: "Apartments",
                    count: stats.apartmentCount,
                    icon: Building2,
                  },
                  { label: "Events", count: stats.eventCount, icon: Ticket },
                  {
                    label: "Logistics",
                    count: stats.logisticsCount,
                    icon: Truck,
                  },
                  {
                    label: "Security",
                    count: stats.securityCount,
                    icon: ShieldIcon,
                  },
                  {
                    label: "Total",
                    count: stats.totalBookings,
                    icon: CalendarIcon,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-purple-50 rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <item.icon className="h-3.5 w-3.5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {item.count}
                      </p>
                      <p className="text-xs text-gray-500">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Security section */}
          <SectionCard title="Account Security">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Email Verified
                    </p>
                    <p className="text-xs text-gray-500">
                      Your email is confirmed
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Shield className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Password
                    </p>
                    <p className="text-xs text-gray-500">Last updated: —</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  onClick={() => toast.info("Password reset email sent")}
                >
                  Change
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
