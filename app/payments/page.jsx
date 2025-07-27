"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuthStore } from "@/lib/store";
import { getBooking, updatePaymentStatus } from "@/lib/database";
import {
  initializePayment,
  verifyPayment,
  initializeClientPayment,
} from "@/lib/payments";

import {
  CreditCard,
  Shield,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Lock,
  Smartphone,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function PaymentPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  console.log("Search Params:", searchParams.toString());
  const bookingId = searchParams.get("booking");
  console.log("Booking ID:", bookingId);
  const reference = searchParams.get("reference");

  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookingData = async () => {
      if (!bookingId) {
        setError("No booking ID provided");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await getBooking(bookingId);

        if (error) {
          setError("Failed to load booking details");
          return;
        }

        setBooking(data);

        // If we have a reference, verify the payment
        if (reference) {
          await verifyPaymentStatus(reference);
        }
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadBookingData();
  }, [bookingId, reference]);

  const verifyPaymentStatus = async (paymentReference) => {
    try {
      const { data, error } = await verifyPayment(paymentReference);

      if (error) {
        setPaymentStatus("failed");
        setError("Payment verification failed");
        return;
      }

      if (data.status === "success") {
        setPaymentStatus("success");
        // Update booking payment status
        await updatePaymentStatus(bookingId, "completed", paymentReference);
        toast.success("Payment successful!", {
          description: "Your booking has been confirmed",
        });
      } else {
        setPaymentStatus("failed");
        setError("Payment was not successful");
      }
    } catch (err) {
      setPaymentStatus("failed");
      setError("Payment verification failed");
    }
  };

  const handlePayment = async (provider) => {
    if (!booking || !user) return;

    setPaymentLoading(true);
    setError("");

    try {
      const paymentData = {
        email: user.email,
        amount: booking.total_amount * 100, // Convert to kobo/cents
        currency: "NGN",
        reference: `BH_${bookingId}_${Date.now()}`,
        callback_url: `${window.location.origin}/payments?booking=${bookingId}`,
        metadata: {
          booking_id: bookingId,
          customer_id: user.id,
          service_title: booking.listings?.title,
          customer_name: user.user_metadata?.name || "Customer",
        },
      };

      // Try client-side payment first (for better UX)
      try {
        const response = await initializeClientPayment(paymentData, provider);

        if (response.status === "success" || response.status === "successful") {
          // Verify payment
          const verification = await verifyPayment(paymentData.reference);

          if (verification.data?.status === "success") {
            // Send confirmation notifications
            await fetch("/api/send-payment-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: user.email,
                bookingDetails: {
                  customerName: user.user_metadata?.name || "Customer",
                  serviceTitle: booking.listings?.title,
                  amount: booking.total_amount.toLocaleString(),
                  reference: paymentData.reference,
                  provider: provider,
                  paymentDate: new Date().toLocaleDateString(),
                  bookingUrl: `${window.location.origin}/dashboard/customer?tab=bookings`,
                },
              }),
            });

            if (booking.contact_phone) {
              await fetch("/api/send-payment-sms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  phone: booking.contact_phone,
                  data: {
                    serviceTitle: booking.listings?.title,
                    amount: booking.total_amount.toLocaleString(),
                    reference: paymentData.reference,
                  },
                }),
              });
            }

            if (booking.contact_phone) {
              await fetch("/api/send-payment-sms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  phone: booking.contact_phone,
                  data: {
                    serviceTitle: booking.listings?.title,
                    amount: booking.total_amount.toLocaleString(),
                    reference: paymentData.reference,
                  },
                }),
              });
            }

            router.push(
              `/payments?booking=${bookingId}&reference=${paymentData.reference}&status=success`
            );
            return;
          }
        }
      } catch (clientError) {
        console.log(
          "Client-side payment failed, trying server-side:",
          clientError
        );
      }

      // Fallback to server-side payment
      const { data, error } = await initializePayment(provider, paymentData);

      if (error) {
        setError(error.message);
        toast.error("Payment initialization failed");
        return;
      }

      // Redirect to payment gateway
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (err) {
      setError("Payment initialization failed");
      toast.error("Payment failed to initialize");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (paymentStatus === "success") {
    return (
      <div className="container max-w-2xl py-8">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 text-green-500">
              <CheckCircle className="h-16 w-16" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Payment Successful!
            </CardTitle>
            <CardDescription>
              Your booking has been confirmed and payment processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{booking?.listings?.title}</h3>
              <p className="text-sm text-muted-foreground">
                Booking Date: {booking?.booking_date}
              </p>
              <p className="text-sm text-muted-foreground">
                Amount Paid: ₦{booking?.total_amount?.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/dashboard/customer?tab=bookings">
                  View My Bookings
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/services">Browse More Services</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <div className="container max-w-2xl py-8">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 text-red-500">
              <XCircle className="h-16 w-16" />
            </div>
            <CardTitle className="text-2xl text-red-600">
              Payment Failed
            </CardTitle>
            <CardDescription>
              There was an issue processing your payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Button
                onClick={() => setPaymentStatus("pending")}
                className="w-full"
              >
                Try Again
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard/customer?tab=bookings">
                  Back to Bookings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardContent className="text-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Booking Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The booking you're trying to pay for could not be found.
            </p>
            <Button asChild>
              <Link href="/dashboard/customer">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/customer?tab=bookings"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Choose Payment Method
              </CardTitle>
              <CardDescription>
                Select your preferred payment provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Paystack */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Paystack</h3>
                        <p className="text-sm text-muted-foreground">
                          Card, Bank Transfer, USSD
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handlePayment("paystack")}
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? (
                        <LoadingSpinner className="h-4 w-4" />
                      ) : (
                        "Pay with Paystack"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Flutterwave */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Globe className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Flutterwave</h3>
                        <p className="text-sm text-muted-foreground">
                          Card, Mobile Money, Bank
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handlePayment("flutterwave")}
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? (
                        <LoadingSpinner className="h-4 w-4" />
                      ) : (
                        "Pay with Flutterwave"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Money */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-60">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Smartphone className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Mobile Money</h3>
                        <p className="text-sm text-muted-foreground">
                          MTN, Airtel, 9mobile
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-green-600" />
                Secure Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span>256-bit SSL Encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>PCI DSS Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Verified Merchants</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">{booking.listings?.title}</h3>
                <p className="text-sm text-muted-foreground">
                  by {booking.listings?.vendors?.business_name}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Booking Date:</span>
                  <span>{booking.booking_date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{booking.booking_time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{booking.guests}</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Service Fee:</span>
                  <span>
                    ₦
                    {(booking.total_amount / 1.05)
                      .toFixed(0)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Platform Fee (5%):</span>
                  <span>
                    ₦
                    {((booking.total_amount * 0.05) / 1.05)
                      .toFixed(0)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₦{booking.total_amount?.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Payment is processed securely through our partners</p>
              <p>• Refunds available as per vendor cancellation policy</p>
              <p>• Payment confirmation sent via email and SMS</p>
              <p>• 24/7 customer support for payment issues</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
