"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLogisticsRequests,
  updateLogisticsRequestWithQuote,
} from "../../../../actions/logistics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function LogisticsRequestsAdmin() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    base_amount: "",
    breakdown: {},
    total_amount: "",
    valid_until: "",
    admin_notes: "",
  });

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-logistics-requests"],
    queryFn: async () => {
      const result = await getLogisticsRequests();
      return result.data || [];
    },
  });

  const quoteMutation = useMutation({
    mutationFn: ({ requestId, quoteData }) =>
      updateLogisticsRequestWithQuote(requestId, quoteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-logistics-requests"] });
      setSelectedRequest(null);
      setQuoteForm({
        base_amount: "",
        breakdown: {},
        total_amount: "",
        valid_until: "",
        admin_notes: "",
      });
    },
  });

  const handleAddQuoteItem = (key, value) => {
    setQuoteForm((prev) => ({
      ...prev,
      breakdown: {
        ...prev.breakdown,
        [key]: parseFloat(value) || 0,
      },
    }));
  };

  const handleRemoveQuoteItem = (key) => {
    const newBreakdown = { ...quoteForm.breakdown };
    delete newBreakdown[key];
    setQuoteForm((prev) => ({ ...prev, breakdown: newBreakdown }));
  };

  const calculateTotal = () => {
    const breakdownTotal = Object.values(quoteForm.breakdown).reduce(
      (sum, val) => sum + val,
      0,
    );
    const base = parseFloat(quoteForm.base_amount) || 0;
    return base + breakdownTotal;
  };

  const handleSubmitQuote = () => {
    const total = calculateTotal();
    quoteMutation.mutate({
      requestId: selectedRequest.id,
      quoteData: {
        ...quoteForm,
        total_amount: total,
      },
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      quoted: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading requests...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Logistics Requests</h1>
        <p className="text-gray-600">
          Manage and quote logistics service requests
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests?.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-mono text-xs">
                  {request.id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{request.full_name}</div>
                    <div className="text-sm text-gray-600">{request.phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {request.service_type.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{request.pickup_state}</div>
                    <div className="text-gray-600">
                      → {request.delivery_state}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(request.pickup_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedRequest(request)}
                      >
                        {request.status === "pending"
                          ? "Create Quote"
                          : "View Details"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Logistics Request Details</DialogTitle>
                      </DialogHeader>

                      {selectedRequest?.id === request.id && (
                        <div className="space-y-6">
                          {/* Request Details */}
                          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h3 className="font-semibold mb-2">
                                Customer Information
                              </h3>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="text-gray-600">Name:</span>{" "}
                                  {request.full_name}
                                </div>
                                <div>
                                  <span className="text-gray-600">Phone:</span>{" "}
                                  {request.phone}
                                </div>
                                <div>
                                  <span className="text-gray-600">Email:</span>{" "}
                                  {request.email}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">
                                Service Details
                              </h3>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="text-gray-600">Type:</span>{" "}
                                  {request.service_type}
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Vehicle:
                                  </span>{" "}
                                  {request.vehicle_type}
                                </div>
                                <div>
                                  <span className="text-gray-600">Weight:</span>{" "}
                                  {request.item_weight}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-semibold mb-2">
                                Pickup Location
                              </h3>
                              <div className="space-y-1 text-sm">
                                <div>{request.pickup_address}</div>
                                {request.pickup_landmark && (
                                  <div className="text-gray-600">
                                    Near: {request.pickup_landmark}
                                  </div>
                                )}
                                <div className="text-gray-600">
                                  {request.pickup_lga}, {request.pickup_state}
                                </div>
                                <div className="font-medium mt-2">
                                  {new Date(
                                    request.pickup_date,
                                  ).toLocaleDateString()}
                                  {request.pickup_time &&
                                    ` at ${request.pickup_time}`}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">
                                Delivery Location
                              </h3>
                              <div className="space-y-1 text-sm">
                                <div>{request.delivery_address}</div>
                                {request.delivery_landmark && (
                                  <div className="text-gray-600">
                                    Near: {request.delivery_landmark}
                                  </div>
                                )}
                                <div className="text-gray-600">
                                  {request.delivery_lga},{" "}
                                  {request.delivery_state}
                                </div>
                                {request.delivery_date && (
                                  <div className="font-medium mt-2">
                                    {new Date(
                                      request.delivery_date,
                                    ).toLocaleDateString()}
                                    {request.delivery_time &&
                                      ` at ${request.delivery_time}`}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">
                              Item Information
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-600">
                                  Description:
                                </span>{" "}
                                {request.item_description}
                              </div>
                              {request.item_category && (
                                <div>
                                  <span className="text-gray-600">
                                    Category:
                                  </span>{" "}
                                  {request.item_category}
                                </div>
                              )}
                              {request.item_dimensions && (
                                <div>
                                  <span className="text-gray-600">
                                    Dimensions:
                                  </span>{" "}
                                  {request.item_dimensions}
                                </div>
                              )}
                              <div>
                                <span className="text-gray-600">Quantity:</span>{" "}
                                {request.quantity}
                              </div>
                              {request.item_value && (
                                <div>
                                  <span className="text-gray-600">Value:</span>{" "}
                                  ₦
                                  {parseFloat(
                                    request.item_value,
                                  ).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>

                          {(request.requires_packaging ||
                            request.requires_insurance ||
                            request.requires_tracking ||
                            request.fragile_items ||
                            request.perishable_items) && (
                            <div>
                              <h3 className="font-semibold mb-2">
                                Special Requirements
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {request.requires_packaging && (
                                  <Badge variant="outline">Packaging</Badge>
                                )}
                                {request.requires_insurance && (
                                  <Badge variant="outline">Insurance</Badge>
                                )}
                                {request.requires_tracking && (
                                  <Badge variant="outline">Tracking</Badge>
                                )}
                                {request.fragile_items && (
                                  <Badge variant="outline">Fragile</Badge>
                                )}
                                {request.perishable_items && (
                                  <Badge variant="outline">Perishable</Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {request.special_instructions && (
                            <div>
                              <h3 className="font-semibold mb-2">
                                Special Instructions
                              </h3>
                              <p className="text-sm text-gray-700">
                                {request.special_instructions}
                              </p>
                            </div>
                          )}

                          {/* Quote Form - Only show for pending requests */}
                          {request.status === "pending" && (
                            <div className="border-t pt-6">
                              <h3 className="text-lg font-semibold mb-4">
                                Create Quote
                              </h3>

                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="base_amount">
                                    Base Amount (₦)
                                  </Label>
                                  <Input
                                    id="base_amount"
                                    type="number"
                                    value={quoteForm.base_amount}
                                    onChange={(e) =>
                                      setQuoteForm((prev) => ({
                                        ...prev,
                                        base_amount: e.target.value,
                                      }))
                                    }
                                  />
                                </div>

                                <div>
                                  <Label>Cost Breakdown</Label>
                                  <div className="space-y-2 mt-2">
                                    {Object.entries(quoteForm.breakdown).map(
                                      ([key, value]) => (
                                        <div key={key} className="flex gap-2">
                                          <Input
                                            value={key}
                                            readOnly
                                            className="flex-1"
                                          />
                                          <Input
                                            type="number"
                                            value={value}
                                            onChange={(e) =>
                                              handleAddQuoteItem(
                                                key,
                                                e.target.value,
                                              )
                                            }
                                            className="w-32"
                                          />
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                              handleRemoveQuoteItem(key)
                                            }
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      ),
                                    )}
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="Item name (e.g., Fuel surcharge)"
                                        id="new-item-key"
                                      />
                                      <Input
                                        type="number"
                                        placeholder="Amount"
                                        id="new-item-value"
                                        className="w-32"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const key =
                                            document.getElementById(
                                              "new-item-key",
                                            ).value;
                                          const value =
                                            document.getElementById(
                                              "new-item-value",
                                            ).value;
                                          if (key && value) {
                                            handleAddQuoteItem(key, value);
                                            document.getElementById(
                                              "new-item-key",
                                            ).value = "";
                                            document.getElementById(
                                              "new-item-value",
                                            ).value = "";
                                          }
                                        }}
                                      >
                                        Add
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-4 bg-purple-50 rounded-lg">
                                  <div className="flex justify-between items-center text-lg font-semibold">
                                    <span>Total Amount:</span>
                                    <span>
                                      ₦{calculateTotal().toLocaleString()}
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor="valid_until">
                                    Quote Valid Until
                                  </Label>
                                  <Input
                                    id="valid_until"
                                    type="date"
                                    value={quoteForm.valid_until}
                                    onChange={(e) =>
                                      setQuoteForm((prev) => ({
                                        ...prev,
                                        valid_until: e.target.value,
                                      }))
                                    }
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="admin_notes">
                                    Admin Notes
                                  </Label>
                                  <Textarea
                                    id="admin_notes"
                                    value={quoteForm.admin_notes}
                                    onChange={(e) =>
                                      setQuoteForm((prev) => ({
                                        ...prev,
                                        admin_notes: e.target.value,
                                      }))
                                    }
                                    rows={3}
                                  />
                                </div>

                                <Button
                                  onClick={handleSubmitQuote}
                                  disabled={
                                    quoteMutation.isPending ||
                                    !quoteForm.base_amount ||
                                    !quoteForm.valid_until
                                  }
                                  className="w-full bg-purple-600 hover:bg-purple-700"
                                >
                                  {quoteMutation.isPending
                                    ? "Submitting..."
                                    : "Submit Quote & Send to Customer"}
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Display existing quote */}
                          {request.status !== "pending" &&
                            request.quoted_amount && (
                              <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">
                                  Quote Details
                                </h3>
                                <div className="space-y-2">
                                  {request.quote_details &&
                                    Object.entries(request.quote_details).map(
                                      ([key, value]) => (
                                        <div
                                          key={key}
                                          className="flex justify-between"
                                        >
                                          <span className="text-gray-600">
                                            {key}:
                                          </span>
                                          <span>
                                            ₦
                                            {parseFloat(value).toLocaleString()}
                                          </span>
                                        </div>
                                      ),
                                    )}
                                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                                    <span>Total:</span>
                                    <span>
                                      ₦
                                      {parseFloat(
                                        request.quoted_amount,
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!requests?.length && (
          <div className="text-center py-12 text-gray-500">
            No logistics requests yet
          </div>
        )}
      </Card>
    </div>
  );
}
