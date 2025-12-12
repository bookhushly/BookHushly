import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import {
  Activity,
  Badge,
  Calendar,
  CheckCircle,
  Eye,
  FileText,
  Plus,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const OverviewTab = ({ user, vendor }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-1">
            Welcome back, {user?.user_metadata?.name || "there"}! 👋
          </h2>
          <p className="text-slate-600">
            Here&#39;s what&lsquo;s happening with your business today
          </p>
        </div>
        <Button
          asChild
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30 hidden md:flex"
          disabled={!vendor?.approved}
        >
          <Link href="/vendor/dashboard/listings/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 bg-white/60 backdrop-blur-md border-slate-200/50 shadow-xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                  <CardDescription>Your latest updates</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              <div className="flex items-start gap-4 group">
                <div className="relative">
                  <div className="w-3 h-3 bg-purple-600 rounded-full ring-4 ring-purple-100 group-hover:ring-purple-200 transition-all"></div>
                  <div className="absolute left-1/2 top-full h-8 w-px bg-slate-200 -translate-x-1/2"></div>
                </div>
                <div className="flex-1 -mt-1">
                  <p className="text-sm font-semibold text-slate-900 mb-1">
                    Account Created
                  </p>
                  <p className="text-xs text-slate-500">
                    Welcome to BookHushly vendor platform
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  2d ago
                </span>
              </div>

              {vendor && (
                <div className="flex items-start gap-4 group">
                  <div className="relative">
                    <div className="w-3 h-3 bg-amber-500 rounded-full ring-4 ring-amber-100 group-hover:ring-amber-200 transition-all"></div>
                    {vendor.approved && (
                      <div className="absolute left-1/2 top-full h-8 w-px bg-slate-200 -translate-x-1/2"></div>
                    )}
                  </div>
                  <div className="flex-1 -mt-1">
                    <p className="text-sm font-semibold text-slate-900 mb-1">
                      KYC Verification Submitted
                    </p>
                    <p className="text-xs text-slate-500">
                      {vendor.approved
                        ? "Your documents have been verified"
                        : "Under review by our team"}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    1d ago
                  </span>
                </div>
              )}

              {vendor?.approved && (
                <div className="flex items-start gap-4 group">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full ring-4 ring-green-100 group-hover:ring-green-200 transition-all animate-pulse"></div>
                  </div>
                  <div className="flex-1 -mt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-900">
                        Vendor Account Approved
                      </p>
                      <Badge className="bg-green-100 text-green-700 border-0">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      You can now create and manage listings
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Just now
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links Sidebar */}
        <div className="space-y-5">
          <Card className="bg-white/60 backdrop-blur-md border-slate-200/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                className="w-full justify-start bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-600/30 font-semibold h-12"
                disabled={!vendor?.approved}
              >
                <Link href="/vendor/dashboard/listings/create">
                  <Plus className="mr-3 h-5 w-5" />
                  Create New Listing
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab("bookings")}
                className="w-full justify-start border-slate-200 hover:bg-slate-50 font-medium h-12"
              >
                <Calendar className="mr-3 h-5 w-5 text-blue-600" />
                View All Bookings
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full justify-start border-slate-200 hover:bg-slate-50 font-medium h-12"
              >
                <Link href="/vendor/dashboard/kyc">
                  <FileText className="mr-3 h-5 w-5 text-amber-600" />
                  {vendor?.approved ? "Update" : "Complete"} KYC
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Performance Card */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 shadow-2xl shadow-blue-600/30 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Performance</h3>
                  <p className="text-xs text-blue-100">This month</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-100">Profile Views</span>
                  <span className="text-lg font-bold">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-100">Conversion Rate</span>
                  <span className="text-lg font-bold">12.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-100">
                    Avg Response Time
                  </span>
                  <span className="text-lg font-bold">2.3h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
