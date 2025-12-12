import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Badge,
  Building,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  Link,
  Settings,
  Upload,
} from "lucide-react";

const ProfileTab = ({ vendor, user }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          Vendor Profile
        </h2>
        <p className="text-slate-600 text-sm">
          Manage your business information and settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/60 backdrop-blur-md border-slate-200/50 shadow-xl">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Building className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  {vendor
                    ? "Your verified business details"
                    : "Complete your vendor profile"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {vendor ? (
              <>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Business Name
                  </label>
                  <p className="text-base text-slate-900 font-medium">
                    {vendor.business_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Verification Status
                  </label>
                  <Badge
                    variant={vendor.approved ? "default" : "secondary"}
                    className={
                      vendor.approved
                        ? "bg-green-100 text-green-800 border-green-200 px-4 py-2"
                        : "px-4 py-2"
                    }
                  >
                    {vendor.approved ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verified Business
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Pending Review
                      </>
                    )}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  asChild
                  className="w-full h-11 font-semibold"
                >
                  <Link href="/vendor/dashboard/kyc">
                    <Edit className="mr-2 h-4 w-4" />
                    Update Profile
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-sm mb-5 text-slate-600">
                  Complete your KYC verification to start accepting bookings and
                  grow your business
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-600/30 h-11"
                >
                  <Link href="/vendor/dashboard/kyc">
                    <FileText className="mr-2 h-4 w-4" />
                    Complete KYC Now
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-md border-slate-200/50 shadow-xl">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Your login and account information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Email Address
              </label>
              <p className="text-base text-slate-900 font-medium">
                {user?.email}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Full Name
              </label>
              <p className="text-base text-slate-900 font-medium">
                {user?.user_metadata?.name || "Not set"}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Account Type
              </label>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 px-4 py-2">
                <Building className="w-4 h-4 mr-2" />
                Vendor Account
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileTab;
