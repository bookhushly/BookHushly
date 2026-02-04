// components/shared/admin/customers/details-modal.jsx
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCustomerDetails,
  useCustomerAnalytics,
} from "@/hooks/use-customers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomerInfo } from "./info";
import { CustomerBookings } from "./bookings";
import { CustomerActivity } from "./activity";
import { EmailCustomerModal } from "./email-modal";
import { Mail, Ban, CheckCircle } from "lucide-react";

export function CustomerDetailsModal({ customerId, onClose }) {
  const [activeTab, setActiveTab] = useState("info");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: customer, isLoading } = useCustomerDetails(customerId, true);
  const { data: analytics } = useCustomerAnalytics(customerId, true);

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

  if (!customer) {
    return null;
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[90vh] flex flex-col p-0">
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <DialogHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg shrink-0">
                    {customer.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-xl sm:text-2xl break-words">
                      {customer.name}
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1 break-words">
                      {customer.email}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 shrink-0"
                >
                  Active
                </Badge>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => setShowEmailModal(true)}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Customer
              </Button>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-3 h-auto">
                  <TabsTrigger
                    value="info"
                    className="text-xs sm:text-sm px-2 py-2"
                  >
                    Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="bookings"
                    className="text-xs sm:text-sm px-2 py-2"
                  >
                    Bookings
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="text-xs sm:text-sm px-2 py-2"
                  >
                    Activity
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4">
                  <TabsContent value="info" className="m-0">
                    <CustomerInfo customer={customer} analytics={analytics} />
                  </TabsContent>

                  <TabsContent value="bookings" className="m-0">
                    <CustomerBookings customerId={customerId} />
                  </TabsContent>

                  <TabsContent value="activity" className="m-0">
                    <CustomerActivity
                      customerId={customerId}
                      analytics={analytics}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showEmailModal && (
        <EmailCustomerModal
          customer={customer}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </>
  );
}
