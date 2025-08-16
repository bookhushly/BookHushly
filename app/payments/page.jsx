"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuthStore } from "@/lib/store";
import { getBooking, updatePaymentStatus } from "@/lib/database";
import {
  initializePayment,
  verifyPayment,
  initializeClientPayment,
  checkNOWPaymentsStatus,
  searchAvailableCurrencies,
  getCurrencyDetails,
  getMinimumPaymentAmount,
  getEstimatedCryptoPrice,
  createNOWPaymentsInvoice,
  getNOWPaymentsStatus,
  getExchangeRate,
} from "@/lib/payments";

import {
  CreditCard,
  Shield,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Lock,
  Wallet,
  Bitcoin,
  Info,
  Clock,
  Search,
  X,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function PaymentPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = searchParams.get("booking");
  const reference = searchParams.get("reference");
  const paymentStatus = searchParams.get("status");

  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState("pending");
  const [error, setError] = useState("");

  // Crypto payment states
  const [cryptoStep, setCryptoStep] = useState(1); // 1: Check API, 2: Search Currency, 3: Show Details, 4: Payment
  const [apiStatus, setApiStatus] = useState(null);
  const [currencySearchQuery, setCurrencySearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [selectedCurrencyDetails, setSelectedCurrencyDetails] = useState(null);
  const [minimumAmount, setMinimumAmount] = useState(null);
  const [minimumAmountCurrency, setMinimumAmountCurrency] = useState(null);
  const [estimatedAmount, setEstimatedAmount] = useState(null);
  const [invoice, setInvoice] = useState(null);

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
        console.log(data);
        setBooking(data);

        // Check if payment was successful from URL params
        if (paymentStatus === "success" && reference) {
          setCurrentPaymentStatus("success");
        } else if (reference && reference !== "null") {
          await verifyPaymentStatus(reference);
        }
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadBookingData();
  }, [bookingId, reference, paymentStatus]);

  const verifyPaymentStatus = async (paymentReference) => {
    try {
      const { data, error } = await verifyPayment(paymentReference);

      if (error) {
        setCurrentPaymentStatus("failed");
        setError("Payment verification failed");
        return;
      }

      if (data.status === "success" || data.payment_status === "finished") {
        setCurrentPaymentStatus("success");
        await updatePaymentStatus(bookingId, "completed", paymentReference);
        toast.success("Payment successful!", {
          description: "Your booking has been confirmed",
        });
        router.push(`/order-successful/${bookingId}`);
      } else {
        setCurrentPaymentStatus("failed");
        setError("Payment was not successful");
      }
    } catch (err) {
      setCurrentPaymentStatus("failed");
      setError("Payment verification failed");
    }
  };

  // Step 1: Check NOWPayments API Status
  const checkCryptoAPIStatus = async () => {
    setPaymentLoading(true);
    setError("");

    try {
      const { data, error } = await checkNOWPaymentsStatus();

      if (error) {
        setError("Crypto payment service is currently unavailable");
        setApiStatus("error");
        return;
      }

      setApiStatus(data);
      setCryptoStep(2);
    } catch (err) {
      setError("Failed to check crypto payment availability");
      setApiStatus("error");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const { data, error } = await searchAvailableCurrencies(query);

        if (error) {
          console.error("Currency search error:", error);
          setSearchResults([]);
          return;
        }

        setSearchResults(data || []);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    []
  );

  // Handle search input change
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setCurrencySearchQuery(query);
    debouncedSearch(query);
  };

  // Handle currency selection
  const handleCurrencySelection = async (currency) => {
    setSelectedCurrency(currency);
    setPaymentLoading(true);
    setError("");
    setCurrencySearchQuery("");
    setSearchResults([]);

    try {
      // Get currency details
      // Step 1: Get currency details
      const { data: currencyDetails } = await getCurrencyDetails(currency);
      setSelectedCurrencyDetails(currencyDetails);

      // Step 2: Convert booking amount to USD
      const { data: converted, error } = await getExchangeRate(
        booking.total_amount,
        "NGN",
        "USD"
      );

      if (error || !converted?.result) {
        throw new Error("Failed to get exchange rate");
      }

      const amountInUSD = converted.result;

      // Step 3: Get minimum payment amount in usd of selected currency
      const { data: minData, error: minError } = await getMinimumPaymentAmount(
        "usd",
        currency
      );
      console.log("Minimum payment data:", minData.min_amount);
      if (minError || !minData) {
        setError("Failed to get minimum payment amount for this currency");
        return;
      }

      const minAmountUSD = minData.min_amount;
      setMinimumAmount(minAmountUSD);

      // Step 4: Check if booking amount in usd meets minimum requirement
      if (amountInUSD < minimumAmount) {
        setError(
          `This cryptocurrency requires a minimum payment of ₦${minimumAmount.toLocaleString()} ` +
            `(${parseFloat(minData.min_amount).toFixed(8)} ${currency.toUpperCase()}). ` +
            `Your booking amount is $${amountInUSD.toLocaleString()}. ` +
            `Please choose a different cryptocurrency with a lower minimum amount.`
        );
        return;
      }

      // Step 4: Get crypto price estimate for booking amount
      const { data: estimateData, error: estimateError } =
        await getEstimatedCryptoPrice(amountInUSD, "usd", currency);

      if (estimateError || !estimateData) {
        setError("Failed to get crypto price estimate");
        return;
      }

      setEstimatedAmount(estimateData);

      console.log(minAmountUSD, "Minimum amount in USD:");
      console.log(currency, "Selected currency:", currency);
      const {
        data: minimumAmountinSelectedCurrency,
        error: minimumAmountError,
      } = await getEstimatedCryptoPrice(minAmountUSD, "usd", currency);
      console.log(estimateData, "Estimated amount data:");
      if (
        minimumAmountError ||
        !minimumAmountinSelectedCurrency?.estimated_amount
      ) {
        throw new Error("Failed to get exchange rate");
      }

      setMinimumAmountCurrency(
        minimumAmountinSelectedCurrency.estimated_amount
      );
      // All validations passed
      setCryptoStep(3);

      console.log(
        `Payment setup successful: ${estimateData.estimated_amount} ${currency.toUpperCase()}`
      );
    } catch (err) {
      console.error("Currency selection error:", err);
      setError("An error occurred while processing currency selection");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Step 4: Create Invoice and Initiate Payment
  const initiateCryptoPayment = async () => {
    if (!booking || !user || !selectedCurrency) return;

    setPaymentLoading(true);
    setError("");

    try {
      const paymentData = {
        email: user.email,
        amount: estimatedAmount.estimated_amount, // Convert to kobo
        currency: selectedCurrency,
        reference: `BH_${bookingId}_${Date.now()}`,
        callback_url: `${window.location.origin}/payments?booking=${bookingId}`,
        metadata: {
          booking_id: bookingId,
          customer_id: user.id,
          service_title: booking.listings?.title,
          customer_name: user.user_metadata?.name || "Customer",
        },
      };

      const { data, error } = await createNOWPaymentsInvoice(
        paymentData,
        selectedCurrency
      );

      if (error) {
        setError(error.message || "Failed to create payment invoice");
        return;
      }

      setInvoice(data);
      setCryptoStep(4);

      // Redirect to NOWPayments invoice page
      if (data.invoice_url) {
        setTimeout(() => {
          window.location.href = data.invoice_url;
        }, 3000);
      }
    } catch (err) {
      setError("Payment initialization failed");
      toast.error("Failed to initialize crypto payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  const sendPaymentNotifications = async (paymentData, provider) => {
    try {
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
    } catch (error) {
      console.error("Notification sending failed:", error);
    }
  };

  // Regular Paystack payment handler
  const handlePaystackPayment = async () => {
    if (!booking || !user) return;

    setPaymentLoading(true);
    setError("");

    try {
      const paymentData = {
        email: user.email,
        amount: booking.total_amount * 100,
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

      // Try client-side payment first
      try {
        const response = await initializeClientPayment(paymentData, "paystack");

        if (response.status === "success" || response.status === "successful") {
          const verification = await verifyPayment(paymentData.reference);

          if (verification.data?.status === "success") {
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
      const { data, error } = await initializePayment("paystack", paymentData);

      if (error) {
        setError(error.message);
        toast.error("Payment initialization failed");
        return;
      }

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

  const resetCryptoFlow = () => {
    setCryptoStep(1);
    setSelectedCurrency(null);
    setSelectedCurrencyDetails(null);
    setMinimumAmount(null);
    setMinimumAmountCurrency(null);
    setEstimatedAmount(null);
    setInvoice(null);
    setApiStatus(null);
    setCurrencySearchQuery("");
    setSearchResults([]);
    setError("");
  };

  const clearSearch = () => {
    setCurrencySearchQuery("");
    setSearchResults([]);
  };

  // Debounce utility function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (currentPaymentStatus === "failed") {
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
                onClick={() => setCurrentPaymentStatus("pending")}
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
                Select your preferred payment option
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Paystack Payment Option */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Paystack</h3>
                        <p className="text-sm text-muted-foreground">
                          Card, Bank Transfer, USSD
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handlePaystackPayment}
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

              {/* Crypto Payment Option */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Bitcoin className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Pay with Crypto</h3>
                          <p className="text-sm text-muted-foreground">
                            Bitcoin, Ethereum, USDT & 200+ more
                          </p>
                        </div>
                      </div>
                      {cryptoStep === 1 && (
                        <Button
                          variant="outline"
                          onClick={checkCryptoAPIStatus}
                          disabled={paymentLoading}
                        >
                          {paymentLoading ? (
                            <LoadingSpinner className="h-4 w-4" />
                          ) : (
                            "Pay with Crypto"
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Crypto Payment Flow */}
                    {cryptoStep > 1 && (
                      <div className="border-t pt-4 space-y-4">
                        {/* Step 2: Currency Search */}
                        {cryptoStep === 2 && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">
                                Search Cryptocurrency
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                Step 2 of 4
                              </Badge>
                            </div>

                            <div className="relative">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                  type="text"
                                  placeholder="Type first 3 characters (e.g., btc, eth, usdt)..."
                                  value={currencySearchQuery}
                                  onChange={handleSearchInputChange}
                                  className="pl-10 pr-10"
                                />
                                {currencySearchQuery && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                    onClick={clearSearch}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              {/* Search Results */}
                              {(searchLoading || searchResults.length > 0) && (
                                <div className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                                  {searchLoading ? (
                                    <div className="flex items-center justify-center p-4">
                                      <LoadingSpinner className="h-4 w-4 mr-2" />
                                      <span className="text-sm">
                                        Searching...
                                      </span>
                                    </div>
                                  ) : searchResults.length > 0 ? (
                                    searchResults.map((currency) => (
                                      <button
                                        key={currency}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b last:border-b-0"
                                        onClick={() =>
                                          handleCurrencySelection(currency)
                                        }
                                        disabled={paymentLoading}
                                      >
                                        <div className="flex items-center">
                                          <Bitcoin className="h-4 w-4 mr-3 text-orange-500" />
                                          <div>
                                            <div className="font-medium">
                                              {currency.toUpperCase()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              Click to select
                                            </div>
                                          </div>
                                        </div>
                                      </button>
                                    ))
                                  ) : currencySearchQuery.length >= 2 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                      No currencies found for "
                                      {currencySearchQuery}"
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </div>

                            <Alert>
                              <Info className="h-4 w-4" />
                              <AlertDescription>
                                Type at least 2 characters to search from 200+
                                available cryptocurrencies. Note: Each
                                cryptocurrency has a different minimum payment
                                amount. Popular options: btc, eth, usdt, usdc,
                                ltc, bch, bnb, ada, xrp, doge
                              </AlertDescription>
                            </Alert>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={resetCryptoFlow}
                              className="text-gray-500"
                            >
                              Back to payment methods
                            </Button>
                          </div>
                        )}

                        {/* Step 3: Show Payment Details */}
                        {cryptoStep === 3 &&
                          selectedCurrency &&
                          minimumAmount &&
                          estimatedAmount && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">Payment Details</h4>
                                <Badge variant="secondary" className="text-xs">
                                  Step 3 of 4
                                </Badge>
                              </div>

                              <div className="bg-green-50 p-4 rounded-lg space-y-3">
                                <div className="flex items-center space-x-2 text-green-700 mb-2">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="font-medium text-sm">
                                    Payment amount meets minimum requirement
                                  </span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    Selected Currency:
                                  </span>
                                  <div className="flex items-center">
                                    <Bitcoin className="h-4 w-4 mr-2 text-orange-500" />
                                    <Badge variant="outline">
                                      {selectedCurrency.toUpperCase()}
                                    </Badge>
                                  </div>
                                </div>

                                {selectedCurrencyDetails && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                      Currency Name:
                                    </span>
                                    <span className="text-sm">
                                      {selectedCurrencyDetails.name}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    Amount to Pay:
                                  </span>
                                  <span className="font-mono text-sm font-semibold">
                                    {parseFloat(
                                      estimatedAmount.estimated_amount
                                    ).toFixed(8)}{" "}
                                    {selectedCurrency.toUpperCase()}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    Minimum Required:
                                  </span>
                                  <span className="font-mono text-sm text-gray-600">
                                    {parseFloat(minimumAmountCurrency).toFixed(
                                      8
                                    )}{" "}
                                    {selectedCurrency.toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                  The crypto amount is calculated in real-time
                                  and may vary slightly during payment
                                  processing due to market fluctuations.
                                </AlertDescription>
                              </Alert>

                              <div className="flex space-x-2">
                                <Button
                                  onClick={initiateCryptoPayment}
                                  disabled={paymentLoading}
                                  className="flex-1"
                                >
                                  {paymentLoading ? (
                                    <LoadingSpinner className="h-4 w-4 mr-2" />
                                  ) : null}
                                  Create Payment Invoice
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setCryptoStep(2)}
                                  disabled={paymentLoading}
                                >
                                  Change Currency
                                </Button>
                              </div>
                            </div>
                          )}

                        {/* Step 4: Payment Processing */}
                        {cryptoStep === 4 && invoice && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Payment Created</h4>
                              <Badge variant="secondary" className="text-xs">
                                Step 4 of 4
                              </Badge>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg space-y-3">
                              <div className="flex items-center space-x-2 text-green-700">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">
                                  Payment invoice created successfully!
                                </span>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Payment Amount:</span>
                                  <span className="font-mono">
                                    {parseFloat(invoice.pay_amount).toFixed(8)}{" "}
                                    {invoice.pay_currency.toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span>USD Value:</span>
                                  <span className="font-mono">
                                    $
                                    {parseFloat(invoice.price_amount).toFixed(
                                      2
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span>Order ID:</span>
                                  <span className="font-mono text-xs">
                                    {invoice.order_id}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 text-blue-600">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">
                                  Redirecting to payment page in 3 seconds...
                                </span>
                              </div>
                            </div>

                            <Alert>
                              <Info className="h-4 w-4" />
                              <AlertDescription>
                                You will be redirected to complete your payment.
                                After successful payment, you'll be brought back
                                to this site automatically.
                              </AlertDescription>
                            </Alert>

                            <div className="flex space-x-2">
                              <Button
                                onClick={() =>
                                  (window.location.href = invoice.invoice_url)
                                }
                                className="flex-1"
                              >
                                Continue to Payment →
                              </Button>
                              <Button
                                variant="outline"
                                onClick={resetCryptoFlow}
                                size="sm"
                              >
                                Start Over
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
              <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Wallet className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">
                      Crypto Payment Notice
                    </p>
                    <p className="text-amber-700">
                      Cryptocurrency transactions are irreversible. Please
                      ensure all details are correct before proceeding. Each
                      cryptocurrency has different minimum payment requirements.
                    </p>
                  </div>
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

                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₦{booking.total_amount?.toLocaleString()}</span>
                </div>
              </div>

              {/* Show crypto equivalent if currency is selected */}
              {selectedCurrency && estimatedAmount && (
                <div className="bg-orange-50 p-3 rounded-lg mt-4">
                  <div className="text-sm">
                    <div className="font-medium text-orange-800 mb-1">
                      Crypto Equivalent:
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-orange-700">
                        {selectedCurrency.toUpperCase()}:
                      </span>
                      <span className="font-mono text-orange-800">
                        {parseFloat(estimatedAmount.estimated_amount).toFixed(
                          8
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Payment is processed securely through our partners</p>
              <p>• Refunds available for card payments as per vendor policy</p>
              <p>• Crypto payments are final and non-refundable</p>
              <p>• Payment confirmation sent via email</p>
              <p>• Each cryptocurrency has different minimum amounts</p>
              <p>• 24/7 customer support for payment issues</p>
            </CardContent>
          </Card>

          {/* Crypto Help Card */}
          {cryptoStep > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Bitcoin className="h-5 w-5 mr-2 text-orange-500" />
                  Crypto Payment Help
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  • Search by typing currency symbols (btc, eth, usdt, etc.)
                </p>
                <p>• Prices are calculated in real-time</p>
                <p>
                  • Each cryptocurrency has different minimum payment amounts
                </p>
                <p>
                  • If your booking amount is below the minimum, try a different
                  crypto
                </p>
                <p>• Transactions are processed on blockchain networks</p>
                <p>• Payment confirmation may take a few minutes</p>
                <div className="mt-3 p-2 bg-blue-50 rounded text-blue-700 text-xs">
                  <strong>Popular low-minimum choices:</strong> USDT, USDC
                  (usually lower minimums than BTC/ETH)
                </div>
                <div className="mt-2 p-2 bg-amber-50 rounded text-amber-700 text-xs">
                  <strong>Note:</strong> If you see a "minimum amount" error,
                  try selecting USDT or USDC which typically have lower minimum
                  requirements.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
