"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function SettingsTab({
  apartment,
  apartmentId,
  onDelete,
  onToggleStatus,
  loading,
}) {
  const isActive = apartment.status === "active";

  return (
    <div className="space-y-6">
      {/* Status Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            Listing Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {isActive ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {isActive ? "Listing is Active" : "Listing is Inactive"}
                </p>
                <p className="text-sm text-gray-600">
                  {isActive
                    ? "Your apartment is visible to customers and can receive bookings"
                    : "Your apartment is hidden from customers and cannot receive bookings"}
                </p>
              </div>
            </div>
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={`${
                isActive
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <Button
            variant="outline"
            onClick={onToggleStatus}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : isActive ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Deactivate Listing
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Activate Listing
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            {apartment.is_verified ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Verified Listing</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    Pending Verification
                  </p>
                  <p className="text-sm text-gray-600">
                    Your listing is under review by our team
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Listing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Listing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Listing ID</p>
            <p className="font-mono text-sm">{apartmentId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Created</p>
            <p className="text-sm">
              {new Date(apartment.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="text-sm">
              {new Date(apartment.updated_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Views</p>
            <p className="text-sm">{apartment.views_count || 0} views</p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 mb-1">
                  Delete This Listing
                </p>
                <p className="text-sm text-red-800 mb-4">
                  Once you delete this apartment listing, there is no going
                  back. Please be certain. All bookings and data will be
                  permanently removed.
                </p>
                <Button
                  variant="destructive"
                  onClick={onDelete}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Apartment Listing
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
