"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function ServicePaymentPage({ requestId, requestType }) {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("quote_id");
  const [paymentMethod, setPaymentMethod] = useState("paystack");

  const { data: quote, isLoading } = useQuery({
    queryKey: ["quote", quoteId],
    queryFn: async () => {
      const res = await fetch(`/api/quotes/${quoteId}`);
      return res.json();
    },
    enabled: !!quoteId,
  });

  const { data: request } = useQuery({
    queryKey: [requestType, requestId],
    queryFn: async () => {
      const res = await fetch(`/api/${requestType}-requests/${requestId}`);
      return res.json();
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (method) => {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          requestType,
          quoteId,
          amount: quote.total_amount,
          paymentMethod: method,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    },
  });

  const handlePayment = () => {
    paymentMutation.mutate(paymentMethod);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!quote || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Quote Not Found</h2>
          <p className="text-gray-600">
            The quote you're looking for doesn't exist or has expired.
          </p>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(quote.valid_until) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">
            Review your quote and proceed with payment
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Quote Summary */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Service Details</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Type:</span>
                  <Badge variant="outline" className="capitalize">
                    {request.service_type?.replace("_", " ")}
                  </Badge>
                </div>

                {requestType === "logistics" ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Route:</span>
                      <span>
                        {request.pickup_state} → {request.delivery_state}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pickup Date:</span>
                      <span>
                        {new Date(request.pickup_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="capitalize">{request.vehicle_type}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span>{request.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span>
                        {new Date(request.start_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Personnel:</span>
                      <span>
                        {request.number_of_guards} {request.guard_type} guards
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="paystack" id="paystack" />
                    <Label htmlFor="paystack" className="cursor-pointer flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            Card Payment (Naira)
                          </div>
                          <div className="text-sm text-gray-600">
                            Pay with debit/credit card or bank transfer
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-purple-600">
                          Paystack
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="crypto" id="crypto" />
                    <Label htmlFor="crypto" className="cursor-pointer flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Cryptocurrency</div>
                          <div className="text-sm text-gray-600">
                            Pay with Bitcoin, USDT, or other crypto
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-purple-600">
                          NOWPayments
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                    <RadioGroupItem value="wallet" id="wallet" disabled />
                    <Label htmlFor="wallet" className="cursor-pointer flex-1">
                      <div>
                        <div className="font-medium">Wallet Balance</div>
                        <div className="text-sm text-gray-600">Coming soon</div>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </Card>
          </div>

          {/* Price Summary */}
          <div className="md:col-span-1">
            <Card className="p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Quote Summary</h2>

              {isExpired && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ This quote has expired
                  </p>
                </div>
              )}

              <div className="space-y-2 mb-4">
                <div className="text-xs text-gray-500">
                  Valid until:{" "}
                  {new Date(quote.valid_until).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Amount:</span>
                  <span>₦{parseFloat(quote.base_amount).toLocaleString()}</span>
                </div>

                {quote.breakdown &&
                  Object.entries(quote.breakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600">{key}:</span>
                      <span>₦{parseFloat(value).toLocaleString()}</span>
                    </div>
                  ))}
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-purple-600">
                  ₦{parseFloat(quote.total_amount).toLocaleString()}
                </span>
              </div>

              {quote.pdf_url && (
                <a
                  href={quote.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full mb-4 text-center text-sm text-purple-600 hover:text-purple-700 underline"
                >
                  Download Quote PDF
                </a>
              )}

              <Button
                onClick={handlePayment}
                disabled={paymentMutation.isPending || isExpired}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {paymentMutation.isPending
                  ? "Processing..."
                  : `Pay ₦${parseFloat(quote.total_amount).toLocaleString()}`}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By proceeding, you agree to our terms of service
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
