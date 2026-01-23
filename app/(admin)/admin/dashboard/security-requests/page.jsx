"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSecurityRequests,
  updateSecurityRequestWithQuote,
} from "../../../../actions/security";
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

export default function SecurityRequestsAdmin() {
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
    queryKey: ["admin-security-requests"],
    queryFn: async () => {
      const result = await getSecurityRequests();
      return result.data || [];
    },
  });

  const quoteMutation = useMutation({
    mutationFn: ({ requestId, quoteData }) =>
      updateSecurityRequestWithQuote(requestId, quoteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-security-requests"] });
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
        <h1 className="text-2xl font-bold">Security Requests</h1>
        <p className="text-gray-600">
          Manage and quote security service requests
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Guards</TableHead>
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
                  <div className="text-sm">{request.state}</div>
                </TableCell>
                <TableCell>
                  {new Date(request.start_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>
                      {request.number_of_guards} {request.guard_type}
                    </div>
                  </div>
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
                        <DialogTitle>Security Request Details</DialogTitle>
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
                                Service Overview
                              </h3>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="text-gray-600">Type:</span>{" "}
                                  {request.service_type}
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Duration:
                                  </span>{" "}
                                  {request.duration_type}
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Risk Level:
                                  </span>{" "}
                                  {request.risk_level}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">
                              Service Location
                            </h3>
                            <div className="space-y-1 text-sm">
                              <div>{request.service_address}</div>
                              {request.landmark && (
                                <div className="text-gray-600">
                                  Near: {request.landmark}
                                </div>
                              )}
                              <div className="text-gray-600">
                                {request.lga}, {request.state}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-semibold mb-2">Schedule</h3>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="text-gray-600">Start:</span>{" "}
                                  {new Date(
                                    request.start_date,
                                  ).toLocaleDateString()}
                                </div>
                                {request.end_date && (
                                  <div>
                                    <span className="text-gray-600">End:</span>{" "}
                                    {new Date(
                                      request.end_date,
                                    ).toLocaleDateString()}
                                  </div>
                                )}
                                {request.start_time && (
                                  <div>
                                    <span className="text-gray-600">Time:</span>{" "}
                                    {request.start_time} - {request.end_time}
                                  </div>
                                )}
                                <div>
                                  <span className="text-gray-600">Shift:</span>{" "}
                                  {request.shift_pattern}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">
                                Personnel Requirements
                              </h3>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="text-gray-600">Guards:</span>{" "}
                                  {request.number_of_guards}
                                </div>
                                <div>
                                  <span className="text-gray-600">Type:</span>{" "}
                                  {request.guard_type}
                                </div>
                                {request.requires_canine && (
                                  <div>• K9 Unit Required</div>
                                )}
                                {request.requires_vehicle && (
                                  <div>• Vehicle Required</div>
                                )}
                              </div>
                            </div>
                          </div>

                          {request.service_type === "event_security" && (
                            <div>
                              <h3 className="font-semibold mb-2">
                                Event Details
                              </h3>
                              <div className="space-y-1 text-sm">
                                {request.event_type && (
                                  <div>
                                    <span className="text-gray-600">Type:</span>{" "}
                                    {request.event_type}
                                  </div>
                                )}
                                {request.expected_attendance && (
                                  <div>
                                    <span className="text-gray-600">
                                      Attendance:
                                    </span>{" "}
                                    {request.expected_attendance} people
                                  </div>
                                )}
                                {request.event_duration_hours && (
                                  <div>
                                    <span className="text-gray-600">
                                      Duration:
                                    </span>{" "}
                                    {request.event_duration_hours} hours
                                  </div>
                                )}
                                {request.vip_protection && (
                                  <div>• VIP Protection Required</div>
                                )}
                              </div>
                            </div>
                          )}

                          {(request.service_type === "residential" ||
                            request.service_type === "corporate") && (
                            <div>
                              <h3 className="font-semibold mb-2">
                                Property Details
                              </h3>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="text-gray-600">Type:</span>{" "}
                                  {request.property_type}
                                </div>
                                {request.property_size && (
                                  <div>
                                    <span className="text-gray-600">Size:</span>{" "}
                                    {request.property_size}
                                  </div>
                                )}
                                <div>
                                  <span className="text-gray-600">
                                    Entrances:
                                  </span>{" "}
                                  {request.number_of_entrances}
                                </div>
                                {request.has_cctv && (
                                  <div>• CCTV Installed</div>
                                )}
                                {request.has_alarm_system && (
                                  <div>• Alarm System Installed</div>
                                )}
                              </div>
                            </div>
                          )}

                          <div>
                            <h3 className="font-semibold mb-2">
                              Risk Assessment
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div>
                                <Badge
                                  className={
                                    request.risk_level === "critical"
                                      ? "bg-red-100 text-red-800"
                                      : request.risk_level === "high"
                                        ? "bg-orange-100 text-orange-800"
                                        : request.risk_level === "medium"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-green-100 text-green-800"
                                  }
                                >
                                  {request.risk_level} Risk
                                </Badge>
                              </div>
                              {request.specific_threats && (
                                <div>
                                  <span className="text-gray-600">
                                    Threats:
                                  </span>{" "}
                                  {request.specific_threats}
                                </div>
                              )}
                              {request.previous_incidents && (
                                <div>
                                  <span className="text-red-600 font-medium">
                                    Previous Incidents Reported
                                  </span>
                                  {request.incident_details && (
                                    <div className="mt-1 text-gray-700">
                                      {request.incident_details}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Requirements</h3>
                            <div className="flex flex-wrap gap-2">
                              {request.requires_background_check && (
                                <Badge variant="outline">
                                  Background Check
                                </Badge>
                              )}
                              {request.requires_uniform && (
                                <Badge variant="outline">Uniform</Badge>
                              )}
                              {request.requires_communication_device && (
                                <Badge variant="outline">
                                  Communication Device
                                </Badge>
                              )}
                            </div>
                            {request.additional_equipment && (
                              <div className="mt-2 text-sm">
                                <span className="text-gray-600">
                                  Additional Equipment:
                                </span>{" "}
                                {request.additional_equipment}
                              </div>
                            )}
                          </div>

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

                          {/* Quote Form */}
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
                                        placeholder="Item name (e.g., Equipment rental)"
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
            No security requests yet
          </div>
        )}
      </Card>
    </div>
  );
}
