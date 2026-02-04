// components/admin/vendors/VendorDetailsModal.jsx
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useVendorDetails } from "@/hooks/use-vendors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VendorInfo } from "./info";
import { VendorKYC } from "./kyc";
import { VendorListings } from "./listings";
import { VendorRevenue } from "./revenue";
import { EmailVendorModal } from "./email-modal";
import { CheckCircle, XCircle, Mail, Clock } from "lucide-react";

export function VendorDetailsModal({ vendorId, onClose }) {
  const [activeTab, setActiveTab] = useState("info");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const queryClient = useQueryClient();

  const { data: vendor, isLoading } = useVendorDetails(vendorId, true);

  const handleApprove = async () => {
    setApproving(true);
    try {
      const response = await fetch("/api/admin/vendors/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId }),
      });

      if (!response.ok) throw new Error("Failed to approve vendor");

      queryClient.invalidateQueries(["vendors"]);
      queryClient.invalidateQueries(["vendorStats"]);
      queryClient.invalidateQueries(["vendorDetails", vendorId]);
      onClose();
    } catch (error) {
      console.error("Error approving vendor:", error);
      alert("Failed to approve vendor. Please try again.");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      const response = await fetch("/api/admin/vendors/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId }),
      });

      if (!response.ok) throw new Error("Failed to reject vendor");

      queryClient.invalidateQueries(["vendors"]);
      queryClient.invalidateQueries(["vendorStats"]);
      queryClient.invalidateQueries(["vendorDetails", vendorId]);
      onClose();
    } catch (error) {
      console.error("Error rejecting vendor:", error);
      alert("Failed to reject vendor. Please try again.");
    } finally {
      setRejecting(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!vendor) {
    return null;
  }

  // Determine if actions should be shown
  const canApprove = vendor.status !== "approved" && !vendor.approved;
  const canReject = vendor.status !== "rejected";
  const isRejected = vendor.status === "rejected";

  // Get status badge
  const getStatusBadge = () => {
    const statusConfig = {
      pending: { bg: "bg-gray-100", text: "text-gray-800", label: "Pending" },
      submitted: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Submitted",
      },
      reviewing: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Reviewing",
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Approved",
      },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
    };

    const config = statusConfig[vendor.status] || statusConfig.pending;

    return (
      <Badge
        variant="outline"
        className={`${config.bg} ${config.text} shrink-0`}
      >
        {config.label}
      </Badge>
    );
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[90vh] flex flex-col p-0">
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <DialogHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl sm:text-2xl break-words">
                    {vendor.business_name}
                  </DialogTitle>
                  <p className="text-sm text-gray-500 mt-1 break-words">
                    {vendor.users?.email}
                  </p>
                </div>
                {getStatusBadge()}
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {/* Approve/Reject buttons for pending vendors */}
              {canApprove && (
                <div className="flex flex-col sm:flex-row gap-2 p-4 bg-gray-50 rounded-lg">
                  <Button
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {approving ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Vendor
                      </>
                    )}
                  </Button>
                  {canReject && (
                    <Button
                      onClick={handleReject}
                      disabled={rejecting}
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      {rejecting ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Vendor
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {/* Re-approve option for rejected vendors */}
              {isRejected && (
                <div className="flex gap-2 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      This vendor was rejected
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      You can re-approve them if needed
                    </p>
                  </div>
                  <Button
                    onClick={handleApprove}
                    disabled={approving}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 shrink-0"
                  >
                    {approving ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Re-approve
                      </>
                    )}
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => setShowEmailModal(true)}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Vendor
              </Button>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 h-auto">
                  <TabsTrigger
                    value="info"
                    className="text-xs sm:text-sm px-2 py-2"
                  >
                    Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="kyc"
                    className="text-xs sm:text-sm px-2 py-2"
                  >
                    <span className="hidden sm:inline">KYC Documents</span>
                    <span className="sm:hidden">KYC</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="listings"
                    className="text-xs sm:text-sm px-2 py-2"
                  >
                    Listings
                  </TabsTrigger>
                  <TabsTrigger
                    value="revenue"
                    className="text-xs sm:text-sm px-2 py-2"
                  >
                    Revenue
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4">
                  <TabsContent value="info" className="m-0">
                    <VendorInfo vendor={vendor} />
                  </TabsContent>

                  <TabsContent value="kyc" className="m-0">
                    <VendorKYC vendor={vendor} />
                  </TabsContent>

                  <TabsContent value="listings" className="m-0">
                    <VendorListings vendorId={vendorId} />
                  </TabsContent>

                  <TabsContent value="revenue" className="m-0">
                    <VendorRevenue vendorId={vendorId} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showEmailModal && (
        <EmailVendorModal
          vendor={vendor}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </>
  );
}
